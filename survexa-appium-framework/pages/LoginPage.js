/**
 * pages/LoginPage.js
 * Login screen page object for Survexa app
 *
 * NOTE: Survexa is a Capacitor WebView app. Elements are inside a WebView.
 * We use UiAutomator2 selectors that work for WebView content.
 * For complex selectors, we use WebView context switching.
 */
const BasePage = require('./BasePage')

class LoginPage extends BasePage {
  constructor(driver) {
    super(driver)

    // ── Selectors ─────────────────────────────────────────────
    // These work for Capacitor WebView via UiAutomator2 text-based selectors
    this.emailField        = `android=new UiSelector().className("android.widget.EditText").instance(0)`
    this.passwordField     = `android=new UiSelector().className("android.widget.EditText").instance(1)`
    this.loginButton       = `android=new UiSelector().text("Sign in")`
    this.forgotPasswordBtn = `android=new UiSelector().descriptionContains("Forgot")`
    this.signupLink        = `android=new UiSelector().descriptionContains("Sign up")`
    this.errorMessage      = `android=new UiSelector().className("android.widget.TextView")`

    // XPath-based fallbacks
    this.emailFieldXPath    = '//android.widget.EditText[@hint="jane@company.com" or @text=""]'
    this.loginButtonXPath   = '//*[contains(@text, "Sign in") or contains(@content-desc, "Sign in")]'
  }

  /**
   * Check if login page is displayed
   */
  async isLoaded() {
    return this.isDisplayed(this.emailField, 20000)
  }

  /**
   * Perform login with email and password
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    await this.waitForElement(this.emailField)

    await this.typeText(this.emailField, email)
    await this.driver.pause(300)

    await this.typeText(this.passwordField, password)
    await this.driver.pause(300)

    await this.hideKeyboard()
    await this.driver.pause(200)

    await this.click(this.loginButton)
    await this.driver.pause(2000)
  }

  /**
   * Get the error message text displayed after invalid login
   */
  async getErrorMessage() {
    const xpath = `//*[contains(@text, "required") or contains(@text, "invalid") or contains(@text, "Invalid") or contains(@text, "error") or contains(@text, "Incorrect") or contains(@text, "incorrect") or contains(@text, "match") or contains(@text, "already exists") or contains(@text, "credentials")]`
    try {
      const el = await this.waitForElement(xpath, 5000)
      return await el.getText()
    } catch (err) {
      return ''
    }
  }

  /**
   * Navigate to Forgot Password screen
   */
  async goToForgotPassword() {
    await this.click(this.forgotPasswordBtn)
    await this.driver.pause(1500)
  }

  /**
   * Navigate to Signup screen
   */
  async goToSignup() {
    await this.click(this.signupLink)
    await this.driver.pause(1500)
  }
}

module.exports = LoginPage
