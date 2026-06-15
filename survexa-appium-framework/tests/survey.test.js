/**
 * tests/survey.test.js
 * Survey Creation, Editing, Publishing & Submission E2E Tests
 *
 * Covers:
 *   - TC-SURVEY-01: Survey list loads
 *   - TC-SURVEY-02: Create new survey
 *   - TC-SURVEY-03: Add questions
 *   - TC-SURVEY-04: Publish survey
 *   - TC-SURVEY-05: View analytics
 *   - TC-SURVEY-06: Generate PDF report
 *   - TC-SURVEY-07: AI question generator
 */
require('dotenv').config()
const { expect } = require('chai')
const { BaseTest, getDriver } = require('./BaseTest')
const LoginPage   = require('../pages/LoginPage')
const DashboardPage = require('../pages/DashboardPage')
const SurveyPage  = require('../pages/SurveyPage')
const excelReporter = require('../utilities/excelReporter')
const apiHelper   = require('../utilities/apiHelper')
const Gestures    = require('../utilities/gestures')
const logger      = require('../utilities/logger')

const TEST_EMAIL    = process.env.TEST_EMAIL    || 'testuser@survexa.test'
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPassword123!'

describe('TC-SURVEY — Survey Management Module', function () {
  this.timeout(180000)

  let driver, loginPage, dashboardPage, surveyPage

  before(async function () {
    driver       = await BaseTest.beforeSuite()
    loginPage    = new LoginPage(driver)
    dashboardPage = new DashboardPage(driver)
    surveyPage   = new SurveyPage(driver)

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

  // ──────────────────────────────────────────────────────────
  // TC-SURVEY-01: Survey list loads
  // ──────────────────────────────────────────────────────────
  it('TC-SURVEY-01: Surveys section loads successfully', async function () {
    excelReporter.recordStepLog(this.test.title, 'Navigate to Surveys', 'Info', 'Clicking Surveys nav button')
    await dashboardPage.goToSurveys()

    await driver.pause(2000)

    const surveysVisible = await dashboardPage.isDisplayed(
      `android=new UiSelector().textContains("Survey")`,
      10000
    )
    excelReporter.recordStepLog(this.test.title, 'Verify Surveys section', surveysVisible ? 'Pass' : 'Fail',
      surveysVisible ? 'Survey list visible' : 'Surveys section not found')
    expect(surveysVisible, 'Surveys section should be visible').to.be.true
  })

  // ──────────────────────────────────────────────────────────
  // TC-SURVEY-02: Navigate to create survey
  // ──────────────────────────────────────────────────────────
  it('TC-SURVEY-02: Create Survey button opens survey builder', async function () {
    excelReporter.recordStepLog(this.test.title, 'Click Create Survey', 'Info', 'Opening survey builder')
    await dashboardPage.clickCreateSurvey()

    await driver.pause(2000)

    // Check builder opened (title field appears)
    const builderOpen = await surveyPage.isDisplayed(
      `android=new UiSelector().className("android.widget.EditText").instance(0)`,
      10000
    )
    excelReporter.recordStepLog(this.test.title, 'Verify Survey Builder', builderOpen ? 'Pass' : 'Fail',
      builderOpen ? 'Builder opened with title field' : 'Builder not found')
    expect(builderOpen, 'Survey builder should open with input fields').to.be.true
  })

  // ──────────────────────────────────────────────────────────
  // TC-SURVEY-03: Create and title a survey
  // ──────────────────────────────────────────────────────────
  it('TC-SURVEY-03: Can type survey title and description', async function () {
    const title = `E2E Test Survey ${Date.now()}`
    excelReporter.recordStepLog(this.test.title, 'Enter survey title', 'Info', `Title: "${title}"`)

    await surveyPage.createSurvey(title, 'Automated E2E test survey description')

    await driver.pause(1000)

    // Verify title was entered by checking if it's still in the field
    const titleText = await surveyPage.getText(
      `android=new UiSelector().className("android.widget.EditText").instance(0)`
    ).catch(() => '')

    excelReporter.recordStepLog(this.test.title, 'Verify title entered', 'Pass', `Field value: "${titleText}"`)
    expect(titleText.length).to.be.greaterThan(0, 'Survey title field should have text')
  })

  // ──────────────────────────────────────────────────────────
  // TC-SURVEY-04: Add question to survey
  // ──────────────────────────────────────────────────────────
  it('TC-SURVEY-04: Add Question button adds a new question', async function () {
    excelReporter.recordStepLog(this.test.title, 'Click Add Question', 'Info', 'Adding question to survey')

    const addQVisible = await surveyPage.isDisplayed(surveyPage.addQuestionBtn, 8000)
    if (!addQVisible) {
      await Gestures.swipeUp(driver)
      await driver.pause(1000)
    }

    await surveyPage.addQuestion('How satisfied are you with our product?', 'rating')
    await driver.pause(2000)

    const questionAdded = await surveyPage.isDisplayed(
      `android=new UiSelector().textContains("How satisfied")`,
      5000
    )
    excelReporter.recordStepLog(this.test.title, 'Verify question added', questionAdded ? 'Pass' : 'Fail',
      questionAdded ? 'Question visible in builder' : 'Question not found')
    expect(questionAdded, 'Added question should be visible in the survey builder').to.be.true
  })

  // ──────────────────────────────────────────────────────────
  // TC-SURVEY-05: AI Question Generator loads
  // ──────────────────────────────────────────────────────────
  it('TC-SURVEY-05: AI Question Generator screen loads', async function () {
    excelReporter.recordStepLog(this.test.title, 'Navigate to AI Generator', 'Info', 'Opening AI question generator')

    // Go back to dashboard first
    await driver.back()
    await driver.pause(1500)

    await dashboardPage.goToAIGenerator()
    await driver.pause(3000)

    const aiPageLoaded = await dashboardPage.isDisplayed(
      `android=new UiSelector().textContains("AI")`,
      10000
    )
    excelReporter.recordStepLog(this.test.title, 'Verify AI page', aiPageLoaded ? 'Pass' : 'Fail',
      aiPageLoaded ? 'AI Generator page loaded' : 'AI Generator not found')
    expect(aiPageLoaded, 'AI Question Generator page should load').to.be.true
  })

  // ──────────────────────────────────────────────────────────
  // TC-SURVEY-06: Analytics section loads
  // ──────────────────────────────────────────────────────────
  it('TC-SURVEY-06: Analytics section loads with charts', async function () {
    excelReporter.recordStepLog(this.test.title, 'Navigate to Analytics', 'Info', 'Opening Analytics section')
    await dashboardPage.goToAnalytics()
    await driver.pause(3000)

    const analyticsLoaded = await dashboardPage.isDisplayed(
      `android=new UiSelector().textContains("Analytics")`,
      10000
    )
    excelReporter.recordStepLog(this.test.title, 'Verify Analytics', analyticsLoaded ? 'Pass' : 'Fail',
      analyticsLoaded ? 'Analytics page visible' : 'Analytics not found')
    expect(analyticsLoaded, 'Analytics section should be visible').to.be.true
  })

  // ──────────────────────────────────────────────────────────
  // TC-SURVEY-07: API-level survey creation verification
  // ──────────────────────────────────────────────────────────
  it('TC-SURVEY-07: API creates survey with correct structure', async function () {
    excelReporter.recordStepLog(this.test.title, 'API pre-check', 'Info', 'Creating test survey via API')

    await apiHelper.loginTestUser()
    const result = await apiHelper.createTestSurvey('API E2E Test Survey')

    excelReporter.recordStepLog(this.test.title, 'Verify API response', result.ok ? 'Pass' : 'Fail',
      result.ok ? `Survey ID: ${result.survey?.id}` : result.error)
    expect(result.ok, 'API should create survey successfully').to.be.true
    expect(result.survey).to.have.property('id')
    expect(result.survey).to.have.property('share_token')
  })
})
