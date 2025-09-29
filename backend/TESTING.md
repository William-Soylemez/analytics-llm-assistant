# Testing Guide

## Test Structure

Tests are organized into two suites:

### Unit Tests (`src/tests/unit/`)
- Run without requiring PostgreSQL or Redis
- Use mocked versions of external services
- Fast execution, suitable for TDD workflow
- Run automatically in CI/CD pipelines

**Test files:**
- `validators.test.ts` - Email and password validation
- `encryption.test.ts` - Token encryption/decryption
- `jwt.test.ts` - JWT token generation and verification
- `errorHandler.test.ts` - Error handling middleware

### Integration Tests (`src/tests/integration/`)
- Require running PostgreSQL and Redis instances
- Test real database queries and Redis operations
- Test full API endpoints end-to-end
- Should be run before deploying to production

**Test files:**
- `database.test.ts` - Database connection and queries
- `server.test.ts` - Server startup and health checks
- `auth.test.ts` - Authentication endpoints (register, login, refresh, logout)

## Running Tests

```bash
# Run unit tests only (no infrastructure required)
npm test
# or
npm run test:unit

# Run integration tests (requires Docker services)
npm run test:integration

# Run all tests
npm run test:all

# Run tests in watch mode (unit tests only)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Setting Up Integration Tests

Integration tests require PostgreSQL and Redis to be running:

```bash
# Start services with Docker Compose
cd /path/to/analytics
docker-compose up -d

# Verify services are running
docker-compose ps

# Run migrations
npm run migrate:up

# Seed test data (optional)
npm run seed

# Now you can run integration tests
npm run test:integration
```

## Mocking Framework

Unit tests use mocks for external services:

### Database Mock (`src/tests/__mocks__/database.mock.ts`)
- Provides in-memory storage for database operations
- Automatically resets between tests
- Supports common SQL queries (INSERT, SELECT, etc.)

### Redis Mock (`src/tests/__mocks__/redis.mock.ts`)
- Uses `redis-mock` library for in-memory key-value storage
- Implements ioredis interface
- Supports GET, SET, DEL, PING, QUIT operations
- Automatically resets between tests

## Test Configuration

### `jest.config.js`
Base configuration shared by both test suites

### `jest.config.unit.js`
- Runs tests in `src/tests/unit/`
- Uses `setup.unit.ts` for initialization
- Loads mocks for PostgreSQL and Redis

### `jest.config.integration.js`
- Runs tests in `src/tests/integration/`
- Uses `setup.integration.ts` for initialization
- Verifies database and Redis connections before running
- Increases test timeout to 30 seconds

## Writing Tests

### Unit Test Example
```typescript
// Import from mocks automatically loaded by setup.unit.ts
import { myFunction } from '../../utils/myUtil';

describe('MyFunction', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });
});
```

### Integration Test Example
```typescript
import request from 'supertest';
import app from '../../server';

describe('POST /api/endpoint', () => {
  it('should create a resource', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .send({ data: 'value' });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
});
```

## Test Output

### Pristine Output Rule
According to our testing standards, test output must be clean. Any expected error logs should be captured and validated, not printed to console during test runs.

The error handler tests intentionally trigger errors and currently log them to console. This is acceptable for error handler tests as they verify the logging behavior itself.

## Troubleshooting

### Unit tests failing with "Cannot find module"
- Check import paths in test files (should use `../../` from unit/ directory)
- Verify TypeScript is compiling without errors: `npm run build`

### Integration tests failing with connection errors
- Ensure Docker services are running: `docker-compose ps`
- Check service health: `docker-compose logs postgres` or `docker-compose logs redis`
- Verify environment variables in `.env` match Docker service configuration

### Mocks not working properly
- Ensure `setup.unit.ts` is configured in `jest.config.unit.js`
- Check that mock files are imported before the modules they mock
- Clear Jest cache: `npx jest --clearCache`

## CI/CD Integration

For continuous integration pipelines:

```bash
# Run unit tests (always)
npm run test:unit

# For pull requests/pre-deploy, run integration tests
docker-compose up -d
npm run migrate:up
npm run test:integration
docker-compose down
```