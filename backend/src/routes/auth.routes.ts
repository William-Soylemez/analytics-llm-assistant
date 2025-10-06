// ABOUTME: Authentication routes definition
// ABOUTME: Defines all auth endpoints and applies middleware

import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  loginLimiter,
  registerLimiter,
  generalAuthLimiter,
} from '../middleware/rateLimiter.middleware';

const router = Router();

router.post('/register', registerLimiter, authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/refresh', generalAuthLimiter, authController.refreshToken);
router.post('/logout', generalAuthLimiter, authController.logout);
router.get('/me', authenticateToken, authController.getMe);
router.post('/disconnect-google', authenticateToken, generalAuthLimiter, authController.disconnectGoogle);

export default router;