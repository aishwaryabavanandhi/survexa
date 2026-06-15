/**
 * tests/gestures.test.js
 * Mobile Gesture Automation Tests — Swipe, Scroll, Long Press, Pinch/Zoom, Drag
 */
require('dotenv').config()
const { expect } = require('chai')
const { BaseTest, getDriver } = require('./BaseTest')
const LoginPage     = require('../pages/LoginPage')
const DashboardPage = require('../pages/DashboardPage')
const Gestures      = require('../utilities/gestures')
const excelReporter = require('../utilities/excelReporter')

const TEST_EMAIL    = process.env.TEST_EMAIL    || 'testuser@survexa.test'
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPassword123!'

describe('TC-GEST — Gesture Automation Module', function () {
  this.timeout(180000)

  let driver, loginPage, dashboardPage

  before(async function () {
    driver       = await BaseTest.beforeSuite()
    loginPage    = new LoginPage(driver)
    dashboardPage = new DashboardPage(driver)

    await BaseTest.ensureLoggedIn(driver, TEST_EMAIL, TEST_PASSWORD)
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

  it('TC-GEST-01: Swipe Up (Scroll Down) on Dashboard', async function () {
    excelReporter.recordStepLog(this.test.title, 'Execute Swipe Up', 'Info', 'Scrolling dashboard down')
    await Gestures.swipeUp(driver)
    await driver.pause(800)

    const appActive = await dashboardPage.isDisplayed(
      `android=new UiSelector().className("android.webkit.WebView")`, 5000
    )
    excelReporter.recordStepLog(this.test.title, 'Verify app active', appActive ? 'Pass' : 'Fail', 'App responsive after swipe')
    expect(appActive, 'App should remain active after swipe up').to.be.true
  })

  it('TC-GEST-02: Swipe Down (Scroll Up) on Dashboard', async function () {
    excelReporter.recordStepLog(this.test.title, 'Execute Swipe Down', 'Info', 'Scrolling dashboard up')
    await Gestures.swipeDown(driver)
    await driver.pause(800)

    const appActive = await dashboardPage.isDisplayed(
      `android=new UiSelector().className("android.webkit.WebView")`, 5000
    )
    excelReporter.recordStepLog(this.test.title, 'Verify app active', appActive ? 'Pass' : 'Fail', 'App responsive after swipe')
    expect(appActive).to.be.true
  })

  it('TC-GEST-03: Swipe Left gesture executes without crash', async function () {
    excelReporter.recordStepLog(this.test.title, 'Execute Swipe Left', 'Info', '')
    await Gestures.swipeLeft(driver)
    await driver.pause(800)

    const appActive = await dashboardPage.isDisplayed(
      `android=new UiSelector().className("android.webkit.WebView")`, 5000
    )
    excelReporter.recordStepLog(this.test.title, 'Verify no crash', appActive ? 'Pass' : 'Fail', '')
    expect(appActive).to.be.true
  })

  it('TC-GEST-04: Swipe Right gesture executes without crash', async function () {
    excelReporter.recordStepLog(this.test.title, 'Execute Swipe Right', 'Info', '')
    await Gestures.swipeRight(driver)
    await driver.pause(800)

    const appActive = await dashboardPage.isDisplayed(
      `android=new UiSelector().className("android.webkit.WebView")`, 5000
    )
    excelReporter.recordStepLog(this.test.title, 'Verify no crash', appActive ? 'Pass' : 'Fail', '')
    expect(appActive).to.be.true
  })

  it('TC-GEST-05: Long Press gesture executes without ANR', async function () {
    const { width, height } = await driver.getWindowSize()
    const midX = Math.round(width / 2)
    const midY = Math.round(height / 2)

    excelReporter.recordStepLog(this.test.title, 'Long Press center', 'Info', `Coordinates: (${midX}, ${midY})`)
    await Gestures.longPressAt(driver, midX, midY, 1500)
    await driver.pause(800)

    // Dismiss any context menu that appeared
    await driver.back().catch(() => {})

    const appActive = await dashboardPage.isDisplayed(
      `android=new UiSelector().className("android.webkit.WebView")`, 5000
    )
    excelReporter.recordStepLog(this.test.title, 'Verify no ANR', appActive ? 'Pass' : 'Fail', 'App responsive after long press')
    expect(appActive, 'App should not ANR after long press').to.be.true
  })

  it('TC-GEST-06: Pinch/Zoom on Analytics chart', async function () {
    await dashboardPage.goToAnalytics()
    await driver.pause(2000)

    const { width, height } = await driver.getWindowSize()
    const midX = Math.round(width / 2)
    const midY = Math.round(height / 2)

    excelReporter.recordStepLog(this.test.title, 'Execute Pinch Zoom', 'Info', 'Zooming in on chart area')
    await Gestures.pinchAndZoom(driver, midX, midY, 1.8)
    await driver.pause(800)

    const appActive = await dashboardPage.isDisplayed(
      `android=new UiSelector().className("android.webkit.WebView")`, 5000
    )
    excelReporter.recordStepLog(this.test.title, 'Verify no crash', appActive ? 'Pass' : 'Fail', 'App active after pinch/zoom')
    expect(appActive, 'App should not crash after pinch/zoom').to.be.true
  })

  it('TC-GEST-07: Pull-to-refresh gesture on Surveys list', async function () {
    await dashboardPage.goToSurveys()
    await driver.pause(2000)

    excelReporter.recordStepLog(this.test.title, 'Pull to Refresh', 'Info', 'Pulling down on surveys list')
    await Gestures.pullToRefresh(driver)
    await driver.pause(2000)

    const surveysStillVisible = await dashboardPage.isDisplayed(
      `android=new UiSelector().className("android.webkit.WebView")`, 8000
    )
    excelReporter.recordStepLog(this.test.title, 'Verify refresh worked', surveysStillVisible ? 'Pass' : 'Fail', '')
    expect(surveysStillVisible, 'Surveys list should still be visible after pull-to-refresh').to.be.true
  })
})
