// ABOUTME: Jest setup file for integration tests
// ABOUTME: Verifies database and Redis connections are available

import db from '../config/database';
import redis from '../config/redis';

// Verify connections before running integration tests
beforeAll(async () => {
  try {
    // Test database connection
    await db.query('SELECT 1');
    console.log('✓ Database connection established');

    // Test Redis connection
    await redis.ping();
    console.log('✓ Redis connection established');
  } catch (error) {
    console.error('Failed to connect to required services:', error);
    console.error('Please ensure PostgreSQL and Redis are running:');
    console.error('  docker-compose up -d');
    process.exit(1);
  }
});

// Cleanup connections after all tests
afterAll(async () => {
  try {
    await db.end();
    await redis.quit();
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
});