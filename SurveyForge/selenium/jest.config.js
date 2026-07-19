module.exports = {
  testEnvironment: 'node',
  testTimeout: 60000, // 60 seconds for slow Selenium UI tests
  verbose: true,
  reporters: [
    "default",
    ["jest-html-reporter", {
      "pageTitle": "Survexa Selenium Test Report",
      "outputPath": "reports/html/Selenium_Report.html",
      "includeFailureMsg": true,
      "includeSuiteFailure": true
    }],
    "<rootDir>/utils/reporter.js"
  ]
};
