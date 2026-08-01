import { Router } from 'express';
import { login, logout, refresh } from '../controllers/authController.js';
import { setupMfa, verifyMfa } from '../controllers/mfaController.js';
import { authenticate } from '../middleware/authenticate.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { loginSchema } from '../utils/validation.js';

const router = Router();

router.post('/login', loginRateLimiter, validateRequest(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);

// MFA setup & verification
router.post('/mfa/setup', authenticate, setupMfa);
router.post('/mfa/verify', authenticate, verifyMfa);

export default router;