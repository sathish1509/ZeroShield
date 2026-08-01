# 🛡️ ZeroShield - Enterprise Cybersecurity & Zero-Trust Access Control Platform

**ZeroShield** is a modern, futuristic, enterprise-grade cybersecurity command center and Zero-Trust access control platform built for real-time threat detection, API microservice proxy authorization, interactive service mesh topology analytics, and live SOC war-room attack simulations.

![ZeroShield Security Platform](https://img.shields.io/badge/ZeroShield-v3.4-10B981?style=for-the-badge&logo=shield)
![React 18](https://img.shields.io/badge/React-18.3-2563EB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss)

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
