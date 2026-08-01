import { Router } from 'express';
import { login, logout, refresh } from '../controllers/authController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { loginSchema } from '../utils/validation.js';

const router = Router();

router.post('/login', validateRequest(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;