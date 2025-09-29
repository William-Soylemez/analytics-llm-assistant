// ABOUTME: Jest setup file for unit tests
// ABOUTME: Initializes mocks for database and Redis before tests run

import dotenv from 'dotenv';
import { resetMockDatabase } from './__mocks__/database.mock';
import { resetMockRedis } from './__mocks__/redis.mock';

// Load environment variables
dotenv.config();

// Initialize mocks before all tests
beforeAll(async () => {
  // Mocks are initialized by importing them
  await import('./__mocks__/database.mock');
  await import('./__mocks__/redis.mock');
});

// Reset state before each test
beforeEach(async () => {
  resetMockDatabase();
  await resetMockRedis();
});

// Cleanup after all tests
afterAll(async () => {
  jest.clearAllMocks();
});