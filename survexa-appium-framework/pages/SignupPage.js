/**
 * pages/SignupPage.js
 * Signup screen page object for Survexa app
 */
const BasePage = require('./BasePage')

class SignupPage extends BasePage {
  constructor(driver) {
    super(driver)

    // ── Selectors ─────────────────────────────────────────────
    this.nameField          = `android=new UiSelector().className("android.widget.EditText").instance(0)`
    this.emailField         = `android=new UiSelector().className("android.widget.EditText").instance(1)`
    this.phoneField         = `android=new UiSelector().className("android.widget.EditText").instance(2)`
    this.passwordField      = `android=new UiSelector().className("android.widget.EditText").instance(3)`
    this.confirmPassField   = `android=new UiSelector().className("android.widget.EditText").instance(4)`
    this.signupButton       = `android=new UiSelector().text("Sign up & verify")`
    this.loginLink          = `android=new UiSelector().descriptionContains("Sign in")`
    this.countryCodeBtn     = `android=new UiSelector().textContains("+91")`
  }

  async isLoaded() {
    return this.isDisplayed(this.nameField, 15000)
  }

  /**
   * Fill and submit the signup form
   */
  async signup({ name, email, phone, password, confirmPassword = null }) {
    await this.waitForElement(this.nameField)

    await this.typeText(this.nameField, name)
    await this.typeText(this.emailField, email)
    await this.typeText(this.phoneField, phone)
    await this.typeText(this.passwordField, password)
    await this.typeText(this.confirmPassField, confirmPassword || password)

    await this.hideKeyboard()
    await this.driver.pause(300)

    await this.click(this.signupButton)
    await this.driver.pause(3000)
  }

  /**
   * Get validation or API error message
   */
  async getErrorMessage() {
    const xpath = `//*[contains(@text, "required") or contains(@text, "invalid") or contains(@text, "Invalid") or contains(@text, "error") or contains(@text, "Incorrect") or contains(@text, "incorrect") or contains(@text, "match") or contains(@text, "already exists") or contains(@text, "credentials") or contains(@text, "Passwords do not match")]`
    try {
      const el = await this.waitForElement(xpath, 5000)
      return await el.getText()
    } catch (err) {
      return ''
    }
  }

  /**
   * Check if OTP verification step appeared (means signup succeeded)
   */
  async isOtpStepShown() {
    return this.isDisplayed(
      `android=new UiSelector().textContains("verification")`,
      8000
    )
  }
}

module.exports = SignupPage
