/**
 * pages/LoginPage.js
 * Login Page Object.
 */
const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    
    // Selectors
    this.emailField = '//*[@resource-id="com.survexa.app:id/email"] | //*[@content-desc="email_input"]';
    this.passwordField = '//*[@resource-id="com.survexa.app:id/password"] | //*[@content-desc="password_input"]';
    this.loginButton = '//*[@resource-id="com.survexa.app:id/btn_login"] | //*[@content-desc="login_button"]';
    this.validationErrorLabel = '//*[@resource-id="com.survexa.app:id/tv_error"] | //*[@content-desc="error_message"]';
    this.signupLink = '//*[@resource-id="com.survexa.app:id/tv_signup"] | //*[@content-desc="signup_link"]';
  }

  /**
   * Log in action.
   */
  async login(email, password) {
    if (email !== null) {
      await this.sendKeys(this.emailField, email);
    } else {
      const el = await this.getElement(this.emailField);
      await el.clearValue();
    }

    if (password !== null) {
      await this.sendKeys(this.passwordField, password);
    } else {
      const el = await this.getElement(this.passwordField);
      await el.clearValue();
    }

    await this.hideKeyboard();
    await this.click(this.loginButton);
  }

  /**
   * Fetches displayed UI validation message.
   */
  async getErrorMessage() {
    return await this.getText(this.validationErrorLabel);
  }
}

module.exports = LoginPage;
