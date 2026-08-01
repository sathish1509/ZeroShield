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
  action,
  query,
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
  if (action) {
    where.action = action;
  }
  if (query) {
    where.OR = [
      { action: { contains: query, mode: 'insensitive' } },
      { resource: { contains: query, mode: 'insensitive' } },
      { resourceId: { contains: query, mode: 'insensitive' } },
    ];
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
      totalPages: Math.ceil(total / Number(limit)) || 1,
    },
  };
};

export const findAuditLogsForExport = async ({
  userId,
  resource,
  action,
  query,
  startDate,
  endDate,
}) => {
  const where = {};
  if (userId) where.userId = Number(userId);
  if (resource) where.resource = resource;
  if (action) where.action = action;
  if (query) {
    where.OR = [
      { action: { contains: query, mode: 'insensitive' } },
      { resource: { contains: query, mode: 'insensitive' } },
      { resourceId: { contains: query, mode: 'insensitive' } },
    ];
  }
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  return prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
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
  });
};

export const getAuditSummary = async (dateFilter = {}) => {
  const where = {};
  if (dateFilter.startDate || dateFilter.endDate) {
    where.createdAt = {};
    if (dateFilter.startDate) where.createdAt.gte = new Date(dateFilter.startDate);
    if (dateFilter.endDate) where.createdAt.lte = new Date(dateFilter.endDate);
  }

  const [totalLogs, actionsSummary, resourcesSummary, userActivity] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.groupBy({
      by: ['action'],
      where,
      _count: { action: true },
    }),
    prisma.auditLog.groupBy({
      by: ['resource'],
      where,
      _count: { resource: true },
    }),
    prisma.auditLog.groupBy({
      by: ['userId'],
      where,
      _count: { userId: true },
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
    userActivityCount: userActivity.length,
  };
};
