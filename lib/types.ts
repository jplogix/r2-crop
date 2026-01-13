export interface InputRow {
  sku: string
  image_url1: string
  image_url2?: string
  image_url3?: string
  image_url4?: string
  image_url5?: string
  image_url6?: string
  image_url7?: string
  image_url8?: string
}

export interface OutputRow {
  sku: string
  r2_url_1: string
  r2_url_2?: string
  r2_url_3?: string
  r2_url_4?: string
  r2_url_5?: string
  r2_url_6?: string
  r2_url_7?: string
  r2_url_8?: string
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
