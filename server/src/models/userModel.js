import { prisma } from '../config/prisma.js';

export const findUserByEmail = (email) =>
  prisma.user.findUnique({
    where: { email },
  });

export const findUserById = (id) =>
  prisma.user.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

export const findAllUsers = () =>
  prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

export const createUserDb = (data) =>
  prisma.user.create({
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

export const updateUserRoleDb = (id, role) =>
  prisma.user.update({
    where: { id: Number(id) },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
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