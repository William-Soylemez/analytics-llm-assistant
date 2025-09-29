// ABOUTME: Error handling middleware tests
// ABOUTME: Verifies custom errors are properly caught and formatted

import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { errorHandler, notFoundHandler } from '../middleware/errorHandler.middleware';
import { AuthError, ValidationError, NotFoundError } from '../utils/errors';

const app = express();

app.get('/test-auth-error', (req: Request, res: Response, next: NextFunction) => {
  next(new AuthError('Invalid credentials'));
});

app.get('/test-validation-error', (req: Request, res: Response, next: NextFunction) => {
  next(new ValidationError('Invalid input'));
});

app.get('/test-not-found-error', (req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError('Resource not found'));
});

app.get('/test-generic-error', (req: Request, res: Response, next: NextFunction) => {
  next(new Error('Something went wrong'));
});

app.use(notFoundHandler);
app.use(errorHandler);

describe('Error Handler Middleware', () => {
  describe('Custom Errors', () => {
    it('should handle AuthError with 401 status', async () => {
      const response = await request(app).get('/test-auth-error');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
      expect(response.body).toHaveProperty('status', 401);
    });

    it('should handle ValidationError with 400 status', async () => {
      const response = await request(app).get('/test-validation-error');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid input');
      expect(response.body).toHaveProperty('status', 400);
    });

    it('should handle NotFoundError with 404 status', async () => {
      const response = await request(app).get('/test-not-found-error');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Resource not found');
      expect(response.body).toHaveProperty('status', 404);
    });
  });

  describe('Generic Errors', () => {
    it('should handle generic errors with 500 status', async () => {
      const response = await request(app).get('/test-generic-error');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('status', 500);
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/nonexistent-route');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Not found');
      expect(response.body).toHaveProperty('status', 404);
    });
  });
});