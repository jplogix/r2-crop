import type { InputRow } from "./types"

/**
 * Parse CSV with flexible format:
 * - First column (or any column named 'sku') contains the SKU
 * - All other columns are treated as image URLs
 * - No specific header names required
 */
export function parseCSV(content: string): InputRow[] {
  const lines = content.trim().split("\n")
  if (lines.length < 2) {
    throw new Error("CSV file must contain a header row and at least one data row")
  }

  // Parse headers (preserve original case for output)
  const headers = lines[0].split(",").map((h) => h.trim())
  const headersLower = headers.map((h) => h.toLowerCase())

  // Find SKU column (case-insensitive)
  const skuIndex = headersLower.findIndex((h) => h === "sku" || h === "sku_code" || h === "product_sku")
  
  if (skuIndex === -1) {
    throw new Error('CSV must contain a "sku" column (or similar: sku_code, product_sku)')
  }

  // Get all non-SKU column indices (these are image URL columns)
  const imageColumnIndices: number[] = []
  const imageColumnNames: string[] = []
  
  headers.forEach((header, index) => {
    if (index !== skuIndex && header) {
      imageColumnIndices.push(index)
      imageColumnNames.push(header)
    }
  })

  if (imageColumnIndices.length === 0) {
    throw new Error("CSV must contain at least one image URL column besides the SKU column")
  }

  const rows: InputRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue // Skip empty lines

    const values = line.split(",").map((v) => v.trim())
    
    const sku = values[skuIndex]
    if (!sku) {
      console.warn(`Row ${i + 1}: Missing SKU, skipping`)
      continue
    }

    // Collect all image URLs from the row
    const imageUrls: string[] = []
    imageColumnIndices.forEach((colIndex) => {
      const url = values[colIndex]
      if (url && url.startsWith("http")) {
        imageUrls.push(url)
      }
    })

    if (imageUrls.length === 0) {
      console.warn(`Row ${i + 1}: No valid image URLs found for SKU ${sku}, skipping`)
      continue
    }

    rows.push({
      sku,
      imageUrls,
    })
  }

  if (rows.length === 0) {
    throw new Error("No valid rows found in CSV")
  }

  return rows
}

export function generateCSV(data: Record<string, string>[]): string {
  if (data.length === 0) return ""

  const headers = Object.keys(data[0])
  const csvLines = [headers.join(",")]

  data.forEach((row) => {
    const values = headers.map((header) => row[header] || "")
    csvLines.push(values.join(","))
  })

  return csvLines.join("\n")
}
