/**
 * tests/BaseTest.js
 * Setup harness implementing lifecycle hooks, failure screenshots, logcat collection, and metrics tracking.
 */
const fs = require('fs');
const path = require('path');
const DriverFactory = require('../drivers/driverFactory');
const excelReporter = require('../utilities/excelReporter');
const logger = require('../utilities/logger');

// Ensure reports directory exists
const failureDir = path.join(__dirname, '../reports/failures');
if (!fs.existsSync(failureDir)) {
  fs.mkdirSync(failureDir, { recursive: true });
}

let driver = null;
let currentTestStartTime = null;

const BaseTest = {
  /**
   * Initializes the driver session before the suite.
   */
  async beforeSuite() {
    try {
      driver = await DriverFactory.initDriver();
      return driver;
    } catch (err) {
      logger.error(`Failed to boot Appium session in before hook: ${err.message}`);
      throw err;
    }
  },

  /**
   * Cleans up driver session after the suite and writes out the Excel report.
   */
  async afterSuite() {
    const caps = driver ? await driver.getCapabilities() : {};
    const device = caps['deviceName'] || 'Emulator';
    const version = caps['platformVersion'] || '14.0';

    await DriverFactory.quitDriver();
    
    // Write out Excel E2E Report
    logger.info('Writing Excel report...');
    await excelReporter.generate(device, version);
  },

  /**
   * Hooks into each test start to track durations.
   */
  beforeEachTest(testContext) {
    currentTestStartTime = new Date();
    logger.info(`Starting test scenario: "${testContext.currentTest.fullTitle()}"`);
    excelReporter.recordStepLog(
      testContext.currentTest.title,
      'Test Init',
      'Pass',
      'Environment ready'
    );
  },

  /**
   * Captures screen screenshots and Android logcat log buffers on test failure.
   */
  async afterEachTest(testContext) {
    const test = testContext.currentTest;
    const endTime = new Date();
    const duration = endTime - currentTestStartTime;
    const caps = driver ? await driver.getCapabilities() : {};
    const deviceName = caps['deviceName'] || 'Emulator';
    const version = caps['platformVersion'] || '14.0';

    if (test.state === 'failed') {
      logger.error(`Test Scenario Failed: "${test.fullTitle()}"`);
      logger.error(`Error stack: ${test.err.stack}`);

      let screenshotPath = 'N/A';
      let activityName = 'N/A';
      let logcatFile = 'N/A';

      if (driver) {
        try {
          // 1. Capture Screenshot
          const b64Image = await driver.takeScreenshot();
          const cleanTitle = test.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
          const screenshotName = `${cleanTitle}_failed.png`;
          screenshotPath = path.join(failureDir, screenshotName);
          fs.writeFileSync(screenshotPath, Buffer.from(b64Image, 'base64'));
          logger.info(`Screenshot captured for failed test: ${screenshotPath}`);

          // 2. Capture Active Activity
          activityName = await driver.getCurrentActivity();
          logger.info(`Failed at active Android activity: ${activityName}`);

          // 3. Dump Logcat buffer
          const logcat = await driver.getLogs('logcat');
          const logcatName = `${cleanTitle}_logcat.log`;
          const logcatPath = path.join(failureDir, logcatName);
          const logText = logcat.map(l => `[${l.timestamp}] [${l.level}]: ${l.message}`).join('\n');
          fs.writeFileSync(logcatPath, logText);
          logcatFile = logcatPath;
          logger.info(`Android logcat logs dumped to: ${logcatPath}`);

        } catch (err) {
          logger.warn(`Failure during test cleanup logging: ${err.message}`);
        }
      }

      // Record test cases sheet
      excelReporter.recordTestCase(
        test.title.substring(0, 10),
        test.parent.title,
        test.title,
        deviceName,
        'Failed',
        currentTestStartTime,
        endTime,
        duration
      );

      // Record failures sheet
      excelReporter.recordFailure(
        test.fullTitle(),
        test.err.message,
        screenshotPath,
        deviceName,
        version,
        activityName
      );

      excelReporter.recordStepLog(
        test.title,
        'Test Cleanup',
        'Fail',
        `Failure details logged. Logcat file: ${logcatFile}`
      );

    } else if (test.state === 'passed') {
      logger.info(`Test Scenario Passed: "${test.fullTitle()}"`);
      
      excelReporter.recordTestCase(
        test.title.substring(0, 10),
        test.parent.title,
        test.title,
        deviceName,
        'Passed',
        currentTestStartTime,
        endTime,
        duration
      );

      excelReporter.recordStepLog(
        test.title,
        'Test Cleanup',
        'Pass',
        `Completed successfully in ${(duration / 1000).toFixed(2)}s`
      );
    } else {
      // Skipped
      excelReporter.recordTestCase(
        test.title.substring(0, 10),
        test.parent.title,
        test.title,
        deviceName,
        'Skipped',
        currentTestStartTime,
        endTime,
        0
      );
    }
  }
};

module.exports = {
  BaseTest,
  getDriver: () => driver
};
