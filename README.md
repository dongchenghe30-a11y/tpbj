# ImageAI Pro

A professional image processing platform powered by Cloudflare Workers AI.

## Features

- **AI Background Removal**: Remove backgrounds instantly with AI
- **Image Compression**: Reduce file size without quality loss
- **Format Conversion**: Convert between JPG, PNG, WebP, and GIF
- **Basic Editing**: Crop, rotate, and flip images
- **Image Optimization**: Adjust brightness, contrast, and saturation
- **Watermark**: Add text or image watermarks
- **Filters**: Apply grayscale, sepia, blur, and other effects
- **Batch Processing**: Process multiple images at once

## Project Structure

```
├── pages/          # Cloudflare Pages frontend
│   ├── index.html  # Main application
│   └── favicon.svg # Favicon icon
└── worker/         # Cloudflare Workers backend
    ├── src/
    │   └── index.js # Worker entry point
    └── wrangler.toml # Worker configuration
```

## Deployment

### Deploy Worker to Cloudflare

1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

3. Deploy the worker:
```bash
cd worker
wrangler deploy
```

4. Update the API URL in `pages/index.html` with your deployed worker URL.

### Deploy Pages to Cloudflare

1. Install Wrangler CLI (if not already installed)
2. Login to Cloudflare (if not already logged in)
3. Deploy to Pages:
```bash
wrangler pages deploy pages
```

## Configuration

The worker is configured in `worker/wrangler.toml`. Update the account ID and any necessary environment variables.

## API Endpoints

- `POST /api/remove-background` - Remove image background using AI
- `POST /api/compress` - Compress image
- `POST /api/convert` - Convert image format
- `POST /api/edit` - Crop, rotate, or flip image
- `POST /api/optimize` - Adjust brightness, contrast, saturation
- `POST /api/watermark` - Add watermark
- `POST /api/filters` - Apply filters
- `POST /api/batch` - Batch process multiple images
- `GET /api/health` - Health check

All endpoints include CORS headers for cross-origin requests.

## License

MIT
