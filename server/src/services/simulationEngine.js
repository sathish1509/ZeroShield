import { prisma } from '../config/prisma.js';
import { createTrafficLogEntry } from '../models/trafficModel.js';
import { createThreatRecord } from '../models/threatModel.js';
import { updateSimulationRunStatusRecord } from '../models/simulationModel.js';
import { broadcastSimulationEvent, broadcastThreatEvent, broadcastTrafficEvent } from '../realtime/websocket.js';

const activeSimulations = new Map(); // runId -> { cancelFlag, intervalHandle, timeoutHandle }

const attackPayloadGenerators = {
  DDOS_BURST: (config, step) => ({
    method: 'GET',
    endpoint: config.endpoint || '/api/v1/payments/tokenize',
    statusCode: step % 3 === 0 ? 429 : 200,
    responseTimeMs: 800 + Math.floor(Math.random() * 600),
    requestSizeBytes: 4096,
    ipAddress: `198.51.100.${10 + (step % (config.sourceIpPoolSize || 15))}`,
    severity: 'CRITICAL',
    threatDescription: `DDoS Traffic Surge: High-volume request spike on Payment Gateway (Step ${step})`,
  }),
  CREDENTIAL_STUFFING: (config, step) => ({
    method: 'POST',
    endpoint: config.endpoint || '/api/v1/auth/login',
    statusCode: 401,
    responseTimeMs: 120 + Math.floor(Math.random() * 50),
    requestSizeBytes: 512,
    ipAddress: `185.220.101.${5 + (step % (config.sourceIpPoolSize || 10))}`,
    severity: 'HIGH',
    threatDescription: `Credential Stuffing: Failed authentication spree from botnet node (Step ${step})`,
  }),
  SQL_INJECTION_ATTEMPT: (config, step) => ({
    method: 'GET',
    endpoint: `${config.endpoint || '/api/v1/users/search'}?q=UNION+SELECT+null,username,password+FROM+users--`,
    statusCode: 400,
    responseTimeMs: 310 + Math.floor(Math.random() * 80),
    requestSizeBytes: 820,
    ipAddress: `198.51.100.${30 + (step % (config.sourceIpPoolSize || 5))}`,
    severity: 'CRITICAL',
    threatDescription: `SQL Injection Attack: Malicious UNION SELECT query payload detected (Step ${step})`,
  }),
  LATERAL_MOVEMENT: (config, step) => ({
    method: 'POST',
    endpoint: config.endpoint || '/api/v1/internal/db/raw-query',
    statusCode: 403,
    responseTimeMs: 250 + Math.floor(Math.random() * 100),
    requestSizeBytes: 1200,
    ipAddress: '10.0.4.88',
    severity: 'CRITICAL',
    threatDescription: `Lateral Movement: Unauthorized internal network hop attempt to DB enclave (Step ${step})`,
  }),
  DATA_EXFILTRATION: (config, step) => ({
    method: 'GET',
    endpoint: config.endpoint || '/api/v1/user/export-pii',
    statusCode: 200,
    responseTimeMs: 1400 + Math.floor(Math.random() * 500),
    requestSizeBytes: 1048576,
    ipAddress: `198.51.100.${50 + (step % (config.sourceIpPoolSize || 4))}`,
    severity: 'HIGH',
    threatDescription: `Data Exfiltration: Bulk PII download anomaly detected (Step ${step})`,
  }),
  BRUTE_FORCE: (config, step) => ({
    method: 'POST',
    endpoint: config.endpoint || '/api/v1/auth/login',
    statusCode: 401,
    responseTimeMs: 95 + Math.floor(Math.random() * 40),
    requestSizeBytes: 380,
    ipAddress: `198.51.100.${70 + (step % 3)}`,
    severity: 'HIGH',
    threatDescription: `Brute Force Attack: Repeated password guess attempt (Step ${step})`,
  }),
};

export const startSimulationExecution = async (runRecord) => {
  const runId = runRecord.id;
  const scenario = runRecord.scenario;
  const config = scenario.config || {};
  const durationMs = (scenario.durationSeconds || 15) * 1000;
  const intervalMs = Math.max(300, Math.floor(1000 / (config.requestsPerSecond || 5)));

  const state = {
    stopped: false,
    stepCount: 0,
    threatsTriggered: 0,
    totalLatencyMs: 0,
    intervalHandle: null,
    timeoutHandle: null,
  };
  activeSimulations.set(runId, state);

  // Broadcast SIMULATION_STARTED event over WebSocket
  broadcastSimulationEvent('SIMULATION_STARTED', {
    runId,
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    attackType: scenario.attackType,
    intensity: scenario.intensity,
    durationSeconds: scenario.durationSeconds,
  });

  const generator = attackPayloadGenerators[scenario.attackType] || attackPayloadGenerators.DDOS_BURST;

  state.intervalHandle = setInterval(async () => {
    if (state.stopped) {
      clearInterval(state.intervalHandle);
      return;
    }

    state.stepCount += 1;
    const currentStep = state.stepCount;
    const injectedTime = new Date();
    const payload = generator(config, currentStep);

    try {
      // 1. Ingest synthetic traffic frame into database with simulationRunId tag
      const trafficLog = await createTrafficLogEntry({
        sourceServiceId: null,
        targetServiceId: scenario.targetServiceId || null,
        method: payload.method,
        endpoint: payload.endpoint,
        statusCode: payload.statusCode,
        responseTimeMs: payload.responseTimeMs,
        requestSizeBytes: payload.requestSizeBytes,
        ipAddress: payload.ipAddress,
      });

      // Explicitly tag traffic log with simulationRunId
      await prisma.trafficLog.update({
        where: { id: trafficLog.id },
        data: { simulationRunId: runId },
      });

      broadcastTrafficEvent({ ...trafficLog, simulationRunId: runId });

      // 2. Trigger real threat detection entry every 2 steps or on critical status
      if (currentStep % 2 === 1 || payload.statusCode >= 400) {
        const detectedTime = new Date();
        const latencyMs = Math.max(2, detectedTime.getTime() - injectedTime.getTime());
        state.totalLatencyMs += latencyMs;

        const threat = await createThreatRecord({
          sourceServiceId: scenario.targetServiceId || null,
          ipAddress: payload.ipAddress,
          description: `[SIMULATION #${runId}] ${payload.threatDescription}`,
          severity: payload.severity,
          status: 'OPEN',
        });

        // Tag threat with simulationRunId
        await prisma.threat.update({
          where: { id: threat.id },
          data: { simulationRunId: runId },
        });

        state.threatsTriggered += 1;

        // Broadcast threat event with detection latency metric
        broadcastThreatEvent({ ...threat, simulationRunId: runId, detectionLatencyMs: latencyMs });

        // Update target service health status to DEGRADED if Critical
        if (payload.severity === 'CRITICAL' && scenario.targetServiceId) {
          await prisma.microservice.update({
            where: { id: scenario.targetServiceId },
            data: { healthStatus: 'DEGRADED' },
          }).catch(() => {});
        }
      }

      // Broadcast step event to War-Room UI
      broadcastSimulationEvent('SIMULATION_STEP', {
        runId,
        step: currentStep,
        trafficId: trafficLog.id,
        endpoint: payload.endpoint,
        statusCode: payload.statusCode,
        timestamp: injectedTime.toISOString(),
      });
    } catch (err) {
      console.error(`Simulation #${runId} step execution error:`, err);
    }
  }, intervalMs);

  // Set timeout to complete simulation after duration
  state.timeoutHandle = setTimeout(async () => {
    if (state.stopped) return;
    state.stopped = true;
    clearInterval(state.intervalHandle);
    activeSimulations.delete(runId);

    const avgLatencyMs = state.threatsTriggered > 0 ? Math.round(state.totalLatencyMs / state.threatsTriggered) : 0;
    const summary = {
      totalTrafficInjected: state.stepCount,
      threatsDetectedCount: state.threatsTriggered,
      avgDetectionLatencyMs: avgLatencyMs,
      completionReason: 'TIMED_OUT',
    };

    await updateSimulationRunStatusRecord(runId, 'COMPLETED', summary);

    broadcastSimulationEvent('SIMULATION_COMPLETED', {
      runId,
      status: 'COMPLETED',
      resultsSummary: summary,
    });
  }, durationMs);
};

export const stopSimulationExecution = async (runId) => {
  const state = activeSimulations.get(Number(runId));
  if (state) {
    state.stopped = true;
    if (state.intervalHandle) clearInterval(state.intervalHandle);
    if (state.timeoutHandle) clearTimeout(state.timeoutHandle);
    activeSimulations.delete(Number(runId));
  }

  const avgLatencyMs = state && state.threatsTriggered > 0 ? Math.round(state.totalLatencyMs / state.threatsTriggered) : 0;
  const summary = {
    totalTrafficInjected: state ? state.stepCount : 0,
    threatsDetectedCount: state ? state.threatsTriggered : 0,
    avgDetectionLatencyMs: avgLatencyMs,
    completionReason: 'MANUALLY_STOPPED',
  };

  const updatedRun = await updateSimulationRunStatusRecord(runId, 'STOPPED', summary);

  broadcastSimulationEvent('SIMULATION_STOPPED', {
    runId: Number(runId),
    status: 'STOPPED',
    resultsSummary: summary,
  });

  return updatedRun;
};
