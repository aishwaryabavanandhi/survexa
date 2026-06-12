const { By } = require('selenium-webdriver');
const BasePage = require('./basePage');
const SeleniumUtils = require('../utilities/seleniumUtils');
const logger = require('../utilities/logger');

class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    
    // Locators
    this.emailModeBtn = By.xpath("//button[contains(text(), 'Email')]");
    this.phoneModeBtn = By.xpath("//button[contains(text(), 'Phone')]");
    
    this.identifierInput = By.css('input#identifier');
    this.passwordInput = By.css('input#password');
    this.submitBtn = By.css('button[type="submit"]');
    
    this.forgotPasswordLink = By.xpath("//a[contains(text(), 'Forgot password?')]");
    this.authErrorBanner = By.xpath("//div[contains(@class, 'bg-red-50') or contains(@class, 'text-red-600')]");
    
    this.emailErrorMsg = By.css('p#identifier-error');
    this.passwordErrorMsg = By.css('p#password-error');
    this.signupLink = By.xpath("//a[contains(@href, '/signup')]");
  }

  /**
   * Navigate to the login page directly
   */
  async navigate() {
    await super.navigate('/login');
  }

  /**
   * Switch authentication modes
   * @param {string} mode - 'email' or 'phone'
   */
  async switchMode(mode) {
    logger.info(`Switching login mode to: ${mode}`);
    if (mode === 'email') {
      await SeleniumUtils.clickWhenReady(this.driver, this.emailModeBtn);
    } else {
      await SeleniumUtils.clickWhenReady(this.driver, this.phoneModeBtn);
    }
  }

  /**
   * Perform an email sign in
   */
  async login(email, password) {
    logger.info(`Attempting login with email: ${email}`);
    await this.switchMode('email');
    if (email !== undefined) {
      await SeleniumUtils.typeWhenReady(this.driver, this.identifierInput, email);
    }
    if (password !== undefined) {
      await SeleniumUtils.typeWhenReady(this.driver, this.passwordInput, password);
    }
    await SeleniumUtils.clickWhenReady(this.driver, this.submitBtn);
  }

  /**
   * Perform a phone sign in trigger
   */
  async loginWithPhone(phone) {
    logger.info(`Attempting login with phone: ${phone}`);
    await this.switchMode('phone');
    // For phone it redirects to /phone/enter or shows input. 
    // According to Login.jsx, if mode is phone it navigates to /phone/enter.
    await SeleniumUtils.clickWhenReady(this.driver, this.submitBtn);
  }

  /**
   * Extract global API authentication error
   */
  async getAuthError() {
    try {
      const banner = await SeleniumUtils.waitForElementVisible(this.driver, this.authErrorBanner, 8000);
      const text = await banner.getText();
      return text.trim();
    } catch (e) {
      return null;
    }
  }

  /**
   * Extract field validation error messages
   */
  async getFieldError(field) {
    try {
      const locator = field === 'identifier' || field === 'email' ? this.emailErrorMsg : this.passwordErrorMsg;
      const errorEl = await SeleniumUtils.waitForElementVisible(this.driver, locator, 2000);
      const text = await errorEl.getText();
      return text.trim();
    } catch (e) {
      // Fallback: check if error is shown in the global API error banner
      return await this.getAuthError();
    }
  }

  /**
   * Navigate to Signup page
   */
  async clickSignup() {
    logger.info('Navigating to Signup page from Login');
    await SeleniumUtils.clickWhenReady(this.driver, this.signupLink);
  }
}

module.exports = LoginPage;
