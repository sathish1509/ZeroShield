import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { autoAuditLog } from '../middleware/auditLogger.js';

import {
  getAnalytics,
  getAuditLogs,
  getDashboard,
  getSettings,
  getSimulation,
  getThreats,
  getTopology,
  getTraffic,
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

const router = Router();

// Current user permission resolution
router.get('/users/me/permissions', authenticate, getCurrentUserPermissions);

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

// Audit Logs
router.get('/audit', authenticate, authorize('audit', 'view'), getAuditLogs);

// Platform System Endpoints
router.get('/dashboard', authenticate, authorize('dashboard', 'view'), getDashboard);
router.get('/traffic', authenticate, authorize('traffic', 'view'), getTraffic);
router.get('/threats', authenticate, authorize('threats', 'view'), getThreats);
router.get('/simulation', authenticate, authorize('simulation', 'view'), getSimulation);
router.get('/analytics', authenticate, authorize('analytics', 'view'), getAnalytics);
router.get('/settings', authenticate, authorize('settings', 'view'), getSettings);

export default router;