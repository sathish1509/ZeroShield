# 🔑 ZeroShield - User Access & Demo Credentials

This document provides login credentials, role profiles, permissions, restrictions, and the page access matrix for testing the **ZeroShield** platform.

---

## 👥 Demo User Credentials

| Role | Role Title | Email Address | Access Key / Password | Access Level |
|------|------------|---------------|-----------------------|--------------|
| **`ADMIN`** | 👑 Administrator | `admin@zeroshield.io` | `admin_secret_key_2026` | Full Access (Unrestricted) |
| **`ANALYST`** | 🛡️ Security Analyst | `analyst@zeroshield.io` | `analyst_sec_key_2026` | Read-Only Security Monitoring |
| **`DEVOPS`** | ⚙️ DevOps Engineer | `devops@zeroshield.io` | `devops_infra_key_2026` | Infrastructure & Mesh Management |

---

## 📋 Role Profiles & Detailed Permissions

### 1. 👑 Administrator (`ADMIN`)
- **Description**: Responsible for managing the entire ZeroShield platform, configuring security policies, registering microservices, and monitoring threats.
- **Permissions**:
  - ✅ View Dashboard
  - ✅ Monitor Live API Traffic
  - ✅ View Service Mesh Topology
  - ✅ Configure Zero Trust Security Policies
  - ✅ Register New Microservices
  - ✅ Generate & Manage JWT Identities
  - ✅ View Threat Detection & Heatmaps
  - ✅ Access & Export Audit Logs
  - ✅ Run Attack Simulations (War-Room)
  - ✅ View Security Analytics
  - ✅ Manage Users & Roles
  - ✅ Modify System & Proxy Settings
- **Restrictions**: *None (Full Access)*

---

### 2. 🛡️ Security Analyst (`ANALYST`)
- **Description**: Continuously monitors API communications, investigates suspicious activities, and responds to security incidents. Cannot modify security configurations.
- **Permissions**:
  - ✅ View Dashboard
  - ✅ Monitor Live API Traffic
  - ✅ View Threat Detection
  - ✅ View Audit Logs
  - ✅ View Service Topology
  - ✅ View Analytics
- **Restrictions**:
  - ❌ Cannot change security policies
  - ❌ Cannot register microservices
  - ❌ Cannot create or manage users
  - ❌ Cannot modify JWT cryptographic settings
  - ❌ Cannot change system proxy configuration
  - ❌ Cannot run attack simulations
  - ❌ Cannot access admin settings

---

### 3. ⚙️ DevOps Engineer (`DEVOPS`)
- **Description**: Responsible for deploying and maintaining microservices while ensuring they communicate securely through the Zero Trust Proxy.
- **Permissions**:
  - ✅ View Dashboard
  - ✅ View Service Mesh Topology
  - ✅ Register Microservices
  - ✅ Generate Service JWT Tokens
  - ✅ Monitor Service Health
  - ✅ View Analytics
- **Restrictions**:
  - ❌ Cannot change security policies
  - ❌ Cannot manage users
  - ❌ Cannot run attack simulations
  - ❌ Cannot modify system settings
  - ❌ Cannot access confidential security logs (View Only traffic & audit summaries)

---

## 📊 Page Access Control Matrix

| Page Module | 👑 Administrator | 🛡️ Security Analyst | ⚙️ DevOps Engineer |
|-------------|:----------------:|:------------------:|:------------------:|
| **Dashboard (`/dashboard`)** | ✅ ALLOWED | ✅ ALLOWED | ✅ ALLOWED |
| **Live Traffic (`/traffic`)** | ✅ ALLOWED | ✅ ALLOWED | 👀 VIEW ONLY |
| **Service Mesh (`/topology`)** | ✅ ALLOWED | ✅ ALLOWED | ✅ ALLOWED |
| **Threat Detection (`/threats`)** | ✅ ALLOWED | ✅ ALLOWED | 👀 VIEW ONLY |
| **Policy Engine (`/policies`)** | ✅ ALLOWED | ❌ RESTRICTED | ❌ RESTRICTED |
| **Audit Logs (`/audit`)** | ✅ ALLOWED | ✅ ALLOWED | 👀 VIEW ONLY |
| **Attack Simulation (`/simulation`)** | ✅ ALLOWED | ❌ RESTRICTED | ❌ RESTRICTED |
| **Analytics (`/analytics`)** | ✅ ALLOWED | ✅ ALLOWED | ✅ ALLOWED |
| **Settings / User Mgmt (`/settings`)** | ✅ ALLOWED | ❌ RESTRICTED | ❌ RESTRICTED |

---

## ⚡ How to Switch Roles in the UI

1. **Top Bar Role Switcher**: In the top navigation bar, use the role pill selector (`SOC ADMIN` \| `ANALYST` \| `DEVOPS`) to instantly switch active access roles.
2. **Settings Page Access Matrix**: Navigate to the **Settings** page (as Administrator) to view the full interactive Role Access Limits Matrix card.
