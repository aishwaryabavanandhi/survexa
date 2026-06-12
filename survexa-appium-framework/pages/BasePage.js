/**
 * pages/BasePage.js
 * Base page helper class containing common Appium operations and explicit waits.
 */
const logger = require('../utilities/logger');

class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  /**
   * Finds a single element.
   */
  async getElement(selector) {
    return await this.driver.$(selector);
  }

  /**
   * Finds multiple elements.
   */
  async getElements(selector) {
    return await this.driver.$$(selector);
  }

  /**
   * Clicks an element with explicit wait.
   */
  async click(selector, timeout = 10000) {
    logger.debug(`Clicking element: ${selector}`);
    const el = await this.getElement(selector);
    await el.waitForDisplayed({ timeout });
    await el.waitForClickable({ timeout });
    await el.click();
  }

  /**
   * Fills an input field.
   */
  async sendKeys(selector, value, timeout = 10000) {
    logger.debug(`Filling text in ${selector}: ${value}`);
    const el = await this.getElement(selector);
    await el.waitForDisplayed({ timeout });
    await el.setValue(value);
  }

  /**
   * Gets text of an element.
   */
  async getText(selector, timeout = 10000) {
    const el = await this.getElement(selector);
    await el.waitForDisplayed({ timeout });
    const text = await el.getText();
    logger.debug(`Element text fetched for ${selector}: "${text}"`);
    return text;
  }

  /**
   * Hides the software keyboard on the screen.
   */
  async hideKeyboard() {
    try {
      if (await this.driver.isKeyboardShown()) {
        await this.driver.hideKeyboard();
        logger.debug('Soft keyboard hidden.');
      }
    } catch (err) {
      logger.debug('Keyboard was already hidden or not accessible.');
    }
  }

  /**
   * Returns whether an element is displayed.
   */
  async isDisplayed(selector, timeout = 5000) {
    try {
      const el = await this.getElement(selector);
      await el.waitForDisplayed({ timeout });
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Accepts standard Android alert dialog.
   */
  async acceptAlert() {
    try {
      await this.driver.acceptAlert();
      logger.info('Dialog accepted.');
    } catch (err) {
      logger.warn('No active native alert found to accept.');
    }
  }

  /**
   * Dismisses standard Android alert dialog.
   */
  async dismissAlert() {
    try {
      await this.driver.dismissAlert();
      logger.info('Dialog dismissed.');
    } catch (err) {
      logger.warn('No active native alert found to dismiss.');
    }
  }

  /**
   * Captures screen screenshot and returns base64.
   */
  async takeScreenshot() {
    return await this.driver.takeScreenshot();
  }
}

module.exports = BasePage;
