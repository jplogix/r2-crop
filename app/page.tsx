"use client"

import { useState } from "react"
import { FileUpload } from "@/components/file-upload"
import { CropDimensionsInput } from "@/components/crop-dimensions-input"
import { ProcessingProgress } from "@/components/processing-progress"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { parseCSV } from "@/lib/csv-parser"
import type { CropDimensions, ProcessingProgress as ProgressType } from "@/lib/types"
import { Download, ImageIcon, Settings } from "lucide-react"

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [dimensions, setDimensions] = useState<CropDimensions>({ width: 940, height: 1215 })
  const [outputFormat, setOutputFormat] = useState<"csv" | "excel">("csv")
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState<ProgressType | null>(null)
  const [outputData, setOutputData] = useState<string | null>(null)
  const [errors, setErrors] = useState<string[]>([])

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile)
    setErrors([])
    setOutputData(null)
    setProgress(null)
  }

  const validateInputs = (): string[] => {
    const validationErrors: string[] = []

    if (!file) {
      validationErrors.push("Please upload a CSV or text file")
    }

    if (dimensions.width <= 0 || dimensions.height <= 0) {
      validationErrors.push("Crop dimensions must be greater than 0")
    }

    if (file) {
      try {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string
            parseCSV(content)
          } catch (error) {
            validationErrors.push(error instanceof Error ? error.message : "Invalid CSV format")
          }
        }
        reader.readAsText(file)
      } catch (error) {
        validationErrors.push("Unable to read file")
      }
    }

    return validationErrors
  }

  const handleProcess = async () => {
    setErrors([])

    const validationErrors = validateInputs()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    if (!file) return

    setProcessing(true)
    setProgress({
      currentRow: 0,
      totalRows: 0,
      currentSku: "Starting...",
      status: "processing",
    })

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("width", dimensions.width.toString())
      formData.append("height", dimensions.height.toString())
      formData.append("format", outputFormat)

      const response = await fetch("/api/process-images", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Processing failed")
      }

      if (!response.body) {
        throw new Error("No response body")
      }

      // Read the stream
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6))

            if (data.type === "progress") {
              setProgress({
                currentRow: data.currentRow,
                totalRows: data.totalRows,
                currentSku: data.currentSku,
                status: "processing",
              })
            } else if (data.type === "complete") {
              setProgress({
                currentRow: data.processedCount,
                totalRows: data.totalCount,
                currentSku: "Complete",
                status: "complete",
              })
              setOutputData(data.output)
            } else if (data.type === "error") {
              setProgress({
                currentRow: 0,
                totalRows: 0,
                currentSku: "",
                status: "error",
                error: data.error,
              })
            }
          }
        }
      }
    } catch (error) {
      setProgress({
        currentRow: 0,
        totalRows: 0,
        currentSku: "",
        status: "error",
        error: error instanceof Error ? error.message : "An error occurred during processing",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!outputData) return

    const blob = new Blob([outputData], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `processed-images-${Date.now()}.${outputFormat}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <ImageIcon className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Image Processor</h1>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Batch process product images: crop, optimize, and upload to Cloudflare R2 storage
            </p>
          </div>

          {/* Main Content */}
          <div className="grid gap-6">
            {/* File Upload */}
            <section>
              <FileUpload onFileSelect={handleFileSelect} />
            </section>

            {/* Configuration */}
            <section className="grid md:grid-cols-2 gap-6">
              <CropDimensionsInput dimensions={dimensions} onChange={setDimensions} />

              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Output Format</h3>
                  </div>

                  <RadioGroup value={outputFormat} onValueChange={(v) => setOutputFormat(v as "csv" | "excel")}>
                    <div className="flex items-center space-x-2 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="csv" id="csv" />
                      <Label htmlFor="csv" className="flex-1 cursor-pointer">
                        <span className="font-medium">CSV</span>
                        <p className="text-xs text-muted-foreground">Comma-separated values</p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="excel" id="excel" />
                      <Label htmlFor="excel" className="flex-1 cursor-pointer">
                        <span className="font-medium">Excel</span>
                        <p className="text-xs text-muted-foreground">Microsoft Excel format</p>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </Card>
            </section>

            {/* Errors */}
            {errors.length > 0 && (
              <Card className="border-destructive/50 bg-destructive/5">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-destructive mb-3">Validation Errors</h3>
                  <ul className="space-y-2">
                    {errors.map((error, index) => (
                      <li key={index} className="text-sm text-destructive flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            )}

            {/* Progress */}
            {progress && <ProcessingProgress progress={progress} />}

            {/* Actions */}
            <div className="flex gap-4">
              <Button onClick={handleProcess} disabled={!file || processing} size="lg" className="flex-1">
                {processing ? "Processing..." : "Start Processing"}
              </Button>

              {outputData && (
                <Button onClick={handleDownload} size="lg" variant="outline" className="gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  Download Results
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
