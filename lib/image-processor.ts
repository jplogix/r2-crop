import sharp from "sharp";
import type { CropDimensions } from "./types";

const DOWNLOAD_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

export async function downloadImage(url: string): Promise<ArrayBuffer> {
	// Retry logic with exponential backoff
	for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT);

			const response = await fetch(url, {
				signal: controller.signal,
				headers: {
					"User-Agent": "Mozilla/5.0 (compatible; ImageProcessor/1.0)",
				},
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				// Provide more specific error messages
				if (response.status === 403) {
					throw new Error(`Access forbidden (403) - check URL permissions`);
				} else if (response.status === 404) {
					throw new Error(`Image not found (404)`);
				} else if (response.status === 429) {
					throw new Error(`Rate limited (429) - too many requests`);
				} else if (response.status >= 500) {
					throw new Error(`Server error (${response.status})`);
				} else {
					throw new Error(
						`Download failed (${response.status}): ${response.statusText}`,
					);
				}
			}

			const arrayBuffer = await response.arrayBuffer();

			// Validate that we got actual data
			if (arrayBuffer.byteLength === 0) {
				throw new Error("Downloaded image is empty");
			}

			return arrayBuffer;
		} catch (error) {
			// Handle abort/timeout errors
			if (error instanceof Error && error.name === "AbortError") {
				if (attempt < MAX_RETRIES) {
					await new Promise((resolve) =>
						setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempt)),
					);
					continue;
				}
				throw new Error(`Download timeout after ${DOWNLOAD_TIMEOUT}ms`);
			}

			// Handle network errors
			if (error instanceof TypeError && error.message.includes("fetch")) {
				if (attempt < MAX_RETRIES) {
					await new Promise((resolve) =>
						setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempt)),
					);
					continue;
				}
				throw new Error("Network error - check URL and internet connection");
			}

			// If this is the last attempt or it's a non-retryable error, throw it
			if (
				attempt === MAX_RETRIES ||
				(error instanceof Error &&
					(error.message.includes("403") ||
						error.message.includes("404") ||
						error.message.includes("empty")))
			) {
				throw error;
			}

			// Wait before retrying
			await new Promise((resolve) =>
				setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempt)),
			);
		}
	}

	throw new Error("Failed to download image after retries");
}

export async function cropImage(
	imageBuffer: ArrayBuffer,
	dimensions: CropDimensions,
): Promise<Buffer> {
	try {
		// Convert ArrayBuffer to Buffer
		const buffer = Buffer.from(imageBuffer);

		// Validate buffer
		if (buffer.length === 0) {
			throw new Error("Image buffer is empty");
		}

		// Get image metadata to calculate dimensions
		const metadata = await sharp(buffer).metadata();

		if (!metadata.width || !metadata.height) {
			throw new Error("Invalid image - unable to determine dimensions");
		}

		if (!metadata.format) {
			throw new Error("Unsupported or corrupted image format");
		}

		const originalWidth = metadata.width;
		const originalHeight = metadata.height;
		const targetWidth = dimensions.width;
		const targetHeight = dimensions.height;

		// Calculate scale to fit: maintain aspect ratio
		// We want to make the product as wide as possible, so we scale based on width
		const scaleX = targetWidth / originalWidth;
		const scaleY = targetHeight / originalHeight;
		const scale = Math.min(scaleX, scaleY); // Use the smaller scale to ensure it fits

		const resizedWidth = Math.round(originalWidth * scale);
		const resizedHeight = Math.round(originalHeight * scale);

		// Resize the image first
		const resizedBuffer = await sharp(buffer)
			.resize(resizedWidth, resizedHeight, {
				fit: "inside",
				withoutEnlargement: false, // Allow upscaling if needed
			})
			.toBuffer();

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
			.toBuffer();

		return jpegBuffer;
	} catch (error) {
		// Provide more context for sharp errors
		if (error instanceof Error) {
			if (error.message.includes("unsupported")) {
				throw new Error(
					"Unsupported image format - please use JPEG, PNG, or WebP",
				);
			} else if (error.message.includes("corrupt")) {
				throw new Error("Corrupted image file");
			} else if (error.message.includes("Input buffer")) {
				throw new Error("Invalid image data");
			} else {
				throw new Error(`Image processing failed: ${error.message}`);
			}
		}
		throw error;
	}
}
