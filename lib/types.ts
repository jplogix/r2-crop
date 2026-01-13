export interface InputRow {
  sku: string
  imageUrls: string[] // Dynamic array of image URLs from CSV columns
}

export interface OutputRow {
  sku: string
  [key: string]: string // Dynamic R2 URLs with original column names
}

export interface ProcessingProgress {
  currentRow: number
  totalRows: number
  currentSku: string
  status: "processing" | "complete" | "error"
  error?: string
}

export interface ProcessingError {
  sku: string
  imageIndex: number
  error: string
}

export interface CropDimensions {
  width: number
  height: number
}
