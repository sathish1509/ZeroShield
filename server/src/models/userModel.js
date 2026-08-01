import { prisma } from '../config/prisma.js';

export const findUserByEmail = (email) =>
  prisma.user.findUnique({
    where: { email },
  });

export const findUserById = (id) =>
  prisma.user.findUnique({
    where: { id },
  });

export const upsertUser = (data) =>
  prisma.user.upsert({
    where: { email: data.email },
    update: {
      name: data.name,
      passwordHash: data.passwordHash,
      role: data.role,
    },
    create: data,
  });