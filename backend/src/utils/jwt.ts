// ABOUTME: JWT token generation and verification utilities
// ABOUTME: Handles access and refresh token creation with appropriate expiration times

import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
}

const getAccessTokenSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
};

const getRefreshTokenSecret = (): string => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    throw new Error('REFRESH_TOKEN_SECRET environment variable is not set');
  }
  return secret;
};

export const generateAccessToken = (userId: string): string => {
  const payload: TokenPayload = { userId };
  const expiresIn = process.env.JWT_EXPIRES_IN || '15m';

  return jwt.sign(payload, getAccessTokenSecret(), {
    expiresIn: expiresIn,
    issuer: 'ga-insights-platform',
  } as jwt.SignOptions);
};

export const generateRefreshToken = (userId: string): string => {
  const payload: TokenPayload = { userId };
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

  return jwt.sign(payload, getRefreshTokenSecret(), {
    expiresIn: expiresIn,
    issuer: 'ga-insights-platform',
  } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, getAccessTokenSecret(), {
      issuer: 'ga-insights-platform',
    }) as TokenPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Access token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid access token');
    }
    throw error;
  }
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, getRefreshTokenSecret(), {
      issuer: 'ga-insights-platform',
    }) as TokenPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    throw error;
  }
};