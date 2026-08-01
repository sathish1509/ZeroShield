import { prisma } from '../config/prisma.js';

export const createAuditEntry = (data) =>
  prisma.auditLog.create({
    data: {
      userId: data.userId,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId ? String(data.resourceId) : null,
      details: data.details || {},
      ipAddress: data.ipAddress || null,
    },
  });

export const findAuditLogs = async ({
  userId,
  resource,
  startDate,
  endDate,
  page = 1,
  limit = 20,
}) => {
  const where = {};

  if (userId) {
    where.userId = Number(userId);
  }
  if (resource) {
    where.resource = resource;
  }
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = new Date(startDate);
    }
    if (endDate) {
      where.createdAt.lte = new Date(endDate);
    }
  }

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    }),
  ]);

  return {
    logs,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getAuditSummary = async () => {
  const [totalLogs, actionsSummary, resourcesSummary] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLog.groupBy({
      by: ['action'],
      _count: { action: true },
    }),
    prisma.auditLog.groupBy({
      by: ['resource'],
      _count: { resource: true },
    }),
  ]);

  return {
    totalLogs,
    actionsSummary: actionsSummary.map((item) => ({
      action: item.action,
      count: item._count.action,
    })),
    resourcesSummary: resourcesSummary.map((item) => ({
      resource: item.resource,
      count: item._count.resource,
    })),
  };
};
