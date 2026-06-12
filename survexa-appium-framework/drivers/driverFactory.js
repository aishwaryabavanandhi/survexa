/**
 * drivers/driverFactory.js
 * Driver manager to control driver lifecycle and dynamically discover connected devices.
 */
const { remote } = require('webdriverio');
const { execSync } = require('child_process');
const config = require('../config/appium.config');
const logger = require('../utilities/logger');

class DriverFactory {
  static driver = null;

  /**
   * Dynamically query connected devices via ADB commands.
   */
  static getConnectedDevices() {
    try {
      const output = execSync('adb devices').toString();
      const lines = output.split('\n');
      const devices = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && line.includes('device')) {
          const parts = line.split('\t');
          if (parts[0]) {
            devices.push(parts[0]);
          }
        }
      }
      return devices;
    } catch (err) {
      logger.warn('Failed to fetch adb devices. Is Android SDK/ADB platform-tools in your system PATH?');
      return [];
    }
  }

  /**
   * Initializes the WebdriverIO Appium driver session.
   */
  static async initDriver() {
    if (this.driver) {
      return this.driver;
    }

    logger.info('Initializing Appium Driver session...');
    const connectedDevices = this.getConnectedDevices();
    const caps = { ...config.capabilities };

    if (connectedDevices.length > 0) {
      const targetDevice = connectedDevices[0];
      logger.info(`Active device detected: ${targetDevice}. Updating capability: appium:deviceName.`);
      caps['appium:deviceName'] = targetDevice;
    } else {
      logger.info(`No active devices detected via ADB. Defaulting to capability deviceName: ${caps['appium:deviceName']}`);
    }

    const initOptions = {
      hostname: config.hostname,
      port: config.port,
      path: config.path,
      capabilities: caps,
      logLevel: config.logLevel
    };

    try {
      this.driver = await remote(initOptions);
      logger.info('Appium Driver session initialized successfully.');
      return this.driver;
    } catch (error) {
      logger.error(`Failed to initialize Appium Driver session: ${error.message}`);
      throw error;
    }
  }

  /**
   * Quits the current Appium driver session.
   */
  static async quitDriver() {
    if (this.driver) {
      logger.info('Terminating Appium Driver session...');
      try {
        await this.driver.deleteSession();
        logger.info('Appium Driver session closed.');
      } catch (error) {
        logger.error(`Error closing Appium session: ${error.message}`);
      } finally {
        this.driver = null;
      }
    }
  }
}

module.exports = DriverFactory;
