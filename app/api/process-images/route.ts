import { type NextRequest } from "next/server"
import { parseCSV, generateCSV } from "@/lib/csv-parser"
import { downloadImage, cropImage } from "@/lib/image-processor"
import { uploadToR2 } from "@/lib/r2-client"
import type { InputRow, OutputRow, ProcessingError } from "@/lib/types"

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const sendMessage = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        const formData = await request.formData()
        const file = formData.get("file") as File
        const width = Number.parseInt(formData.get("width") as string)
        const height = Number.parseInt(formData.get("height") as string)
        const format = formData.get("format") as string

        // Validate inputs
        if (!file) {
          sendMessage({ type: "error", error: "No file provided" })
          controller.close()
          return
        }

        if (!width || !height || width <= 0 || height <= 0) {
          sendMessage({ type: "error", error: "Invalid crop dimensions" })
          controller.close()
          return
        }

        // Get R2 bucket name from environment
        const bucketName = process.env.R2_BUCKET_NAME
        if (!bucketName) {
          sendMessage({ type: "error", error: "R2_BUCKET_NAME environment variable is not set" })
          controller.close()
          return
        }

        // Parse CSV file
        const content = await file.text()
        let inputRows: InputRow[]

        try {
          inputRows = parseCSV(content)
        } catch (error) {
          sendMessage({
            type: "error",
            error: error instanceof Error ? error.message : "Failed to parse CSV",
          })
          controller.close()
          return
        }

        // Send initial progress
        sendMessage({
          type: "progress",
          currentRow: 0,
          totalRows: inputRows.length,
          currentSku: "Starting...",
        })

        // Process images
        const outputRows: OutputRow[] = []
        const errors: ProcessingError[] = []

        for (let rowIndex = 0; rowIndex < inputRows.length; rowIndex++) {
          const row = inputRows[rowIndex]
          const outputRow: OutputRow = { sku: row.sku }

          // Send progress update
          sendMessage({
            type: "progress",
            currentRow: rowIndex + 1,
            totalRows: inputRows.length,
            currentSku: row.sku,
          })

          // Process each image URL in the row
          for (let i = 0; i < row.imageUrls.length; i++) {
            const imageUrl = row.imageUrls[i]
            const imageIndex = i + 1 // 1-based index for output

            try {
              // Download image
              const imageBuffer = await downloadImage(imageUrl)

              // Crop/resize image with white background padding
              const croppedBuffer = await cropImage(imageBuffer, { width, height })

              // Upload to R2 with SKU and index
              const r2Key = `${row.sku}-${imageIndex}.jpg`
              const r2Url = await uploadToR2(croppedBuffer, r2Key, bucketName)

              // Add to output with dynamic key
              outputRow[`r2_url_${imageIndex}`] = r2Url
            } catch (error) {
              errors.push({
                sku: row.sku,
                imageIndex,
                error: error instanceof Error ? error.message : "Unknown error",
              })

              // For the first image, this is a critical error
              if (i === 0) {
                sendMessage({
                  type: "error",
                  error: `Failed to process required first image for SKU ${row.sku}: ${error instanceof Error ? error.message : "Unknown error"}`,
                })
                controller.close()
                return
              }
            }
          }

          outputRows.push(outputRow)
        }

        // Generate output file
        let output: string

        if (format === "excel") {
          // For Excel, we'll still generate CSV format
          // In a production app, you'd use a library like xlsx
          output = generateCSV(outputRows as unknown as Record<string, string>[])
        } else {
          output = generateCSV(outputRows as unknown as Record<string, string>[])
        }

        // Send completion message
        sendMessage({
          type: "complete",
          output,
          processedCount: outputRows.length,
          totalCount: inputRows.length,
          errors: errors.length > 0 ? errors : undefined,
        })

        controller.close()
      } catch (error) {
        console.error("[v0] Processing error:", error)
        sendMessage({
          type: "error",
          error: error instanceof Error ? error.message : "Processing failed",
        })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
