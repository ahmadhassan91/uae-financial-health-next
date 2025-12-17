#!/bin/bash
# =============================================================================
# ON-PREM DEPLOYMENT SCRIPT
# =============================================================================
# This script builds the frontend for on-prem deployment
# Run this on your local machine or CI server, then copy 'out' folder to server
# =============================================================================

set -e

echo "🏗️  Building Financial Clinic for On-Prem Deployment"
echo "=================================================="

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the frontend directory"
    exit 1
fi

# Step 1: Create .env.local for on-prem build
echo ""
echo "📝 Step 1: Setting up environment..."
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://financialclinic.ae/api/v1
NEXT_PUBLIC_BASE_URL=https://financialclinic.ae
NEXT_PUBLIC_ENVIRONMENT=production
STATIC_EXPORT=true
EOF

echo "   ✅ Created .env.local"

# Step 2: Install dependencies
echo ""
echo "📦 Step 2: Installing dependencies..."
npm install

# Step 3: Build the application
echo ""
echo "🔨 Step 3: Building application..."
npm run build

# Step 4: Verify output
echo ""
echo "📁 Step 4: Verifying build output..."
if [ -d "out" ]; then
    echo "   ✅ Static export successful!"
    echo "   📂 Output directory: ./out"
    echo ""
    echo "   Contents:"
    ls -la out/ | head -20
    echo ""
    echo "   Size: $(du -sh out | cut -f1)"
else
    echo "   ❌ Error: 'out' directory not found"
    echo "   The build may have failed or static export is not enabled"
    exit 1
fi

# Step 5: Create deployment package
echo ""
echo "📦 Step 5: Creating deployment package..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PACKAGE_NAME="financialclinic_frontend_${TIMESTAMP}.tar.gz"

tar -czf "$PACKAGE_NAME" -C out .
echo "   ✅ Created: $PACKAGE_NAME"
echo "   Size: $(du -h "$PACKAGE_NAME" | cut -f1)"

# Instructions
echo ""
echo "=================================================="
echo "🚀 DEPLOYMENT INSTRUCTIONS"
echo "=================================================="
echo ""
echo "1. Copy the package to the on-prem server:"
echo "   scp $PACKAGE_NAME finclinic01@192.168.128.135:/tmp/"
echo ""
echo "2. On the server, extract to web root:"
echo "   sudo mkdir -p /var/www/financialclinic"
echo "   sudo tar -xzf /tmp/$PACKAGE_NAME -C /var/www/financialclinic/out"
echo "   sudo chown -R www-data:www-data /var/www/financialclinic"
echo ""
echo "3. Make sure Nginx is configured:"
echo "   sudo cp nginx.conf.onprem.example /etc/nginx/sites-available/financialclinic.ae"
echo "   sudo ln -sf /etc/nginx/sites-available/financialclinic.ae /etc/nginx/sites-enabled/"
echo "   sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "4. Verify deployment:"
echo "   curl -I https://financialclinic.ae"
echo ""
echo "=================================================="
echo "✅ Build complete!"
echo "=================================================="
