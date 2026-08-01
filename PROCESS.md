# ZeroShield - End-to-End System Processes & Architectural Workflows

## 🛡️ Overview
This document details **all core processes and execution workflows** performed by **ZeroShield (v3.4)** — an enterprise-grade Zero-Trust Microservice API Security Gateway & SOC Command Center.

ZeroShield operates in two primary modes:
1. **Proactive In-Line Interception Proxy Mode (Real-Time)**: Intercepts, inspects, and enforces security decisions on live inter-service requests before they reach target microservices to prevent lateral movement.
2. **SOC Telemetry & Log Ingestion Mode (Forensic & Analytics)**: Ingests, parses, and analyzes static or streaming security logs from servers, API gateways, and cloud storage streams.

---

## 🔄 Index of Core System Processes

1. [Process 1: Real-Time Zero-Trust Proxy Interception Workflow](#process-1-real-time-zero-trust-proxy-interception-workflow)
2. [Process 2: Lateral Movement & Anomaly Prevention Process](#process-2-lateral-movement--anomaly-prevention-process)
3. [Process 3: Security Log Ingestion & Remote Stream Processing](#process-3-security-log-ingestion--remote-stream-processing)
4. [Process 4: Dynamic Policy Engine & Rule Evaluation Process](#process-4-dynamic-policy-engine--rule-evaluation-process)
5. [Process 5: Immutable Cryptographic Audit Trail Logging](#process-5-immutable-cryptographic-audit-trail-logging)
6. [Process 6: Telemetry Aggregation & Real-Time Analytics Process](#process-6-telemetry-aggregation--real-time-analytics-process)
7. [Process 7: Cyber Attack Simulation & War-Room Mitigation](#process-7-cyber-attack-simulation--war-room-mitigation)
8. [Process 8: Role-Based Access Control (RBAC) Governance Process](#process-8-role-based-access-control-rbac-governance-process)

---

## ⚡ Process 1: Real-Time Zero-Trust Proxy Interception Workflow

### **Objective**
Intercept every request between **Service A (Origin)** and **Service B (Destination)** at the proxy edge, enforcing cryptographic identity and policy validation inline.

### **Pipeline Flow Diagram**
```
Service A (Origin Microservice)
      │
      ▼
+-------------------------------------------------------------------+
|               ZERO-TRUST PROXY CORE ENGINE (SHARD-01)            |
|                                                                   |
|   ┌──────────────────────────────────────────────────────────┐    |
|   │ 1. 🔑 JWT Validation (RS256 Signature & Expiration)      │    |
|   └──────────────────────────┬───────────────────────────────┘    |
|                              v                                    |
|   ┌──────────────────────────────────────────────────────────┐    |
|   │ 2. 🛡️ Policy Engine (Service-to-Service Scope Matrix)    │    |
|   └──────────────────────────┬───────────────────────────────┘    |
|                              v                                    |
|   ┌──────────────────────────────────────────────────────────┐    |
|   │ 3. 🧠 AI Threat Risk Engine (Payload & SQLi Scanning)    │    |
|   └──────────────────────────┬───────────────────────────────┘    |
|                              v                                    |
|   ┌──────────────────────────────────────────────────────────┐    |
|   │ 4. 📜 Immutable Audit Logger (Ledger Entry Write)       │    |
|   └──────────────────────────┬───────────────────────────────┘    |
|                              v                                    |
|   ┌──────────────────────────────────────────────────────────┐    |
|   │ 5. ⚡ Decision Enforcement (ALLOW 200 / BLOCK 403)        │    |
|   └──────────────────────────────────────────────────────────┘    |
+-------------------------------------------------------------------+
      │                                             │
 (If Risk <= 70 & Valid)                   (If Scope / Risk Violation)
      │                                             │
      v                                             v
Service B (Target Node)               Interception Blocked (403)
[Safe Delivery 200 OK]                [Lateral Threat Isolated]
```

### **Detailed Step-by-step Execution Steps**
1. **Request Ingestion**: Origin node (Service A) issues an HTTP/gRPC call intended for Service B.
2. **Stage 1 - JWT Validation**: Proxy inspects `Authorization: Bearer <token>`, verifies RS256 signature against public keys, checks token expiration (`exp`), and extracts `serviceId`, `serviceName`, and `scope`.
3. **Stage 2 - Policy Engine**: Evaluates whether Service A is authorized to call Service B based on the current service-to-service policy matrix.
4. **Stage 3 - AI Threat Risk Engine**: Scans headers, parameters, and request body for malicious SQLi/XSS signatures and calculates a dynamic **Risk Score (0–100)**.
5. **Stage 4 - Immutable Audit Logger**: Generates a cryptographic audit record containing request details, risk score, and inspection latency.
6. **Stage 5 - Decision Enforcement**:
   - **ALLOW (`200 OK`)**: Request is safely forwarded to Service B.
   - **BLOCK (`403 FORBIDDEN`)**: Request is terminated immediately at the proxy edge, preventing Service B from being compromised.

---

## 🛑 Process 2: Lateral Movement & Anomaly Prevention Process

### **Objective**
Detect and stop compromised internal microservices from executing lateral movement attacks against internal databases, customer credentials vaults, or payment microservices.

### **Detection & Isolation Mechanics**
1. **Scope Claim Verification**: Even if a service presents a valid JWT, ZeroShield verifies if that specific service has `SCOPE_ACCESS` for the requested target endpoint.
2. **Behavioral Anomaly Trigger**: If `Analytics-Worker` attempts to invoke `/api/v1/vault/customer/credentials`, ZeroShield flags an `UNAUTHORIZED_LATERAL_MOVEMENT_ATTEMPT`.
3. **Automated Containment**:
   - Proxy immediately drops the TCP connection with HTTP 403 Forbidden.
   - Triggers an instant alert badge in the **Threat Detection SOC Module**.
   - Increments threat counter and updates live Service Mesh status for the target node to `PROTECTED (ISOLATED)`.

---

## 📥 Process 3: Security Log Ingestion & Remote Stream Processing

### **Objective**
Ingest forensic log data from local files or remote cloud streams for offline security auditing and AI threat analysis.

### **Ingestion Options & Workflow**

#### **Option 1: Local File Upload (Drag & Drop)**
- **Supported Formats**: `.log`, `.txt`, `.json`, `.csv`.
- **Validation**: Verifies file extension and checks maximum payload limits (e.g. 50MB per file).
- **Execution**: Renders interactive progress bar, sanitizes log lines, and generates a unique dataset ID (e.g. `LOG-2026-000124`).

#### **Option 2: Remote Stream Access (URL / Webhook)**
- **Supported Providers**: AWS S3 Bucket Log URLs, AWS CloudWatch Streams, Splunk HEC, Datadog Webhook, Kubernetes Audit HEC.
- **Validation**: Connects via HTTP/HTTPS with optional `Bearer Token` authentication.
- **Execution**: Connects stream asynchronously, assigns a stream ID (e.g. `REMOTE-LOG-2026-000891`), and streams records into the Analytics engine.

---

## 🛡️ Process 4: Dynamic Policy Engine & Rule Evaluation Process

### **Objective**
Enforce security governance policies dynamically across all microservice proxy nodes without requiring service restarts.

### **Evaluated Policy Rules**
1. **Strict Mutual TLS (mTLS 1.3)**: Mandates dual-way client certificate authentication.
2. **Global Rate Limiting**: Enforces maximum requests per second per IP (e.g. 100 req/s).
3. **Payload Sanitization**: Automatically strips SQL injection patterns and script tags.
4. **Geographical IP Whitelisting**: Blocks traffic originating from restricted country codes.
5. **JWT Key Auto-Rotation**: Enforces 15-minute token rotation cycles.

---

## 📜 Process 5: Immutable Cryptographic Audit Trail Logging

### **Objective**
Maintain a tamper-evident, audit-ready event log for regulatory compliance (SOC2, HIPAA, ISO 27001).

### **Execution Workflow**
1. Every proxy evaluation event produces a JSON payload: `timestamp`, `proxyId`, `originService`, `targetService`, `riskScore`, `decision`, `latencyMs`.
2. Appends SHA-256 integrity hash to each ledger entry.
3. Provides search, severity filtering (`CRITICAL`, `WARNING`, `INFO`), and export functionality (CSV/JSON).

---

## 📊 Process 6: Telemetry Aggregation & Real-Time Analytics Process

### **Objective**
Aggregate real-time proxy performance and security statistics into high-impact visual charts.

### **Rendered Visual Metrics**
- **Request Volume Breakdown (24h)**: AreaChart tracking Allowed vs Blocked volume trends.
- **Overall Enforcement Ratio**: Pie Donut chart visualizing 97% Allowed vs 3% Blocked traffic.
- **Average Proxy Latency**: BarChart displaying sub-15ms proxy processing overhead.
- **Top Targeted Endpoints Table**: Ranked view of API endpoints facing the highest attack volume.

---

## ⚔️ Process 7: Cyber Attack Simulation & War-Room Mitigation

### **Objective**
Stress-test ZeroShield proxy defenses under controlled cyber attack scenarios.

### **Supported Attack Vectors**
1. **DDoS Attack Flood**: Simulates 10,000+ concurrent requests per second.
2. **SQL Injection Attack Wave**: Injects SQL payload patterns across input fields.
3. **JWT Credential Stuffing / Forgery**: Injects expired or malformed bearer tokens.

### **Mitigation Process**
- Proxy automatically throttles traffic, blocks malformed tokens, and updates threat level badge to `CRITICAL (ATTACK ACTIVE)`.
- User can trigger **Reset & Purge Threats** to flush attack state and restore baseline operation.

---

## 🔒 Process 8: Role-Based Access Control (RBAC) Governance Process

### **Objective**
Enforce multi-tenant user access control across the ZeroShield dashboard based on assigned corporate role.

### **Permission Matrix**

| Module / Feature | SOC ADMIN | ANALYST | DEVOPS |
| :--- | :---: | :---: | :---: |
| **Dashboard** | Full Access | Full Access | Full Access |
| **Zero Trust Proxy Engine** | Full Access | Full Access | Full Access |
| **Live Traffic Inspector** | Full Access | Full Access | View-Only |
| **Service Mesh Topology** | Full Access | Full Access | Full Access |
| **Threat Detection** | Full Access | Full Access | View-Only |
| **Policy Engine** | Full Access | Restricted | Restricted |
| **Audit Logs** | Full Access | Full Access | View-Only |
| **Upload Logs** | Full Access | Full Access | Full Access |
| **Attack Simulation War-Room** | Full Access | Restricted | Restricted |
| **Analytics Telemetry** | Full Access | Full Access | Full Access |
| **Settings & Configuration** | Full Access | Restricted | Restricted |

---

## 💻 Tech Stack Summary
- **Frontend**: React 19, Vite, TailwindCSS v4, Recharts, Lucide React Icons
- **Backend**: Node.js, Express 5, Supabase PostgreSQL, Prisma ORM, WebSockets
- **Protocols**: mTLS 1.3, RS256 JWT, HTTP/2, REST, JSON
