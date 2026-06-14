/**
 * pages/DashboardPage.js
 * Dashboard / main app page object for Survexa
 */
const BasePage = require('./BasePage')

class DashboardPage extends BasePage {
  constructor(driver) {
    super(driver)

    // ── Navigation selectors ──────────────────────────────────
    this.surveysNavBtn    = `android=new UiSelector().textContains("Surveys")`
    this.analyticsNavBtn  = `android=new UiSelector().textContains("Analytics")`
    this.billingNavBtn    = `android=new UiSelector().textContains("Billing")`
    this.settingsNavBtn   = `android=new UiSelector().textContains("Settings")`
    this.dashboardTitle   = `android=new UiSelector().textContains("Dashboard")`
    this.createSurveyBtn  = `android=new UiSelector().textContains("Create")`
    this.upgradeBillingCard = `android=new UiSelector().textContains("Upgrade")`
    this.aiGeneratorBtn   = `android=new UiSelector().textContains("AI")`
    this.logoutBtn        = `android=new UiSelector().textContains("Logout")`
    this.profileAvatar    = `android=new UiSelector().description("Profile")`

    // Survey list item
    this.surveyListItem   = `android=new UiSelector().className("android.widget.TextView")`
  }

  /**
   * Check if dashboard has loaded
   */
  async isLoaded() {
    return this.isDisplayed(this.dashboardTitle, 20000)
  }

  /**
   * Navigate to Surveys section
   */
  async goToSurveys() {
    await this.click(this.surveysNavBtn)
    await this.driver.pause(1500)
  }

  /**
   * Navigate to Analytics section
   */
  async goToAnalytics() {
    await this.click(this.analyticsNavBtn)
    await this.driver.pause(1500)
  }

  /**
   * Navigate to Billing section
   */
  async goToBilling() {
    await this.click(this.billingNavBtn)
    await this.driver.pause(1500)
  }

  /**
   * Click Create Survey button
   */
  async clickCreateSurvey() {
    await this.click(this.createSurveyBtn)
    await this.driver.pause(2000)
  }

  /**
   * Open AI Question Generator
   */
  async goToAIGenerator() {
    await this.click(this.aiGeneratorBtn)
    await this.driver.pause(2000)
  }

  /**
   * Perform logout
   */
  async logout() {
    // Try to find logout button directly, or open settings first
    const logoutVisible = await this.isDisplayed(this.logoutBtn, 3000)
    if (!logoutVisible) {
      // Try opening settings
      const settingsVisible = await this.isDisplayed(this.settingsNavBtn, 3000)
      if (settingsVisible) {
        await this.click(this.settingsNavBtn)
        await this.driver.pause(1500)
      }
    }

    await this.scrollToElement(this.logoutBtn, 10)

    const logoutNow = await this.isDisplayed(this.logoutBtn, 3000)
    if (logoutNow) {
      await this.click(this.logoutBtn)
      await this.driver.pause(2000)
    }
  }

  /**
   * Get count of surveys in list
   */
  async getSurveyCount() {
    try {
      const items = await this.driver.$$(`android=new UiSelector().className("android.view.View")`)
      return items.length
    } catch {
      return 0
    }
  }
}

module.exports = DashboardPage
