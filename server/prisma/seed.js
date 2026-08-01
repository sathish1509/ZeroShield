import { PrismaClient, RoleName, RuleType, PolicyStatus } from '@prisma/client';
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
    ['threats', 'view'], ['threats', 'manage'],
    ['policies', 'view'], ['policies', 'create'], ['policies', 'update'], ['policies', 'delete'], ['policies', 'manage'],
    ['audit', 'view'], ['audit', 'manage'],
    ['simulation', 'view'], ['simulation', 'manage'],
    ['analytics', 'view'], ['analytics', 'manage'],
    ['settings', 'view'], ['settings', 'manage'],
    ['users', 'view'], ['users', 'create'], ['users', 'update'], ['users', 'delete'], ['users', 'manage'],
  ],
  ANALYST: [
    ['dashboard', 'view'],
    ['traffic', 'view'],
    ['topology', 'view'],
    ['threats', 'view'],
    ['audit', 'view'],
    ['analytics', 'view'],
    ['policies', 'view'],
  ],
  DEVOPS: [
    ['dashboard', 'view'], ['dashboard', 'manage'],
    ['topology', 'view'], ['topology', 'manage'],
    ['analytics', 'view'], ['analytics', 'manage'],
    ['traffic', 'view'],
    ['threats', 'view'],
    ['audit', 'view'],
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

  console.log('Seed complete: roles, permissions, demo users, and security policies are ready.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });