import type { InputRow } from "./types"

export function parseCSV(content: string): InputRow[] {
  const lines = content.trim().split("\n")
  if (lines.length < 2) {
    throw new Error("CSV file must contain a header row and at least one data row")
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

  // Validate required columns
  if (!headers.includes("sku")) {
    throw new Error('CSV must contain "sku" column')
  }
  if (!headers.includes("image_url1")) {
    throw new Error('CSV must contain "image_url1" column')
  }

  const rows: InputRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim())
    const row: Partial<InputRow> = {}

    headers.forEach((header, index) => {
      const value = values[index]
      if (value) {
        row[header as keyof InputRow] = value
      }
    })

    // Validate required fields
    if (!row.sku || !row.image_url1) {
      throw new Error(`Row ${i + 1}: Missing required fields (sku or image_url1)`)
    }

    rows.push(row as InputRow)
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
