# Webflow Assets

Dynamic asset loading system for Webflow sites using Vite + Cloudflare R2 with GitHub branch selection for development.

## Setup

1. Install dependencies: `npm install`
2. Build assets: `npm run build:prod` and `npm run build:staging`
3. Set up GitHub secrets:
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_API_TOKEN`
   - `R2_BUCKET_NAME`
4. Rename `workflow-examples` to `.github` to activate workflows
5. Configure asset loader:
   - Copy `asset-loader.js` as starting point
   - Replace `your-bucket-name.r2.dev` with your R2 bucket URL
   - Replace `your-username/your-repo-name` with your GitHub repository

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

## Deployment Workflows

The system includes three deployment workflows:

1. **`main.yml`** - Deploys production assets to `/prod/` when pushing to `main` branch
2. **`dev.yml`** - Deploys staging assets to `/staging/` when pushing to `dev` branch
3. **`branch-deploy.yml`** - Deploys staging assets to `/{branch-name}/` for all other branches

This allows the dev mode branch selector to load assets from any deployed branch.

## Usage in Webflow

1. Copy the contents of `asset-loader.js`
2. Update the configuration section with your values:
   - `baseUrl`: Your Cloudflare R2 bucket URL
   - `githubRepo`: Your GitHub repository (format: `username/repo-name`)
3. Add the configured script to your Webflow site's custom code section

## Dev Mode

Add `?dev` to any URL to enable development mode with:

- Unminified assets
- Branch selection dropdown (fetches branches from configured GitHub repo)
- Real-time manifest info
- Development panel with controls

### Branch Selection

In dev mode, the system will:

1. Fetch all available branches from your GitHub repository
2. Display them in a dropdown in the dev panel
3. Allow switching between branches (saves selection in localStorage)
4. Load assets from `/{branch-name}/` instead of `/staging/`
5. Automatically reload when switching branches

**Note:** Branch selection only works in dev mode. Production always uses `/prod/` path.

### Branch Deployment

- Push to any branch to deploy assets to `/{branch-name}/` path in R2
- The branch selector will show all available branches from GitHub
- Assets are automatically built and deployed via GitHub Actions
- Each branch gets its own isolated asset path
