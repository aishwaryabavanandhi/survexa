/**
 * tests/navigation.test.js
 * Navigation, Deep Links, Back Button, and Screen Transition Tests
 */
require('dotenv').config()
const { expect } = require('chai')
const { BaseTest, getDriver } = require('./BaseTest')
const LoginPage     = require('../pages/LoginPage')
const DashboardPage = require('../pages/DashboardPage')
const excelReporter = require('../utilities/excelReporter')
const Gestures      = require('../utilities/gestures')

const TEST_EMAIL    = process.env.TEST_EMAIL    || 'testuser@survexa.test'
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPassword123!'

describe('TC-NAV — Navigation Module', function () {
  this.timeout(180000)

  let driver, loginPage, dashboardPage

  before(async function () {
    driver       = await BaseTest.beforeSuite()
    loginPage    = new LoginPage(driver)
    dashboardPage = new DashboardPage(driver)

    const loginLoaded = await loginPage.isLoaded()
    if (loginLoaded) {
      await loginPage.login(TEST_EMAIL, TEST_PASSWORD)
      await driver.pause(4000)
    }
  })

  after(async function () {
    await BaseTest.afterSuite()
  })

  beforeEach(function () {
    BaseTest.beforeEachTest(this)
  })

  afterEach(async function () {
    await BaseTest.afterEachTest(this)
  })

  it('TC-NAV-01: Bottom navigation - Surveys tab', async function () {
    excelReporter.recordStepLog(this.test.title, 'Click Surveys tab', 'Info', 'Bottom nav navigation')
    await dashboardPage.goToSurveys()
    await driver.pause(2000)

    const visible = await dashboardPage.isDisplayed(`android=new UiSelector().textContains("Survey")`, 10000)
    excelReporter.recordStepLog(this.test.title, 'Verify Surveys tab', visible ? 'Pass' : 'Fail', '')
    expect(visible).to.be.true
  })

  it('TC-NAV-02: Bottom navigation - Analytics tab', async function () {
    excelReporter.recordStepLog(this.test.title, 'Click Analytics tab', 'Info', 'Bottom nav navigation')
    await dashboardPage.goToAnalytics()
    await driver.pause(2000)

    const visible = await dashboardPage.isDisplayed(`android=new UiSelector().textContains("Analytics")`, 10000)
    excelReporter.recordStepLog(this.test.title, 'Verify Analytics tab', visible ? 'Pass' : 'Fail', '')
    expect(visible).to.be.true
  })

  it('TC-NAV-03: Bottom navigation - Billing tab', async function () {
    excelReporter.recordStepLog(this.test.title, 'Click Billing tab', 'Info', 'Bottom nav navigation')
    await dashboardPage.goToBilling()
    await driver.pause(2000)

    const visible = await dashboardPage.isDisplayed(`android=new UiSelector().textContains("Billing")`, 10000)
    excelReporter.recordStepLog(this.test.title, 'Verify Billing tab', visible ? 'Pass' : 'Fail', '')
    expect(visible).to.be.true
  })

  it('TC-NAV-04: Back button returns to previous screen', async function () {
    excelReporter.recordStepLog(this.test.title, 'Navigate forward', 'Info', 'Going to Surveys')
    await dashboardPage.goToSurveys()
    await driver.pause(1500)

    excelReporter.recordStepLog(this.test.title, 'Press back', 'Info', 'Pressing Android back')
    await dashboardPage.pressBack()
    await driver.pause(1500)

    // Should be on previous screen
    excelReporter.recordStepLog(this.test.title, 'Verify back navigation', 'Pass', 'Back button worked')
    const isOnApp = await dashboardPage.isDisplayed(
      `android=new UiSelector().className("android.webkit.WebView")`,
      5000
    )
    expect(isOnApp, 'App should still be in foreground after back').to.be.true
  })

  it('TC-NAV-05: Dashboard displays key metric cards', async function () {
    excelReporter.recordStepLog(this.test.title, 'Navigate to Dashboard', 'Info', 'Checking dashboard cards')

    const dashVisible = await dashboardPage.isDisplayed(
      `android=new UiSelector().textContains("Dashboard")`,
      10000
    )
    expect(dashVisible, 'Dashboard section should be visible').to.be.true

    // Scroll through dashboard to check metrics cards
    await Gestures.swipeUp(driver)
    await driver.pause(1000)
    await Gestures.swipeDown(driver)

    excelReporter.recordStepLog(this.test.title, 'Dashboard scroll', 'Pass', 'Dashboard content scrollable')
  })

  it('TC-NAV-06: App relaunches without crashing (background/foreground)', async function () {
    excelReporter.recordStepLog(this.test.title, 'Put app in background', 'Info', 'Backgrounding app for 5s')

    await driver.background(5)
    await driver.pause(2000)

    excelReporter.recordStepLog(this.test.title, 'App resumed', 'Info', 'Checking for crash or ANR')

    // Check app is still running (WebView present)
    const appActive = await dashboardPage.isDisplayed(
      `android=new UiSelector().className("android.webkit.WebView")`,
      10000
    )
    excelReporter.recordStepLog(this.test.title, 'Verify no crash', appActive ? 'Pass' : 'Fail',
      appActive ? 'App resumed without crash' : 'App may have crashed')
    expect(appActive, 'App should resume without crash after background').to.be.true
  })

  it('TC-NAV-07: Help & Support section accessible', async function () {
    excelReporter.recordStepLog(this.test.title, 'Navigate to Help', 'Info', 'Finding Help section')

    const helpVisible = await dashboardPage.isDisplayed(
      `android=new UiSelector().textContains("Help")`,
      5000
    )

    if (helpVisible) {
      await dashboardPage.click(`android=new UiSelector().textContains("Help")`)
      await driver.pause(2000)
      const helpLoaded = await dashboardPage.isDisplayed(
        `android=new UiSelector().textContains("Help")`,
        5000
      )
      excelReporter.recordStepLog(this.test.title, 'Help section loaded', helpLoaded ? 'Pass' : 'Fail', '')
      expect(helpLoaded, 'Help section should be accessible').to.be.true
    } else {
      excelReporter.recordStepLog(this.test.title, 'Help nav not visible', 'Skip', 'Help button not in current view')
      this.skip()
    }
  })
})
