// ABOUTME: Global error handling middleware for Express
// ABOUTME: Catches and formats all errors with appropriate HTTP responses

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method}`);

    return res.status(err.statusCode).json({
      error: err.message,
      status: err.statusCode,
    });
  }

  logger.error(`500 - ${err.message} - ${req.originalUrl} - ${req.method}`, {
    stack: err.stack,
  });

  return res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    status: 500,
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    status: 404,
  });
};