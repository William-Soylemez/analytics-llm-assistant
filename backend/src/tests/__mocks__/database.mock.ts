// ABOUTME: Mock implementation of PostgreSQL database for unit testing
// ABOUTME: Provides in-memory query results without requiring actual database connection

import { QueryResult } from 'pg';

interface MockDatabase {
  users: Map<string, any>;
  gaProperties: Map<string, any>;
  insights: Map<string, any>;
  nextId: number;
}

const mockDb: MockDatabase = {
  users: new Map(),
  gaProperties: new Map(),
  insights: new Map(),
  nextId: 1,
};

export const resetMockDatabase = () => {
  mockDb.users.clear();
  mockDb.gaProperties.clear();
  mockDb.insights.clear();
  mockDb.nextId = 1;
};

export const mockQuery = jest.fn(
  async (text: string, params?: any[]): Promise<QueryResult<any>> => {
    // Handle SELECT NOW() for health checks
    if (text.includes('SELECT NOW()')) {
      return {
        rows: [{ current_time: new Date() }],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: [],
      };
    }

    // Handle SELECT 1 for connection tests
    if (text.includes('SELECT 1')) {
      return {
        rows: [{ '?column?': 1 }],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: [],
      };
    }

    // Handle parameterized test queries
    if (text.includes('SELECT $1 as value')) {
      return {
        rows: [{ value: params?.[0] }],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: [],
      };
    }

    // Handle user creation
    if (text.includes('INSERT INTO users')) {
      const id = String(mockDb.nextId++);
      const user = {
        id,
        email: params?.[0],
        password_hash: params?.[1],
        created_at: new Date(),
        updated_at: new Date(),
        subscription_tier: 'free',
        daily_digest_enabled: false,
      };
      mockDb.users.set(id, user);
      return {
        rows: [user],
        rowCount: 1,
        command: 'INSERT',
        oid: 0,
        fields: [],
      };
    }

    // Handle user lookup by email
    if (text.includes('SELECT') && text.includes('FROM users') && text.includes('email = $1')) {
      const email = params?.[0];
      const user = Array.from(mockDb.users.values()).find((u) => u.email === email);
      return {
        rows: user ? [user] : [],
        rowCount: user ? 1 : 0,
        command: 'SELECT',
        oid: 0,
        fields: [],
      };
    }

    // Handle user lookup by ID
    if (text.includes('SELECT') && text.includes('FROM users') && text.includes('id = $1')) {
      const id = params?.[0];
      const user = mockDb.users.get(id);
      return {
        rows: user ? [user] : [],
        rowCount: user ? 1 : 0,
        command: 'SELECT',
        oid: 0,
        fields: [],
      };
    }

    // Default: return empty result
    return {
      rows: [],
      rowCount: 0,
      command: 'SELECT',
      oid: 0,
      fields: [],
    };
  }
);

// Mock the database module
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    query: mockQuery,
    end: jest.fn(),
  },
  query: mockQuery,
}));