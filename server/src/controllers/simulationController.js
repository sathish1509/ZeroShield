import { asyncHandler } from '../utils/asyncHandler.js';
import {
  createSimulationRunRecord,
  findActiveRunForService,
  findAttackScenarioById,
  findAttackScenarios,
  findSimulationRunDetailsById,
  findSimulationRunsList,
} from '../models/simulationModel.js';
import { startSimulationExecution, stopSimulationExecution } from '../services/simulationEngine.js';

export const getSimulationScenarios = asyncHandler(async (_req, res) => {
  const scenarios = await findAttackScenarios();
  res.json({
    status: 'success',
    data: { scenarios },
  });
});

export const runSimulation = asyncHandler(async (req, res) => {
  const { scenarioId } = req.body;

  if (!scenarioId) {
    return res.status(400).json({
      status: 'fail',
      message: 'scenarioId parameter is required',
    });
  }

  const scenario = await findAttackScenarioById(Number(scenarioId));
  if (!scenario) {
    return res.status(404).json({
      status: 'fail',
      message: `Attack scenario with ID ${scenarioId} not found`,
    });
  }

  // Safety Guard 1: Verify target service is simulation-safe
  if (scenario.targetService && !scenario.targetService.isSimulationSafe) {
    return res.status(400).json({
      status: 'fail',
      message: `Target service '${scenario.targetService.name}' is flagged as NOT simulation safe. Simulation rejected.`,
    });
  }

  // Safety Guard 2: Enforce max 1 active RUNNING simulation per target service
  if (scenario.targetServiceId) {
    const activeRun = await findActiveRunForService(scenario.targetServiceId);
    if (activeRun) {
      return res.status(409).json({
        status: 'fail',
        message: `An active simulation (Run #${activeRun.id}) is already targeting service ID ${scenario.targetServiceId}. Please stop it first.`,
      });
    }
  }

  // Create Simulation Run DB Record
  const runRecord = await createSimulationRunRecord(scenarioId, req.user.id);

  // Kick off asynchronous simulation execution engine
  startSimulationExecution(runRecord);

  res.status(201).json({
    status: 'success',
    data: {
      run: runRecord,
      message: `Simulation #${runRecord.id} for '${scenario.name}' started successfully.`,
    },
  });
});

export const executeSimulation = asyncHandler(async (req, res) => {
  const { attackType, scenarioId } = req.body;

  const allScenarios = await findAttackScenarios();
  let targetScenario = null;

  if (scenarioId) {
    targetScenario = allScenarios.find((s) => s.id === Number(scenarioId));
  } else if (attackType) {
    targetScenario = allScenarios.find((s) => s.attackType === attackType || s.attackType.includes(attackType));
  }

  if (!targetScenario && allScenarios.length > 0) {
    targetScenario = allScenarios[0];
  }

  if (!targetScenario) {
    return res.status(404).json({
      status: 'fail',
      message: 'No simulation scenario available',
    });
  }

  const runRecord = await createSimulationRunRecord(targetScenario.id, req.user.id);
  startSimulationExecution(runRecord);

  res.status(200).json({
    status: 'success',
    data: {
      attackType: attackType || targetScenario.attackType,
      scenarioName: targetScenario.name,
      executionStatus: 'COMPLETED',
      trafficLogId: runRecord.id,
      threatId: runRecord.id,
      serviceDegraded: true,
      terminalTrace: [
        `[INGRESS] Attack scenario triggered: ${targetScenario.name}`,
        `[ENFORCEMENT] Threat rules evaluated & threat logged`,
        `[TELEMETRY] Simulation run #${runRecord.id} active`,
      ],
    },
  });
});

export const stopSimulation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedRun = await stopSimulationExecution(id);

  res.json({
    status: 'success',
    data: {
      run: updatedRun,
      message: `Simulation #${id} stopped successfully.`,
    },
  });
});

export const getSimulationRuns = asyncHandler(async (_req, res) => {
  const runs = await findSimulationRunsList();
  res.json({
    status: 'success',
    data: { runs },
  });
});

export const getSimulationRunDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const details = await findSimulationRunDetailsById(id);

  if (!details) {
    return res.status(404).json({
      status: 'fail',
      message: `Simulation run #${id} not found`,
    });
  }

  res.json({
    status: 'success',
    data: details,
  });
});
