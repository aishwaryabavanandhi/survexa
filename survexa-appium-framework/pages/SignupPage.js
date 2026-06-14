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
    this.signupButton       = `android=new UiSelector().textContains("Sign up")`
    this.loginLink          = `android=new UiSelector().textContains("Sign in")`
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
    const errorSelectors = [
      `android=new UiSelector().textContains("required")`,
      `android=new UiSelector().textContains("invalid")`,
      `android=new UiSelector().textContains("already exists")`,
      `android=new UiSelector().textContains("match")`,
      `android=new UiSelector().textContains("characters")`,
    ]
    for (const sel of errorSelectors) {
      if (await this.isDisplayed(sel, 3000)) {
        return await this.getText(sel)
      }
    }
    return ''
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
