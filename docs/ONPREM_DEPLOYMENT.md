# On-Prem Production Deployment Guide

## The Problem
When running Next.js with `npm run dev` or development mode, pages are compiled **on-demand**, causing 5+ second delays on first page loads.

## The Solution
Run Next.js as a **production server** with PM2. This pre-compiles all pages at build time.

---

## Quick Start (On Your Server)

### 1. Build the Application
```bash
cd /path/to/frontend
npm run build
```

### 2. Start with PM2
```bash
npm run pm2:start
```

### 3. Save PM2 Configuration
```bash
pm2 save
pm2 startup   # Follow the instructions to enable auto-start on boot
```

---

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build production-ready Next.js app |
| `npm run pm2:start` | Start the production server with PM2 |
| `npm run pm2:stop` | Stop the server |
| `npm run pm2:restart` | Rebuild and restart (after code changes) |
| `npm run pm2:logs` | View server logs |

---

## Full Deployment Steps

### Step 1: SSH to Server
```bash
ssh finclinic01@your-server-ip
```

### Step 2: Navigate to Frontend Directory
```bash
cd /path/to/uae-financial-health/frontend
```

### Step 3: Pull Latest Code
```bash
git pull origin main
```

### Step 4: Install Dependencies
```bash
npm ci
```

### Step 5: Build Production Bundle
```bash
npm run build
```

### Step 6: Start/Restart PM2
```bash
# First time:
npm run pm2:start

# After code changes:
npm run pm2:restart
```

### Step 7: Verify
```bash
pm2 status
curl -I http://localhost:3000
```

---

## Nginx Configuration

Ensure Nginx proxies to the Next.js server (port 3000):

```nginx
server {
    listen 443 ssl;
    server_name financialclinic.ae;

    # SSL configuration...

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Why This Works

| Mode | Compilation | First Load |
|------|-------------|------------|
| `npm run dev` | On-demand (slow) | 3-10 seconds |
| `npm run start` (after build) | Pre-compiled | < 500ms |

The production build (`npm run build`) compiles all pages ahead of time. When users access the site, pages are served instantly without runtime compilation.

---

## Troubleshooting

### Check if PM2 is running:
```bash
pm2 status
```

### View logs:
```bash
pm2 logs financial-clinic --lines 100
```

### Restart after crash:
```bash
pm2 restart financial-clinic
```

### If port 3000 is in use:
```bash
lsof -i :3000
kill -9 <PID>
npm run pm2:start
```
