module.exports = {
  // "collectCoverage": true,
  testEnvironment: 'jsdom',
  coverageDirectory: 'reports',
  collectCoverageFrom: [
    'packages/**/src/**/*.ts',
    '!packages/**/node_modules/**',
    '!**/node_modules/**'
  ],
  coverageReporters: [
    // "clover",
    // "html",
    'text-summary'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleFileExtensions: ['js', 'ts'],
  modulePaths: ['<rootDir>'],
  testRegex: '(/packages/([^/]{1,})/__tests__/.*)\\.test.ts$',
  // "testRegex": "(/packages/idraw/__tests__/.*)\\.test.ts$",
  setupFiles: ['jest-canvas-mock']
};
