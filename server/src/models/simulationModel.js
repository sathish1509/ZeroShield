import { prisma } from '../config/prisma.js';

export const findAttackScenarios = async () => {
  return prisma.attackScenario.findMany({
    include: {
      targetService: { select: { id: true, name: true, healthStatus: true, isSimulationSafe: true } },
    },
    orderBy: { id: 'asc' },
  });
};

export const findAttackScenarioById = async (id) => {
  return prisma.attackScenario.findUnique({
    where: { id: Number(id) },
    include: {
      targetService: { select: { id: true, name: true, healthStatus: true, isSimulationSafe: true } },
    },
  });
};

export const findActiveRunForService = async (serviceId) => {
  if (!serviceId) return null;
  return prisma.simulationRun.findFirst({
    where: {
      status: 'RUNNING',
      scenario: {
        targetServiceId: Number(serviceId),
      },
    },
  });
};

export const createSimulationRunRecord = async (scenarioId, userId) => {
  return prisma.simulationRun.create({
    data: {
      scenarioId: Number(scenarioId),
      triggeredBy: Number(userId),
      status: 'RUNNING',
      startedAt: new Date(),
    },
    include: {
      scenario: {
        include: {
          targetService: true,
        },
      },
      triggerer: { select: { id: true, name: true, email: true, role: true } },
    },
  });
};

export const updateSimulationRunStatusRecord = async (runId, status, resultsSummary) => {
  const data = { status };
  if (status === 'COMPLETED' || status === 'STOPPED') {
    data.endedAt = new Date();
  }
  if (resultsSummary) {
    data.resultsSummary = resultsSummary;
  }

  return prisma.simulationRun.update({
    where: { id: Number(runId) },
    data,
    include: {
      scenario: { select: { id: true, name: true, attackType: true } },
      triggerer: { select: { id: true, name: true, email: true } },
    },
  });
};

export const findSimulationRunsList = async () => {
  return prisma.simulationRun.findMany({
    orderBy: { startedAt: 'desc' },
    include: {
      scenario: { select: { id: true, name: true, attackType: true, intensity: true } },
      triggerer: { select: { id: true, name: true, role: true } },
      _count: {
        select: {
          trafficLogs: true,
          threats: true,
        },
      },
    },
  });
};

export const findSimulationRunDetailsById = async (runId) => {
  const run = await prisma.simulationRun.findUnique({
    where: { id: Number(runId) },
    include: {
      scenario: {
        include: {
          targetService: { select: { id: true, name: true, baseUrl: true } },
        },
      },
      triggerer: { select: { id: true, name: true, email: true, role: true } },
      trafficLogs: {
        orderBy: { timestamp: 'asc' },
        select: {
          id: true,
          method: true,
          endpoint: true,
          statusCode: true,
          responseTimeMs: true,
          ipAddress: true,
          timestamp: true,
        },
      },
      threats: {
        orderBy: { detectedAt: 'asc' },
        select: {
          id: true,
          description: true,
          severity: true,
          status: true,
          detectedAt: true,
        },
      },
    },
  });

  if (!run) return null;

  // Build unified event timeline & measure detection latency
  const timeline = [];
  let totalLatencyMs = 0;
  let latencyCount = 0;

  const firstInjectedTimestamp = run.trafficLogs[0]?.timestamp
    ? new Date(run.trafficLogs[0].timestamp).getTime()
    : null;

  run.trafficLogs.forEach((log) => {
    timeline.push({
      type: 'TRAFFIC_INJECTED',
      id: log.id,
      timestamp: log.timestamp,
      detail: `${log.method} ${log.endpoint} (HTTP ${log.statusCode}) from ${log.ipAddress}`,
      responseTimeMs: log.responseTimeMs,
    });
  });

  run.threats.forEach((threat) => {
    const threatDetectedMs = new Date(threat.detectedAt).getTime();
    let detectionLatencyMs = 0;
    if (firstInjectedTimestamp) {
      detectionLatencyMs = Math.max(0, threatDetectedMs - firstInjectedTimestamp);
      totalLatencyMs += detectionLatencyMs;
      latencyCount += 1;
    }

    timeline.push({
      type: 'THREAT_FLAGGED',
      id: threat.id,
      timestamp: threat.detectedAt,
      severity: threat.severity,
      description: threat.description,
      detectionLatencyMs,
    });
  });

  // Sort timeline chronologically
  timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const avgDetectionLatencyMs = latencyCount > 0 ? Math.round(totalLatencyMs / latencyCount) : 0;

  return {
    run,
    metrics: {
      totalTrafficInjected: run.trafficLogs.length,
      threatsDetectedCount: run.threats.length,
      avgDetectionLatencyMs,
    },
    timeline,
  };
};
