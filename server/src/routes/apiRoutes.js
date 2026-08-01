import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { autoAuditLog } from '../middleware/auditLogger.js';
import { trafficIngestRateLimiter } from '../middleware/rateLimiter.js';

import {
  exportAuditLogs,
  getAnalytics,
  getAuditLogs,
  getDashboard,
  getDashboardLanding,
  getSettings,
  getTopology,
} from '../controllers/systemController.js';

import {
  createPolicy,
  deletePolicy,
  getPolicies,
  getPolicyById,
  updatePolicy,
} from '../controllers/policyController.js';

import {
  createUser,
  getCurrentUserPermissions,
  getUsers,
  updateUserRole,
} from '../controllers/userController.js';

import {
  createService,
  deleteService,
  generateServiceIdentity,
  getServiceById,
  getServiceHealth,
  getServices,
  revokeServiceIdentity,
  updateService,
  updateServiceHealth,
} from '../controllers/serviceController.js';

import { createTrafficLog, getTraffic } from '../controllers/trafficController.js';
import { createThreat, getThreats, updateThreatStatus } from '../controllers/threatController.js';
import {
  executeSimulation,
  getSimulationRunDetails,
  getSimulationRuns,
  getSimulationScenarios,
  runSimulation,
  stopSimulation,
} from '../controllers/simulationController.js';
import {
  getAuditSummaryHandler,
  getServiceHealthHandler,
  getThreatSummaryHandler,
  getTrafficSummaryHandler,
} from '../controllers/analyticsController.js';
import { getActiveSessions, revokeSession } from '../controllers/sessionController.js';

const router = Router();

// Current user permission & active session resolution
router.get('/users/me/permissions', authenticate, getCurrentUserPermissions);
router.get('/users/me/sessions', authenticate, getActiveSessions);
router.post('/sessions/:id/revoke', authenticate, autoAuditLog, revokeSession);

// User Management (Admin only)
router.get('/users', authenticate, authorize('users', 'view'), getUsers);
router.post('/users', authenticate, authorize('users', 'create'), autoAuditLog, createUser);
router.put('/users/:id/role', authenticate, authorize('users', 'update'), autoAuditLog, updateUserRole);

// Policy Engine
router.get('/policies', authenticate, authorize('policies', 'view'), getPolicies);
router.get('/policies/:id', authenticate, authorize('policies', 'view'), getPolicyById);
router.post('/policies', authenticate, authorize('policies', 'create'), autoAuditLog, createPolicy);
router.put('/policies/:id', authenticate, authorize('policies', 'update'), autoAuditLog, updatePolicy);
router.delete('/policies/:id', authenticate, authorize('policies', 'delete'), autoAuditLog, deletePolicy);

// Microservice Registry & Identity Management
router.get('/services', authenticate, authorize('services', 'view'), getServices);
router.get('/services/:id', authenticate, authorize('services', 'view'), getServiceById);
router.post('/services', authenticate, authorize('services', 'create'), autoAuditLog, createService);
router.put('/services/:id', authenticate, authorize('services', 'update'), autoAuditLog, updateService);
router.delete('/services/:id', authenticate, authorize('services', 'delete'), autoAuditLog, deleteService);

// Service-to-Service Identity Credentials
router.post('/services/:id/identity', authenticate, authorize('services', 'create'), autoAuditLog, generateServiceIdentity);
router.post('/services/:id/identity/revoke', authenticate, authorize('services', 'delete'), autoAuditLog, revokeServiceIdentity);

// Microservice Health Monitoring
router.get('/services/:id/health', authenticate, authorize('services', 'view'), getServiceHealth);
router.put('/services/:id/health', authenticate, authorize('services', 'update'), autoAuditLog, updateServiceHealth);

// Service Mesh Topology Data
router.get('/topology', authenticate, authorize('topology', 'view'), getTopology);

// Live Traffic Streaming & Logs
router.get('/traffic', authenticate, authorize('traffic', 'view'), getTraffic);
router.post('/traffic', trafficIngestRateLimiter, authenticate, authorize('traffic', 'manage'), autoAuditLog, createTrafficLog);

// Threat Detection Engine & Threat Management
router.get('/threats', authenticate, authorize('threats', 'view'), getThreats);
router.post('/threats', authenticate, authorize('threats', 'manage'), autoAuditLog, createThreat);
router.put('/threats/:id/status', authenticate, authorize('threats', 'update'), autoAuditLog, updateThreatStatus);

// SOC Attack War-Room Simulator
router.get('/simulation', authenticate, authorize('simulation', 'view'), getSimulationScenarios);
router.get('/simulation/scenarios', authenticate, authorize('simulation', 'view'), getSimulationScenarios);
router.post('/simulation/run', authenticate, authorize('simulation', 'manage'), autoAuditLog, runSimulation);
router.post('/simulation/execute', authenticate, authorize('simulation', 'manage'), autoAuditLog, executeSimulation);
router.post('/simulation/runs/:id/stop', authenticate, authorize('simulation', 'manage'), autoAuditLog, stopSimulation);
router.get('/simulation/runs', authenticate, authorize('simulation', 'manage'), getSimulationRuns);
router.get('/simulation/runs/:id', authenticate, authorize('simulation', 'manage'), getSimulationRunDetails);

// Audit Logs & Export
router.get('/audit', authenticate, authorize('audit', 'view'), getAuditLogs);
router.get('/audit/export', authenticate, authorize('audit', 'view'), exportAuditLogs);

// System Metrics & Analytics Aggregation
router.get('/dashboard', authenticate, authorize('dashboard', 'view'), getDashboard);
router.get('/dashboard/summary', authenticate, authorize('dashboard', 'view'), getDashboardLanding);
router.get('/analytics', authenticate, authorize('analytics', 'view'), getAnalytics);
router.get('/analytics/traffic-summary', authenticate, authorize('analytics', 'view'), getTrafficSummaryHandler);
router.get('/analytics/threat-summary', authenticate, authorize('analytics', 'view'), getThreatSummaryHandler);
router.get('/analytics/service-health', authenticate, authorize('analytics', 'view'), getServiceHealthHandler);
router.get('/analytics/audit-summary', authenticate, authorize('analytics', 'view'), getAuditSummaryHandler);
router.get('/settings', authenticate, authorize('settings', 'view'), getSettings);

export default router;