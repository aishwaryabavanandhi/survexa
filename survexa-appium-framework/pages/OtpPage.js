/**
 * pages/OtpPage.js
 * OTP verification screen page object
 */
const BasePage = require('./BasePage')

class OtpPage extends BasePage {
  constructor(driver) {
    super(driver)

    this.otpInput        = `android=new UiSelector().className("android.widget.EditText").instance(0)`
    this.verifyButton    = `android=new UiSelector().textContains("Verify")`
    this.resendButton    = `android=new UiSelector().textContains("Resend")`
    this.emailOtpTab     = `android=new UiSelector().textContains("Email")`
    this.phoneOtpTab     = `android=new UiSelector().textContains("Phone")`
    this.successMessage  = `android=new UiSelector().textContains("verified")`
    this.errorMessage    = `android=new UiSelector().textContains("Invalid")`
  }

  async isLoaded() {
    return this.isDisplayed(this.otpInput, 15000)
  }

  /**
   * Enter OTP code (6 digits)
   */
  async enterOtp(code) {
    await this.waitForElement(this.otpInput)
    await this.typeText(this.otpInput, String(code))
    await this.hideKeyboard()
    await this.driver.pause(300)
  }

  /**
   * Click verify button
   */
  async verifyOtp(code) {
    await this.enterOtp(code)
    await this.click(this.verifyButton)
    await this.driver.pause(3000)
  }

  /**
   * Check if OTP was accepted (redirected to dashboard or next step)
   */
  async isVerificationSuccessful() {
    return this.isDisplayed(this.successMessage, 8000)
  }

  /**
   * Resend OTP
   */
  async resendOtp() {
    await this.click(this.resendButton)
    await this.driver.pause(2000)
  }

  async getErrorMessage() {
    if (await this.isDisplayed(this.errorMessage, 3000)) {
      return await this.getText(this.errorMessage)
    }
    return ''
  }
}

module.exports = OtpPage
