const config = require('../config/selenium.config');
const logger = require('../utilities/logger');

class BasePage {
  constructor(driver) {
    if (!driver) {
      throw new Error('A valid WebDriver instance is required for Page Objects.');
    }
    this.driver = driver;
    this.baseUrl = config.baseUrl;
  }

  /**
   * Navigate to a path relative to the baseUrl
   */
  async navigate(path = '') {
    const targetUrl = `${this.baseUrl}${path.startsWith('/') ? path : '/' + path}`;
    logger.info(`Navigating to URL: ${targetUrl}`);
    await this.driver.get(targetUrl);
  }

  /**
   * Get the current page URL
   */
  async getUrl() {
    return await this.driver.getCurrentUrl();
  }

  /**
   * Get the page title
   */
  async getTitle() {
    return await this.driver.getTitle();
  }

  /**
   * Refresh the page
   */
  async refresh() {
    logger.info('Refreshing browser page');
    await this.driver.navigate().refresh();
  }

  /**
   * Navigate back in history
   */
  async back() {
    logger.info('Navigating back in browser history');
    await this.driver.navigate().back();
  }

  /**
   * Navigate forward in history
   */
  async forward() {
    logger.info('Navigating forward in browser history');
    await this.driver.navigate().forward();
  }
}

module.exports = BasePage;
