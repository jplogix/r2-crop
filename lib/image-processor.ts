import type { CropDimensions } from "./types"
import sharp from "sharp"

export async function downloadImage(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`)
  }
  return response.arrayBuffer()
}

export async function cropImage(imageBuffer: ArrayBuffer, dimensions: CropDimensions): Promise<Buffer> {
  // Convert ArrayBuffer to Buffer
  const buffer = Buffer.from(imageBuffer)

  // Get image metadata to calculate dimensions
  const metadata = await sharp(buffer).metadata()
  
  if (!metadata.width || !metadata.height) {
    throw new Error("Unable to determine image dimensions")
  }

  const originalWidth = metadata.width
  const originalHeight = metadata.height
  const targetWidth = dimensions.width
  const targetHeight = dimensions.height

  // Calculate scale to fit: maintain aspect ratio
  // We want to make the product as wide as possible, so we scale based on width
  const scaleX = targetWidth / originalWidth
  const scaleY = targetHeight / originalHeight
  const scale = Math.min(scaleX, scaleY) // Use the smaller scale to ensure it fits

  const resizedWidth = Math.round(originalWidth * scale)
  const resizedHeight = Math.round(originalHeight * scale)

  // Resize the image first
  const resizedBuffer = await sharp(buffer)
    .resize(resizedWidth, resizedHeight, {
      fit: "inside",
      withoutEnlargement: false, // Allow upscaling if needed
    })
    .toBuffer()

  // Create final image with exact dimensions and white background
  // Center the product vertically (middle of y-axis)
  const jpegBuffer = await sharp({
    create: {
      width: targetWidth,
      height: targetHeight,
      channels: 3,
      background: { r: 255, g: 255, b: 255 }, // White background
    },
  })
    .composite([
      {
        input: resizedBuffer,
        top: Math.round((targetHeight - resizedHeight) / 2), // Center vertically
        left: Math.round((targetWidth - resizedWidth) / 2), // Center horizontally
      },
    ])
    .jpeg({ quality: 90 })
    .toBuffer()

  return jpegBuffer
}
