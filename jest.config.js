module.exports = {
  // "collectCoverage": true,
  testEnvironment: 'jsdom',
  coverageDirectory: 'reports',
  collectCoverageFrom: ['packages/**/src/**/*.ts', '!packages/**/node_modules/**', '!**/node_modules/**'],
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
  testPathIgnorePatterns: [
    // TODO
    '(/packages/core/__tests__/.*)\\.test.ts$',
    // '(/packages/idraw/__tests__/.*)\\.test.ts$',
    '(/packages/renderer/__tests__/.*)\\.test.ts$',
    '(/packages/types/__tests__/.*)\\.test.ts$'
  ],
  moduleNameMapper: {
    '@idraw/types': '<rootDir>/packages/types/src/index.ts',
    '@idraw/util': '<rootDir>/packages/util/src/index.ts',
    '@idraw/renderer': '<rootDir>/packages/renderer/src/index.ts',
    '@idraw/core': '<rootDir>/packages/core/src/index.ts',
    '^idraw$': '<rootDir>/packages/idraw/src/index.ts'
  },
  // "testRegex": "(/packages/idraw/__tests__/.*)\\.test.ts$",
  setupFiles: ['jest-canvas-mock', './jest.setup.js']
};
