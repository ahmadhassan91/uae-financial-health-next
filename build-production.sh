#!/bin/bash
# =============================================================================
# ON-PREM PRODUCTION DEPLOYMENT SCRIPT
# =============================================================================
# This script builds and deploys Next.js in PRODUCTION SERVER MODE
# This is the recommended approach for on-prem deployment with PM2
# =============================================================================

set -e

echo "🏗️  Building Financial Clinic for On-Prem Deployment (Production Server Mode)"
echo "=============================================================================="

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the frontend directory"
    exit 1
fi

# Step 1: Create .env.local for production build
echo ""
echo "📝 Step 1: Setting up environment..."
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://financialclinic.ae/api/v1
NEXT_PUBLIC_BASE_URL=https://financialclinic.ae
NEXT_PUBLIC_ENVIRONMENT=production
EOF

echo "   ✅ Created .env.local"

# Step 2: Install dependencies
echo ""
echo "📦 Step 2: Installing dependencies..."
npm ci --production=false

# Step 3: Build the application (production mode, NOT static export)
echo ""
echo "🔨 Step 3: Building application in PRODUCTION mode..."
npm run build

# Step 4: Verify output
echo ""
echo "📁 Step 4: Verifying build output..."
if [ -d ".next" ]; then
    echo "   ✅ Production build successful!"
    echo "   📂 Output directory: ./.next"
    echo ""
    echo "   Size: $(du -sh .next | cut -f1)"
else
    echo "   ❌ Error: '.next' directory not found"
    echo "   The build may have failed"
    exit 1
fi

# Step 5: Create logs directory
echo ""
echo "📂 Step 5: Creating logs directory..."
mkdir -p logs
echo "   ✅ Created logs directory"

# Step 6: Deployment Instructions
echo ""
echo "=============================================================================="
echo "🚀 DEPLOYMENT COMPLETE - NEXT STEPS"
echo "=============================================================================="
echo ""
echo "The application is built. Now deploy with PM2:"
echo ""
echo "1. STOP the old process (if running):"
echo "   pm2 stop financial-clinic 2>/dev/null || true"
echo ""
echo "2. START the production server:"
echo "   pm2 start ecosystem.config.js --env production"
echo ""
echo "3. SAVE PM2 configuration (persist across reboots):"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
echo "4. CHECK status:"
echo "   pm2 status"
echo "   pm2 logs financial-clinic"
echo ""
echo "5. If you need to restart after code changes:"
echo "   npm run build && pm2 restart financial-clinic"
echo ""
echo "=============================================================================="
echo "✅ Build complete! Run 'pm2 start ecosystem.config.js' to start the server"
echo "=============================================================================="
