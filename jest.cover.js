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
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    },
  }
}