// ABOUTME: Mock implementation of Redis for unit testing
// ABOUTME: Provides in-memory key-value storage without requiring actual Redis connection

import RedisMock from 'redis-mock';

const mockRedisClient = RedisMock.createClient();

// Promisify the mock client methods to match ioredis interface
const mockRedis = {
  get: jest.fn((key: string): Promise<string | null> => {
    return new Promise((resolve) => {
      mockRedisClient.get(key, (err: Error | null, value: string | null) => {
        resolve(value);
      });
    });
  }),

  set: jest.fn(
    (key: string, value: string, ...args: any[]): Promise<'OK'> => {
      return new Promise((resolve) => {
        if (args[0] === 'EX' && typeof args[1] === 'number') {
          // Handle EX (expiration in seconds)
          mockRedisClient.setex(key, args[1], value, () => {
            resolve('OK');
          });
        } else {
          mockRedisClient.set(key, value, () => {
            resolve('OK');
          });
        }
      });
    }
  ),

  del: jest.fn((key: string): Promise<number> => {
    return new Promise((resolve) => {
      mockRedisClient.del(key, (err: Error | null, count: number) => {
        resolve(count);
      });
    });
  }),

  ping: jest.fn((): Promise<'PONG'> => {
    return Promise.resolve('PONG');
  }),

  quit: jest.fn((): Promise<'OK'> => {
    return Promise.resolve('OK');
  }),

  flushall: jest.fn((): Promise<'OK'> => {
    return new Promise((resolve) => {
      mockRedisClient.flushall(() => {
        resolve('OK');
      });
    });
  }),

  on: jest.fn(),
};

export const resetMockRedis = async () => {
  await mockRedis.flushall();
  jest.clearAllMocks();
};

// Mock the redis module
jest.mock('../../config/redis', () => ({
  __esModule: true,
  default: mockRedis,
}));

export default mockRedis;