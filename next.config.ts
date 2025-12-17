import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for on-prem deployment (set STATIC_EXPORT=true in .env)
  // When enabled, runs `next build` and exports to 'out' folder
  output: process.env.STATIC_EXPORT === 'true' ? 'export' : undefined,
  
  // Standard build settings
  trailingSlash: true,
  images: {
    unoptimized: true
  },
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
