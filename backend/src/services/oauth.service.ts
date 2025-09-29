// ABOUTME: OAuth service for Google authentication and token management
// ABOUTME: Handles OAuth flow, token exchange, refresh, and CSRF protection

import crypto from 'crypto';
import getOAuthClient, { GOOGLE_OAUTH_SCOPES } from '../config/oauth';
import redis from '../config/redis';
import * as UserModel from '../models/user.model';
import { AuthError } from '../utils/errors';
import logger from '../utils/logger';

const STATE_EXPIRATION = 10 * 60; // 10 minutes in seconds

interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

/**
 * Generate authorization URL with state parameter for CSRF protection
 */
export const getAuthorizationUrl = async (userId: string): Promise<string> => {
  const oauth2Client = getOAuthClient();
  const state = crypto.randomBytes(32).toString('hex');

  // Store state in Redis with user ID for validation
  await redis.set(`oauth:state:${state}`, userId, 'EX', STATE_EXPIRATION);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GOOGLE_OAUTH_SCOPES,
    state: state,
    prompt: 'consent', // Force consent screen to always get refresh token
  });

  return authUrl;
};

/**
 * Handle OAuth callback and exchange code for tokens
 */
export const handleCallback = async (
  code: string,
  state: string
): Promise<{ userId: string; tokens: OAuthTokens }> => {
  // Validate state parameter
  const userId = await redis.get(`oauth:state:${state}`);
  if (!userId) {
    throw new AuthError('Invalid or expired OAuth state');
  }

  // Delete state to prevent reuse
  await redis.del(`oauth:state:${state}`);

  // Exchange code for tokens
  const oauth2Client = getOAuthClient();
  let tokens;
  try {
    const { tokens: googleTokens } = await oauth2Client.getToken(code);
    tokens = googleTokens;
  } catch (error) {
    logger.error('Failed to exchange OAuth code for tokens:', error);
    throw new AuthError('Failed to authenticate with Google');
  }

  if (!tokens.access_token || !tokens.refresh_token) {
    throw new AuthError('Missing tokens from Google OAuth response');
  }

  const expiresAt = tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600000);

  const oauthTokens: OAuthTokens = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt,
  };

  // Store encrypted tokens in database
  await UserModel.updateGoogleTokens(
    userId,
    oauthTokens.accessToken,
    oauthTokens.refreshToken,
    oauthTokens.expiresAt
  );

  logger.info(`OAuth tokens stored for user ${userId}`);

  return { userId, tokens: oauthTokens };
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (userId: string): Promise<string> => {
  // Get existing tokens from database
  const tokens = await UserModel.getGoogleTokens(userId);
  if (!tokens || !tokens.refreshToken) {
    throw new AuthError('No refresh token available');
  }

  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials({
    refresh_token: tokens.refreshToken,
  });

  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    if (!credentials.access_token) {
      throw new Error('No access token in refresh response');
    }

    const expiresAt = credentials.expiry_date ? new Date(credentials.expiry_date) : new Date(Date.now() + 3600000);

    // Update access token in database
    await UserModel.updateGoogleTokens(userId, credentials.access_token, tokens.refreshToken, expiresAt);

    logger.info(`Access token refreshed for user ${userId}`);

    return credentials.access_token;
  } catch (error) {
    logger.error('Failed to refresh access token:', error);
    throw new AuthError('Failed to refresh Google access token');
  }
};

/**
 * Get valid access token, refreshing if necessary
 */
export const getValidAccessToken = async (userId: string): Promise<string> => {
  const tokens = await UserModel.getGoogleTokens(userId);
  if (!tokens) {
    throw new AuthError('User has not connected Google account');
  }

  // Check if token is expired or will expire in next 5 minutes
  const now = new Date();
  const expiresAt = new Date(tokens.expiresAt);
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);

  if (expiresAt <= fiveMinutesFromNow) {
    // Token is expired or about to expire, refresh it
    return await refreshAccessToken(userId);
  }

  return tokens.accessToken;
};