# 🚀 ZeroShield Deployment Guide (Vercel & Render)

This document provides step-by-step instructions for deploying the **ZeroShield Platform** (Vite + React Frontend and Express + Prisma Node.js Backend) to **Vercel** and **Render**.

---

## 📋 Overview

| Platform | Recommended Use Case | Configuration File |
|----------|----------------------|--------------------|
| **Vercel** | SPA Frontend hosting (or fullstack serverless) | [`vercel.json`](file:///d:/ZeroShield/ZeroShield/vercel.json) |
| **Render** | Persistent Node.js Web Service (Backend) & Static Site (Frontend Blueprint) | [`render.yaml`](file:///d:/ZeroShield/ZeroShield/render.yaml) |

---

## ⚡ Option 1: Hybrid Deployment (Vercel Frontend + Render Backend) — Recommended

This architecture deploys the persistent Node.js Express API to **Render Web Service** and the Vite React UI to **Vercel**.

### Step 1: Deploy Backend to Render

1. Log into [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** $\rightarrow$ **Blueprint**.
3. Connect your ZeroShield Git repository.
4. Render will read `render.yaml` and discover the `zeroshield-backend` web service.
5. Configure the required environment variables:
   - `DATABASE_URL`: Your PostgreSQL / Supabase connection string.
   - `CLIENT_ORIGIN`: Your Vercel frontend URL (e.g., `https://zeroshield.vercel.app`).
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
6. Click **Apply**. Once built, note your backend URL (e.g., `https://zeroshield-backend.onrender.com`).

### Step 2: Deploy Frontend to Vercel

1. Log into [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New** $\rightarrow$ **Project**.
3. Import the ZeroShield repository.
4. Set Framework Preset: **Vite**.
5. Set Build Command: `npm run build`
6. Set Output Directory: `dist`
7. Add Environment Variables:
   - `VITE_API_URL`: Your Render backend URL (e.g. `https://zeroshield-backend.onrender.com`).
8. Click **Deploy**.

---

## 🌐 Option 2: Render Blueprint (All-In-One Deployment)

Deploy both Frontend and Backend using Render's Infrastructure-as-Code Blueprint (`render.yaml`).

1. Connect your repository to Render Blueprints.
2. Render creates two services automatically:
   - `zeroshield-backend`: Node.js Web Service.
   - `zeroshield-frontend`: Static Site serving Vite SPA.
3. Fill in required environment secrets (`DATABASE_URL`, `CLIENT_ORIGIN`, Supabase keys).
4. Click **Deploy**.

---

## 🛠️ Environment Variables Reference

| Key | Description | Required | Example / Default |
|-----|-------------|----------|-------------------|
| `NODE_ENV` | Runtime environment | Yes | `production` |
| `PORT` | API Listening Port | Yes | `10000` (Render) / `4000` |
| `DATABASE_URL` | PostgreSQL Connection String | Yes | `postgresql://user:pass@host:5432/db` |
| `JWT_ACCESS_SECRET` | Signing secret for access tokens | Yes | Minimum 16 random chars |
| `JWT_REFRESH_SECRET` | Signing secret for refresh tokens | Yes | Minimum 16 random chars |
| `CLIENT_ORIGIN` | Allowed CORS Origin | Yes | `https://zeroshield.vercel.app` |
| `COOKIE_SECURE` | Enforce Secure HTTPS cookies | Yes | `true` in production |
| `SUPABASE_URL` | Supabase endpoint | Optional | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase Anon Key | Optional | `eyJhbG...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key | Optional | `eyJhbG...` |

---

## 🔒 Post-Deployment Verification

1. **Backend Health Check**:
   ```bash
   curl https://<your-backend-domain>/api/health
   ```
   Should return: `{"status":"success","data":{"status":"ok","service":"ZeroShield API Engine"}}`

2. **Run Database Migrations & Seed**:
   ```bash
   npx prisma migrate deploy
   node prisma/seed.js
   ```

3. **Verify CORS & Authentication**:
   Log in with seeded demo credentials (`admin@zeroshield.io` / `admin_secret_key_2026`) from your deployed Vercel frontend.
