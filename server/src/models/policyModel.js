import { prisma } from '../config/prisma.js';

export const findAllPolicies = () =>
  prisma.securityPolicy.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

export const findPolicyById = (id) =>
  prisma.securityPolicy.findUnique({
    where: { id: Number(id) },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

export const createPolicy = (data) =>
  prisma.securityPolicy.create({
    data,
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

export const updatePolicy = (id, data) =>
  prisma.securityPolicy.update({
    where: { id: Number(id) },
    data,
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

export const deletePolicy = (id) =>
  prisma.securityPolicy.delete({
    where: { id: Number(id) },
  });
