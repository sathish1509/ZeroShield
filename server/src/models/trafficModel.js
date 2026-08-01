import { prisma } from '../config/prisma.js';

export const createTrafficLogEntry = async (data) => {
  return prisma.trafficLog.create({
    data: {
      sourceServiceId: data.sourceServiceId ? Number(data.sourceServiceId) : null,
      targetServiceId: data.targetServiceId ? Number(data.targetServiceId) : null,
      method: data.method.toUpperCase(),
      endpoint: data.endpoint,
      statusCode: Number(data.statusCode),
      responseTimeMs: Number(data.responseTimeMs || 0),
      requestSizeBytes: Number(data.requestSizeBytes || 0),
      ipAddress: data.ipAddress || '127.0.0.1',
    },
    include: {
      sourceService: { select: { id: true, name: true } },
      targetService: { select: { id: true, name: true } },
    },
  });
};

export const findTrafficLogs = async ({
  statusCode,
  method,
  sourceServiceId,
  targetServiceId,
  ipAddress,
  page = 1,
  limit = 20,
}) => {
  const where = {};
  if (statusCode) where.statusCode = Number(statusCode);
  if (method) where.method = method.toUpperCase();
  if (sourceServiceId) where.sourceServiceId = Number(sourceServiceId);
  if (targetServiceId) where.targetServiceId = Number(targetServiceId);
  if (ipAddress) where.ipAddress = { contains: ipAddress, mode: 'insensitive' };

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const [logs, total] = await Promise.all([
    prisma.trafficLog.findMany({
      where,
      include: {
        sourceService: { select: { id: true, name: true } },
        targetService: { select: { id: true, name: true } },
      },
      orderBy: { timestamp: 'desc' },
      skip,
      take,
    }),
    prisma.trafficLog.count({ where }),
  ]);

  return {
    logs,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};
