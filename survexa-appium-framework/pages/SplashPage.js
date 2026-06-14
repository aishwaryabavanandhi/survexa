/**
 * pages/SplashPage.js
 * Survexa Splash / Welcome screen page object
 */
const BasePage = require('./BasePage')

class SplashPage extends BasePage {
  constructor(driver) {
    super(driver)

    // Selectors — Capacitor WebView renders HTML in WebView
    // We locate by content-desc, xpath, or UiAutomator2 selectors
    this.splashContainer = 'android=new UiSelector().className("android.webkit.WebView")'
    this.welcomeButton   = `android=new UiSelector().description("Get Started")`
    this.loginButton     = `android=new UiSelector().description("Sign In")`
    this.signupButton    = `android=new UiSelector().description("Sign Up")`
  }

  /**
   * Wait for the splash/welcome screen to load
   */
  async waitForSplash(timeout = 15000) {
    await this.driver.pause(3000) // Let Capacitor WebView load
    const webview = await this.driver.$(this.splashContainer)
    await webview.waitForDisplayed({ timeout })
  }

  /**
   * Check if app has loaded (WebView is present)
   */
  async isLoaded() {
    return this.isDisplayed(this.splashContainer, 20000)
  }

  /**
   * Navigate to login from welcome screen
   */
  async goToLogin() {
    // Survexa shows /splash → /welcome → /login
    // Try clicking the "Sign In" button or just wait for redirect
    const loginVisible = await this.isDisplayed(
      `android=new UiSelector().textContains("Sign in")`,
      5000
    )
    if (loginVisible) {
      await this.click(`android=new UiSelector().textContains("Sign in")`)
    }
  }
}

module.exports = SplashPage
