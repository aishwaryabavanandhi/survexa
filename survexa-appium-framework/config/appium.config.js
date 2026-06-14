/**
 * config/appium.config.js
 * Appium 2.x WebdriverIO configuration for Survexa Android App
 * Supports real devices and emulators dynamically
 */
require('dotenv').config()
const path = require('path')

const isRealDevice = (process.env.DEVICE_TYPE || 'real').toLowerCase() === 'real'
const APK_PATH = path.resolve(__dirname, '..', process.env.APK_PATH || '../app-release.apk')
const fs = require('fs')

/**
 * Build the Appium capabilities object.
 * Supports both APK installation and already-installed app modes.
 */
function buildCapabilities() {
  const caps = {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': isRealDevice
      ? (process.env.DEVICE_UDID || 'Android Device')
      : (process.env.AVD_NAME || 'Pixel_6_API_34'),
    'appium:newCommandTimeout': 300,
    'appium:noReset': false,
    'appium:fullReset': false,
    'appium:autoGrantPermissions': true,
    'appium:disableWindowAnimation': true,
    'appium:uiautomator2ServerLaunchTimeout': 60000,
    'appium:uiautomator2ServerInstallTimeout': 60000,
    'appium:androidInstallTimeout': 120000,
  }

  if (isRealDevice && process.env.DEVICE_UDID) {
    caps['appium:udid'] = process.env.DEVICE_UDID
  }

  if (!isRealDevice) {
    caps['appium:avd'] = process.env.AVD_NAME || 'Pixel_6_API_34'
    caps['appium:avdLaunchTimeout'] = 120000
    caps['appium:avdReadyTimeout'] = 120000
  }

  // Use APK installation if file exists; otherwise use installed app
  if (fs.existsSync(APK_PATH)) {
    console.log(`[Config] Using APK: ${APK_PATH}`)
    caps['appium:app'] = APK_PATH
  } else {
    console.log(`[Config] APK not found — using installed app: ${process.env.APP_PACKAGE}`)
    caps['appium:appPackage'] = process.env.APP_PACKAGE || 'com.survexa.app'
    caps['appium:appActivity'] = process.env.APP_ACTIVITY || 'com.survexa.app.MainActivity'
  }

  return caps
}

const config = {
  hostname: process.env.APPIUM_HOST || '127.0.0.1',
  port: parseInt(process.env.APPIUM_PORT || '4723', 10),
  path: '/',
  capabilities: buildCapabilities(),
  waitforTimeout: parseInt(process.env.ELEMENT_WAIT_TIMEOUT || '15000', 10),
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  logLevel: 'warn',
}

module.exports = { config, buildCapabilities }
