module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/infrastructure/cdk.out/',
    '/dist/'
  ],
  collectCoverageFrom: [
    'local-server-hybrid.js',
    'src/**/*.js',
    '!src/**/*.test.js',
    '!**/node_modules/**',
    '!infrastructure/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 10000
};