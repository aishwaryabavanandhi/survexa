const { By, until } = require('selenium-webdriver');
const BasePage = require('./basePage');
const SeleniumUtils = require('../utilities/seleniumUtils');
const logger = require('../utilities/logger');

class DashboardPage extends BasePage {
  constructor(driver) {
    super(driver);

    // Sidebar & Navigation links
    this.dashboardLink = By.css("a[href*='/dashboard']");
    this.surveysLink = By.css("a[href*='/surveys']");
    this.createSurveyLink = By.css("a[href*='/create']");
    this.responsesLink = By.css("a[href*='/responses']");
    this.analyticsLink = By.css("a[href*='/analytics']");
    this.reportsLink = By.css("a[href*='/reports']");
    this.aiGeneratorLink = By.css("a[href*='/ai-generator']");
    this.settingsLink = By.css("a[href*='/settings']");
    this.billingLink = By.css("a[href*='/billing']");

    // Profile & Logout
    this.logoutBtn = By.css("button[title='Sign out'], button.logout-btn, button:has-text('Sign out')");
    this.userAvatar = By.css('div.avatar, img.avatar, button.profile-menu');
    this.pageHeader = By.css('h1, h2');
  }

  /**
   * Navigate to a tab via sidebar links
   * @param {string} tab - The sidebar navigation route name
   */
  async navigateToTab(tab) {
    logger.info(`Navigating to tab: ${tab}`);
    let locator;
    switch (tab.toLowerCase()) {
      case 'dashboard': locator = this.dashboardLink; break;
      case 'surveys': locator = this.surveysLink; break;
      case 'create': locator = this.createSurveyLink; break;
      case 'responses': locator = this.responsesLink; break;
      case 'analytics': locator = this.analyticsLink; break;
      case 'reports': locator = this.reportsLink; break;
      case 'ai-generator': locator = this.aiGeneratorLink; break;
      case 'settings': locator = this.settingsLink; break;
      case 'billing': locator = this.billingLink; break;
      default: throw new Error(`Unknown sidebar tab: ${tab}`);
    }
    await SeleniumUtils.clickWhenReady(this.driver, locator);
  }

  /**
   * Perform user logout
   */
  async logout() {
    logger.info('Initiating logout flow...');
    
    // Sometimes the logout button might be hidden or inside a profile menu. We try direct or click avatar first.
    try {
      await SeleniumUtils.clickWhenReady(this.driver, this.logoutBtn, 3000);
    } catch (err) {
      logger.warn('Direct logout button click failed, trying to click profile avatar first.');
      try {
        await SeleniumUtils.clickWhenReady(this.driver, this.userAvatar, 3000);
        await SeleniumUtils.clickWhenReady(this.driver, this.logoutBtn, 3000);
      } catch (nestedErr) {
        // Fallback: search for sign out using XPath text locator
        logger.warn('Avatar menu click failed, seeking Sign out button by text.');
        const xpathBtn = By.xpath("//button[contains(., 'Sign out') or contains(., 'Log out') or @title='Sign out']");
        await SeleniumUtils.clickWhenReady(this.driver, xpathBtn);
      }
    }
    
    // Wait until URL changes to login page
    await this.driver.wait(until.urlContains('/login'), 8000);
    logger.info('Successfully logged out.');
  }

  /**
   * Get the main heading text of the current dashboard route page
   */
  async getHeaderTitle() {
    await SeleniumUtils.waitForSpinnerToDisappear(this.driver);
    const header = await SeleniumUtils.waitForElementVisible(this.driver, this.pageHeader);
    return (await header.getText()).trim();
  }
}

module.exports = DashboardPage;
