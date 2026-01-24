# Deployment Guide

## Prerequisites

- Node.js installed
- Cloudflare account
- Wrangler CLI installed

## Installation

```bash
npm install -g wrangler
```

## Deploy Worker

```bash
cd worker
wrangler login
wrangler deploy
```

After deployment, copy the worker URL and update it in `pages/index.html`.

## Deploy Pages

```bash
wrangler pages deploy pages
```

## Hardcoded API URL

The frontend uses the hardcoded API URL: `https://tupiaianji.dongchenghe30.workers.dev/`

## CORS Configuration

The worker automatically handles:
- OPTIONS preflight requests
- CORS headers for all responses
- Cross-origin request support
