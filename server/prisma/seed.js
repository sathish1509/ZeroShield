import { PrismaClient, RoleName } from '@prisma/client';
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
    ['dashboard', 'view'],
    ['traffic', 'view'],
    ['topology', 'view'],
    ['threats', 'view'],
    ['policies', 'manage'],
    ['audit', 'view'],
    ['simulation', 'manage'],
    ['analytics', 'view'],
    ['settings', 'manage'],
  ],
  ANALYST: [
    ['dashboard', 'view'],
    ['traffic', 'view'],
    ['topology', 'view'],
    ['threats', 'view'],
    ['audit', 'view'],
    ['analytics', 'view'],
  ],
  DEVOPS: [
    ['dashboard', 'view'],
    ['traffic', 'view'],
    ['topology', 'view'],
    ['audit', 'view'],
    ['analytics', 'view'],
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

  for (const user of users) {
    const passwordHash = await hashPassword(user.password);

    await prisma.user.upsert({
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
  }

  console.log('Seed complete: roles, permissions, and demo users are ready.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });