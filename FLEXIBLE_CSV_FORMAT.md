# Flexible CSV Format Documentation

## Overview
The app now accepts CSV files with **flexible column headers** and can handle **any number of rows**.

## CSV Requirements

### 1. SKU Column (Required)
- Must have a column named: `sku`, `SKU`, `sku_code`, or `product_sku` (case-insensitive)
- This column identifies each product

### 2. Image URL Columns (Flexible)
- **Any other columns** are treated as image URLs
- Column names can be anything (e.g., `image_url_1`, `main_image`, `photo1`, etc.)
- Must contain valid HTTP/HTTPS URLs
- At least **one image URL** is required per row

## Example CSV Formats

### Format 1: Standard
```csv
sku,image_url_1,image_url_2,image_url_3
PROD-001,https://example.com/img1.jpg,https://example.com/img2.jpg,https://example.com/img3.jpg
PROD-002,https://example.com/img4.jpg,,
```

### Format 2: Custom Headers
```csv
SKU,main_photo,side_view,back_view,detail
12345,https://cdn.com/a.jpg,https://cdn.com/b.jpg,https://cdn.com/c.jpg,https://cdn.com/d.jpg
67890,https://cdn.com/e.jpg,https://cdn.com/f.jpg,,
```

### Format 3: Different Column Names
```csv
product_sku,front,back,left,right,top,bottom
ABC-001,https://imgs.com/1.jpg,https://imgs.com/2.jpg,https://imgs.com/3.jpg,https://imgs.com/4.jpg,https://imgs.com/5.jpg,https://imgs.com/6.jpg
ABC-002,https://imgs.com/7.jpg,https://imgs.com/8.jpg,,,,
```

## Features

### ✅ Flexible Headers
- No specific column names required (except SKU)
- Works with any naming convention
- Preserves original column names in output

### ✅ Dynamic Image Processing
- Processes **all image URLs** found in each row
- No limit on number of images per row (handles 1-100+ images)
- Skips empty cells automatically

### ✅ Scalability
- Handles CSVs with **thousands of rows**
- Streams progress updates in real-time
- Memory-efficient processing

### ✅ Robust Error Handling
- Skips rows with missing SKUs (with warning)
- Skips rows with no valid image URLs (with warning)
- Continues processing even if individual images fail
- Only fails if the **first image** of a row fails (critical)

## Output Format

The output CSV will contain:
- Original `sku` column
- Generated columns: `r2_url_1`, `r2_url_2`, `r2_url_3`, etc.
- One R2 URL for each successfully processed image

Example output:
```csv
sku,r2_url_1,r2_url_2,r2_url_3
PROD-001,https://r2crop.unifywebservices.com/PROD-001-1.jpg,https://r2crop.unifywebservices.com/PROD-001-2.jpg,https://r2crop.unifywebservices.com/PROD-001-3.jpg
PROD-002,https://r2crop.unifywebservices.com/PROD-002-1.jpg,,
```

## Processing Rules

1. **First image is required**: If the first image URL fails to process, the entire row fails
2. **Other images are optional**: If images 2-N fail, they're skipped but processing continues
3. **Empty cells ignored**: Blank cells in image columns are automatically skipped
4. **URL validation**: Only cells starting with "http" are treated as image URLs
5. **Row validation**: Rows without a valid SKU or any image URLs are skipped with a warning

## Large CSV Support

The app can handle:
- ✅ 100+ rows: No problem
- ✅ 1,000+ rows: Works smoothly with real-time progress
- ✅ 10,000+ rows: Efficiently processes with streaming
- ✅ Multiple images per product: Up to 100+ images per SKU

Progress bar updates after each row is processed, so you can monitor large batches in real-time.
