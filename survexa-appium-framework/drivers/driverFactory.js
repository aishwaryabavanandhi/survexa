/**
 * drivers/DriverFactory.js
 * Creates and manages the Appium WebdriverIO session.
 * Handles connection, teardown, screenshot capture, and logcat collection.
 */
const { remote } = require('webdriverio')
const { config } = require('../config/appium.config')
const logger = require('../utilities/logger')
const path = require('path')
const fs = require('fs')

class DriverFactory {
  constructor() {
    this.driver = null
    this.sessionId = null
  }

  /**
   * Initialize Appium driver session
   * @returns {Promise<WebdriverIO.Browser>}
   */
  async createDriver() {
    logger.info('Initializing Appium driver session...')
    logger.info(`Host: ${config.hostname}:${config.port}`)
    logger.info(`Platform: Android | Automation: UiAutomator2`)

    try {
      this.driver = await remote({
        hostname: config.hostname,
        port: config.port,
        path: config.path || '/',
        capabilities: config.capabilities,
        waitforTimeout: config.waitforTimeout,
        connectionRetryTimeout: config.connectionRetryTimeout,
        connectionRetryCount: config.connectionRetryCount,
        logLevel: config.logLevel || 'warn',
      })

      this.sessionId = this.driver.sessionId
      logger.info(`✅ Driver session created: ${this.sessionId}`)

      // Set implicit wait
      try {
        await this.driver.setTimeout({ implicit: parseInt(process.env.IMPLICIT_WAIT || '5000', 10) })
      } catch (timeoutErr) {
        logger.warn(`Could not set implicit timeout: ${timeoutErr.message}`)
      }

      return this.driver
    } catch (err) {
      logger.error(`❌ Driver creation failed: ${err.message}`)
      throw err
    }
  }

  /**
   * Capture screenshot and save to reports/screenshots/
   * @param {string} testName - Name of the test (used in filename)
   * @returns {string} Screenshot file path
   */
  async captureScreenshot(testName) {
    if (!this.driver) return null

    const screenshotDir = path.resolve(__dirname, '../reports/screenshots')
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const safeName = testName.replace(/[^a-z0-9]/gi, '_').slice(0, 50)
    const filename = `${safeName}_${timestamp}.png`
    const filepath = path.join(screenshotDir, filename)

    try {
      await this.driver.saveScreenshot(filepath)
      logger.info(`📸 Screenshot saved: ${filepath}`)
      return filepath
    } catch (err) {
      logger.warn(`⚠️ Screenshot failed: ${err.message}`)
      return null
    }
  }

  /**
   * Collect device logcat and save to logs/
   * @param {string} testName
   * @returns {string} Log file path
   */
  async captureLogcat(testName) {
    if (!this.driver) return null

    const logDir = path.resolve(__dirname, '../logs')
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const safeName = testName.replace(/[^a-z0-9]/gi, '_').slice(0, 50)
    const filename = `logcat_${safeName}_${timestamp}.txt`
    const filepath = path.join(logDir, filename)

    try {
      const logs = await this.driver.getLogs('logcat')
      const logText = logs
        .map((l) => `[${l.level}] ${l.timestamp} ${l.message}`)
        .join('\n')
      fs.writeFileSync(filepath, logText, 'utf-8')
      logger.info(`📋 Logcat saved: ${filepath}`)
      return filepath
    } catch (err) {
      logger.warn(`⚠️ Logcat collection failed: ${err.message}`)
      return null
    }
  }

  /**
   * Get current foreground activity
   * @returns {string}
   */
  async getCurrentActivity() {
    if (!this.driver) return 'Unknown'
    try {
      return await this.driver.getCurrentActivity()
    } catch {
      return 'Unknown'
    }
  }

  /**
   * Restart the app (terminate + launch)
   */
  async restartApp() {
    if (!this.driver) return
    try {
      await this.driver.terminateApp(process.env.APP_PACKAGE || 'com.survexa.app')
      await this.driver.pause(1500)
      await this.driver.activateApp(process.env.APP_PACKAGE || 'com.survexa.app')
      await this.driver.pause(2000)
      logger.info('🔄 App restarted')
    } catch (err) {
      logger.warn(`⚠️ App restart failed: ${err.message}`)
    }
  }

  /**
   * Quit the driver and end the Appium session
   */
  async quitDriver() {
    if (this.driver) {
      try {
        await this.driver.deleteSession()
        logger.info('✅ Appium session ended')
      } catch (err) {
        logger.warn(`⚠️ Session cleanup warning: ${err.message}`)
      }
      this.driver = null
      this.sessionId = null
    }
  }
}

module.exports = new DriverFactory()
