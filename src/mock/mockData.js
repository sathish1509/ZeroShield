export const INITIAL_SERVICES = [
  { id: 'usr', name: 'External Client / User', type: 'client', status: 'healthy', trustScore: 98, latency: '2ms', requests: 1420500, ip: '192.168.1.45', zone: 'Internet' },
  { id: 'gw', name: 'Edge API Gateway', type: 'gateway', status: 'healthy', trustScore: 99, latency: '4ms', requests: 1420500, ip: '10.0.1.1', zone: 'DMZ' },
  { id: 'proxy', name: 'Zero Trust Proxy Engine', type: 'proxy', status: 'healthy', trustScore: 100, latency: '8.4ms', requests: 1420500, ip: '10.0.2.10', zone: 'Control Plane' },
  { id: 'ord', name: 'Order Processing Service', type: 'service', status: 'healthy', trustScore: 96, latency: '12ms', requests: 620400, ip: '10.0.3.15', zone: 'Internal Mesh' },
  { id: 'pay', name: 'Payment Gateway Service', type: 'service', status: 'healthy', trustScore: 99, latency: '14ms', requests: 310200, ip: '10.0.3.20', zone: 'PCI-DSS Enclave' },
  { id: 'inv', name: 'Inventory & Stock Service', type: 'service', status: 'healthy', trustScore: 94, latency: '9ms', requests: 412000, ip: '10.0.3.25', zone: 'Internal Mesh' },
  { id: 'ntf', name: 'Notification & SMS Engine', type: 'service', status: 'healthy', trustScore: 92, latency: '11ms', requests: 77900, ip: '10.0.3.30', zone: 'Internal Mesh' },
  { id: 'db', name: 'Encrypted Core DB Cluster', type: 'database', status: 'healthy', trustScore: 100, latency: '3ms', requests: 1342600, ip: '10.0.4.50', zone: 'Isolated DB Vault' }
];

export const INITIAL_ALERTS = [
  { id: 'alt-101', time: '14:21:04', type: 'Expired JWT Token Replay', service: 'Payment Service', severity: 'high', reason: 'JWT signature expired 140s ago', ip: '185.220.101.5', status: 'Blocked' },
  { id: 'alt-102', time: '14:20:45', type: 'SQL Injection', service: 'Order Service', severity: 'critical', reason: "Malicious payload detected: ' OR '1'='1 in /api/v1/orders", ip: '194.26.29.112', status: 'Blocked' },
  { id: 'alt-103', time: '14:19:12', type: 'Geo Violation', service: 'Inventory Service', severity: 'medium', reason: 'Access attempt from non-whitelisted country (RU)', ip: '95.173.136.72', status: 'Blocked' },
  { id: 'alt-104', time: '14:18:30', type: 'Rate Limit Exceeded', service: 'Edge API Gateway', severity: 'medium', reason: '340 req/min exceeded maximum threshold (100/min)', ip: '45.154.255.88', status: 'Throttled' },
  { id: 'alt-105', time: '14:16:05', type: 'Unauthorized Access', service: 'Payment Service', severity: 'critical', reason: 'Missing mTLS client certificate validation', ip: '198.51.100.24', status: 'Blocked' },
  { id: 'alt-106', time: '14:14:22', type: 'Payload Anomaly', service: 'Order Service', severity: 'low', reason: 'Unexpected binary payload content-type header', ip: '203.0.113.88', status: 'Inspected' }
];

export const INITIAL_POLICIES = [
  { id: 'pol-1', name: 'Strict JWT Signature & Expiry', category: 'Authentication', enabled: true, riskImpact: 'Critical', description: 'Requires valid RS256 signed JWTs with unexpired tokens.' },
  { id: 'pol-2', name: 'Business Hours Geofencing', category: 'Access Control', enabled: true, riskImpact: 'High', description: 'Restricts access outside 09:00 - 18:00 UTC to allowed corporate IP ranges.' },
  { id: 'pol-3', name: 'Allowed Countries Whitelist', category: 'Geofencing', enabled: true, regions: ['India', 'Singapore', 'United States', 'Germany'], riskImpact: 'High', description: 'Enforces geo-IP validation restricting connection origin.' },
  { id: 'pol-4', name: 'Global Rate Limiting', category: 'Traffic Management', enabled: true, value: 100, unit: 'req/min', riskImpact: 'Medium', description: 'Caps single IP traffic bursts at 100 requests per minute.' },
  { id: 'pol-5', name: 'Deep Payload WAF Inspection', category: 'Threat Inspection', enabled: true, riskImpact: 'Critical', description: 'Scans HTTP body parameters for SQLi, XSS, and command injection patterns.' },
  { id: 'pol-6', name: 'Dynamic Risk Score Threshold', category: 'Zero Trust AI', enabled: true, threshold: 80, riskImpact: 'Critical', description: 'Automatically drops connections with calculated risk score > 80.' }
];

export const INITIAL_TRAFFIC = [
  { id: 'tr-1', timestamp: '14:21:08', source: 'External Client', destination: 'Edge API Gateway', method: 'POST', endpoint: '/api/v1/auth/token', jwtStatus: 'Valid', riskScore: 12, latency: '4ms', decision: 'Allowed' },
  { id: 'tr-2', timestamp: '14:21:07', source: 'Edge API Gateway', destination: 'Zero Trust Proxy', method: 'GET', endpoint: '/api/v1/orders/1092', jwtStatus: 'Valid', riskScore: 8, latency: '8ms', decision: 'Allowed' },
  { id: 'tr-3', timestamp: '14:21:05', source: 'Zero Trust Proxy', destination: 'Payment Service', method: 'POST', endpoint: '/api/v1/payments/charge', jwtStatus: 'Expired', riskScore: 88, latency: '14ms', decision: 'Blocked' },
  { id: 'tr-4', timestamp: '14:21:02', source: 'Zero Trust Proxy', destination: 'Order Service', method: 'PUT', endpoint: '/api/v1/orders/cancel', jwtStatus: 'Invalid', riskScore: 94, latency: '11ms', decision: 'Blocked' },
  { id: 'tr-5', timestamp: '14:20:58', source: 'Zero Trust Proxy', destination: 'Inventory Service', method: 'GET', endpoint: '/api/v1/inventory/items', jwtStatus: 'Valid', riskScore: 15, latency: '6ms', decision: 'Allowed' },
  { id: 'tr-6', timestamp: '14:20:50', source: 'Inventory Service', destination: 'Encrypted Core DB', method: 'GET', endpoint: 'SELECT * FROM inventory', jwtStatus: 'Valid', riskScore: 5, latency: '3ms', decision: 'Allowed' }
];

export const INITIAL_AUDIT_LOGS = [
  { id: 'aud-1001', timestamp: '2026-08-01 14:21:05', source: '185.220.101.5', destination: 'Payment Service', endpoint: '/api/v1/payments/charge', decision: 'Blocked', reason: 'Expired JWT Signature', latency: '14ms', riskScore: 88 },
  { id: 'aud-1002', timestamp: '2026-08-01 14:20:45', source: '194.26.29.112', destination: 'Order Service', endpoint: '/api/v1/orders', decision: 'Blocked', reason: 'SQL Injection in Query Param', latency: '11ms', riskScore: 98 },
  { id: 'aud-1003', timestamp: '2026-08-01 14:19:12', source: '95.173.136.72', destination: 'Inventory Service', endpoint: '/api/v1/inventory', decision: 'Blocked', reason: 'Geo-Location Policy Violation (RU)', latency: '9ms', riskScore: 82 },
  { id: 'aud-1004', timestamp: '2026-08-01 14:18:30', source: '45.154.255.88', destination: 'Edge API Gateway', endpoint: '/api/v1/search', decision: 'Blocked', reason: 'Rate Limit Burst (340/min)', latency: '5ms', riskScore: 76 },
  { id: 'aud-1005', timestamp: '2026-08-01 14:15:00', source: '198.51.100.24', destination: 'Notification Service', endpoint: '/api/v1/notifications', decision: 'Allowed', reason: 'Valid Mutual TLS & Identity', latency: '7ms', riskScore: 10 },
  { id: 'aud-1006', timestamp: '2026-08-01 14:12:11', source: '203.0.113.44', destination: 'Order Service', endpoint: '/api/v1/orders/create', decision: 'Allowed', reason: 'Compliant Zero-Trust Identity', latency: '12ms', riskScore: 14 }
];

export const HOURLY_REQUEST_DATA = [
  { time: '08:00', total: 42000, allowed: 41200, blocked: 800, latency: 7.2 },
  { time: '09:00', total: 98000, allowed: 96100, blocked: 1900, latency: 8.1 },
  { time: '10:00', total: 165000, allowed: 161200, blocked: 3800, latency: 8.9 },
  { time: '11:00', total: 210000, allowed: 204500, blocked: 5500, latency: 9.4 },
  { time: '12:00', total: 195000, allowed: 190100, blocked: 4900, latency: 8.6 },
  { time: '13:00', total: 240000, allowed: 232000, blocked: 8000, latency: 9.8 },
  { time: '14:00', total: 270000, allowed: 259500, blocked: 10500, latency: 8.4 }
];

// Black & Slate Monochrome Palette with Red Threat Accents
export const THREAT_DISTRIBUTION_DATA = [
  { name: 'SQL Injection', value: 34, color: '#F43F5E' },
  { name: 'Expired JWT', value: 28, color: '#0F172A' },
  { name: 'Unauthorized Service', value: 18, color: '#334155' },
  { name: 'Geo Violation', value: 12, color: '#475569' },
  { name: 'Payload Anomaly', value: 5, color: '#64748B' },
  { name: 'Rate Limit Burst', value: 3, color: '#94A3B8' }
];

export const RISK_SCORE_DISTRIBUTION = [
  { range: '0-20 (Safe)', count: 1250000 },
  { range: '21-40 (Low)', count: 130000 },
  { range: '41-60 (Elevated)', count: 25000 },
  { range: '61-80 (High Risk)', count: 12000 },
  { range: '81-100 (Critical Blocked)', count: 42500 }
];
