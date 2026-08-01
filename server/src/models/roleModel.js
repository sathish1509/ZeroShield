import { prisma } from '../config/prisma.js';

export const upsertRole = (data) =>
  prisma.role.upsert({
    where: { name: data.name },
    update: {
      description: data.description,
    },
    create: data,
  });

export const getRoleByName = (name) =>
  prisma.role.findUnique({
    where: { name },
    include: {
      permissions: true,
    },
  });