// ABOUTME: Authentication controller handling HTTP requests for auth endpoints
// ABOUTME: Validates requests and calls auth service methods

import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { ValidationError } from '../utils/errors';
import logger from '../utils/logger';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const tokens = await authService.register({ email, password });

    logger.info(`User registered: ${email}`);

    res.status(201).json({
      message: 'User registered successfully',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const tokens = await authService.login({ email, password });

    logger.info(`User logged in: ${email}`);

    res.status(200).json({
      message: 'Login successful',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    const newAccessToken = await authService.refresh(refreshToken);

    res.status(200).json({
      message: 'Token refreshed successfully',
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    await authService.logout(refreshToken);

    logger.info('User logged out');

    res.status(200).json({
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    res.status(200).json({
      user: {
        id: req.user.id,
        email: req.user.email,
        subscription_tier: req.user.subscription_tier,
        daily_digest_enabled: req.user.daily_digest_enabled,
        created_at: req.user.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};