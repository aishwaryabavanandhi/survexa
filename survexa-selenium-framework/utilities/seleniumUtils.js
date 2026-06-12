const { By, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');
const config = require('../config/selenium.config');
const logger = require('./logger');

// Ensure screenshots directories exist
const failureDir = path.resolve(config.screenshotPath);
if (!fs.existsSync(failureDir)) {
  fs.mkdirSync(failureDir, { recursive: true });
}

/**
 * Selenium Utility Helpers
 */
class SeleniumUtils {

  /**
   * Wait for React FullPageSpinner or animate-spin loader to disappear
   */
  static async waitForSpinnerToDisappear(driver, timeout = config.explicitTimeout) {
    try {
      const spinnerLocator = By.css('svg.animate-spin, .animate-spin');
      await driver.wait(async () => {
        const elements = await driver.findElements(spinnerLocator);
        return elements.length === 0;
      }, timeout);
      // Brief sleep for DOM rendering transition
      await driver.sleep(500);
    } catch (e) {
      logger.warn('Spinner did not disappear or was not found.');
    }
  }
  
  /**
   * Explicitly wait for an element to be located and visible
   */
  static async waitForElementVisible(driver, locator, timeout = config.explicitTimeout) {
    try {
      const waitLocator = typeof locator === 'string' ? By.css(locator) : locator;
      const element = await driver.wait(until.elementLocated(waitLocator), timeout);
      await driver.wait(until.elementIsVisible(element), timeout);
      return element;
    } catch (error) {
      logger.error(`Element visible timeout: ${locator.toString()}`);
      throw error;
    }
  }

  /**
   * Explicitly wait for an element to be visible and enabled for clicking
   */
  static async waitForElementClickable(driver, locator, timeout = config.explicitTimeout) {
    try {
      const element = await this.waitForElementVisible(driver, locator, timeout);
      await driver.wait(until.elementIsEnabled(element), timeout);
      return element;
    } catch (error) {
      logger.error(`Element clickable timeout: ${locator.toString()}`);
      throw error;
    }
  }

  /**
   * Click on an element after waiting for it to be clickable
   */
  static async clickWhenReady(driver, locator, timeout = config.explicitTimeout) {
    const element = await this.waitForElementClickable(driver, locator, timeout);
    await element.click();
  }

  /**
   * Type text into an element after waiting for it to be visible
   */
  static async typeWhenReady(driver, locator, text, timeout = config.explicitTimeout) {
    const element = await this.waitForElementVisible(driver, locator, timeout);
    await element.clear();
    await element.sendKeys(text);
  }

  /**
   * Scroll an element into view using JS execution
   */
  static async scrollIntoView(driver, element) {
    await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", element);
  }

  /**
   * Execute custom JavaScript synchronous script
   */
  static async executeJavaScript(driver, script, ...args) {
    return await driver.executeScript(script, ...args);
  }

  /**
   * Safely handle JavaScript alert popups
   */
  static async handleAlert(driver, action = 'accept', timeout = 5000) {
    try {
      await driver.wait(until.alertIsPresent(), timeout);
      const alert = await driver.switchTo().alert();
      const text = await alert.getText();
      if (action.toLowerCase() === 'accept') {
        await alert.accept();
        logger.info(`Alert accepted: "${text}"`);
      } else {
        await alert.dismiss();
        logger.info(`Alert dismissed: "${text}"`);
      }
      return text;
    } catch (error) {
      logger.warn(`No alert popped up within ${timeout}ms.`);
      return null;
    }
  }

  /**
   * Switch between windows / browser tabs based on URL or title match
   */
  static async handleWindow(driver, titleOrUrlMatch, timeout = 5000) {
    const originalWindow = await driver.getWindowHandle();
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const handles = await driver.getAllWindowHandles();
      for (const handle of handles) {
        await driver.switchTo().window(handle);
        const title = await driver.getTitle();
        const url = await driver.getCurrentUrl();
        if (title.includes(titleOrUrlMatch) || url.includes(titleOrUrlMatch)) {
          logger.info(`Switched to window/tab matching "${titleOrUrlMatch}"`);
          return originalWindow;
        }
      }
      await driver.sleep(500);
    }
    
    await driver.switchTo().window(originalWindow);
    throw new Error(`Window matching "${titleOrUrlMatch}" not found.`);
  }

  /**
   * Capture a detailed failure record (screenshot, console logs, current URL)
   */
  static async captureFailureDetails(driver, testName, failureReason) {
    const timestamp = Date.now();
    const fileSafeName = testName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const screenshotPath = path.join(failureDir, `${fileSafeName}_${timestamp}.png`);
    const dumpPath = path.join(failureDir, `${fileSafeName}_${timestamp}.json`);
    
    let currentUrl = 'Unknown URL';
    let consoleLogs = [];
    let screenshotBase64 = null;

    try {
      currentUrl = await driver.getCurrentUrl();
    } catch (e) {
      logger.error('Failed to retrieve current URL for failure details.');
    }

    try {
      screenshotBase64 = await driver.takeScreenshot();
      fs.writeFileSync(screenshotPath, screenshotBase64, 'base64');
      logger.info(`Failure screenshot captured: ${screenshotPath}`);
    } catch (e) {
      logger.error(`Failed to capture failure screenshot: ${e.message}`);
    }

    try {
      // Chrome-specific logs retrieval (Note: Firefox/Edge might not support this standard)
      const capabilities = await driver.getCapabilities();
      const browserName = capabilities.getBrowserName().toLowerCase();
      if (browserName === 'chrome' || browserName === 'msedge') {
        const logEntries = await driver.manage().logs().get('browser');
        consoleLogs = logEntries.map(log => ({
          timestamp: new Date(log.timestamp).toISOString(),
          level: log.level.name,
          message: log.message
        }));
      }
    } catch (e) {
      logger.warn('Failed to retrieve browser console logs.');
    }

    // Write metadata file
    const metadata = {
      testName,
      timestamp: new Date().toISOString(),
      url: currentUrl,
      reason: failureReason,
      consoleLogs
    };

    try {
      fs.writeFileSync(dumpPath, JSON.stringify(metadata, null, 2), 'utf8');
      logger.info(`Failure metadata logged: ${dumpPath}`);
    } catch (e) {
      logger.error('Failed to write failure metadata dump.');
    }

    return {
      screenshotPath,
      dumpPath,
      currentUrl,
      consoleLogs
    };
  }

  /**
   * Action retry mechanism for wrapping flaky behaviors
   */
  static async retryAction(actionFn, retries = 3, delayMs = 1000) {
    let lastError;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await actionFn();
      } catch (err) {
        lastError = err;
        logger.warn(`Action failed on attempt ${attempt}/${retries}. Retrying in ${delayMs}ms... Error: ${err.message}`);
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }
    throw lastError;
  }
}

module.exports = SeleniumUtils;
