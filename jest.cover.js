const config = require('./jest.config');

module.exports = {
  ...config,
  ...{
    "collectCoverage": true,
    "coverageReporters": [
      "clover",
      // "html",
      "text-summary"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 1,
        "functions": 1,
        "lines": 1,
        "statements": 1
      }
    },
  }
}