-- ZeroShield Supabase Database Schema Migration
-- Includes Enums, 15 Core Tables, Row-Level Security (RLS) Policies, and RPC Analytics Functions

-- 1. Create Custom Enum Types
CREATE TYPE role_name AS ENUM ('ADMIN', 'ANALYST', 'DEVOPS');
CREATE TYPE rule_type AS ENUM ('RATE_LIMIT', 'IP_ALLOWLIST', 'AUTH_REQUIRED', 'PAYLOAD_VALIDATION');
CREATE TYPE policy_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE service_status AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');
CREATE TYPE health_status AS ENUM ('HEALTHY', 'DEGRADED', 'DOWN');
CREATE TYPE connection_status AS ENUM ('ALLOWED', 'BLOCKED', 'PENDING_REVIEW');
CREATE TYPE threat_rule_type AS ENUM ('RATE_LIMIT_EXCEEDED', 'REPEATED_AUTH_FAILURE', 'UNUSUAL_ENDPOINT_ACCESS', 'PAYLOAD_ANOMALY', 'GEO_ANOMALY');
CREATE TYPE threat_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE threat_status AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE');
CREATE TYPE attack_type AS ENUM ('BRUTE_FORCE', 'DDOS_BURST', 'CREDENTIAL_STUFFING', 'SQL_INJECTION_ATTEMPT', 'LATERAL_MOVEMENT', 'DATA_EXFILTRATION');
CREATE TYPE simulation_intensity AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE simulation_run_status AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'STOPPED');

-- 2. Create Tables
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role role_name NOT NULL,
  mfa_secret VARCHAR(255),
  is_mfa_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name role_name UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  resource VARCHAR(255) NOT NULL,
  action VARCHAR(255) NOT NULL,
  UNIQUE(role_id, resource, action)
);

CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_id INT REFERENCES refresh_tokens(id) ON DELETE SET NULL,
  ip_address VARCHAR(255),
  user_agent TEXT,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE security_policies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  rule_type rule_type NOT NULL,
  rule_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  status policy_status DEFAULT 'ACTIVE',
  created_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  resource VARCHAR(255) NOT NULL,
  resource_id VARCHAR(255),
  details JSONB DEFAULT '{}'::jsonb,
  ip_address VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE microservices (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  owner_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  base_url VARCHAR(255) NOT NULL,
  status service_status DEFAULT 'ACTIVE',
  health_status health_status DEFAULT 'HEALTHY',
  is_simulation_safe BOOLEAN DEFAULT TRUE,
  tags JSONB DEFAULT '[]'::jsonb,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE service_identities (
  id SERIAL PRIMARY KEY,
  service_id INT NOT NULL REFERENCES microservices(id) ON DELETE CASCADE,
  client_secret_hash VARCHAR(255),
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN DEFAULT FALSE
);

CREATE TABLE service_connections (
  id SERIAL PRIMARY KEY,
  source_service_id INT NOT NULL REFERENCES microservices(id) ON DELETE CASCADE,
  target_service_id INT NOT NULL REFERENCES microservices(id) ON DELETE CASCADE,
  protocol VARCHAR(50) DEFAULT 'HTTP',
  status connection_status DEFAULT 'ALLOWED',
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_service_id, target_service_id, protocol)
);

CREATE TABLE traffic_logs (
  id SERIAL PRIMARY KEY,
  source_service_id INT REFERENCES microservices(id) ON DELETE SET NULL,
  target_service_id INT REFERENCES microservices(id) ON DELETE SET NULL,
  simulation_run_id INT,
  method VARCHAR(10) NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  status_code INT NOT NULL,
  response_time_ms INT NOT NULL,
  request_size_bytes INT NOT NULL,
  ip_address VARCHAR(255) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE threat_rules (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  rule_type threat_rule_type NOT NULL,
  threshold_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  severity threat_severity DEFAULT 'MEDIUM',
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE threats (
  id SERIAL PRIMARY KEY,
  rule_id INT REFERENCES threat_rules(id) ON DELETE SET NULL,
  source_service_id INT REFERENCES microservices(id) ON DELETE SET NULL,
  simulation_run_id INT,
  ip_address VARCHAR(255),
  description TEXT NOT NULL,
  severity threat_severity NOT NULL,
  status threat_status DEFAULT 'OPEN',
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by INT REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE attack_scenarios (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  attack_type attack_type NOT NULL,
  target_service_id INT REFERENCES microservices(id) ON DELETE SET NULL,
  intensity simulation_intensity DEFAULT 'MEDIUM',
  duration_seconds INT DEFAULT 30,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE simulation_runs (
  id SERIAL PRIMARY KEY,
  scenario_id INT NOT NULL REFERENCES attack_scenarios(id) ON DELETE CASCADE,
  triggered_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status simulation_run_status DEFAULT 'QUEUED',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  results_summary JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add Foreign Key for simulation_run_id in traffic_logs and threats
ALTER TABLE traffic_logs ADD CONSTRAINT fk_traffic_simulation FOREIGN KEY (simulation_run_id) REFERENCES simulation_runs(id) ON DELETE SET NULL;
ALTER TABLE threats ADD CONSTRAINT fk_threat_simulation FOREIGN KEY (simulation_run_id) REFERENCES simulation_runs(id) ON DELETE SET NULL;

-- 3. Create Performance Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_permissions_role ON permissions(role_id);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX idx_microservices_owner ON microservices(owner_id);
CREATE INDEX idx_traffic_logs_status ON traffic_logs(status_code);
CREATE INDEX idx_traffic_logs_timestamp ON traffic_logs(timestamp);
CREATE INDEX idx_traffic_logs_simulation ON traffic_logs(simulation_run_id);
CREATE INDEX idx_threats_status ON threats(status);
CREATE INDEX idx_threats_severity ON threats(severity);
CREATE INDEX idx_threats_simulation ON threats(simulation_run_id);
CREATE INDEX idx_simulation_runs_scenario ON simulation_runs(scenario_id);

-- 4. Enable Row Level Security (RLS) on ALL 15 Tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE microservices ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE threats ENABLE ROW LEVEL SECURITY;
ALTER TABLE attack_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_runs ENABLE ROW LEVEL SECURITY;

-- 5. Define Defense-in-Depth RLS Policies
-- Service Role bypasses RLS for backend operations.
-- For anon/authenticated role direct access: default deny unless explicitly permitted.

CREATE POLICY service_role_all ON users FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_all_roles ON roles FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_all_perms ON permissions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_all_refresh ON refresh_tokens FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_all_sessions ON user_sessions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_all_policies ON security_policies FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_all_audit ON audit_logs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_all_services ON microservices FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_all_identities ON service_identities FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_all_connections ON service_connections FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_all_traffic ON traffic_logs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_all_rules ON threat_rules FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_all_threats ON threats FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_all_scenarios ON attack_scenarios FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY service_role_all_runs ON simulation_runs FOR ALL USING (auth.role() = 'service_role');

-- Read-only policy example for public metadata (e.g. predefined attack scenarios list)
CREATE POLICY anon_read_scenarios ON attack_scenarios FOR SELECT USING (true);
