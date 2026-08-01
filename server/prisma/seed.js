import {
  PrismaClient,
  RoleName,
  RuleType,
  PolicyStatus,
  ServiceStatus,
  HealthStatus,
  ConnectionStatus,
  ThreatRuleType,
  ThreatSeverity,
  AttackType,
  SimulationIntensity,
} from '@prisma/client';
import { hashPassword } from '../src/utils/password.js';

const prisma = new PrismaClient();

const roles = [
  {
    name: RoleName.ADMIN,
    description: 'Administrator responsible for managing policies, users, and platform settings.',
  },
  {
    name: RoleName.ANALYST,
    description: 'Security analyst focused on monitoring, investigations, and incident response.',
  },
  {
    name: RoleName.DEVOPS,
    description: 'DevOps engineer responsible for service delivery and infrastructure visibility.',
  },
];

const permissions = {
  ADMIN: [
    ['dashboard', 'view'], ['dashboard', 'manage'],
    ['traffic', 'view'], ['traffic', 'manage'],
    ['topology', 'view'], ['topology', 'manage'],
    ['threats', 'view'], ['threats', 'manage'], ['threats', 'update'],
    ['policies', 'view'], ['policies', 'create'], ['policies', 'update'], ['policies', 'delete'], ['policies', 'manage'],
    ['audit', 'view'], ['audit', 'manage'],
    ['simulation', 'view'], ['simulation', 'manage'],
    ['analytics', 'view'], ['analytics', 'manage'],
    ['settings', 'view'], ['settings', 'manage'],
    ['users', 'view'], ['users', 'create'], ['users', 'update'], ['users', 'delete'], ['users', 'manage'],
    ['services', 'view'], ['services', 'create'], ['services', 'update'], ['services', 'delete'], ['services', 'manage'],
  ],
  ANALYST: [
    ['dashboard', 'view'],
    ['traffic', 'view'],
    ['topology', 'view'],
    ['threats', 'view'], ['threats', 'update'],
    ['audit', 'view'],
    ['analytics', 'view'],
    ['policies', 'view'],
    ['services', 'view'],
    ['simulation', 'view'],
  ],
  DEVOPS: [
    ['dashboard', 'view'], ['dashboard', 'manage'],
    ['topology', 'view'], ['topology', 'manage'],
    ['analytics', 'view'], ['analytics', 'manage'],
    ['traffic', 'view'],
    ['threats', 'view'],
    ['audit', 'view'],
    ['services', 'view'], ['services', 'create'], ['services', 'update'], ['services', 'manage'],
  ],
};

const users = [
  {
    name: 'ZeroShield Admin',
    email: 'admin@zeroshield.io',
    password: 'admin_secret_key_2026',
    role: RoleName.ADMIN,
  },
  {
    name: 'ZeroShield Analyst',
    email: 'analyst@zeroshield.io',
    password: 'analyst_sec_key_2026',
    role: RoleName.ANALYST,
  },
  {
    name: 'ZeroShield DevOps',
    email: 'devops@zeroshield.io',
    password: 'devops_infra_key_2026',
    role: RoleName.DEVOPS,
  },
];

const initialPolicies = [
  {
    name: 'Global API Rate Limiter',
    description: 'Enforce rate limits per IP across all public microservice gateways',
    ruleType: RuleType.RATE_LIMIT,
    ruleConfig: { requestsPerMinute: 100, windowMs: 60000 },
    status: PolicyStatus.ACTIVE,
  },
  {
    name: 'Internal Admin IP Allowlist',
    description: 'Restrict admin dashboard and policy modifications to trusted CIDR subnets',
    ruleType: RuleType.IP_ALLOWLIST,
    ruleConfig: { allowedIps: ['127.0.0.1', '10.0.0.0/8', '192.168.1.0/24'] },
    status: PolicyStatus.ACTIVE,
  },
  {
    name: 'Strict JWT Authentication Guard',
    description: 'Require valid cryptographic JWT signatures on all /api endpoints',
    ruleType: RuleType.AUTH_REQUIRED,
    ruleConfig: { authTypes: ['Bearer'], tokenExpirationMs: 900000 },
    status: PolicyStatus.ACTIVE,
  },
  {
    name: 'WAF Payload Inspection',
    description: 'Validate request body payload size and content-type headers',
    ruleType: RuleType.PAYLOAD_VALIDATION,
    ruleConfig: { maxSizeBytes: 1048576, allowedContentTypes: ['application/json'] },
    status: PolicyStatus.ACTIVE,
  },
];

const initialThreatRules = [
  {
    name: 'Traffic Burst Rate Limit Exceeded',
    ruleType: ThreatRuleType.RATE_LIMIT_EXCEEDED,
    thresholdConfig: { maxRequestsPerWindow: 10, windowSeconds: 10 },
    severity: ThreatSeverity.HIGH,
    enabled: true,
  },
  {
    name: 'Repeated Authentication Failures',
    ruleType: ThreatRuleType.REPEATED_AUTH_FAILURE,
    thresholdConfig: { maxFailures: 3, windowSeconds: 30 },
    severity: ThreatSeverity.HIGH,
    enabled: true,
  },
  {
    name: 'Unusual Endpoint / Malicious SQLi Access',
    ruleType: ThreatRuleType.UNUSUAL_ENDPOINT_ACCESS,
    thresholdConfig: { detectPatterns: ['UNION SELECT', 'OR 1=1', '<script>', 'DROP TABLE'] },
    severity: ThreatSeverity.CRITICAL,
    enabled: true,
  },
  {
    name: 'Excessive Payload Size Anomaly',
    ruleType: ThreatRuleType.PAYLOAD_ANOMALY,
    thresholdConfig: { maxSizeBytes: 1048576 },
    severity: ThreatSeverity.MEDIUM,
    enabled: true,
  },
];

const initialServices = [
  {
    name: 'Edge API Gateway',
    description: 'Public entrance routing traffic into the ZeroShield proxy mesh',
    baseUrl: 'https://gateway.zeroshield.io',
    status: ServiceStatus.ACTIVE,
    healthStatus: HealthStatus.HEALTHY,
    tags: ['gateway', 'dmz', 'ingress'],
    isSimulationSafe: true,
  },
  {
    name: 'Zero Trust Proxy Engine',
    description: 'Central authorization and mTLS sidecar proxy engine',
    baseUrl: 'https://proxy.internal.zeroshield.io',
    status: ServiceStatus.ACTIVE,
    healthStatus: HealthStatus.HEALTHY,
    tags: ['proxy', 'control-plane', 'zero-trust'],
    isSimulationSafe: true,
  },
  {
    name: 'Order Processing Service',
    description: 'Handles customer checkout, order state and workflow state',
    baseUrl: 'https://orders.service.internal',
    status: ServiceStatus.ACTIVE,
    healthStatus: HealthStatus.HEALTHY,
    tags: ['mesh', 'business-logic', 'orders'],
    isSimulationSafe: true,
  },
  {
    name: 'Payment Gateway Service',
    description: 'Secure credit card and tokenized payment processing service',
    baseUrl: 'https://payments.service.internal',
    status: ServiceStatus.ACTIVE,
    healthStatus: HealthStatus.HEALTHY,
    tags: ['pci-dss', 'payments', 'secure-enclave'],
    isSimulationSafe: true,
  },
  {
    name: 'Inventory & Stock Service',
    description: 'Real-time SKU catalog, inventory reservation & warehouse stock',
    baseUrl: 'https://inventory.service.internal',
    status: ServiceStatus.ACTIVE,
    healthStatus: HealthStatus.HEALTHY,
    tags: ['mesh', 'inventory', 'stock'],
    isSimulationSafe: true,
  },
  {
    name: 'Notification & SMS Engine',
    description: 'Transactional email, push notifications & SMS delivery engine',
    baseUrl: 'https://notifications.service.internal',
    status: ServiceStatus.ACTIVE,
    healthStatus: HealthStatus.HEALTHY,
    tags: ['mesh', 'notifications', 'async'],
    isSimulationSafe: true,
  },
  {
    name: 'Encrypted Core DB Cluster',
    description: 'Primary PostgreSQL transactional database vault with AES-256 encryption',
    baseUrl: 'postgres://db-vault.internal:5432/zeroshield',
    status: ServiceStatus.ACTIVE,
    healthStatus: HealthStatus.HEALTHY,
    tags: ['database', 'vault', 'encrypted'],
    isSimulationSafe: true,
  },
];

async function main() {
  const roleRows = new Map();

  for (const role of roles) {
    const row = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });

    roleRows.set(role.name, row);
  }

  for (const [roleName, actions] of Object.entries(permissions)) {
    const role = roleRows.get(roleName);

    for (const [resource, action] of actions) {
      await prisma.permission.upsert({
        where: {
          roleId_resource_action: {
            roleId: role.id,
            resource,
            action,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          resource,
          action,
        },
      });
    }
  }

  const createdUserMap = new Map();
  for (const user of users) {
    const passwordHash = await hashPassword(user.password);

    const userRow = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        passwordHash,
        role: user.role,
        isMfaEnabled: false,
      },
      create: {
        name: user.name,
        email: user.email,
        passwordHash,
        role: user.role,
      },
    });
    createdUserMap.set(user.role, userRow);
  }

  const adminUser = createdUserMap.get(RoleName.ADMIN);
  const devopsUser = createdUserMap.get(RoleName.DEVOPS);

  if (adminUser) {
    for (const policy of initialPolicies) {
      const existing = await prisma.securityPolicy.findFirst({
        where: { name: policy.name },
      });

      if (!existing) {
        await prisma.securityPolicy.create({
          data: {
            ...policy,
            createdBy: adminUser.id,
          },
        });
      }
    }
  }

  for (const tr of initialThreatRules) {
    const existing = await prisma.threatRule.findFirst({
      where: { name: tr.name },
    });
    if (!existing) {
      await prisma.threatRule.create({
        data: tr,
      });
    }
  }

  const serviceMap = new Map();
  if (devopsUser && adminUser) {
    for (let i = 0; i < initialServices.length; i++) {
      const s = initialServices[i];
      const ownerId = i < 2 ? adminUser.id : devopsUser.id;

      const row = await prisma.microservice.upsert({
        where: { name: s.name },
        update: {
          description: s.description,
          baseUrl: s.baseUrl,
          status: s.status,
          healthStatus: s.healthStatus,
          tags: s.tags,
          isSimulationSafe: s.isSimulationSafe,
        },
        create: {
          name: s.name,
          description: s.description,
          ownerId,
          baseUrl: s.baseUrl,
          status: s.status,
          healthStatus: s.healthStatus,
          tags: s.tags,
          isSimulationSafe: s.isSimulationSafe,
        },
      });
      serviceMap.set(s.name, row);
    }

    const gw = serviceMap.get('Edge API Gateway');
    const proxy = serviceMap.get('Zero Trust Proxy Engine');
    const ord = serviceMap.get('Order Processing Service');
    const pay = serviceMap.get('Payment Gateway Service');
    const inv = serviceMap.get('Inventory & Stock Service');
    const ntf = serviceMap.get('Notification & SMS Engine');
    const db = serviceMap.get('Encrypted Core DB Cluster');

    const connections = [
      { source: gw, target: proxy, protocol: 'HTTPS', status: ConnectionStatus.ALLOWED },
      { source: proxy, target: ord, protocol: 'mTLS', status: ConnectionStatus.ALLOWED },
      { source: proxy, target: pay, protocol: 'mTLS', status: ConnectionStatus.ALLOWED },
      { source: proxy, target: inv, protocol: 'mTLS', status: ConnectionStatus.ALLOWED },
      { source: proxy, target: ntf, protocol: 'gRPC', status: ConnectionStatus.ALLOWED },
      { source: ord, target: db, protocol: 'TCP/TLS', status: ConnectionStatus.ALLOWED },
      { source: pay, target: db, protocol: 'TCP/TLS', status: ConnectionStatus.ALLOWED },
    ];

    for (const conn of connections) {
      if (conn.source && conn.target) {
        await prisma.serviceConnection.upsert({
          where: {
            connection_unique_link: {
              sourceServiceId: conn.source.id,
              targetServiceId: conn.target.id,
              protocol: conn.protocol,
            },
          },
          update: { status: conn.status },
          create: {
            sourceServiceId: conn.source.id,
            targetServiceId: conn.target.id,
            protocol: conn.protocol,
            status: conn.status,
          },
        });
      }
    }

    // Seed Attack Scenarios
    const paymentService = serviceMap.get('Payment Gateway Service');
    const authService = serviceMap.get('Edge API Gateway');

    const initialScenarios = [
      {
        name: 'Distributed High-Volume DDoS Burst',
        description: 'Simulates a massive distributed denial of service request surge targeting Payment Gateway',
        attackType: AttackType.DDOS_BURST,
        targetServiceId: paymentService?.id || null,
        intensity: SimulationIntensity.HIGH,
        durationSeconds: 15,
        config: { requestsPerSecond: 25, sourceIpPoolSize: 20, endpoint: '/api/v1/payments/tokenize' },
      },
      {
        name: 'Credential Stuffing Botnet Attack',
        description: 'High-frequency automated login verification attempt using stolen password dumps',
        attackType: AttackType.CREDENTIAL_STUFFING,
        targetServiceId: authService?.id || null,
        intensity: SimulationIntensity.HIGH,
        durationSeconds: 12,
        config: { requestsPerSecond: 15, sourceIpPoolSize: 10, endpoint: '/api/v1/auth/login' },
      },
      {
        name: 'WAF SQL Injection Exploit Probe',
        description: 'Targeted database query injection attempts searching for vulnerable ORM endpoints',
        attackType: AttackType.SQL_INJECTION_ATTEMPT,
        targetServiceId: authService?.id || null,
        intensity: SimulationIntensity.MEDIUM,
        durationSeconds: 10,
        config: { requestsPerSecond: 8, sourceIpPoolSize: 5, endpoint: '/api/v1/users/search' },
      },
      {
        name: 'Unapproved Lateral Movement Hop',
        description: 'Compromised microservice attempting unauthorized internal network access to Encrypted DB Vault',
        attackType: AttackType.LATERAL_MOVEMENT,
        targetServiceId: paymentService?.id || null,
        intensity: SimulationIntensity.MEDIUM,
        durationSeconds: 10,
        config: { requestsPerSecond: 5, sourceIpPoolSize: 3, endpoint: '/api/v1/internal/db/raw-query' },
      },
      {
        name: 'High-Volume Data Exfiltration Probe',
        description: 'Suspicious large payload extraction attempt originating from sensitive internal API endpoints',
        attackType: AttackType.DATA_EXFILTRATION,
        targetServiceId: paymentService?.id || null,
        intensity: SimulationIntensity.HIGH,
        durationSeconds: 15,
        config: { requestsPerSecond: 10, sourceIpPoolSize: 4, endpoint: '/api/v1/user/export-pii' },
      },
    ];

    for (const sc of initialScenarios) {
      const existing = await prisma.attackScenario.findFirst({
        where: { name: sc.name },
      });
      if (!existing) {
        await prisma.attackScenario.create({
          data: sc,
        });
      }
    }
  }

  console.log('Seed complete: roles, permissions, demo users, policies, threat rules, microservices, topology, and attack scenarios ready.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });