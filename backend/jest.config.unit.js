const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  displayName: 'unit',
  testMatch: ['<rootDir>/src/tests/unit/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.unit.ts'],
};