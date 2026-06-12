/**
 * config/appium.config.js
 * Capability profiles and appium server configurations.
 */
require('dotenv').config();
const path = require('path');

const platformVersion = process.env.ANDROID_PLATFORM_VERSION || '14.0';
const deviceName = process.env.ANDROID_DEVICE_NAME || 'Medium_Phone_API_36.0';
const appPackage = process.env.APP_PACKAGE || 'com.survexa.app';
const appActivity = process.env.APP_ACTIVITY || 'com.survexa.app.MainActivity';

// Resolve APK path relative to project root
const apkPath = process.env.APK_PATH 
  ? path.resolve(process.env.APK_PATH) 
  : path.resolve(__dirname, '../app/app-release.apk');

const baseCapabilities = {
  platformName: 'Android',
  'appium:platformVersion': platformVersion,
  'appium:deviceName': deviceName,
  'appium:automationName': 'UiAutomator2',
  'appium:autoGrantPermissions': true,
  'appium:newCommandTimeout': 3600,
  'appium:noReset': false,
  'appium:fullReset': false
};

// Add APK or pre-installed app capabilities dynamically
if (process.env.USE_APK === 'true') {
  baseCapabilities['appium:app'] = apkPath;
} else {
  baseCapabilities['appium:appPackage'] = appPackage;
  baseCapabilities['appium:appActivity'] = appActivity;
}

module.exports = {
  hostname: process.env.APPIUM_HOST || '127.0.0.1',
  port: parseInt(process.env.APPIUM_PORT || '4723', 10),
  path: process.env.APPIUM_PATH || '/',
  capabilities: baseCapabilities,
  logLevel: 'info'
};
