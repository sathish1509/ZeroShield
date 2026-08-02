# 🛡️ ZeroShield - Enterprise Cybersecurity & Zero-Trust Access Control Platform

**ZeroShield** is a modern, futuristic, enterprise-grade cybersecurity command center and Zero-Trust access control platform built for real-time threat detection, API microservice proxy authorization, interactive service mesh topology analytics, and live SOC war-room attack simulations.

![ZeroShield Security Platform](https://img.shields.io/badge/ZeroShield-v3.4-10B981?style=for-the-badge&logo=shield)
![React 18](https://img.shields.io/badge/React-18.3-2563EB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss)

---

## 🌐 Live Production Deployments

- 🚀 **Live Frontend Web Application (Vercel)**: [https://zero-shield-iota.vercel.app/](https://zero-shield-iota.vercel.app/)
- 🛡️ **Live Express Backend API Engine (Render)**: [https://zeroshield-backend-4px0.onrender.com/](https://zeroshield-backend-4px0.onrender.com/)
- 💚 **Backend API Health Check Endpoint**: [https://zeroshield-backend-4px0.onrender.com/api/health](https://zeroshield-backend-4px0.onrender.com/api/health)

---

## ✨ Features & Functional Highlights

- 🎨 **Sovereign Security Light UI**: Clean, modern UI inspired by sovereign identity vaults and high-contrast dark hero accent cards.
- 👑 **Fine-Grained Role-Based Access Control (RBAC)**: Supports 3 distinct enterprise access roles (**Administrator**, **Security Analyst**, **DevOps Engineer**) with real-time HTTP 403 permission guards.
- 🌐 **Interactive Service Mesh Diagram**: SVG/Canvas visualizer showcasing traffic flows between User $\rightarrow$ API Gateway $\rightarrow$ Zero Trust Proxy $\rightarrow$ Microservices $\rightarrow$ Encrypted Database with green (allowed) and red (blocked) packet animation streams.
- 💥 **SOC Attack War-Room Simulator**: Execute 6 live attack exploits (SQL Injection, Expired JWT Replay, Geo-Fencing Violation, DDoS Surge, Lateral Movement, Token Forgery) with instant visual isolation, risk score spikes, and auto-mitigation.
- 📊 **Recharts Analytics & Telemetry**: Comprehensive request volume charts, latency distribution histograms, risk score curves, threat heatmaps, and exportable CSV audit logs.

---

## 📱 10 Completed Platform Modules

1. **🔑 Login Page** (`LoginPage.jsx`): Cyber grid matrix background, credentials login, and 1-Click Demo Login button.
2. **📊 Dashboard** (`DashboardPage.jsx`): Top KPI stat cards with sparklines, Dark Hero Key Status card, interactive Service Mesh Diagram, Recent Security Alerts, and mini analytics graphs.
3. **⚡ Live Traffic Inspector** (`LiveTrafficPage.jsx`): Real-time streaming log grid with auto-refresh animation, pause/play ticker control, HTTP badges, risk scores, and decision badges.
4. **🌐 Service Topology** (`ServiceTopologyPage.jsx` & `TopologyCanvas.jsx`): Animated service graph (Gateway, Proxy, Order, Payment, Inventory, Notification, DB) with node inspector drawers.
5. **🛡️ Threat Detection** (`ThreatDetectionPage.jsx`): Threat category donut chart, attack timeline line graph, and targeted endpoint heatmap matrix.
6. **⚙️ Policy Engine** (`PolicyEnginePage.jsx`): Interactive toggle switches for JWT validation, operating hours, geofencing, rate limits, WAF payload inspection, and risk drop limits.
7. **📜 Audit Logs** (`AuditLogsPage.jsx`): Searchable, filterable enterprise audit log table with CSV export function.
8. **💥 Attack Simulation War-Room** (`AttackSimulationPage.jsx`): SOC attack launchers with real-time defensive isolation and streaming terminal console.
9. **📈 Analytics** (`AnalyticsPage.jsx`): Historical request trends, latency metrics, enforcement ratios, and top targeted endpoint rankings.
10. **⚙️ Settings & User Management** (`SettingsPage.jsx`): Proxy configuration, JWT key rotation, webhook alerts, and interactive Role & Access Limits Matrix.

---

## 👥 Demo User Credentials & Access Summary

For full details on user credentials and the page access matrix, refer to [USER_ACCESS.md](USER_ACCESS.md).

| Role | Role Title | Email Address | Access Key / Password | Access Matrix Summary |
|------|------------|---------------|-----------------------|-----------------------|
| **`ADMIN`** | 👑 Administrator | `admin@zeroshield.io` | `admin_secret_key_2026` | Full Access (All 10 Modules) |
| **`ANALYST`** | 🛡️ Security Analyst | `analyst@zeroshield.io` | `analyst_sec_key_2026` | Read-Only Security Monitoring |
| **`DEVOPS`** | ⚙️ DevOps Engineer | `devops@zeroshield.io` | `devops_infra_key_2026` | Infrastructure & Mesh Management |

---

## 🛠️ Technology Stack

- **Core**: React 18, Vite 8
- **Styling**: Tailwind CSS v4, Custom Sovereign Light & Glassmorphism design tokens
- **Icons**: Lucide React Icons
- **Data Visualization**: Recharts
- **Graphics Engine**: HTML5 Canvas & Custom SVG Interactive Networks

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js `v18.0.0` or higher
- npm `v9.0.0` or higher

### Installation Commands

```bash
# 1. Clone or navigate to the repository
cd ZeroShield

# 2. Install dependencies
npm install

# 3. Start the local development server
npm run dev

# 4. Build for production
npm run build
```

Once started, open **`http://localhost:5174/`** (or `http://localhost:5173/`) in your browser.

---

## 🧩 Backend Foundation (Phase 1)

ZeroShield now includes a dedicated backend scaffold in `server/` built with **Node.js + Express + PostgreSQL + Prisma** for authentication and role-based access control.

### Backend structure

```
server/
├── package.json
├── .env.example
├── prisma/
│   ├── schema.prisma
│   ├── seed.js
│   └── migrations/
│       └── 20260801000000_init/
│           └── migration.sql
└── src/
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    └── utils/
```

### Environment variables

Copy `server/.env.example` to `server/.env` and set your local values:

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_ACCESS_SECRET` — access token signing secret
- `JWT_REFRESH_SECRET` — refresh token signing secret
- `PORT` — API port

### Install and run the API

```bash
cd server
npm install
npm run db:migrate
npm run seed
npm run dev
```

### Auth endpoints

- `POST /api/auth/login` — email/password login, returns a short-lived access token and sets a refresh token cookie
- `POST /api/auth/refresh` — issues a fresh access token from a valid refresh token cookie
- `POST /api/auth/logout` — revokes the refresh token cookie

### Smoke test the seeded demo users

After seeding the database and starting the API, run:

```bash
cd server
npm run test:auth
```

The smoke test verifies login, refresh, protected dashboard access, and logout for all three demo roles: **ADMIN**, **ANALYST**, and **DEVOPS**.

---

## ⚡ Phase 2 Backend: Dynamic RBAC, Policy Engine & Automatic Audit Logging

Phase 2 introduces DB-driven dynamic permission enforcement, a full-featured Policy Engine, automatic audit logging for privileged operations, and User & Role Management.

### Key Capabilities

1. **Dynamic Permission Enforcement**: `authorize(resource, action)` middleware resolves permissions directly from the database `permissions` table matching the enterprise access matrix.
2. **Current User Permissions API**: `GET /api/users/me/permissions` returns the active user's role and resolved permission array for conditional UI rendering.
3. **Policy Engine**: Full CRUD for security policies (`RATE_LIMIT`, `IP_ALLOWLIST`, `AUTH_REQUIRED`, `PAYLOAD_VALIDATION`) with strict Zod `rule_config` shape validation.
4. **Automatic Audit Logging**: `autoAuditLog` middleware automatically records all privileged write actions (policy CUD, user creation, role changes) to the `audit_logs` table without scattering code in controllers.
5. **Role-Aware Audit Inspector**:
   - **ADMIN** & **ANALYST**: Access full paginated audit logs with search, user, resource, and date range filters.
   - **DEVOPS**: Receives summary-only aggregated metrics (total counts, action/resource breakdowns) to enforce confidential log restrictions.
6. **User & Role Management**: Admin-only user creation (`POST /api/users`) and role modification (`PUT /api/users/:id/role`), which automatically generate audit logs.

### Phase 2 Endpoints Summary

| Endpoint | HTTP Method | Allowed Roles | Description |
|----------|-------------|---------------|-------------|
| `/api/users/me/permissions` | `GET` | All Authenticated | Returns active user role & permission array |
| `/api/policies` | `GET` | Admin, Analyst | List all security policies |
| `/api/policies/:id` | `GET` | Admin, Analyst | Get specific policy details |
| `/api/policies` | `POST` | Admin | Create a new security policy (Audit Logged) |
| `/api/policies/:id` | `PUT` | Admin | Update security policy (Audit Logged) |
| `/api/policies/:id` | `DELETE` | Admin | Delete security policy (Audit Logged) |
| `/api/audit` | `GET` | Admin, Analyst, DevOps | Audit log table (Full for Admin/Analyst, Summary-only for DevOps) |
| `/api/users` | `GET` | Admin | List all registered system users |
| `/api/users` | `POST` | Admin | Register new user (Audit Logged) |
| `/api/users/:id/role` | `PUT` | Admin | Modify user role (Audit Logged) |

### Run Phase 2 Automated Tests

```bash
# Run Phase 2 backend verification test suite
npm run backend:test-phase2

# Or directly in server directory
cd server
npm run test:phase2
```

---

## 🌐 Phase 3 Backend: Microservice Registry, JWT Identities & Mesh Topology

Phase 3 introduces microservice registration, service-to-service cryptographic JWT identity generation, graph-ready service mesh topology data, and health status monitoring.

### Key Capabilities

1. **Microservice Registry**: `microservices` database table with owner tracking, status (`ACTIVE`, `INACTIVE`, `PENDING`), health status (`HEALTHY`, `DEGRADED`, `DOWN`), and tags.
2. **Service-to-Service JWT Identities**: Short-lived signed JWT credential generation (`POST /api/services/:id/identity`) containing `serviceId`, `serviceName`, `identityId`, and `scope` claims. Admin-only revocation (`POST /api/services/:id/identity/revoke`).
3. **Service Mesh Topology Data**: `GET /api/topology` queries `microservices` and `service_connections` to output graph-ready `{ nodes, edges }` data structure accessible to all 3 roles.
4. **Health Monitoring**: `GET /api/services/:id/health` and `PUT /api/services/:id/health` endpoints for inspecting and manually updating health status.
5. **Automatic Audit Trail**: All service registrations, metadata updates, deregistration, identity generation, and health changes generate automatic audit log entries.

### Phase 3 Endpoints Summary

| Endpoint | HTTP Method | Allowed Roles | Description |
|----------|-------------|---------------|-------------|
| `/api/services` | `GET` | Admin, Analyst, DevOps | List all registered microservices |
| `/api/services/:id` | `GET` | Admin, Analyst, DevOps | Get single microservice details |
| `/api/services` | `POST` | Admin, DevOps | Register new microservice (Audit Logged) |
| `/api/services/:id` | `PUT` | Admin, DevOps | Update microservice (DevOps restricted to owned services) |
| `/api/services/:id` | `DELETE` | Admin | Deregister microservice (Audit Logged) |
| `/api/services/:id/identity` | `POST` | Admin, DevOps | Issue short-lived JWT identity credential (Audit Logged) |
| `/api/services/:id/identity/revoke` | `POST` | Admin | Revoke service identity credential (Audit Logged) |
| `/api/services/:id/health` | `GET` | Admin, Analyst, DevOps | Get current health status |
| `/api/services/:id/health` | `PUT` | Admin, DevOps | Update health status (Audit Logged) |
| `/api/topology` | `GET` | Admin, Analyst, DevOps | Graph-ready service mesh topology data (`{ nodes, edges }`) |

### Run Phase 3 Automated Tests

```bash
# Run Phase 3 backend verification test suite
npm run backend:test-phase3

# Or directly in server directory
cd server
npm run test:phase3
```

---

## 💥 Phase 4 Backend: Real-Time Threat Engine, Traffic Ingestion & Attack Simulator

Phase 4 introduces live microservice request ingestion (`POST /api/traffic`), automated threat detection & RBAC threat resolution (`/api/threats`), an interactive SOC attack war-room simulator executing 6 attack vectors (`POST /api/simulation/execute`), and WebSocket event broadcasting (`ws://localhost:4000/ws`).

### Phase 4 Endpoints Summary

| Endpoint | HTTP Method | Allowed Roles | Description |
|----------|-------------|---------------|-------------|
| `/api/traffic` | `GET` | Admin, Analyst, DevOps | List paginated traffic log frames |
| `/api/traffic` | `POST` | Admin, Analyst, DevOps | Ingest microservice traffic frame & broadcast WS |
| `/api/threats` | `GET` | Admin, Analyst, DevOps | Search & inspect active/historical security threats |
| `/api/threats` | `POST` | Admin, Analyst | Register security threat & broadcast WS alert |
| `/api/threats/:id/status` | `PUT` | Admin, Analyst | Update threat status (`INVESTIGATING`, `RESOLVED`, `FALSE_POSITIVE`) (Audit Logged) |
| `/api/simulation` | `GET` | Admin, Analyst | List available attack war-room scenarios |
| `/api/simulation/execute` | `POST` | Admin, Analyst | Execute SOC attack simulation vector (Audit Logged) |

### Run Phase 4 Automated Tests

```bash
# Run Phase 4 backend verification test suite
npm run backend:test-phase4
```

---

## 📊 Phase 5 Backend: Refined Audit Log Search/Export & Analytics Aggregation

Phase 5 delivers high-performance SQL database analytics aggregations, structured/full-text audit search, role-aware audit log CSV/JSON exports, per-service health metrics, and a single-roundtrip landing dashboard endpoint.

### Key Capabilities

1. **Refined Audit Search & Role-Aware Export**:
   - `GET /api/audit/export`: Accepts `format=csv` or `format=json`.
   - **Admin / Analyst**: Full raw log export including timestamps, user credentials, resource IDs, IP addresses, and JSON payloads.
   - **DevOps**: Summary-only export (aggregated counts by action/resource category; raw log details and user emails omitted per role matrix).
2. **Database Aggregation Endpoints**:
   - `GET /api/analytics/traffic-summary`: Request volume time-series (SQL date_trunc), status code distributions (`2xx`, `3xx`, `4xx`, `5xx`), and service request volumes. Supports `range` (`24h`, `7d`, `30d`) & `serviceId`.
   - `GET /api/analytics/threat-summary`: Threat counts by severity, status, and trend over time.
   - `GET /api/analytics/service-health`: Per-service uptime %, error rate %, average response time ms, and total requests.
   - `GET /api/analytics/audit-summary`: Privileged action counts grouped by user, role, and action type.
3. **Landing Dashboard Endpoint**:
   - `GET /api/dashboard/summary`: Single payload returning service health counts, open threats, today's request volume, active policies, recent audit events, and mini 24h traffic trend.

### Phase 5 Endpoints Summary

| Endpoint | HTTP Method | Allowed Roles | Query Params | Description |
|----------|-------------|---------------|--------------|-------------|
| `/api/audit/export` | `GET` | Admin, Analyst, DevOps | `format=csv\|json`, `query`, `resource`, `action` | Role-aware CSV/JSON audit export |
| `/api/dashboard/summary` | `GET` | Admin, Analyst, DevOps | N/A | Landing dashboard top-line KPIs & mini trend |
| `/api/analytics/traffic-summary` | `GET` | Admin, Analyst, DevOps | `range=24h\|7d\|30d`, `serviceId` | Bucketed traffic volume & status code distribution |
| `/api/analytics/threat-summary` | `GET` | Admin, Analyst, DevOps | `range=24h\|7d\|30d` | Threat count breakdown & time-series trend |
| `/api/analytics/service-health` | `GET` | Admin, Analyst, DevOps | `range=24h\|7d\|30d` | Per-microservice uptime %, latency, & error rates |
| `/api/analytics/audit-summary` | `GET` | Admin, Analyst, DevOps | `range=24h\|7d\|30d` | Privileged audit activity counts by user/role/action |

### Run Phase 5 Automated Tests

```bash
# Run Phase 5 backend verification test suite
npm run backend:test-phase5
```

---

## 🎯 Phase 6 Backend: SOC Attack War-Room Simulation Engine & Latency Telemetry

Phase 6 introduces a database-backed SOC Attack War-Room Simulation Engine (`AttackScenario`, `SimulationRun`), generating synthetic traffic through the real ingestion pipeline, triggering real threat rules, measuring detection latency in milliseconds, streaming live events over WebSockets, and providing run analytics.

### Key Capabilities

1. **Predefined Attack Scenarios**:
   - `DDOS_BURST`: High-volume distributed request surge targeting Payment Gateway.
   - `CREDENTIAL_STUFFING`: Password spray botnet login attempts.
   - `SQL_INJECTION_ATTEMPT`: Malicious `UNION SELECT` query pattern probing.
   - `LATERAL_MOVEMENT`: Unauthorized internal service hop to Core DB enclave.
   - `DATA_EXFILTRATION`: Bulk PII download extraction anomaly.
2. **Real Pipeline Threat Tagging & Detection Latency**:
   - Synthetic traffic is tagged with `simulationRunId` and ingested into `traffic_logs`.
   - Threat rules trigger real `Threat` records tagged with `simulationRunId`.
   - Measures exact **detection latency** (`detectedAt - injectedTimestamp` in ms).
3. **Live WebSocket Streaming**:
   - Emits real-time `SIMULATION_STARTED`, `SIMULATION_STEP`, `THREAT_DETECTED`, `SIMULATION_COMPLETED`, and `SIMULATION_STOPPED` payloads.
4. **Safety & Audit Guards**:
   - Verifies `isSimulationSafe` flag on target microservices.
   - Enforces max 1 active simulation run per target service.
   - Audit logs start and stop operations (`autoAuditLog`).

### Phase 6 Endpoints Summary

| Endpoint | HTTP Method | Allowed Roles | Description |
|----------|-------------|---------------|-------------|
| `/api/simulation/scenarios` | `GET` | Admin, Analyst | List predefined attack scenarios |
| `/api/simulation/run` | `POST` | Admin | Start simulation execution run (Audit Logged) |
| `/api/simulation/runs/:id/stop` | `POST` | Admin | Halt active simulation run (Audit Logged) |
| `/api/simulation/runs` | `GET` | Admin | List past & active simulation runs |
| `/api/simulation/runs/:id` | `GET` | Admin | Detailed run timeline & detection latency metrics |

### Run Phase 6 Automated Tests

```bash
# Run Phase 6 backend verification test suite
npm run backend:test-phase6
```

---

## 🛡️ Phase 7 Backend: Enterprise Security Hardening Pass

Phase 7 completes the backend by enforcing complete defense-in-depth security hardening across all earlier phases:

1. **Environment Secrets Audit & Fail-Fast Startup**:
   - Strict Zod schema validation on startup (`env.js`). Halts startup immediately if `DATABASE_URL`, `JWT_ACCESS_SECRET`, or `JWT_REFRESH_SECRET` are missing.
   - Credentials bcrypt-hashed at seed time with zero raw secrets stored in code.
2. **Rate Limiting & Abuse Prevention**:
   - Global rate limiter (300 requests / 15 min / IP).
   - Strict auth rate limiter on `/api/auth/login` (5 login attempts / 15 min / IP).
   - Telemetry rate limiter on `/api/traffic` (100 ingests / min / IP).
3. **HTTP Security Headers & Cookies**:
   - `helmet()` middleware enforcing `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, and Content-Security-Policy.
   - Refresh tokens stored in `httpOnly`, `sameSite: 'strict'`, `secure` cookies.
4. **Session Management & Refresh Token Rotation**:
   - Short-lived JWT access tokens (15m TTL).
   - Refresh token rotation (old refresh token invalidated upon re-issue).
   - Active user session tracking in `user_sessions` with instant session revocation endpoints (`POST /api/sessions/:id/revoke`).
5. **TOTP Multi-Factor Authentication (MFA)**:
   - Built-in TOTP MFA engine (RFC 6238 HMAC-SHA1) with secret generation, `otpauth://` QR URI formatting, and 6-digit code verification (`POST /api/auth/mfa/setup`, `POST /api/auth/mfa/verify`).
6. **Production Error Masking**:
   - Stack traces and internal database errors sanitized in production mode (`NODE_ENV === 'production'`).

---

## 🔒 Zero Trust Security Design Architecture

ZeroShield was built ground-up to reflect the core tenets of the **Zero Trust Architecture Framework (NIST SP 800-207)**:

| Zero Trust Core Principle | Concrete ZeroShield Implementation Feature | Technical Enforcement Mechanism |
|---------------------------|--------------------------------------------|----------------------------------|
| **1. Explicit Verification** | Multi-Factor Authentication (TOTP), Signed Service-to-Service JWT Credentials | `verifyTotpCode` HMAC validation, `verifyAccessToken` middleware, and RSA/HS256 service tokens (`ServiceIdentity`). |
| **2. Least-Privilege Access** | Dynamic Role-Based Access Control (RBAC), Service-Scoped Resource Ownership | Policy engine evaluating `(role, resource, action)` matrices, blocking unauthorized mutations with HTTP 403 Forbidden. |
| **3. Assume Breach** | Real-Time Threat Engine, Continuous Audit Logging, Active Session Revocation | Immediate tagging of anomaly patterns (`DDOS`, `SQLI`), database-backed audit log hooks on all write endpoints, and one-click session revocation (`UserSession`). |
| **4. Continuous Monitoring** | Live Telemetry Streaming, Detection Latency Tracking, War-Room Attack Simulator | Microsecond anomaly detection, WebSocket live events, and detection latency SLAs (`detectedAt - injectedTimestamp`). |

---

## 📑 Complete API Reference Matrix (Phases 1-7)

| Category | Endpoint | HTTP Method | Allowed Roles | Description |
|----------|----------|-------------|---------------|-------------|
| **Auth & MFA** | `/api/auth/login` | `POST` | Public (Rate-limited) | Authenticate user, verify MFA (if enabled), issue JWT & refresh cookie |
| **Auth & MFA** | `/api/auth/refresh` | `POST` | Public | Rotate refresh token and issue fresh access token |
| **Auth & MFA** | `/api/auth/logout` | `POST` | Authenticated | Revoke refresh token & clear httpOnly session cookie |
| **Auth & MFA** | `/api/auth/mfa/setup` | `POST` | Authenticated | Initiate TOTP MFA setup & retrieve `otpauth://` QR URI |
| **Auth & MFA** | `/api/auth/mfa/verify` | `POST` | Authenticated | Verify 6-digit TOTP code and enable MFA on account |
| **Sessions** | `/api/users/me/sessions` | `GET` | Authenticated | List active user device sessions |
| **Sessions** | `/api/sessions/:id/revoke` | `POST` | Admin, Owner | Immediately invalidate an active user session |
| **Users** | `/api/users/me/permissions` | `GET` | Authenticated | Resolve allowed permissions for logged-in user |
| **Users** | `/api/users` | `GET` | Admin | List system users |
| **Users** | `/api/users` | `POST` | Admin | Create user with assigned RBAC role |
| **Users** | `/api/users/:id/role` | `PUT` | Admin | Update user's assigned RBAC role |
| **Policies** | `/api/policies` | `GET` | Admin, Analyst | List active & inactive security policies |
| **Policies** | `/api/policies` | `POST` | Admin | Create security policy (Audit Logged) |
| **Policies** | `/api/policies/:id` | `PUT` | Admin | Update security policy configuration |
| **Policies** | `/api/policies/:id` | `DELETE` | Admin | Delete security policy |
| **Services** | `/api/services` | `GET` | Admin, Analyst, DevOps | List registered microservices |
| **Services** | `/api/services` | `POST` | Admin, DevOps | Register new microservice |
| **Services** | `/api/services/:id` | `PUT` | Admin, DevOps (Owner) | Update microservice details |
| **Services** | `/api/services/:id` | `DELETE` | Admin | Remove microservice from registry |
| **Identity** | `/api/services/:id/identity` | `POST` | Admin, DevOps (Owner) | Issue service-to-service JWT identity credential |
| **Identity** | `/api/services/:id/identity/revoke` | `POST` | Admin | Revoke service-to-service credential |
| **Health** | `/api/services/:id/health` | `PUT` | Admin, Analyst, DevOps | Update health status (`HEALTHY`, `DEGRADED`, `DOWN`) |
| **Topology** | `/api/topology` | `GET` | Admin, Analyst, DevOps | Graph topology nodes & inter-service connection edges |
| **Traffic** | `/api/traffic` | `GET` | Admin, Analyst, DevOps | Query ingress traffic logs with filters |
| **Traffic** | `/api/traffic` | `POST` | Admin, DevOps (Rate-limited) | Record ingress traffic log frame |
| **Threats** | `/api/threats` | `GET` | Admin, Analyst, DevOps | Query security threats with severity & status filters |
| **Threats** | `/api/threats` | `POST` | Admin, Analyst | Ingest detected threat anomaly |
| **Threats** | `/api/threats/:id/status` | `PUT` | Admin, Analyst | Update threat status (`INVESTIGATING`, `RESOLVED`) |
| **Simulation** | `/api/simulation/scenarios` | `GET` | Admin, Analyst | List predefined attack scenarios |
| **Simulation** | `/api/simulation/run` | `POST` | Admin | Trigger attack simulation run (Audit Logged) |
| **Simulation** | `/api/simulation/runs/:id/stop` | `POST` | Admin | Halt active attack simulation run |
| **Simulation** | `/api/simulation/runs` | `GET` | Admin | List simulation run history |
| **Simulation** | `/api/simulation/runs/:id` | `GET` | Admin | Detailed run timeline & detection latency SLAs |
| **Audit** | `/api/audit` | `GET` | Admin, Analyst, DevOps | Query audit log history (Role-restricted for DevOps) |
| **Audit** | `/api/audit/export` | `GET` | Admin, Analyst, DevOps | Export audit logs to CSV/JSON format |
| **Analytics** | `/api/dashboard/summary` | `GET` | Admin, Analyst, DevOps | Landing dashboard top-line KPIs & mini trend |
| **Analytics** | `/api/analytics/traffic-summary` | `GET` | Admin, Analyst, DevOps | Time-bucketed request volume & status code breakdown |
| **Analytics** | `/api/analytics/threat-summary` | `GET` | Admin, Analyst, DevOps | Time-series threat trend & severity breakdown |
| **Analytics** | `/api/analytics/service-health` | `GET` | Admin, Analyst, DevOps | Per-microservice uptime %, latency & error rates |
| **Analytics** | `/api/analytics/audit-summary` | `GET` | Admin, Analyst, DevOps | Privileged audit activity counts by user/role/action |

---

### Run Complete Platform Automated Test Suite (Phases 1-7)

```bash
# Run individual phase test suites
npm run backend:test-auth
npm run backend:test-phase2
npm run backend:test-phase3
npm run backend:test-phase4
npm run backend:test-phase5
npm run backend:test-phase6
npm run backend:test-phase7
```

---

## 📁 Repository Structure

```
ZeroShield/
├── README.md                      # Project documentation
├── USER_ACCESS.md                 # Credentials & RBAC Access Limits matrix
├── index.html                     # Main HTML template
├── package.json                   # Project dependencies & scripts
├── vite.config.js                 # Vite & Tailwind build configuration
├── server/                        # Express + Prisma backend foundation
└── src/
    ├── App.jsx                    # Main application shell with RBAC page guard
    ├── index.css                  # Sovereign Light CSS tokens & micro-animations
    ├── config/
    │   └── accessLimits.js        # Role profiles, permissions, restrictions & access matrix
    ├── context/
    │   └── SecurityContext.jsx    # Shared telemetry state, attack triggers & role state
    ├── mock/
    │   └── mockData.js            # Initial services, alerts, logs, and telemetry
    ├── components/
    │   ├── common/                # StatCard, GlassCard, Badge, Toast, RecentAlertsCard
    │   ├── layout/                # TopNav, Sidebar
    │   └── topology/              # ServiceMeshDiagram, TopologyCanvas
    └── pages/                     # 10 Platform pages
        ├── LoginPage.jsx
        ├── DashboardPage.jsx
        ├── LiveTrafficPage.jsx
        ├── ServiceTopologyPage.jsx
        ├── ThreatDetectionPage.jsx
        ├── PolicyEnginePage.jsx
        ├── AuditLogsPage.jsx
        ├── AttackSimulationPage.jsx
        ├── AnalyticsPage.jsx
        └── SettingsPage.jsx
```

---

## 🔒 Security & License

Built for enterprise Zero-Trust security demonstrations and national hackathon SOC command center showcases.
