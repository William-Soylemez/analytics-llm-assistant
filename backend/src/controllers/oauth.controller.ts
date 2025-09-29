// ABOUTME: OAuth controller for Google authentication flow
// ABOUTME: Handles OAuth initiation and callback endpoints

import { Request, Response, NextFunction } from 'express';
import * as oauthService from '../services/oauth.service';
import logger from '../utils/logger';
import { AuthError, ValidationError } from '../utils/errors';

/**
 * Initiate Google OAuth flow
 * GET /api/auth/google
 */
export const initiateOAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      throw new AuthError('User must be authenticated to connect Google account');
    }

    const authUrl = await oauthService.getAuthorizationUrl(req.user.id);

    res.json({
      authUrl,
      message: 'Redirect user to this URL to authorize Google account',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle OAuth callback from Google
 * GET /api/auth/google/callback
 */
export const handleCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, state, error } = req.query;

    // Handle user denial
    if (error) {
      logger.warn(`OAuth denied: ${error}`);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/settings?oauth=denied`);
    }

    // Validate required parameters
    if (!code || typeof code !== 'string') {
      throw new ValidationError('Authorization code is required');
    }

    if (!state || typeof state !== 'string') {
      throw new ValidationError('State parameter is required');
    }

    // Exchange code for tokens
    const { userId } = await oauthService.handleCallback(code, state);

    logger.info(`OAuth successful for user ${userId}`);

    // Redirect to frontend with success
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/settings?oauth=success`);
  } catch (error) {
    logger.error('OAuth callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/settings?oauth=error`);
  }
};

/**
 * Check OAuth connection status
 * GET /api/auth/google/status
 */
export const getStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      throw new AuthError('User must be authenticated');
    }

    const tokens = await oauthService.getValidAccessToken(req.user.id);
    const hasConnection = !!tokens;

    res.json({
      connected: hasConnection,
      message: hasConnection ? 'Google account connected' : 'Google account not connected',
    });
  } catch (error) {
    if (error instanceof AuthError && error.message.includes('not connected')) {
      return res.json({
        connected: false,
        message: 'Google account not connected',
      });
    }
    next(error);
  }
};