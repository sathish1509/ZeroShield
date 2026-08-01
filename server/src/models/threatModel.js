import { prisma } from '../config/prisma.js';

export const createThreatRecord = async (data) => {
  return prisma.threat.create({
    data: {
      ruleId: data.ruleId ? Number(data.ruleId) : null,
      sourceServiceId: data.sourceServiceId ? Number(data.sourceServiceId) : null,
      ipAddress: data.ipAddress || null,
      description: data.description,
      severity: data.severity,
      status: data.status || 'OPEN',
    },
    include: {
      sourceService: { select: { id: true, name: true } },
      rule: { select: { id: true, name: true, ruleType: true } },
      resolver: { select: { id: true, name: true, email: true } },
    },
  });
};

export const findThreats = async ({
  severity,
  status,
  sourceServiceId,
  page = 1,
  limit = 20,
}) => {
  const where = {};
  if (severity) where.severity = severity;
  if (status) where.status = status;
  if (sourceServiceId) where.sourceServiceId = Number(sourceServiceId);

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const [threats, total] = await Promise.all([
    prisma.threat.findMany({
      where,
      include: {
        sourceService: { select: { id: true, name: true } },
        rule: { select: { id: true, name: true, ruleType: true } },
        resolver: { select: { id: true, name: true, email: true } },
      },
      orderBy: { detectedAt: 'desc' },
      skip,
      take,
    }),
    prisma.threat.count({ where }),
  ]);

  return {
    threats,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const findThreatById = async (id) => {
  return prisma.threat.findUnique({
    where: { id: Number(id) },
    include: {
      sourceService: { select: { id: true, name: true } },
      rule: { select: { id: true, name: true, ruleType: true } },
      resolver: { select: { id: true, name: true, email: true } },
    },
  });
};

export const updateThreatStatusRecord = async (id, status, resolverUserId) => {
  const updateData = {
    status,
  };

  if (status === 'RESOLVED' || status === 'FALSE_POSITIVE') {
    updateData.resolvedAt = new Date();
    updateData.resolvedBy = Number(resolverUserId);
  }

  return prisma.threat.update({
    where: { id: Number(id) },
    data: updateData,
    include: {
      sourceService: { select: { id: true, name: true } },
      rule: { select: { id: true, name: true, ruleType: true } },
      resolver: { select: { id: true, name: true, email: true } },
    },
  });
};
