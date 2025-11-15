# Netlify Deployment Configuration

This document explains the Next.js configuration changes made for Netlify deployment.

## Configuration Changes

### 1. Next.js Configuration (`next.config.ts`)

The following changes were made to support static export and Netlify deployment:

- **Static Export**: Configured `output: 'export'` for static site generation
- **Image Optimization**: Disabled with `images: { unoptimized: true }` (required for static export)
- **Trailing Slash**: Enabled with `trailingSlash: true` for better compatibility
- **Environment Variables**: Configured default production API URL
- **API Rewrites**: Conditionally enabled only for development
- **Bundle Optimization**: Added webpack configuration for better caching

### 2. Environment Variables

#### Development
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Production (Netlify)
```bash
NEXT_PUBLIC_API_URL=https://uae-financial-health-api-4188fd6ae86c.herokuapp.com
```

### 3. Dynamic Routes

The dynamic company survey route `/survey/c/[companyId]` was configured for static generation:

- Created `generateStaticParams()` function to pre-generate common company routes
- Wrapped client component with Suspense boundary for `useSearchParams()` compatibility
- Pre-generated routes for: emiratesnbd, adcb, mashreq, etisalat, dnata, demo

## Build Process

### Local Build
```bash
npm run build
```

### Production Build (with environment variable)
```bash
NEXT_PUBLIC_API_URL=https://uae-financial-health-api-4188fd6ae86c.herokuapp.com npm run build
```

## Output

The build generates a static export in the `out/` directory containing:
- Static HTML files for all routes
- Optimized JavaScript bundles
- Static assets (images, fonts, etc.)
- Pre-generated company survey pages

## Netlify Configuration Requirements

For Netlify deployment, configure:

1. **Build Command**: `npm run build`
2. **Publish Directory**: `out`
3. **Node Version**: 18.x
4. **Environment Variables**: Set `NEXT_PUBLIC_API_URL` to the Heroku backend URL

## Features Maintained

All existing functionality is preserved:
- Authentication flows (JWT tokens, simple auth, post-registration)
- Survey submission and results
- Admin dashboard
- Localization (English/Arabic with RTL support)
- Company-specific survey links
- Report generation and email delivery
- Guest user flows

## API Integration

The frontend communicates directly with the Heroku FastAPI backend at:
`https://uae-financial-health-api-4188fd6ae86c.herokuapp.com`

No API proxy is needed in production as the frontend makes direct HTTPS requests to the backend.