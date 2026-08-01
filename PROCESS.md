# ZeroShield - Project Overview & End-to-End System Process

## 🛡️ Executive Summary
**ZeroShield** (v3.4) is an enterprise-grade **Zero-Trust Identity-Aware Microservice API Security Gateway & SOC Command Center**. Designed for modern cloud-native architectures, ZeroShield intercepts, inspects, and enforces cryptographic authorization on every internal and external API request across microservices using Mutual TLS (mTLS 1.3), AI risk-score calculation, and automated anomaly containment.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology Used | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + Vite | High-performance single-page application (SPA) |
| **Styling & Design System** | TailwindCSS v4 + Glassmorphism | Custom dark slate & monochrome SaaS aesthetic |
| **Icons & UI Assets** | Lucide React | Clean, scalable vector icons |
| **Telemetry & Visualization** | Recharts | Custom interactive Area, Bar, and Pie charts |
| **Backend & Storage** | Supabase (PostgreSQL) + Node.js | Database persistence, mTLS audit logs, security policies |
| **State Management** | React Context (`SecurityContext`) | Real-time global security state, simulation triggers, RBAC |

---

## 🔄 End-to-End Operating Process

```
                                  +------------------------------------+
                                  |    Incoming Microservice Traffic   |
                                  +------------------------------------+
                                                    |
                                                    v
                                  +------------------------------------+
                                  |    ZeroShield mTLS 1.3 Proxy       |
                                  |   (Cryptographic Cert Check)       |
                                  +------------------------------------+
                                                    |
                                                    v
                                  +------------------------------------+
                                  |      AI Threat Risk Engine         |
                                  |  (SQLi, JWT Forgery, Rate Limits)  |
                                  +------------------------------------+
                                          /                  \
                                         /                    \
                         (Risk Score <= 70)                  (Risk Score > 70)
                                       /                        \
                                      v                          v
                      +------------------------+      +------------------------+
                      |   Traffic Passed 200   |      |   Traffic Blocked 403   |
                      |   (Forwarded to Mesh)  |      |   (Logged & SIEM Alert) |
                      +------------------------+      +------------------------+
```

### 1. Ingestion & Cryptographic Verification
- Every request passing through the proxy is verified for **Mutual TLS (mTLS 1.3)** identity certificates and signed **RS256 JWT** tokens.
- Invalid certificates or unauthenticated signatures are instantly blocked at the edge with HTTP 401/403 status codes.

### 2. Real-Time Threat Inspection
- The ZeroShield inspection engine calculates a dynamic **Risk Score (0 to 100)** for every incoming packet based on signature matching, rate limits, payload sanitization, and geographical origin.
- Requests exceeding threat thresholds (e.g. SQL Injection attempts, DDoS floods, or Credential Stuffing) are isolated immediately.

### 3. State Propagation & SOC Telemetry
- All security decisions (Allowed vs. Blocked) are recorded in the central immutable audit ledger.
- Real-time telemetry updates all active dashboard panels, alerts, and service mesh topology nodes without requiring page refreshes.

---

## 💻 Module Overview

### 1. Dashboard (`/`)
- **SOC Command Center Overview**: Displays total verified requests, allowed vs. blocked metrics, proxy latency, and threat defense rates.
- **Service Mesh Health**: Interactive topology preview showing 8 microservice nodes (Payment Gateway, Auth Engine, Order Processing, etc.).
- **Dark Hero Card**: Live summary of `ZeroTrust Proxy Engine (PROXY ID: ZS-MESH-01)`.

### 2. Live Traffic (`/traffic`)
- **Real-Time Request Inspector**: Inspects every HTTP request with timestamps, endpoints, client IP, payload size, response code, and threat risk score.
- **Filtering & Search**: Filter traffic by status code (200 OK vs 403 Forbidden) or search specific endpoints.

### 3. Service Mesh (`/topology`)
- **Microservice Mesh Topology**: Node graph rendering real-time connectivity between service nodes.
- **Node Isolation Controls**: Select any service to view current load, mTLS certificate status, or trigger emergency isolation.

### 4. Threat Detection (`/threats`)
- **Security Incident Monitor**: Categorized overview of active anomalies (SQL Injection, Rate Limit Spikes, Unauthorized JWT Forgery).
- **Incident Response**: View detailed payload traces, origin IP addresses, and automated mitigation steps.

### 5. Policy Engine (`/policies`)
- **Interactive Security Rule Manager**: Toggle or adjust security enforcement rules:
  - Strict mTLS Certificate Enforcement
  - Global Rate Limiting (e.g., max 100 req/sec per IP)
  - Automatic SQL Injection & XSS Payload Sanitization
  - Geo-Blocking for high-risk zones

### 6. Audit Logs (`/audit`)
- **Immutable Security Ledger**: Full forensic log trail of all proxy enforcement actions.
- **Export & Search**: Search logs by Keyword, Severity Level (`CRITICAL`, `WARNING`, `INFO`), or export log datasets as CSV/JSON.

### 7. Analytics (`/analytics`)
- **Enterprise Telemetry Suite**: High-impact Recharts visual suite featuring:
  - **Request Volume Breakdown**: AreaChart comparing Allowed vs Blocked traffic.
  - **Overall Enforcement Ratio**: Pie Donut chart showing 97% Allowed vs 3% Blocked.
  - **Proxy Latency Histogram**: BarChart displaying sub-15ms proxy processing times.
  - **Top Targeted Endpoints**: Ranked table of most frequently attacked API routes.

### 8. Attack Simulation War-Room (`/simulation`)
- **Live Cyber Attack Injector**: Simulate realistic attack vectors (DDoS Flood, SQLi Injection Attack, JWT Key Hijack) in a controlled sandbox environment.
- **Real-Time System Defense**: Watch ZeroShield proxy isolate malicious traffic and trigger live alert badges.
- **Reset & Purge Controls**: Instantly purge threat simulations and reset SOC stats.

### 9. Settings (`/settings`)
- **System Configuration**: Manage cryptographic JWT expiration timeouts, mTLS toggles, SIEM webhook endpoints (Slack, Datadog), and audit retention horizons.

---

## 🔐 Role-Based Access Control (RBAC)

ZeroShield enforces strict multi-role authorization across all features:

| Role | Dashboard & Telemetry | Live Traffic & Audit Logs | Security Policy Edits | Attack Simulation Reset | System Settings |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **SOC ADMIN** | Full Access | Full Access | Full Access | Full Access | Full Access |
| **ANALYST** | Full Access | Full Access | View-Only | View-Only | Restricted |
| **DEVOPS** | Full Access | View Topology & Metrics | View-Only | Restricted | Restricted |

---

## 🚀 Getting Started & Local Development

### 1. Installation
```bash
git clone https://github.com/sathish1509/ZeroShield.git
cd ZeroShield
npm install
```

### 2. Running Dev Server
```bash
npm run dev
# App starts locally at http://localhost:5173/ or http://localhost:5174/
```

### 3. Production Build & Verification
```bash
npm run build
# Compiles production assets into /dist
```

---

## 📄 License & System Status
- **Version**: 3.4.0
- **Status**: Production-Ready SOC Command Center
- **License**: Enterprise Proprietary - ZeroShield Security Systems
