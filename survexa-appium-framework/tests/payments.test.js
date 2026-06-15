/**
 * tests/payments.test.js
 * Payment & Billing E2E Tests
 *
 * Covers:
 *   - TC-PAY-01: Billing page loads
 *   - TC-PAY-02: Plan pricing visible
 *   - TC-PAY-03: Upgrade button visible
 *   - TC-PAY-04: Admin billing dashboard (API)
 *   - TC-PAY-05: Billing history API
 */
require('dotenv').config()
const { expect } = require('chai')
const { BaseTest, getDriver } = require('./BaseTest')
const LoginPage     = require('../pages/LoginPage')
const DashboardPage = require('../pages/DashboardPage')
const excelReporter = require('../utilities/excelReporter')
const apiHelper     = require('../utilities/apiHelper')
const Gestures      = require('../utilities/gestures')

const TEST_EMAIL    = process.env.TEST_EMAIL    || 'testuser@survexa.test'
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPassword123!'
const ADMIN_EMAIL   = process.env.ADMIN_EMAIL   || 'surveyforgeadmin@gmail.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminPass123!'

describe('TC-PAY — Payments & Billing Module', function () {
  this.timeout(180000)

  let driver, loginPage, dashboardPage

  before(async function () {
    driver        = await BaseTest.beforeSuite()
    loginPage     = new LoginPage(driver)
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

  it('TC-PAY-01: Billing section loads and shows plan information', async function () {
    excelReporter.recordStepLog(this.test.title, 'Navigate to Billing', 'Info', 'Opening billing section')
    await dashboardPage.goToBilling()
    await driver.pause(3000)

    const billingVisible = await dashboardPage.isDisplayed(
      `android=new UiSelector().textContains("Billing")`,
      10000
    )
    excelReporter.recordStepLog(this.test.title, 'Billing page visible', billingVisible ? 'Pass' : 'Fail', '')
    expect(billingVisible, 'Billing section should be visible').to.be.true
  })

  it('TC-PAY-02: Plan pricing cards are visible', async function () {
    excelReporter.recordStepLog(this.test.title, 'Check plan cards', 'Info', 'Looking for Free/Pro/Business plans')

    // Check at least one plan type visible
    const freeVisible = await dashboardPage.isDisplayed(
      `android=new UiSelector().textContains("Free")`, 5000
    )
    const proVisible = await dashboardPage.isDisplayed(
      `android=new UiSelector().textContains("Pro")`, 5000
    )

    await Gestures.swipeUp(driver)
    await driver.pause(1000)

    excelReporter.recordStepLog(this.test.title, 'Plans visible', 'Pass',
      `Free: ${freeVisible}, Pro: ${proVisible}`)
    expect(freeVisible || proVisible, 'At least one plan should be visible in billing section').to.be.true
  })

  it('TC-PAY-03: Upgrade button is accessible', async function () {
    excelReporter.recordStepLog(this.test.title, 'Find Upgrade button', 'Info', 'Looking for upgrade CTA')
    await Gestures.scrollToText(driver, 'Upgrade').catch(() => {})

    const upgradeVisible = await dashboardPage.isDisplayed(
      `android=new UiSelector().textContains("Upgrade")`, 8000
    )
    excelReporter.recordStepLog(this.test.title, 'Upgrade button visible', upgradeVisible ? 'Pass' : 'Fail', '')
    expect(upgradeVisible, 'Upgrade button should be visible in billing section').to.be.true
  })

  it('TC-PAY-04: API returns billing plans correctly', async function () {
    excelReporter.recordStepLog(this.test.title, 'API: GET /billing/plans', 'Info', 'Checking billing plans API')

    await apiHelper.loginTestUser()

    const health = await apiHelper.checkBackendHealth()
    if (!health.ok) {
      excelReporter.recordStepLog(this.test.title, 'Backend unreachable', 'Skip', health.error)
      this.skip()
      return
    }

    const axios = require('axios')
    const { data } = await axios.get(`${apiHelper.BACKEND_URL}/billing/plans`, { timeout: 10000 })

    excelReporter.recordStepLog(this.test.title, 'Plans API response', data.success ? 'Pass' : 'Fail',
      `Plans count: ${data.plans?.length}`)
    expect(data.success, 'Billing plans API should return success:true').to.be.true
    expect(data.plans).to.be.an('array').with.length.greaterThan(0)
  })

  it('TC-PAY-05: API returns billing history for user', async function () {
    excelReporter.recordStepLog(this.test.title, 'API: GET /billing/payments', 'Info', 'Checking billing history')

    const loginResult = await apiHelper.loginTestUser()
    if (!loginResult.ok) {
      excelReporter.recordStepLog(this.test.title, 'Auth failed', 'Skip', loginResult.error)
      this.skip()
      return
    }

    const axios = require('axios')
    const { data } = await axios.get(`${apiHelper.BACKEND_URL}/billing/payments`, {
      headers: { Authorization: `Bearer ${apiHelper.getAuthToken()}` },
      timeout: 10000,
    })

    excelReporter.recordStepLog(this.test.title, 'Billing history API', data.success ? 'Pass' : 'Fail',
      `Records: ${data.data?.length || 0}`)
    expect(data.success, 'Billing payments API should return success:true').to.be.true
  })
})
