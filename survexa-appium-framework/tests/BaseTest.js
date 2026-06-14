/**
 * tests/BaseTest.js
 * Mocha lifecycle hooks for Appium test suite
 * Handles: driver init, teardown, screenshots on failure, logcat, and Excel reporting
 */
require('dotenv').config()
const DriverFactory = require('../drivers/DriverFactory')
const excelReporter = require('../utilities/excelReporter')
const logger = require('../utilities/logger')
const apiHelper = require('../utilities/apiHelper')

let _driver = null
let _currentTestTitle = ''
let _currentTestStart = null

/**
 * Global suite lifecycle
 */
const BaseTest = {
  /**
   * Called once before all tests in a suite
   */
  async beforeSuite() {
    logger.info('════════════════════════════════════════')
    logger.info('   Survexa Appium E2E Framework v2.0')
    logger.info('════════════════════════════════════════')

    // 1. Validate backend is reachable first
    logger.info(`Checking backend connectivity: ${apiHelper.BACKEND_URL}`)
    const health = await apiHelper.checkBackendHealth()
    if (!health.ok) {
      logger.warn(`⚠️  Backend not reachable. UI tests that need API will fail.`)
    }

    // 2. Initialize Appium driver
    _driver = await DriverFactory.createDriver()

    // 3. Collect device info for report
    let deviceName = 'Android Device'
    let androidVersion = 'Unknown'

    try {
      deviceName = await _driver.execute('mobile: deviceInfo', {}).then((i) => i.deviceName).catch(() => 'Android Device')
    } catch { }

    try {
      androidVersion = await _driver.execute('mobile: deviceInfo', {}).then((i) => i.androidVersion).catch(() => {
        return _driver.capabilities?.['appium:platformVersion'] || 'Unknown'
      })
    } catch { }

    excelReporter.setDeviceInfo(deviceName, androidVersion)
    logger.info(`📱 Device: ${deviceName} | Android: ${androidVersion}`)

    // 4. Wait for app to load
    await _driver.pause(3000)

    return _driver
  },

  /**
   * Called once after all tests
   */
  async afterSuite() {
    // Generate Excel report
    try {
      const reportPath = await excelReporter.generateReport()
      logger.info(`📊 Excel report: ${reportPath}`)
    } catch (err) {
      logger.error(`Report generation failed: ${err.message}`)
    }

    // Close driver
    await DriverFactory.quitDriver()
    logger.info('════════ Test Suite Complete ════════')
  },

  /**
   * Called before each individual test
   * @param {Mocha.Context} ctx - Mocha test context
   */
  beforeEachTest(ctx) {
    _currentTestTitle = ctx.currentTest?.title || 'Unknown Test'
    _currentTestStart = Date.now()
    logger.info(`\n▶  Starting: ${_currentTestTitle}`)
    excelReporter.recordStepLog(_currentTestTitle, 'Test Started', 'Info', '')
  },

  /**
   * Called after each individual test
   * @param {Mocha.Context} ctx - Mocha test context
   */
  async afterEachTest(ctx) {
    const endTime = Date.now()
    const state = ctx.currentTest?.state || 'unknown'
    const status = state === 'passed' ? 'Pass' : state === 'pending' ? 'Skip' : 'Fail'
    const testTitle = ctx.currentTest?.title || _currentTestTitle
    const errorMsg = ctx.currentTest?.err?.message || ''

    let screenshotPath = null
    let activityName = 'Unknown'

    if (status === 'Fail' && _driver) {
      // Capture screenshot on failure
      screenshotPath = await DriverFactory.captureScreenshot(testTitle)

      // Capture logcat on failure
      await DriverFactory.captureLogcat(testTitle)

      // Get current activity
      activityName = await DriverFactory.getCurrentActivity()

      // Record failure
      excelReporter.recordFailure({
        testName: testTitle,
        reason: errorMsg || 'Test assertion failed',
        screenshotPath,
        activityName,
      })

      logger.error(`❌ FAILED: ${testTitle}`)
      if (errorMsg) logger.error(`   Reason: ${errorMsg}`)
    } else {
      logger.info(`✅ ${status}: ${testTitle}`)
    }

    // Record test case result
    excelReporter.recordTestCase({
      testId: testTitle.split(':')[0]?.trim() || `TC-${Date.now()}`,
      module: testTitle.split(' ')[1] || 'General',
      scenario: testTitle,
      status,
      startTime: _currentTestStart,
      endTime,
      screenshotPath,
    })

    excelReporter.recordStepLog(
      testTitle,
      'Test Completed',
      status,
      errorMsg || ''
    )
  },
}

/**
 * Get the current driver instance
 */
function getDriver() {
  return _driver
}

module.exports = { BaseTest, getDriver }
