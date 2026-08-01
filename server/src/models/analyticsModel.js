import { prisma } from '../config/prisma.js';

export const getDashboardSummaryMetrics = async () => {
  const [totalServices, activeServices, totalTrafficLogs, openThreatsCount, activePoliciesCount] =
    await Promise.all([
      prisma.microservice.count(),
      prisma.microservice.count({ where: { status: 'ACTIVE' } }),
      prisma.trafficLog.count(),
      prisma.threat.count({ where: { status: { in: ['OPEN', 'INVESTIGATING'] } } }),
      prisma.securityPolicy.count({ where: { status: 'ACTIVE' } }),
    ]);

  const recentAlerts = await prisma.threat.findMany({
    take: 5,
    orderBy: { detectedAt: 'desc' },
    include: {
      sourceService: { select: { id: true, name: true } },
    },
  });

  return {
    kpis: {
      totalServices,
      activeServices,
      totalTrafficLogs,
      openThreatsCount,
      activePoliciesCount,
      systemHealth: openThreatsCount > 0 ? 'ATTENTION_REQUIRED' : 'ALL_SYSTEMS_OPERATIONAL',
    },
    recentAlerts,
  };
};

export const getAnalyticsDetailedMetrics = async () => {
  const [
    totalLogs,
    errorLogsCount,
    avgResponseTimeResult,
    threatsBySeverity,
    threatsByStatus,
    trafficByStatus,
    topEndpoints,
  ] = await Promise.all([
    prisma.trafficLog.count(),
    prisma.trafficLog.count({ where: { statusCode: { gte: 400 } } }),
    prisma.trafficLog.aggregate({ _avg: { responseTimeMs: true } }),
    prisma.threat.groupBy({
      by: ['severity'],
      _count: { _all: true },
    }),
    prisma.threat.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.trafficLog.groupBy({
      by: ['statusCode'],
      _count: { _all: true },
    }),
    prisma.trafficLog.groupBy({
      by: ['endpoint', 'method'],
      _count: { _all: true },
      orderBy: { _count: { endpoint: 'desc' } },
      take: 5,
    }),
  ]);

  const avgResponseTimeMs = Math.round(avgResponseTimeResult._avg.responseTimeMs || 0);

  return {
    overview: {
      totalLogs,
      errorLogsCount,
      successRate: totalLogs > 0 ? Number((((totalLogs - errorLogsCount) / totalLogs) * 100).toFixed(2)) : 100,
      avgResponseTimeMs,
    },
    threatsBySeverity: threatsBySeverity.map((item) => ({
      severity: item.severity,
      count: item._count._all,
    })),
    threatsByStatus: threatsByStatus.map((item) => ({
      status: item.status,
      count: item._count._all,
    })),
    trafficByStatus: trafficByStatus.map((item) => ({
      statusCode: item.statusCode,
      count: item._count._all,
    })),
    topTargetedEndpoints: topEndpoints.map((item) => ({
      endpoint: item.endpoint,
      method: item.method,
      requestCount: item._count._all,
    })),
  };
};
