// ABOUTME: Basic server health check tests
// ABOUTME: Verifies the Express server starts and responds correctly

import request from 'supertest';
import app from '../server';

describe('Server Health', () => {
  describe('GET /health', () => {
    it('should return 200 and status ok', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /nonexistent', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Not found');
    });
  });
});