#!/bin/bash

echo "Updating nginx configuration for Financial Clinic..."

# Backup current config
sudo cp /etc/nginx/sites-available/financialclinic.ae /etc/nginx/sites-available/financialclinic.ae.backup.$(date +%Y%m%d_%H%M%S)

# Copy new config (assuming it's uploaded to /tmp)
sudo cp /tmp/nginx.conf.onprem.fixed /etc/nginx/sites-available/financialclinic.ae

# Test configuration
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "Nginx configuration test passed. Reloading..."
    sudo systemctl reload nginx
    echo "Nginx reloaded successfully!"
    
    # Test API
    echo "Testing API endpoint..."
    curl -I https://financialclinic.ae/api/v1/health
else
    echo "Nginx configuration test failed. Please check the config."
    exit 1
fi
