/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testTimeout: 90000,
  verbose: true,
  reporters: [
    "default",
    ["<rootDir>/dist/helpers/report.js", {}]
  ],
  testMatch: [
    "**/dist/tests/**/*.test.js"
  ]
};
