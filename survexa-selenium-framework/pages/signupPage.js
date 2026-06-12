const { By } = require('selenium-webdriver');
const BasePage = require('./basePage');
const SeleniumUtils = require('../utilities/seleniumUtils');
const logger = require('../utilities/logger');

class SignupPage extends BasePage {
  constructor(driver) {
    super(driver);

    // Locators
    this.nameInput = By.css('input#name');
    this.emailInput = By.css('input#email');
    this.phoneInput = By.css('input#phone');
    
    // Country code select trigger if needed, otherwise default is +91
    this.countrySelector = By.css('div.flex.gap-2 select'); 
    
    this.passwordInput = By.css('input#password');
    this.confirmPasswordInput = By.css('input#confirmPassword');
    this.submitBtn = By.css('button[type="submit"]');

    // Field-level error messages
    this.nameError = By.css('p#name-error');
    this.emailError = By.css('p#email-error');
    this.phoneError = By.xpath("//input[@id='phone']/../../following-sibling::p[contains(@class, 'text-red-500')] | //p[@id='phone-error']");
    this.passwordError = By.css('p#password-error');
    this.confirmPasswordError = By.css('p#confirmPassword-error');
    this.apiErrorBanner = By.xpath("//div[contains(@class, 'bg-red-50') or contains(@class, 'text-red-600')]");
    
    this.loginLink = By.xpath("//a[contains(@href, '/login')]");
  }

  /**
   * Navigate directly to Signup
   */
  async navigate() {
    await super.navigate('/signup');
  }

  /**
   * Submit registration details
   */
  async signup(name, email, phone, password, confirmPassword) {
    logger.info(`Attempting signup for name: ${name}, email: ${email}`);
    
    if (name !== undefined) {
      await SeleniumUtils.typeWhenReady(this.driver, this.nameInput, name);
    }
    if (email !== undefined) {
      await SeleniumUtils.typeWhenReady(this.driver, this.emailInput, email);
    }
    if (phone !== undefined) {
      await SeleniumUtils.typeWhenReady(this.driver, this.phoneInput, phone);
    }
    if (password !== undefined) {
      await SeleniumUtils.typeWhenReady(this.driver, this.passwordInput, password);
    }
    if (confirmPassword !== undefined) {
      await SeleniumUtils.typeWhenReady(this.driver, this.confirmPasswordInput, confirmPassword);
    }

    await SeleniumUtils.clickWhenReady(this.driver, this.submitBtn);
  }

  /**
   * Retrieve field-level validation errors
   */
  async getFieldError(field) {
    try {
      let locator;
      switch (field) {
        case 'name': locator = this.nameError; break;
        case 'email': locator = this.emailError; break;
        case 'phone': locator = this.phoneError; break;
        case 'password': locator = this.passwordError; break;
        case 'confirmPassword': locator = this.confirmPasswordError; break;
        default: throw new Error(`Invalid signup field error key: ${field}`);
      }
      const errorEl = await SeleniumUtils.waitForElementVisible(this.driver, locator, 2000);
      const text = await errorEl.getText();
      return text.trim();
    } catch (e) {
      return null;
    }
  }

  /**
   * Retrieve general registration API error
   */
  async getApiError() {
    try {
      const banner = await SeleniumUtils.waitForElementVisible(this.driver, this.apiErrorBanner, 3000);
      return (await banner.getText()).trim();
    } catch (e) {
      return null;
    }
  }

  /**
   * Click login link
   */
  async clickLogin() {
    logger.info('Navigating to Login page from Signup');
    await SeleniumUtils.clickWhenReady(this.driver, this.loginLink);
  }
}

module.exports = SignupPage;
