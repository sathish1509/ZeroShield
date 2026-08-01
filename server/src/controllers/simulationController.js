import { asyncHandler } from '../utils/asyncHandler.js';
import { createTrafficLogEntry } from '../models/trafficModel.js';
import { createThreatRecord } from '../models/threatModel.js';
import { prisma } from '../config/prisma.js';
import { broadcastTrafficEvent, broadcastThreatEvent } from '../realtime/websocket.js';
import { z } from 'zod';

const simulationSchema = z.object({
  attackType: z.enum([
    'SQL_INJECTION',
    'EXPIRED_JWT',
    'GEO_FENCING',
    'DDOS_SURGE',
    'LATERAL_MOVEMENT',
    'TOKEN_FORGERY',
  ]),
});

const attackConfigs = {
  SQL_INJECTION: {
    name: 'SQL Injection Exploit',
    method: 'GET',
    endpoint: "/api/v1/users/search?q=1' OR 1=1; DROP TABLE users;--",
    statusCode: 400,
    responseTimeMs: 340,
    requestSizeBytes: 420,
    ipAddress: '185.220.101.4',
    severity: 'CRITICAL',
    description: 'Malicious SQL injection signature detected in search query payload',
    mitigation: 'WAF Rule #104 activated: Malicious payload blocked & IP blacklisted.',
  },
  EXPIRED_JWT: {
    name: 'Expired JWT Token Replay',
    method: 'POST',
    endpoint: '/api/v1/orders/checkout',
    statusCode: 401,
    responseTimeMs: 85,
    requestSizeBytes: 1250,
    ipAddress: '198.51.100.14',
    severity: 'HIGH',
    description: 'Attempted API authorization using expired cryptographic JWT access token',
    mitigation: 'Token Guard: Signature rejected, session terminated & re-authentication enforced.',
  },
  GEO_FENCING: {
    name: 'Geo-Fencing Policy Violation',
    method: 'GET',
    endpoint: '/api/v1/admin/vault',
    statusCode: 403,
    responseTimeMs: 120,
    requestSizeBytes: 310,
    ipAddress: '198.51.100.42',
    severity: 'HIGH',
    description: 'Ingress traffic detected from unauthorized geographic region (ASN-9842)',
    mitigation: 'Geo-Fence Guard: Ingress subnet dropped at border gateway.',
  },
  DDOS_SURGE: {
    name: 'DDoS High-Volume Burst Surge',
    method: 'GET',
    endpoint: '/api/v1/payments/tokenize',
    statusCode: 429,
    responseTimeMs: 1450,
    requestSizeBytes: 8500,
    ipAddress: '45.83.67.12',
    severity: 'CRITICAL',
    description: 'Volumetric request spike exceeding 5,000 req/sec threshold on Payment Gateway',
    mitigation: 'Rate Limiter: Adaptive tarpitting & IP bucket rate throttled.',
  },
  LATERAL_MOVEMENT: {
    name: 'Unauthorized Service Lateral Hop',
    method: 'POST',
    endpoint: '/api/v1/internal/db/raw-query',
    statusCode: 403,
    responseTimeMs: 210,
    requestSizeBytes: 1890,
    ipAddress: '10.0.4.88',
    severity: 'CRITICAL',
    description: 'Microservice attempting direct unapproved network connection to Encrypted DB Vault',
    mitigation: 'Zero-Trust Proxy: mTLS identity handshake failed & microservice network port isolated.',
  },
  TOKEN_FORGERY: {
    name: 'Cryptographic Token Signature Forgery',
    method: 'PUT',
    endpoint: '/api/v1/services/identity/issue',
    statusCode: 403,
    responseTimeMs: 95,
    requestSizeBytes: 640,
    ipAddress: '185.220.101.99',
    severity: 'CRITICAL',
    description: 'Service identity token failed HMAC-SHA256 signature verification audit',
    mitigation: 'Identity Guard: Credential key revoked & alert logged in audit trail.',
  },
};

export const getSimulation = asyncHandler(async (req, res) => {
  res.json({
    status: 'success',
    data: {
      scenarios: Object.keys(attackConfigs).map((key) => ({
        type: key,
        name: attackConfigs[key].name,
        severity: attackConfigs[key].severity,
      })),
      message: 'Simulation engine ready for SOC attack execution.',
    },
  });
});

export const executeSimulation = asyncHandler(async (req, res) => {
  const { attackType } = simulationSchema.parse(req.body);
  const config = attackConfigs[attackType];

  // Fetch gateway / primary target microservice if available
  const gatewayService = await prisma.microservice.findFirst({
    where: { name: { contains: 'Gateway', mode: 'insensitive' } },
  });

  const targetService = await prisma.microservice.findFirst({
    where: { name: { contains: 'Payment', mode: 'insensitive' } },
  });

  // 1. Create Traffic Log Entry
  const trafficLog = await createTrafficLogEntry({
    sourceServiceId: gatewayService?.id || null,
    targetServiceId: targetService?.id || null,
    method: config.method,
    endpoint: config.endpoint,
    statusCode: config.statusCode,
    responseTimeMs: config.responseTimeMs,
    requestSizeBytes: config.requestSizeBytes,
    ipAddress: config.ipAddress,
  });

  // Broadcast traffic frame over WebSocket
  broadcastTrafficEvent(trafficLog);

  // 2. Create Threat Record
  const threat = await createThreatRecord({
    sourceServiceId: targetService?.id || gatewayService?.id || null,
    ipAddress: config.ipAddress,
    description: `[SIMULATION] ${config.description}`,
    severity: config.severity,
    status: 'OPEN',
  });

  // Broadcast threat alert over WebSocket
  broadcastThreatEvent(threat);

  // 3. Update Target Microservice Health if Critical
  let serviceDegraded = false;
  if (config.severity === 'CRITICAL' && targetService) {
    await prisma.microservice.update({
      where: { id: targetService.id },
      data: { healthStatus: 'DEGRADED' },
    });
    serviceDegraded = true;
  }

  const logsTrace = [
    `[${new Date().toISOString()}] INGRESS: ${config.method} ${config.endpoint} from IP ${config.ipAddress}`,
    `[${new Date().toISOString()}] ENFORCEMENT: Policy check failed -> HTTP ${config.statusCode}`,
    `[${new Date().toISOString()}] THREAT_ENGINE: Threat #${threat.id} logged [Severity: ${config.severity}]`,
    `[${new Date().toISOString()}] MITIGATION: ${config.mitigation}`,
  ];

  res.status(200).json({
    status: 'success',
    data: {
      attackType,
      scenarioName: config.name,
      executionStatus: 'COMPLETED',
      trafficLogId: trafficLog.id,
      threatId: threat.id,
      serviceDegraded,
      mitigationAction: config.mitigation,
      terminalTrace: logsTrace,
    },
  });
});
