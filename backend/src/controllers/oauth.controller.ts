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
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  try {
    const { code, state, error } = req.query;

    logger.info('OAuth callback received', {
      hasCode: !!code,
      hasState: !!state,
      hasError: !!error,
    });

    // Handle user denial
    if (error) {
      logger.warn(`OAuth denied by user: ${error}`);
      return res.redirect(`${frontendUrl}/?oauth=denied&message=${encodeURIComponent('You denied access to Google Analytics')}`);
    }

    // Validate required parameters
    if (!code || typeof code !== 'string') {
      logger.error('OAuth callback: Missing authorization code');
      throw new ValidationError('Authorization code is required');
    }

    if (!state || typeof state !== 'string') {
      logger.error('OAuth callback: Missing state parameter');
      throw new ValidationError('State parameter is required');
    }

    logger.info('Exchanging OAuth code for tokens...');

    // Exchange code for tokens
    const { userId } = await oauthService.handleCallback(code, state);

    logger.info(`OAuth successful for user ${userId}`);

    // Redirect to frontend dashboard with success
    res.redirect(`${frontendUrl}/?oauth=success`);
  } catch (error) {
    logger.error('OAuth callback error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.redirect(`${frontendUrl}/?oauth=error&message=${encodeURIComponent(errorMessage)}`);
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