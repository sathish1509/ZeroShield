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

// Audit Logs
router.get('/audit', authenticate, authorize('audit', 'view'), getAuditLogs);

// Platform System Endpoints
router.get('/dashboard', authenticate, authorize('dashboard', 'view'), getDashboard);
router.get('/traffic', authenticate, authorize('traffic', 'view'), getTraffic);
router.get('/topology', authenticate, authorize('topology', 'view'), getTopology);
router.get('/threats', authenticate, authorize('threats', 'view'), getThreats);
router.get('/simulation', authenticate, authorize('simulation', 'view'), getSimulation);
router.get('/analytics', authenticate, authorize('analytics', 'view'), getAnalytics);
router.get('/settings', authenticate, authorize('settings', 'view'), getSettings);

export default router;