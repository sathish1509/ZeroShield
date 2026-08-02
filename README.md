# 🛡️ ZeroShield - Enterprise Cybersecurity & Zero-Trust Access Control Platform

**ZeroShield** is a modern, futuristic, enterprise-grade cybersecurity command center and Zero-Trust access control platform built for real-time threat detection, API microservice proxy authorization, interactive service mesh topology analytics, and live SOC war-room attack simulations.

![ZeroShield Security Platform](https://img.shields.io/badge/ZeroShield-v3.4-10B981?style=for-the-badge&logo=shield)
![React 18](https://img.shields.io/badge/React-18.3.1-2563EB?style=for-the-badge&logo=react)
![Vite 6](https://img.shields.io/badge/Vite-6.4-646CFF?style=for-the-badge&logo=vite)
![Tailwind CSS v4](https://img.shields.io/badge/TailwindCSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss)
![Node 24](https://img.shields.io/badge/Node.js-24.x-339933?style=for-the-badge&logo=nodedotjs)
![Express 5](https://img.shields.io/badge/Express-5.1-000000?style=for-the-badge&logo=express)
![Prisma ORM](https://img.shields.io/badge/Prisma-6.16-2D3748?style=for-the-badge&logo=prisma)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)
![Google Gemini AI](https://img.shields.io/badge/Gemini_AI-1.5_Flash-8E75B2?style=for-the-badge&logo=googlegemini)

---

## 🌐 Live Production Deployments

- 🚀 **Live Frontend Web Application (Vercel)**: [https://zero-shield-iota.vercel.app/](https://zero-shield-iota.vercel.app/)
- 🛡️ **Live Express Backend API Engine (Render)**: [https://zeroshield-backend-4px0.onrender.com/](https://zeroshield-backend-4px0.onrender.com/)
- 💚 **Backend API Health Check Endpoint**: [https://zeroshield-backend-4px0.onrender.com/api/health](https://zeroshield-backend-4px0.onrender.com/api/health)

---

## 🏛️ Executive Architecture Overview

ZeroShield operates on the **"Never Trust, Always Verify"** Zero-Trust paradigm. In traditional perimeter-based security models, once a request bypasses the external gateway, internal microservices trust each other implicitly. ZeroShield removes implicit trust by deploying an edge proxy layer that intercepts **every single request** between microservices and enforces a 5-step validation pipeline in real-time.

```
                                  ZEROSHIELD MESH SECURITY BOUNDARY
                                ┌────────────────────────────────────┐
                                │                                    │
 [ Client / Ingress ] ───────► │ [ ZeroTrust Proxy Node Shard ]     │
                                │   ├─ 1. RS256 JWT Verification     │
                                │   ├─ 2. Scope & RBAC Policy Check  │
                                │   ├─ 3. WAF SQLi/Payload Scanner   │ ──────► [ Target Service B ]
                                │   ├─ 4. AI Risk Score Assessment   │          (Allowed 200 OK)
                                │   └─ 5. Audit Logger Enforcement   │
                                │                                    │
                                └─────────────────┬──────────────────┘
                                                  │
                                                  ▼
                                         [ Request Dropped ]
                                        (Blocked 403 Forbidden)
```

### Key Security Principles:
1. **Cryptographic Identity Verification**: Mandatory RS256 asymmetric JWT signature checks on incoming Authorization headers.
2. **Microservice Scoping & Lateral Movement Defense**: Prevents compromised non-essential worker containers (e.g. Analytics) from jumping directly to secure data vaults.
3. **Deep Packet WAF Payload Scanner**: Intercepts malicious SQL injection payloads (`UNION SELECT`, `' OR '1'='1`) and command execution strings.
4. **AI-Driven Threat Risk Engine**: Dynamically scores requests (0–100) based on anomaly severity, client IP reputation, and geofencing policies.

---

## 🛠️ Complete Technology Stack Specification

| Layer | Technology / Library | Version | Purpose & Description |
| :--- | :--- | :--- | :--- |
| **Frontend Core** | React | `18.3.1` | Component-based UI library with Concurrent Mode rendering |
| **Build System** | Vite | `6.4.3` | High-performance Rollup-backed bundler and HMR dev server |
| **Styling & Design** | Tailwind CSS | `4.0.0` | Utility-first CSS framework with modern color tokens and custom glassmorphism utilities |
| **Icons & UI Assets** | Lucide React | `1.16.0` | Vector icon library for security status indicators, nodes, and action triggers |
| **Data Visualization**| Recharts | `3.0.0` | SVG chart library for traffic trends, latency distribution histograms, and heatmaps |
| **Backend Runtime** | Node.js | `24.x` | Asynchronous JavaScript runtime engine |
| **API Framework** | Express | `5.1.0` | Micro-framework providing RESTful API routes, middleware pipelines, and error handlers |
| **Database & ORM** | Prisma + Supabase | `6.16.0` | Type-safe PostgreSQL ORM with cloud-managed database persistence |
| **Security & Auth** | JSONWebToken / Helmet | `9.0.2` / `8.3` | RS256 token verification, Helmet HTTP response security headers, and rate limiters |
| **AI Threat Intelligence** | Google Gemini AI | `1.5 Flash` | Generative AI LLM for 1-click Root Cause Analysis (RCA) and SOC remediation reports |
| **Threat Score API** | AbuseIPDB API | `v2` | Global honeypot threat database querying IP abuse confidence scores (0-100%) |
| **IP Geolocation API** | IPInfo API | `v1` | Real-time IP resolution for physical location, ISP, organization, and coordinates |

---

## 📂 Project Directory Structure

```
ZeroShield/
├── .env                       # Root environment variables (API keys, DB connection)
├── .npmrc                     # npm configuration for legacy peer dependency resolution
├── DEPLOYMENT.md              # Cloud deployment manual for Vercel and Render
├── PROCESS.md                 # Project architecture log & decision matrix
├── README.md                  # Master documentation manual
├── REQUIREMENTS.md            # System requirements specification
├── USER_ACCESS.md             # Role-based credential reference guide
├── vercel.json                # Vercel SPA routes & security headers configuration
├── render.yaml                # Render backend service deployment blueprint
├── package.json               # Frontend root dependencies & npm build scripts
├── vite.config.js             # Vite 6 configuration file
│
├── api/                       # Vercel Serverless Function entry point
│   └── index.js               # Handler forwarding /api requests to Express server
│
├── src/                       # Frontend React Application
│   ├── assets/                # Static visual assets & branding
│   ├── components/            # Reusable UI Components
│   │   ├── common/            # GlassCard, StatCard, Badge, Toast, GeminiAiModal
│   │   ├── layout/            # TopNav, Sidebar layout components
│   │   └── topology/          # Interactive Service Mesh Canvas & Diagram
│   ├── config/                # Access matrix definitions & role limits
│   ├── context/               # SecurityContext provider (global security state)
│   ├── mock/                  # Static baseline security logs & mock datasets
│   ├── pages/                 # 10 Platform Module Page Views
│   └── services/              # API Client Integrations (Gemini AI, AbuseIPDB, IPInfo)
│
└── server/                    # Express.js Backend Application
    ├── package.json           # Backend dependencies & Prisma scripts
    ├── prisma/                # Prisma Schema & Database seed scripts
    └── src/
        ├── app.js             # Express app setup, CORS, Helmet, and route definitions
        ├── server.js          # HTTP server listener (Port 4000/10000)
        ├── config/            # Environment variable validation via Zod
        ├── controllers/       # Business logic (Policies, Traffic, Threats, Simulation)
        ├── middleware/        # zeroTrustProxy.js, rateLimiter.js, errorHandler.js
        ├── models/            # Data access functions for policies & simulations
        └── routes/            # REST API endpoints (/api/auth, /api/policies, etc.)
```

---

## 📱 10 Platform Modules (Technical Breakdown)

### 1. 🔑 Login & Identity Verification (`LoginPage.jsx`)
- **Visual Design**: High-tech cyber grid layout with real-time mTLS status indicators.
- **Functionality**: Authenticates users against predefined roles, issues RS256 signed JWT tokens, and includes a 1-Click Demo Login selector.

### 2. 📊 Executive Security Command Dashboard (`DashboardPage.jsx`)
- **Visual Design**: Top KPI stat cards with trend sparklines and dark hero ZeroTrust Proxy card.
- **Functionality**: Live monitoring of Total Requests, Allowed vs Blocked traffic counts, average proxy latencies (`8.4ms`), 8 glowing proxy node shard status dots, and live threat streams.

### 3. ⚡ Zero-Trust Real-Time Interception Proxy (`ZeroTrustProxyPage.jsx`)
- **Visual Design**: Interactive request simulator console with preset attack scenarios.
- **Functionality**: Simulates real-time 5-step proxy pipeline inspection on custom request payloads, computing risk scores and displaying decision outcomes (200 OK vs 403 Forbidden).

### 4. 📈 Streaming Live Traffic Inspector (`LiveTrafficPage.jsx`)
- **Visual Design**: Real-time ticker console with play/pause controls and filterable HTTP method tags.
- **Functionality**: Streams live packet inspections, displaying client IP, origin container, target service, method, payload status, and isolation duration.

### 5. 🌐 Interactive Service Mesh Topology (`ServiceTopologyPage.jsx` & `ServiceMeshDiagram.jsx`)
- **Visual Design**: Animated SVG/Canvas vector mesh displaying microservice nodes (Ingress Gateway $\rightarrow$ Proxy $\rightarrow$ Order/Payment/Vault $\rightarrow$ DB Cluster).
- **Functionality**: Visualizes active green (allowed) and red (blocked attack) traffic flows with node inspector drawers.

### 6. 🛡️ Threat Detection & Incident Matrix (`ThreatDetectionPage.jsx`)
- **Visual Design**: Recharts threat category donut chart, timeline trend lines, and endpoint heatmaps.
- **Functionality**: Categorizes threats (SQLi, Expired JWT, Geo-Fencing, Rate Limits), shows AbuseIPDB malicious confidence scores, and enables 1-click Gemini AI Root Cause Analysis (RCA).

### 7. ⚙️ Zero-Trust Policy Engine (`PolicyEnginePage.jsx`)
- **Visual Design**: Grid of policy configuration cards with neon toggle switches.
- **Functionality**: Allows administrators to toggle and deploy policies in real-time:
  - Strict RS256 JWT Signature Validation
  - Business Hours Window Enforcement (09:00 - 18:00)
  - Geographic Geofencing (India, Singapore, US, Germany)
  - IP Rate Limiting (100 req/min)
  - Deep WAF Payload Inspection
  - Dynamic Risk Score Threshold (80/100 Drop Limit)

### 8. 📜 Enterprise Audit Logs & Forensics (`AuditLogsPage.jsx`)
- **Visual Design**: High-density data table with quick search, severity filters, and date pickers.
- **Functionality**: Records every proxy decision for forensic auditability with 1-click CSV file export.

### 9. 📥 Remote Security Log Ingestion Engine (`UploadLogsPage.jsx`)
- **Visual Design**: Clean dual-tab ingestion interface (File Upload vs Remote Stream Link).
- **Functionality**: Ingests JSON arrays, CSV logs, NGINX syslog streams, and AWS S3/CloudWatch logs, parsing log data in real-time to update global dashboard metrics.

### 10. 💥 SOC Attack War-Room Simulator (`AttackSimulationPage.jsx`)
- **Visual Design**: Cyber war-room alert banner with pulsating red attack status badges and live terminal log output.
- **Functionality**: Launches 6 simulated cyber exploits:
  - **SQL Injection**: Inject `' OR '1'='1` in URL query parameters.
  - **Expired JWT Token Replay**: Replay captured authorization header after TTL expiration.
  - **Geo-Fencing Violation**: Connection attempts originating from blocked IP ranges (RU/CN).
  - **DDoS Traffic Surge**: High-frequency flood of 50,000 req/sec.
  - **Lateral Movement Attack**: Unauthorized container hop into the Customer Credentials Vault.
  - **Token Replay & Forgery**: Forged HMAC signature using invalid signing keys.

---

## 👥 Role-Based Access Control (RBAC) Matrix

| Module / Page ID | Administrator (`ADMIN`) | Security Analyst (`ANALYST`) | DevOps Engineer (`DEVOPS`) |
| :--- | :---: | :---: | :---: |
| **Dashboard** (`dashboard`) | ✅ Full Access | ✅ Full Access | ✅ Full Access |
| **Zero-Trust Proxy** (`proxy`) | ✅ Full Access | 👁️ View Only | ✅ Full Access |
| **Live Traffic** (`traffic`) | ✅ Full Access | ✅ Full Access | ✅ Full Access |
| **Service Topology** (`topology`) | ✅ Full Access | 👁️ View Only | ✅ Full Access |
| **Threat Detection** (`threats`) | ✅ Full Access | ✅ Full Access | 👁️ View Only |
| **Policy Engine** (`policies`) | ✅ Full Access | 🚫 Restricted | 👁️ View Only |
| **Audit Logs** (`audit`) | ✅ Full Access | ✅ Full Access | 👁️ View Only |
| **Upload Logs** (`upload`) | ✅ Full Access | 🚫 Restricted | ✅ Full Access |
| **Attack Simulation** (`simulation`) | ✅ Full Access | 🚫 Restricted | 🚫 Restricted |
| **Analytics** (`analytics`) | ✅ Full Access | ✅ Full Access | ✅ Full Access |
| **Settings & Users** (`settings`) | ✅ Full Access | 🚫 Restricted | 👁️ View Only |

### Demo Credentials:
- **Admin**: `admin@zeroshield.io` | Key: `admin_secret_key_2026`
- **Analyst**: `analyst@zeroshield.io` | Key: `analyst_sec_key_2026`
- **DevOps**: `devops@zeroshield.io` | Key: `devops_infra_key_2026`

---

## 🔌 REST API Endpoint Reference

The backend Express application (`/server`) exposes the following RESTful API surface:

| HTTP Method | API Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates credentials and returns JWT bearer token |
| `GET` | `/api/health` | Public | System health check returning status, service name, and uptime |
| `GET` | `/api/policies` | Authenticated | Retrieves all configured Zero-Trust policy rules |
| `POST` | `/api/policies` | Admin Only | Creates a new policy rule with validation schema checks |
| `PATCH` | `/api/policies/:id` | Admin Only | Updates policy status or threshold configurations |
| `GET` | `/api/traffic/live` | Authenticated | Streams real-time microservice traffic telemetry |
| `GET` | `/api/threats` | Authenticated | Fetches detected threat incidents and risk distribution |
| `POST` | `/api/simulation/run` | Admin / DevOps | Executes a SOC cyber attack simulation run |
| `GET` | `/api/audit` | Authenticated | Retrieves paginated proxy audit log records |

---

## 🛠️ Local Installation & Development Guide

### Prerequisites
- **Node.js**: `>= 20.0.0`
- **npm**: `>= 9.0.0`
- **Git**

### 1. Clone Repository & Setup Environment
```bash
git clone https://github.com/sathish1509/ZeroShield.git
cd ZeroShield

# Copy environment template
cp .env.example .env
```

### 2. Install Dependencies & Build Production Bundle
```bash
# Install frontend dependencies
npm install --legacy-peer-deps

# Install backend dependencies
cd server && npm install && cd ..

# Build frontend production assets
npm run build
```

### 3. Run Development Servers
```bash
# Terminal 1: Run Frontend Dev Server (http://localhost:5173)
npm run dev

# Terminal 2: Run Backend Express Server (http://localhost:4000)
npm run backend:dev
```

---

## 📄 License & Attribution

ZeroShield is licensed under the **MIT License**. Created by Sathish (2026). Built for enterprise cybersecurity operations and Zero-Trust network architecture.
