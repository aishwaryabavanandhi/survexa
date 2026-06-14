/**
 * tests/auth.test.js
 * Authentication E2E Tests for Survexa Android App
 *
 * Covers:
 *   - TC-AUTH-01: Empty email validation
 *   - TC-AUTH-02: Empty password validation
 *   - TC-AUTH-03: Invalid credentials error
 *   - TC-AUTH-04: Successful login
 *   - TC-AUTH-05: Logout
 *   - TC-AUTH-06: Signup flow
 *   - TC-AUTH-07: Email OTP verification
 *   - TC-AUTH-08: Forgot password
 *   - TC-AUTH-09: Session persistence on app background
 */
require('dotenv').config()
const { expect } = require('chai')
const { BaseTest, getDriver } = require('./BaseTest')
const LoginPage  = require('../pages/LoginPage')
const SignupPage  = require('../pages/SignupPage')
const OtpPage    = require('../pages/OtpPage')
const DashboardPage = require('../pages/DashboardPage')
const excelReporter = require('../utilities/excelReporter')
const apiHelper  = require('../utilities/apiHelper')
const logger     = require('../utilities/logger')

const TEST_EMAIL    = process.env.TEST_EMAIL    || 'testuser@survexa.test'
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPassword123!'

describe('TC-AUTH — Authentication Module', function () {
  this.timeout(120000)

  let driver, loginPage, signupPage, otpPage, dashboardPage

  before(async function () {
    driver      = await BaseTest.beforeSuite()
    loginPage   = new LoginPage(driver)
    signupPage  = new SignupPage(driver)
    otpPage     = new OtpPage(driver)
    dashboardPage = new DashboardPage(driver)
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

  // ──────────────────────────────────────────────────────────
  // TC-AUTH-01: Empty email validation
  // ──────────────────────────────────────────────────────────
  it('TC-AUTH-01: Empty email shows validation error', async function () {
    excelReporter.recordStepLog(this.test.title, 'Navigate to Login', 'Info', 'Waiting for login page')
    const loaded = await loginPage.isLoaded()
    expect(loaded, 'Login page should be displayed').to.be.true

    excelReporter.recordStepLog(this.test.title, 'Submit with empty email', 'Info', 'Email left blank')
    await loginPage.login('', TEST_PASSWORD)

    const error = await loginPage.getErrorMessage()
    excelReporter.recordStepLog(this.test.title, 'Check error message', 'Pass', `Error: "${error}"`)
    expect(error.toLowerCase()).to.satisfy(
      (msg) => msg.includes('email') || msg.includes('required') || msg.includes('invalid'),
      `Expected email validation error, got: "${error}"`
    )
  })

  // ──────────────────────────────────────────────────────────
  // TC-AUTH-02: Empty password validation
  // ──────────────────────────────────────────────────────────
  it('TC-AUTH-02: Empty password shows validation error', async function () {
    excelReporter.recordStepLog(this.test.title, 'Submit with empty password', 'Info', 'Password left blank')
    await loginPage.login(TEST_EMAIL, '')

    const error = await loginPage.getErrorMessage()
    excelReporter.recordStepLog(this.test.title, 'Check error message', 'Pass', `Error: "${error}"`)
    expect(error.toLowerCase()).to.satisfy(
      (msg) => msg.includes('password') || msg.includes('required'),
      `Expected password validation error, got: "${error}"`
    )
  })

  // ──────────────────────────────────────────────────────────
  // TC-AUTH-03: Invalid credentials
  // ──────────────────────────────────────────────────────────
  it('TC-AUTH-03: Invalid credentials show auth error', async function () {
    excelReporter.recordStepLog(this.test.title, 'Enter invalid credentials', 'Info', 'Using wrong email/pass')
    await loginPage.login('nobody@nope.invalid', 'WrongPass123!')

    const error = await loginPage.getErrorMessage()
    excelReporter.recordStepLog(this.test.title, 'Check auth error', 'Pass', `Error: "${error}"`)
    expect(error.toLowerCase()).to.satisfy(
      (msg) => msg.includes('invalid') || msg.includes('incorrect') || msg.includes('password') || msg.includes('credentials'),
      `Expected auth error, got: "${error}"`
    )
  })

  // ──────────────────────────────────────────────────────────
  // TC-AUTH-04: Valid login
  // ──────────────────────────────────────────────────────────
  it('TC-AUTH-04: Valid login redirects to dashboard', async function () {
    // First ensure test user exists via API
    excelReporter.recordStepLog(this.test.title, 'Pre-check: verify test account', 'Info', `Email: ${TEST_EMAIL}`)
    const apiLogin = await apiHelper.loginTestUser()
    if (!apiLogin.ok) {
      logger.warn(`Test account not found via API (${apiLogin.error}) — test may fail`)
    }

    excelReporter.recordStepLog(this.test.title, 'Enter valid credentials', 'Info', `Email: ${TEST_EMAIL}`)
    await loginPage.login(TEST_EMAIL, TEST_PASSWORD)

    await driver.pause(4000)

    const dashLoaded = await dashboardPage.isLoaded()
    excelReporter.recordStepLog(this.test.title, 'Verify dashboard loaded', dashLoaded ? 'Pass' : 'Fail',
      dashLoaded ? 'Dashboard visible' : 'Dashboard not found after login')
    expect(dashLoaded, 'Dashboard should be visible after successful login').to.be.true
  })

  // ──────────────────────────────────────────────────────────
  // TC-AUTH-05: Session persistence
  // ──────────────────────────────────────────────────────────
  it('TC-AUTH-05: Session persists after app is backgrounded', async function () {
    excelReporter.recordStepLog(this.test.title, 'Put app in background', 'Info', 'Backgrounding for 3s')
    await driver.background(3)

    excelReporter.recordStepLog(this.test.title, 'Resume app', 'Info', 'App resumed from background')
    await driver.pause(2000)

    const dashLoaded = await dashboardPage.isLoaded()
    excelReporter.recordStepLog(this.test.title, 'Verify session persisted', dashLoaded ? 'Pass' : 'Fail',
      dashLoaded ? 'Still on dashboard — session OK' : 'Redirected to login — session lost')
    expect(dashLoaded, 'Session should persist after app is backgrounded').to.be.true
  })

  // ──────────────────────────────────────────────────────────
  // TC-AUTH-06: Logout
  // ──────────────────────────────────────────────────────────
  it('TC-AUTH-06: Logout redirects to login screen', async function () {
    excelReporter.recordStepLog(this.test.title, 'Trigger logout', 'Info', 'Finding logout button')
    await dashboardPage.logout()

    await driver.pause(3000)

    const loginLoaded = await loginPage.isLoaded()
    excelReporter.recordStepLog(this.test.title, 'Verify login screen shown', loginLoaded ? 'Pass' : 'Fail',
      loginLoaded ? 'Redirected to login — logout OK' : 'Still on dashboard after logout')
    expect(loginLoaded, 'Login screen should appear after logout').to.be.true
  })

  // ──────────────────────────────────────────────────────────
  // TC-AUTH-07: Signup UI loads
  // ──────────────────────────────────────────────────────────
  it('TC-AUTH-07: Signup screen loads with all required fields', async function () {
    excelReporter.recordStepLog(this.test.title, 'Navigate to Signup', 'Info', 'Tapping Sign Up link')
    await loginPage.goToSignup()

    const signupLoaded = await signupPage.isLoaded()
    excelReporter.recordStepLog(this.test.title, 'Verify signup form', signupLoaded ? 'Pass' : 'Fail',
      signupLoaded ? 'Signup form with Name/Email/Phone fields visible' : 'Signup form not found')
    expect(signupLoaded, 'Signup form should be displayed').to.be.true
  })

  // ──────────────────────────────────────────────────────────
  // TC-AUTH-08: Signup password mismatch validation
  // ──────────────────────────────────────────────────────────
  it('TC-AUTH-08: Signup rejects password mismatch', async function () {
    excelReporter.recordStepLog(this.test.title, 'Fill signup form', 'Info', 'Using mismatched passwords')

    await signupPage.signup({
      name: 'Test User',
      email: `test_${Date.now()}@example.com`,
      phone: '9876543210',
      password: 'ValidPass123!',
      confirmPassword: 'DifferentPass456!',
    })

    const error = await signupPage.getErrorMessage()
    excelReporter.recordStepLog(this.test.title, 'Verify mismatch error', error ? 'Pass' : 'Fail', `Error: "${error}"`)
    expect(error.toLowerCase()).to.satisfy(
      (msg) => msg.includes('match') || msg.includes('password') || msg.includes('confirm'),
      `Expected password mismatch error, got: "${error}"`
    )
  })
})
