# Image Processing Pipeline

A production-ready Next.js application for batch processing product images with automatic cropping and Cloudflare R2 storage upload.

## Features

- **CSV/Text File Upload**: Support for bulk image processing via CSV input
- **Configurable Cropping**: Specify custom dimensions with scale-to-fit behavior
- **Cloudflare R2 Integration**: Automatic upload to R2 object storage
- **Progress Tracking**: Real-time processing status with detailed progress indicators
- **Error Handling**: Graceful error handling with validation and detailed error messages
- **Export Options**: Download results as CSV or Excel format

## Prerequisites

- Node.js 18+ 
- Cloudflare account with R2 storage enabled
- R2 API credentials (Account ID, Access Key, Secret Key)

## Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Cloudflare R2 credentials to `.env.local`:
   ```env
   R2_ACCOUNT_ID=your_account_id
   R2_ACCESS_KEY_ID=your_access_key
   R2_SECRET_ACCESS_KEY=your_secret_key
   R2_BUCKET_NAME=your_bucket_name
   ```

### Getting R2 Credentials

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2** in the left sidebar
3. Create a new bucket or use an existing one
4. Go to **Manage R2 API Tokens**
5. Create a new API token with read/write permissions
6. Copy the Account ID, Access Key ID, and Secret Access Key

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Input CSV Format

Your CSV file must include the following columns:

- `sku` (required): Product SKU or unique identifier
- `image_url1` (required): URL to the first product image
- `image_url2` through `image_url8` (optional): Additional image URLs

Example CSV:
```csv
sku,image_url1,image_url2,image_url3
PROD-001,https://example.com/img1.jpg,https://example.com/img2.jpg,
PROD-002,https://example.com/img3.jpg,,
```

## Output Format

The application generates a CSV/Excel file with:

- `sku`: Original product SKU
- `r2_url_1` (required): R2 URL for the first processed image
- `r2_url_2` through `r2_url_8` (optional): R2 URLs for additional images

## How It Works

1. **Upload**: User uploads CSV file with product SKUs and image URLs
2. **Configure**: Set crop dimensions and output format
3. **Process**: For each row:
   - Downloads images from provided URLs
   - Crops images to specified dimensions (scale-to-fit)
   - Uploads to Cloudflare R2 with naming pattern: `{sku}-{index}.jpg`
4. **Download**: Generate and download output file with R2 URLs

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Image Processing**: Sharp
- **Storage**: Cloudflare R2 (S3-compatible)
- **UI Components**: Radix UI + Custom components

## Error Handling

The application handles:
- Missing required fields (sku, image_url1)
- Invalid URLs or unreachable images
- Upload failures to R2
- Invalid CSV format
- Network errors

Errors are displayed in the UI with specific details about what failed.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard:
   - `R2_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME`
4. Deploy

### Other Platforms

Ensure your deployment platform supports:
- Node.js runtime
- Environment variables
- File upload handling
- Sufficient memory for image processing

## License

MIT
