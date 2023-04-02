module.exports = {
  testTimeout: 2 * 60 * 1000,
  moduleFileExtensions: ['js', 'ts'],
  modulePaths: ['<rootDir>'],
  testRegex: '/__tests__/e2e.test.ts$'
  // testRegex: '/__tests__/(.*)\\.test.ts$'
  // "testRegex": "(/packages/idraw/__tests__/.*)\\.test.ts$",
  // setupFiles: ['jest-canvas-mock']
};
