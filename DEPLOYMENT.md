# 🚀 ZeroShield Cloud & Production Deployment Guide

This document outlines the complete deployment workflow for **ZeroShield Zero-Trust Security Gateway**, covering deployment on **Vercel** (Frontend) and **Render** (Express Backend), along with environment variable configurations and system requirements.

---

## 📋 System & Software Requirements (`requirements.txt`)

```txt
# Runtimes
node >= 18.0.0
npm >= 9.0.0

# Frontend Dependencies
react == 18.3.1
react-dom == 18.3.1
tailwindcss == 4.0.0
@tailwindcss/vite == 4.0.0
lucide-react == 1.16.0
recharts == 3.0.0

# Build Tooling
vite == 8.2.0
@vitejs/plugin-react == 4.3.4
```

---

## ⚡ 1. Frontend Deployment (Vercel)

The frontend is built with **React 18** and **Vite 8**, configured for static single-page app (SPA) hosting with security headers.

### Configuration (`vercel.json`)
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "cleanUrls": true,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Steps to Deploy on Vercel:
1. Log in to [Vercel Dashboard](https://vercel.com/new).
2. Connect your GitHub repository: `sathish1509/ZeroShield`.
3. Add the following **Environment Variables**:
   * `VITE_ABUSEIPDB_API_KEY`: Your AbuseIPDB Key
   * `VITE_GEMINI_API_KEY`: Your Google Gemini AI Key
   * `VITE_IPINFO_API_KEY`: Your IPInfo Key
4. Click **Deploy**. Vercel will execute `npm run build` and publish the production dist bundle.

---

## 🛡️ 2. Backend Deployment (Render)

The backend is an **Express.js** Node server managing Zero-Trust mTLS proxy rules, JWT validation, and threat detection algorithms.

### Configuration (`render.yaml`)
```yaml
services:
  - type: web
    name: zeroshield-backend
    runtime: node
    region: singapore
    rootDir: server
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

### Steps to Deploy on Render:
1. Log in to [Render Dashboard](https://dashboard.render.com/select-repo?type=web).
2. Connect repository `sathish1509/ZeroShield`.
3. Select **Web Service**:
   * **Root Directory**: `server`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
4. Add **Environment Variables**:
   * `DATABASE_URL`: PostgreSQL / Supabase connection string
   * `JWT_ACCESS_SECRET`: Secret key for RS256 JWT tokens
   * `JWT_REFRESH_SECRET`: Secret key for refresh tokens
   * `CLIENT_ORIGIN`: Your Vercel frontend URL (e.g. `https://zeroshield.vercel.app`)
5. Click **Create Web Service**.

---

## 🛠️ 3. Local Production Verification

To test and verify the production bundle locally before pushing:

```bash
# 1. Install dependencies
npm install

# 2. Build production assets
npm run build

# 3. Preview production build
npm run preview
```
