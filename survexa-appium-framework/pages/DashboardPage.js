/**
 * pages/DashboardPage.js
 * Dashboard elements and bottom navigation page object.
 */
const BasePage = require('./BasePage');

class DashboardPage extends BasePage {
  constructor(driver) {
    super(driver);
    
    // Bottom Navigation Elements
    this.dashboardTitle = '//*[@resource-id="com.survexa.app:id/tv_dashboard_title"] | //*[@content-desc="dashboard_title"]';
    this.surveysTab = '//*[@resource-id="com.survexa.app:id/nav_surveys"] | //*[@content-desc="nav_surveys"]';
    this.analyticsTab = '//*[@resource-id="com.survexa.app:id/nav_analytics"] | //*[@content-desc="nav_analytics"]';
    this.billingTab = '//*[@resource-id="com.survexa.app:id/nav_billing"] | //*[@content-desc="nav_billing"]';
    
    // Navigation Drawer / Top bar
    this.drawerToggle = '//*[@resource-id="com.survexa.app:id/btn_drawer_toggle"] | //*[@content-desc="drawer_toggle"]';
    this.logoutMenuOption = '//*[@resource-id="com.survexa.app:id/menu_logout"] | //*[@content-desc="menu_logout"]';
    
    // Performance & metrics placeholders (RecyclerView cards)
    this.surveyCards = '//*[@resource-id="com.survexa.app:id/rv_surveys"]/android.widget.FrameLayout';
    this.upgradeBillingCard = '//*[@resource-id="com.survexa.app:id/card_upgrade"] | //*[@content-desc="upgrade_card"]';
  }

  /**
   * Navigates to the Surveys tab.
   */
  async goToSurveys() {
    await this.click(this.surveysTab);
  }

  /**
   * Navigates to the Analytics tab.
   */
  async goToAnalytics() {
    await this.click(this.analyticsTab);
  }

  /**
   * Navigates to the Billing/Settings tab.
   */
  async goToBilling() {
    await this.click(this.billingTab);
  }

  /**
   * Triggers the navigation drawer slide out.
   */
  async openDrawer() {
    await this.click(this.drawerToggle);
  }

  /**
   * Log out from navigation drawer.
   */
  async logout() {
    await this.openDrawer();
    await this.click(this.logoutMenuOption);
  }

  /**
   * Check if dashboard page has loaded.
   */
  async isLoaded() {
    return await this.isDisplayed(this.dashboardTitle);
  }
}

module.exports = DashboardPage;
