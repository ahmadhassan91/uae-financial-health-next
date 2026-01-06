import type { NextConfig } from "next";

// Check if we should build for static export (on-prem deployment)
const isStaticExport = process.env.STATIC_EXPORT === 'true';

const nextConfig: NextConfig = {
  // Enable static export for on-prem deployment when STATIC_EXPORT=true
  output: isStaticExport ? 'export' : undefined,
  
  // Exclude dynamic pages from static generation
  ...(isStaticExport && {
    trailingSlash: true,
    images: {
      unoptimized: true
    },
    // Skip static generation for dynamic/authenticated pages
    generateBuildId: () => 'build',
    distDir: 'out',
  }),
  eslint: {
    // Disable ESLint during builds to allow deployment with warnings
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow builds to continue even with TypeScript errors
    ignoreBuildErrors: true,
  },
  // Disable strict mode for builds
  reactStrictMode: false,
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;
