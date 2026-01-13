# Deployment Guide - Dokploy with Nixpacks

## Prerequisites
- ✅ Dokploy installed on your VPS
- ✅ GitHub repository connected
- ✅ Environment variables configured in Dokploy

## Environment Variables Required

Make sure these are set in your Dokploy app settings:

```bash
R2_ACCOUNT_ID=489728cb909b0bfd68e116d4b16f1694
R2_ACCESS_KEY_ID=e4a420ad50f72f1bdc42fab2594bfdd8
R2_SECRET_ACCESS_KEY=c2996027c4f341c65a13677b216f48ff860b4658494a4968bb0726ad75648d64
R2_BUCKET_NAME=r2-crop
R2_PUBLIC_DOMAIN=r2crop.unifywebservices.com
NODE_ENV=production
```

## Deployment Steps

### 1. Configuration Files Created
- ✅ `nixpacks.toml` - Nixpacks build configuration
- ✅ `.dockerignore` - Files to exclude from Docker build

### 2. Build Configuration
The `nixpacks.toml` file configures:
- **Node.js 24** - Latest LTS version
- **pnpm** - Fast package manager
- **Build process**: Install → Build → Start
- **Start command**: `pnpm start` (Next.js production server)

### 3. Deploy in Dokploy

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add Dokploy deployment config"
   git push
   ```

2. **In Dokploy Dashboard**:
   - Go to your app
   - Click **Deploy** or **Redeploy**
   - Nixpacks will automatically detect the configuration
   - Build will run: Install → Build → Start

3. **Monitor Build**:
   - Watch the build logs in Dokploy
   - Ensure all dependencies install correctly
   - Verify Sharp compiles successfully

### 4. Post-Deployment Verification

Check these after deployment:
- [ ] App is running on your domain
- [ ] CSV upload works
- [ ] Image processing completes successfully
- [ ] Images are uploaded to R2
- [ ] Public URLs are accessible via `r2crop.unifywebservices.com`

## Troubleshooting

### Sharp Build Issues
If Sharp fails to build, the `nixpacks.toml` already includes the necessary build tools. Check logs for specific errors.

### Memory Issues
Next.js builds can be memory-intensive. Ensure your VPS has at least 2GB RAM.

### Port Configuration
Dokploy will automatically handle port mapping. Next.js runs on port 3000 by default.

## Build Process

```
1. Setup Phase: Install Node.js 24 & pnpm
2. Install Phase: pnpm install --frozen-lockfile
3. Build Phase: pnpm run build (Next.js compilation)
4. Start: pnpm start (Production server)
```

## Notes

- Production build includes all optimizations
- Sharp binary will be compiled for your VPS architecture
- Environment variables are injected at runtime
- Static assets are optimized during build
