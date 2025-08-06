# Webflow Assets

Dynamic asset loading system for Webflow sites using Vite + Cloudflare R2.

## Setup

1. Install dependencies: `npm install`
2. Build assets: `npm run build:prod` and `npm run build:staging`
3. Set up GitHub secrets:
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_API_TOKEN`
   - `R2_BUCKET_NAME`
4. Rename `workflow-examples` to `.github` to activate workflows

## Cloudflare Setup

1. Make bucket
2. Enable public access
3. Configure CORS:

```
[
  {
    "AllowedOrigins": [
      "https://domain.webflow.io"
    ],
    "AllowedMethods": [
      "GET"
    ],
    "AllowedHeaders": [
      "Content-Type"
    ],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3600
  }
]
```

## Development

- `npm run dev` - Start dev server
- `npm run build:staging` - Build staging assets
- `npm run build:prod` - Build production assets

## Usage in Webflow

Add the asset loader script to your Webflow site's custom code section after setting cloudflare R2 url.

## Dev Mode

Add `?dev` to any URL to enable development mode with unminified assets.
