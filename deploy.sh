#!/bin/bash
# =============================================================================
# DEPLOYMENT SCRIPT (Run this when deploying new changes)
# =============================================================================
# This script handles the clean build and restart of the application
# Use this every time you pull new code.
# =============================================================================

echo "🚀 Starting Deployment Process..."
echo "================================================="

# 1. Stop existing process
echo "🛑 Stopping current service..."
pm2 stop financial-clinic 2>/dev/null || true

# 2. Clean build artifacts to prevent caching issues
echo "🧹 Cleaning cache (.next, out, node_modules/.cache)..."
rm -rf .next
rm -rf out
rm -rf node_modules/.cache

# 3. Use correct Node version (optional, if you use nvm)
# export NVM_DIR="$HOME/.nvm"
# [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 4. Install Dependencies
echo "📦 Installing/Updating dependencies..."
npm install

# 5. Build (Standard Production Build, strictly forcing STATIC_EXPORT=false)
echo "🔨 Building project..."
export STATIC_EXPORT=false
if npm run build; then
    echo "   ✅ Build Successful!"
else
    echo "   ❌ Build Failed!"
    exit 1
fi

# 6. Restart PM2 with fresh configuration
echo "🔄 Restarting PM2 process..."
pm2 delete financial-clinic 2>/dev/null || true
pm2 start ecosystem.config.js --env production

# 7. Save PM2 list for auto-restart on reboot
echo "💾 Saving PM2 configuration..."
pm2 save

echo "================================================="
echo "✅ Deployment Complete!"
echo "   Server is running on port 3000"
echo "   Check logs with: pm2 logs financial-clinic"
echo "================================================="
