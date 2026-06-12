const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const edge = require('selenium-webdriver/edge');
const config = require('../config/selenium.config');
const logger = require('../utilities/logger');
const SeleniumUtils = require('../utilities/seleniumUtils');
const ExcelReporter = require('../utilities/excelReporter');

// Initialize global execution registry
global.executionData = {
  environment: process.env.NODE_ENV || 'local-dev',
  startDate: new Date(),
  endDate: null,
  tests: [],
  logs: []
};

/**
 * Log steps programmatically for the Excel "Execution Logs" sheet
 */
global.logStep = function(testName, description, result = 'SUCCESS', remarks = '') {
  const logEntry = {
    timestamp: new Date(),
    testName,
    description,
    result,
    remarks
  };
  global.executionData.logs.push(logEntry);
  logger.info(`[Step] ${testName} - ${description} -> ${result} (${remarks})`);
};

// Root-level hooks for Mocha
before(async function() {
  logger.info('=== Starting E2E Automation Test Run ===');
  global.executionData.startDate = new Date();
});

after(async function() {
  logger.info('=== E2E Automation Test Run Completed ===');
  global.executionData.endDate = new Date();
  
  try {
    await ExcelReporter.generateReport(global.executionData);
  } catch (error) {
    logger.error(`Failed to compile Excel report: ${error.message}`);
  }
});

/**
 * Helper to build driver based on browser config
 */
async function buildDriver() {
  const browser = config.browserName.toLowerCase();
  logger.info(`Initializing WebDriver for browser: ${browser} (Headless: ${config.headless})`);
  
  const builder = new Builder().forBrowser(browser);

  if (browser === 'chrome') {
    const options = new chrome.Options();
    if (config.headless) {
      options.addArguments('--headless=new');
    }
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1920,1080');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    // Enable browser console log capture
    const logging = require('selenium-webdriver/lib/logging');
    const prefs = new logging.Preferences();
    prefs.setLevel(logging.Type.BROWSER, logging.Level.ALL);
    options.setLoggingPrefs(prefs);
    builder.setChromeOptions(options);
    
  } else if (browser === 'firefox') {
    const options = new firefox.Options();
    if (config.headless) {
      options.addArguments('--headless');
    }
    builder.setFirefoxOptions(options);
    
  } else if (browser === 'msedge' || browser === 'edge') {
    const options = new edge.Options();
    if (config.headless) {
      options.addArguments('--headless');
    }
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1920,1080');
    builder.setEdgeOptions(options);
  } else {
    throw new Error(`Unsupported browser specified in config: ${config.browserName}`);
  }

  const driver = await builder.build();
  await driver.manage().setTimeouts({ implicit: config.implicitTimeout });
  return driver;
}

module.exports = {
  buildDriver
};
