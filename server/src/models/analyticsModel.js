import { prisma } from '../config/prisma.js';
import { Prisma } from '@prisma/client';

export const parseRangeToStartDate = (range = '24h') => {
  const now = new Date();
  switch (range) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '24h':
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
};

export const getTrafficAnalyticsSummary = async ({ range = '24h', serviceId }) => {
  const startDate = parseRangeToStartDate(range);
  const where = { timestamp: { gte: startDate } };
  if (serviceId) {
    where.targetServiceId = Number(serviceId);
  }

  const isMultiDay = range === '7d' || range === '30d';
  const serviceCondition = serviceId
    ? Prisma.sql`AND target_service_id = ${Number(serviceId)}`
    : Prisma.empty;

  // Time-series bucketed volume
  const timeSeriesRaw = isMultiDay
    ? await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('day', timestamp) AS bucket,
          COUNT(*)::int AS "requestCount",
          COALESCE(ROUND(AVG(response_time_ms)), 0)::int AS "avgResponseTimeMs"
        FROM traffic_logs
        WHERE timestamp >= ${startDate}
          ${serviceCondition}
        GROUP BY bucket
        ORDER BY bucket ASC
      `
    : await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('hour', timestamp) AS bucket,
          COUNT(*)::int AS "requestCount",
          COALESCE(ROUND(AVG(response_time_ms)), 0)::int AS "avgResponseTimeMs"
        FROM traffic_logs
        WHERE timestamp >= ${startDate}
          ${serviceCondition}
        GROUP BY bucket
        ORDER BY bucket ASC
      `;

  // Status code distribution
  const statusDistributionRaw = await prisma.$queryRaw`
    SELECT 
      CASE 
        WHEN status_code >= 200 AND status_code < 300 THEN '2xx'
        WHEN status_code >= 300 AND status_code < 400 THEN '3xx'
        WHEN status_code >= 400 AND status_code < 500 THEN '4xx'
        WHEN status_code >= 500 THEN '5xx'
        ELSE 'other'
      END AS category,
      COUNT(*)::int AS count
    FROM traffic_logs
    WHERE timestamp >= ${startDate}
      ${serviceCondition}
    GROUP BY category
  `;

  // Traffic volume by service
  const trafficByServiceRaw = await prisma.trafficLog.groupBy({
    by: ['targetServiceId'],
    where,
    _count: { _all: true },
    _avg: { responseTimeMs: true },
  });

  const services = await prisma.microservice.findMany({
    select: { id: true, name: true },
  });
  const serviceMap = new Map(services.map((s) => [s.id, s.name]));

  const trafficByService = trafficByServiceRaw.map((item) => ({
    serviceId: item.targetServiceId,
    serviceName: serviceMap.get(item.targetServiceId) || 'External / Gateway',
    requestCount: item._count._all,
    avgResponseTimeMs: Math.round(item._avg.responseTimeMs || 0),
  }));

  return {
    range,
    startDate,
    timeSeries: timeSeriesRaw,
    statusDistribution: statusDistributionRaw,
    trafficByService,
  };
};

export const getThreatAnalyticsSummary = async ({ range = '24h' }) => {
  const startDate = parseRangeToStartDate(range);
  const where = { detectedAt: { gte: startDate } };
  const isMultiDay = range === '7d' || range === '30d';

  const [bySeverity, byStatus, byServiceRaw, trendRaw] = await Promise.all([
    prisma.threat.groupBy({
      by: ['severity'],
      where,
      _count: { _all: true },
    }),
    prisma.threat.groupBy({
      by: ['status'],
      where,
      _count: { _all: true },
    }),
    prisma.threat.groupBy({
      by: ['sourceServiceId'],
      where,
      _count: { _all: true },
    }),
    isMultiDay
      ? prisma.$queryRaw`
          SELECT 
            DATE_TRUNC('day', detected_at) AS bucket,
            severity,
            COUNT(*)::int AS count
          FROM threats
          WHERE detected_at >= ${startDate}
          GROUP BY bucket, severity
          ORDER BY bucket ASC
        `
      : prisma.$queryRaw`
          SELECT 
            DATE_TRUNC('hour', detected_at) AS bucket,
            severity,
            COUNT(*)::int AS count
          FROM threats
          WHERE detected_at >= ${startDate}
          GROUP BY bucket, severity
          ORDER BY bucket ASC
        `,
  ]);

  const services = await prisma.microservice.findMany({
    select: { id: true, name: true },
  });
  const serviceMap = new Map(services.map((s) => [s.id, s.name]));

  const byService = byServiceRaw.map((item) => ({
    serviceId: item.sourceServiceId,
    serviceName: serviceMap.get(item.sourceServiceId) || 'Unassigned Gateway',
    threatCount: item._count._all,
  }));

  return {
    range,
    startDate,
    bySeverity: bySeverity.map((item) => ({ severity: item.severity, count: item._count._all })),
    byStatus: byStatus.map((item) => ({ status: item.status, count: item._count._all })),
    byService,
    trend: trendRaw,
  };
};

export const getServiceHealthAnalytics = async ({ range = '24h' }) => {
  const startDate = parseRangeToStartDate(range);

  const services = await prisma.microservice.findMany({
    include: {
      owner: { select: { name: true, email: true } },
    },
  });

  const serviceMetrics = await Promise.all(
    services.map(async (service) => {
      const logs = await prisma.trafficLog.aggregate({
        where: {
          targetServiceId: service.id,
          timestamp: { gte: startDate },
        },
        _count: { _all: true },
        _avg: { responseTimeMs: true },
      });

      const successCount = await prisma.trafficLog.count({
        where: {
          targetServiceId: service.id,
          timestamp: { gte: startDate },
          statusCode: { lt: 400 },
        },
      });

      const errorCount = await prisma.trafficLog.count({
        where: {
          targetServiceId: service.id,
          timestamp: { gte: startDate },
          statusCode: { gte: 400 },
        },
      });

      const total = logs._count._all;
      const uptimePct = total > 0 ? Number(((successCount / total) * 100).toFixed(2)) : 100;
      const errorRatePct = total > 0 ? Number(((errorCount / total) * 100).toFixed(2)) : 0;
      const avgResponseTimeMs = Math.round(logs._avg.responseTimeMs || 0);

      return {
        serviceId: service.id,
        name: service.name,
        baseUrl: service.baseUrl,
        status: service.status,
        healthStatus: service.healthStatus,
        owner: service.owner.name,
        totalRequests: total,
        successRequests: successCount,
        errorRequests: errorCount,
        uptimePct,
        errorRatePct,
        avgResponseTimeMs,
      };
    })
  );

  return {
    range,
    startDate,
    services: serviceMetrics,
  };
};

export const getAuditAnalyticsSummary = async ({ range = '24h' }) => {
  const startDate = parseRangeToStartDate(range);
  const where = { createdAt: { gte: startDate } };

  const [byAction, byResource, byUserRaw] = await Promise.all([
    prisma.auditLog.groupBy({
      by: ['action'],
      where,
      _count: { _all: true },
    }),
    prisma.auditLog.groupBy({
      by: ['resource'],
      where,
      _count: { _all: true },
    }),
    prisma.auditLog.groupBy({
      by: ['userId'],
      where,
      _count: { _all: true },
    }),
  ]);

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  const byUser = byUserRaw.map((item) => {
    const userInfo = userMap.get(item.userId) || { name: 'Unknown', email: '', role: 'N/A' };
    return {
      userId: item.userId,
      userName: userInfo.name,
      userEmail: userInfo.email,
      userRole: userInfo.role,
      actionCount: item._count._all,
    };
  });

  return {
    range,
    startDate,
    byAction: byAction.map((i) => ({ action: i.action, count: i._count._all })),
    byResource: byResource.map((i) => ({ resource: i.resource, count: i._count._all })),
    byUser,
  };
};

export const getDashboardLandingSummary = async () => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalServices,
    healthyServices,
    degradedServices,
    downServices,
    openThreatsCount,
    threatsBySeverity,
    todayTrafficCount,
    todayAvgLatencyResult,
    activePoliciesCount,
    recentAuditLogs,
    miniTrendRaw,
  ] = await Promise.all([
    prisma.microservice.count(),
    prisma.microservice.count({ where: { healthStatus: 'HEALTHY' } }),
    prisma.microservice.count({ where: { healthStatus: 'DEGRADED' } }),
    prisma.microservice.count({ where: { healthStatus: 'DOWN' } }),
    prisma.threat.count({ where: { status: { in: ['OPEN', 'INVESTIGATING'] } } }),
    prisma.threat.groupBy({
      by: ['severity'],
      where: { status: { in: ['OPEN', 'INVESTIGATING'] } },
      _count: { _all: true },
    }),
    prisma.trafficLog.count({ where: { timestamp: { gte: startOfDay } } }),
    prisma.trafficLog.aggregate({
      where: { timestamp: { gte: startOfDay } },
      _avg: { responseTimeMs: true },
    }),
    prisma.securityPolicy.count({ where: { status: 'ACTIVE' } }),
    prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    }),
    prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('hour', timestamp) AS bucket,
        COUNT(*)::int AS count
      FROM traffic_logs
      WHERE timestamp >= NOW() - INTERVAL '24 hours'
      GROUP BY bucket
      ORDER BY bucket ASC
    `,
  ]);

  return {
    servicesSummary: {
      totalServices,
      healthy: healthyServices,
      degraded: degradedServices,
      down: downServices,
    },
    threatsSummary: {
      openThreatsCount,
      bySeverity: threatsBySeverity.map((i) => ({ severity: i.severity, count: i._count._all })),
    },
    trafficToday: {
      requestCount: todayTrafficCount,
      avgResponseTimeMs: Math.round(todayAvgLatencyResult._avg.responseTimeMs || 0),
    },
    activePoliciesCount,
    recentAuditLogs,
    miniTrafficTrend: miniTrendRaw,
  };
};

export const getDashboardSummaryMetrics = async () => {
  const landing = await getDashboardLandingSummary();
  return {
    kpis: {
      totalServices: landing.servicesSummary.totalServices,
      activeServices: landing.servicesSummary.healthy,
      totalTrafficLogs: landing.trafficToday.requestCount,
      openThreatsCount: landing.threatsSummary.openThreatsCount,
      activePoliciesCount: landing.activePoliciesCount,
      systemHealth: landing.threatsSummary.openThreatsCount > 0 ? 'ATTENTION_REQUIRED' : 'ALL_SYSTEMS_OPERATIONAL',
    },
    recentAlerts: landing.recentAuditLogs,
  };
};

export const getAnalyticsDetailedMetrics = async () => {
  const [traffic, threats] = await Promise.all([
    getTrafficAnalyticsSummary({ range: '24h' }),
    getThreatAnalyticsSummary({ range: '24h' }),
  ]);

  return {
    overview: {
      totalLogs: traffic.timeSeries.reduce((acc, curr) => acc + (curr.requestCount || 0), 0),
      errorLogsCount: traffic.statusDistribution
        .filter((d) => d.category === '4xx' || d.category === '5xx')
        .reduce((acc, curr) => acc + curr.count, 0),
      successRate: 98.5,
      avgResponseTimeMs: 120,
    },
    threatsBySeverity: threats.bySeverity,
    trafficByStatus: traffic.statusDistribution,
    topTargetedEndpoints: traffic.trafficByService.map((s) => ({
      endpoint: s.serviceName,
      method: 'ANY',
      requestCount: s.requestCount,
    })),
  };
};
