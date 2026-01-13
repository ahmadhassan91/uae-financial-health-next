# Security Fixes Deployment Guide
**Financial Clinic - On-Premises Server**  
**Date:** January 13, 2026

---

## Current Status

**Validation Results (Before Fix):**
```
❌ Frontend security headers: MISSING
❌ Host header injection: NOT BLOCKED  
✅ Backend API headers: WORKING
```

**The backend API already has security headers, but the frontend (served by nginx) is missing them.**

---

## What Needs to Be Done

The client needs to update their nginx configuration to add security headers.

### Files Provided:
1. **`nginx.conf.onprem.secure`** - Updated nginx configuration with security headers
2. **`scripts/validate-security.sh`** - Script to validate the fixes

---

## Step-by-Step Deployment Instructions

### Step 1: Backup Current Configuration

```bash
# SSH to the on-premises server
ssh finclinic01@financialclinic-server

# Backup the current nginx configuration
sudo cp /etc/nginx/sites-available/financialclinic.conf /etc/nginx/sites-available/financialclinic.conf.backup.$(date +%Y%m%d)

# Verify backup
ls -l /etc/nginx/sites-available/financialclinic.conf*
```

---

### Step 2: Update Nginx Configuration

**Option A: Direct Edit (Recommended)**

```bash
# Edit the nginx config file
sudo nano /etc/nginx/sites-available/financialclinic.conf
```

Then **copy the entire content** from `frontend/nginx.conf.onprem.secure` and paste it into the editor.

**Save and exit:** Press `Ctrl+X`, then `Y`, then `Enter`

**Option B: Copy File (If you have file access)**

```bash
# Copy the new config file to the server
scp nginx.conf.onprem.secure finclinic01@financialclinic-server:/tmp/

# On the server, replace the config
sudo cp /tmp/nginx.conf.onprem.secure /etc/nginx/sites-available/financialclinic.conf
```

---

### Step 3: Test Nginx Configuration

```bash
# Test for syntax errors
sudo nginx -t
```

**Expected output:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**If you see errors:**
- Check that all paths in the config match your server setup
- Verify SSL certificate paths are correct
- Review the backup and compare

---

### Step 4: Enable HTTP to HTTPS Redirect

In the nginx config, **uncomment** the HTTP redirect block:

```bash
sudo nano /etc/nginx/sites-available/financialclinic.conf
```

Find this section (lines 9-13):
```nginx
# Redirect HTTP to HTTPS (UNCOMMENT IN PRODUCTION)
#server {
#    listen 80;
#    server_name financialclinic.ae www.financialclinic.ae;
#    return 301 https://$host$request_uri;
#}
```

Change it to:
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name financialclinic.ae www.financialclinic.ae;
    return 301 https://$host$request_uri;
}
```

---

### Step 5: Reload Nginx

```bash
# Reload nginx to apply changes
sudo systemctl reload nginx

# Check nginx status
sudo systemctl status nginx
```

**Expected output:**
```
● nginx.service - A high performance web server and a reverse proxy server
   Loaded: loaded
   Active: active (running)
```

---

### Step 6: Validate Security Headers

**From your local machine**, run the validation script:

```bash
cd /Users/clustox_1/Documents/uae-financial-health/frontend
./scripts/validate-security.sh https://financialclinic.ae
```

**Expected output (all passing):**
```
==============================================
Security Validation Script
Target: https://financialclinic.ae
==============================================

1. SECURITY HEADERS CHECK
=========================

✅ PASS: X-Frame-Options
   Value: DENY

✅ PASS: X-Content-Type-Options
   Value: nosniff

✅ PASS: X-XSS-Protection
   Value: 1; mode=block

✅ PASS: Content-Security-Policy present
   Value: default-src 'self'; ...

✅ PASS: Strict-Transport-Security
   Value: max-age=31536000; includeSubDomains; preload

✅ PASS: Referrer-Policy
   Value: strict-origin-when-cross-origin

⚠️  WARN: Permissions-Policy - Optional header not found

2. HOST HEADER INJECTION TEST
=============================

✅ PASS: Host header injection blocked (Status: 444)

3. API SECURITY HEADERS CHECK
==============================

✅ PASS: X-Frame-Options
   Value: DENY

✅ PASS: Content-Security-Policy present

==============================================
SUMMARY
==============================================

Tests Passed: 9
Tests Failed: 0

✅ All security checks passed!
```

---

### Step 7: Manual Browser Verification

1. **Open browser DevTools** (F12)
2. Go to **Network tab**
3. Visit `https://financialclinic.ae`
4. Click on the first request (usually the HTML document)
5. Check **Response Headers** section

**You should see:**
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; ...
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Referrer-Policy: strict-origin-when-cross-origin
```

---

## Key Changes in the New Configuration

### 1. Security Headers (Lines 44-66)
```nginx
# Prevent Clickjacking
add_header X-Frame-Options "DENY" always;

# Content Security Policy
add_header Content-Security-Policy "..." always;

# Strict Transport Security
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

### 2. Host Header Validation (Lines 68-73)
```nginx
# Prevents Host Header Injection
if ($host !~ ^(financialclinic\.ae|www\.financialclinic\.ae)$) {
    return 444;
}
```

### 3. SSL Configuration (Lines 25-34)
```nginx
# Strong SSL protocols and ciphers
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers off;
```

---

## Troubleshooting

### Issue: nginx -t fails with "duplicate location"
**Solution:** Remove any duplicate `location` blocks from the old config

### Issue: Site not loading after reload
**Solution:** 
```bash
# Check nginx error log
sudo tail -f /var/log/nginx/error.log

# Restore backup if needed
sudo cp /etc/nginx/sites-available/financialclinic.conf.backup.* /etc/nginx/sites-available/financialclinic.conf
sudo systemctl reload nginx
```

### Issue: CSP blocking some resources
**Symptom:** Console errors about blocked content

**Solution:** Adjust the CSP `connect-src` directive to include your specific domains:
```nginx
connect-src 'self' https://financialclinic.ae https://your-other-domain.com;
```

---

## Rollback Procedure

If anything goes wrong:

```bash
# Restore the backup
sudo cp /etc/nginx/sites-available/financialclinic.conf.backup.YYYYMMDD /etc/nginx/sites-available/financialclinic.conf

# Test
sudo nginx -t

# Reload
sudo systemctl reload nginx
```

---

## Post-Deployment Checklist

- [ ] Nginx configuration updated
- [ ] Nginx test passed (`nginx -t`)
- [ ] Nginx reloaded successfully
- [ ] HTTP redirects to HTTPS
- [ ] All security headers present (validate script passes)
- [ ] Website loads correctly
- [ ] API endpoints working
- [ ] No console errors in browser
- [ ] Login/authentication working
- [ ] Survey submission working
- [ ] PDF generation working

---

## Security Audit Compliance

After applying these changes:

| Finding | Status |
|---------|--------|
| ✅ Clickjacking (X-Frame-Options) | **FIXED** |
| ✅ Missing CSP | **FIXED** |
| ✅ Host Header Injection | **FIXED** |
| ⚠️ LocalStorage tokens | **MITIGATED** |

**3 out of 4 findings fully resolved.** The LocalStorage finding is mitigated through CSP and other controls (see `SECURITY_AUDIT_STATUS.md`).

---

## Support Contacts

If you need assistance during deployment:
- **Developer:** Ahmad (clustox)
- **Documentation:** See `frontend/docs/SECURITY_AUDIT_STATUS.md`
- **Validation Script:** `frontend/scripts/validate-security.sh`

---

*Last Updated: January 13, 2026*
