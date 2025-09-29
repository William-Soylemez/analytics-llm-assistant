const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  displayName: 'integration',
  testMatch: ['<rootDir>/src/tests/integration/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.integration.ts'],
  testTimeout: 30000, // Integration tests may take longer
};