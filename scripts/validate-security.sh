#!/bin/bash
# Security Validation Script for Financial Clinic
# Run this script to validate security headers and configurations
# Usage: ./scripts/validate-security.sh [URL]

# Default URL
URL="${1:-https://financialclinic.ae}"

echo "=============================================="
echo "Security Validation Script"
echo "Target: $URL"
echo "Date: $(date)"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check header
check_header() {
    local header_name=$1
    local expected_value=$2
    local response=$3
    
    if echo "$response" | grep -i "^$header_name:" > /dev/null; then
        actual_value=$(echo "$response" | grep -i "^$header_name:" | head -1 | cut -d: -f2- | xargs)
        if [ -n "$expected_value" ]; then
            if echo "$actual_value" | grep -q "$expected_value"; then
                echo -e "${GREEN}✅ PASS${NC}: $header_name"
                echo "   Value: $actual_value"
                return 0
            else
                echo -e "${RED}❌ FAIL${NC}: $header_name"
                echo "   Expected: $expected_value"
                echo "   Got: $actual_value"
                return 1
            fi
        else
            echo -e "${GREEN}✅ PASS${NC}: $header_name present"
            echo "   Value: $actual_value"
            return 0
        fi
    else
        echo -e "${RED}❌ FAIL${NC}: $header_name - Header not found"
        return 1
    fi
}

echo "1. SECURITY HEADERS CHECK"
echo "========================="
echo ""

# Fetch headers from the main page
echo "Fetching headers from $URL..."
HEADERS=$(curl -sI "$URL" 2>/dev/null)

if [ -z "$HEADERS" ]; then
    echo -e "${RED}ERROR: Could not fetch headers from $URL${NC}"
    echo "Make sure the URL is accessible."
    exit 1
fi

echo ""

# Check each security header
PASSED=0
FAILED=0

# 1. X-Frame-Options (Clickjacking protection)
if check_header "X-Frame-Options" "DENY" "$HEADERS"; then
    ((PASSED++))
else
    ((FAILED++))
fi
echo ""

# 2. X-Content-Type-Options (MIME-sniffing protection)
if check_header "X-Content-Type-Options" "nosniff" "$HEADERS"; then
    ((PASSED++))
else
    ((FAILED++))
fi
echo ""

# 3. X-XSS-Protection
if check_header "X-XSS-Protection" "1" "$HEADERS"; then
    ((PASSED++))
else
    ((FAILED++))
fi
echo ""

# 4. Content-Security-Policy
if check_header "Content-Security-Policy" "" "$HEADERS"; then
    ((PASSED++))
else
    ((FAILED++))
fi
echo ""

# 5. Strict-Transport-Security (HSTS)
if check_header "Strict-Transport-Security" "max-age" "$HEADERS"; then
    ((PASSED++))
else
    ((FAILED++))
fi
echo ""

# 6. Referrer-Policy
if check_header "Referrer-Policy" "strict-origin" "$HEADERS"; then
    ((PASSED++))
else
    ((FAILED++))
fi
echo ""

# 7. Permissions-Policy
if check_header "Permissions-Policy" "" "$HEADERS"; then
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  WARN${NC}: Permissions-Policy - Optional header not found"
fi
echo ""

echo ""
echo "2. HOST HEADER INJECTION TEST"
echo "============================="
echo ""

# Test with invalid host header
echo "Testing with invalid Host header (evil.com)..."
INJECTION_RESPONSE=$(curl -sI -H "Host: evil.com" "$URL" 2>/dev/null)
INJECTION_STATUS=$(echo "$INJECTION_RESPONSE" | head -1 | awk '{print $2}')

if [ "$INJECTION_STATUS" = "400" ] || [ "$INJECTION_STATUS" = "444" ] || [ "$INJECTION_STATUS" = "403" ]; then
    echo -e "${GREEN}✅ PASS${NC}: Host header injection blocked (Status: $INJECTION_STATUS)"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}: Host header injection NOT blocked (Status: $INJECTION_STATUS)"
    echo "   Server should reject invalid Host headers"
    ((FAILED++))
fi
echo ""

echo ""
echo "3. API SECURITY HEADERS CHECK"
echo "=============================="
echo ""

API_URL="${URL}/api/v1/health"
echo "Fetching headers from $API_URL..."
API_HEADERS=$(curl -sI "$API_URL" 2>/dev/null)

if [ -n "$API_HEADERS" ]; then
    # Check API security headers
    if check_header "X-Frame-Options" "DENY" "$API_HEADERS"; then
        ((PASSED++))
    else
        ((FAILED++))
    fi
    echo ""
    
    if check_header "Content-Security-Policy" "" "$API_HEADERS"; then
        ((PASSED++))
    else
        ((FAILED++))
    fi
else
    echo -e "${YELLOW}⚠️  WARN${NC}: Could not fetch API headers"
fi
echo ""

echo ""
echo "=============================================="
echo "SUMMARY"
echo "=============================================="
echo ""
echo -e "Tests Passed: ${GREEN}$PASSED${NC}"
echo -e "Tests Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All security checks passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some security checks failed. Please review the results above.${NC}"
    exit 1
fi
