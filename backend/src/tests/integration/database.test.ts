// ABOUTME: Database connection and query tests
// ABOUTME: Verifies PostgreSQL connection and basic query functionality

import { query } from '../../config/database';

describe('Database Connection', () => {
  it('should connect to database and execute query', async () => {
    const result = await query('SELECT NOW() as current_time');

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toHaveProperty('current_time');
  });

  it('should execute parameterized query', async () => {
    const testValue = 'test';
    const result = await query('SELECT $1 as value', [testValue]);

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].value).toBe(testValue);
  });
});