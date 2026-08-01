import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import {
  getAnalytics,
  getAuditLogs,
  getDashboard,
  getPolicies,
  getSettings,
  getSimulation,
  getThreats,
  getTopology,
  getTraffic,
} from '../controllers/systemController.js';

const router = Router();

router.get('/dashboard', authenticate, getDashboard);
router.get('/traffic', authenticate, getTraffic);
router.get('/topology', authenticate, getTopology);
router.get('/threats', authenticate, getThreats);
router.get('/analytics', authenticate, getAnalytics);
router.get('/audit', authenticate, getAuditLogs);

router.get('/policies', authenticate, authorize('ADMIN'), getPolicies);
router.get('/simulation', authenticate, authorize('ADMIN'), getSimulation);
router.get('/settings', authenticate, authorize('ADMIN'), getSettings);

export default router;