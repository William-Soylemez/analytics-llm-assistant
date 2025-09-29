// ABOUTME: OAuth routes definition
// ABOUTME: Defines endpoints for Google OAuth flow

import { Router } from 'express';
import * as oauthController from '../controllers/oauth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { generalAuthLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

// Initiate OAuth flow - must be authenticated
router.get('/google', authenticateToken, generalAuthLimiter, oauthController.initiateOAuth);

// OAuth callback - public endpoint (Google redirects here)
router.get('/google/callback', oauthController.handleCallback);

// Check connection status - must be authenticated
router.get('/google/status', authenticateToken, generalAuthLimiter, oauthController.getStatus);

export default router;