// ABOUTME: Authentication middleware for protecting routes
// ABOUTME: Validates JWT tokens and attaches user to request object

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { findById } from '../models/user.model';
import { AuthError } from '../utils/errors';

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AuthError('Authorization header missing');
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new AuthError('Invalid authorization header format');
    }

    const token = parts[1];

    const payload = verifyAccessToken(token);

    const user = await findById(payload.userId);

    if (!user) {
      throw new AuthError('User not found');
    }

    req.user = user;

    next();
  } catch (error) {
    if (error instanceof Error) {
      next(new AuthError(error.message));
    } else {
      next(new AuthError('Authentication failed'));
    }
  }
};