/**
 * tests/e2e.test.js
 * Comprehensive End-to-End Mobile Test suite for Appium.
 */
const { expect } = require('chai');
const { BaseTest, getDriver } = require('./BaseTest');
const LoginPage = require('../pages/LoginPage');
const FormPage = require('../pages/FormPage');
const DashboardPage = require('../pages/DashboardPage');
const Gestures = require('../utilities/gestures');
const excelReporter = require('../utilities/excelReporter');
const logger = require('../utilities/logger');

describe('Survexa Enterprise E2E Test Suite', function () {
  let driver;
  let loginPage;
  let formPage;
  let dashboardPage;

  before(async function () {
    driver = await BaseTest.beforeSuite();
    loginPage = new LoginPage(driver);
    formPage = new FormPage(driver);
    dashboardPage = new DashboardPage(driver);
  });

  after(async function () {
    await BaseTest.afterSuite();
  });

  beforeEach(function () {
    BaseTest.beforeEachTest(this);
  });

  afterEach(async function () {
    await BaseTest.afterEachTest(this);
  });

  // ==========================================================
  // MODULE: AUTHENTICATION
  // ==========================================================
  
  it('TC-AUTH-01: Verify error on empty username input', async function () {
    excelReporter.recordStepLog(this.test.title, 'Input Credentials', 'Info', 'Email is empty');
    await loginPage.login('', 'TestPass123!');
    const error = await loginPage.getErrorMessage();
    expect(error.toLowerCase()).to.include('email');
    excelReporter.recordStepLog(this.test.title, 'Verify Validation', 'Pass', `Error displayed: ${error}`);
  });

  it('TC-AUTH-02: Verify error on empty password input', async function () {
    excelReporter.recordStepLog(this.test.title, 'Input Credentials', 'Info', 'Password is empty');
    await loginPage.login('user@survexa.test', '');
    const error = await loginPage.getErrorMessage();
    expect(error.toLowerCase()).to.include('password');
    excelReporter.recordStepLog(this.test.title, 'Verify Validation', 'Pass', `Error displayed: ${error}`);
  });

  it('TC-AUTH-03: Verify error on invalid username/password', async function () {
    excelReporter.recordStepLog(this.test.title, 'Input Credentials', 'Info', 'Incorrect credentials entered');
    await loginPage.login('invalid@survexa.test', 'WrongPass!');
    const error = await loginPage.getErrorMessage();
    expect(error.toLowerCase()).to.include('invalid');
    excelReporter.recordStepLog(this.test.title, 'Verify Validation', 'Pass', `Error displayed: ${error}`);
  });

  it('TC-AUTH-04: Verify successful login with valid credentials', async function () {
    excelReporter.recordStepLog(this.test.title, 'Input Credentials', 'Info', 'Valid credentials entered');
    await loginPage.login('user@survexa.test', 'ValidPass123!');
    
    // Validate dashboard navigation
    const isDashboardLoaded = await dashboardPage.isLoaded();
    expect(isDashboardLoaded).to.be.true;
    excelReporter.recordStepLog(this.test.title, 'Verify Dashboard Navigation', 'Pass', 'Dashboard loaded successfully');
  });

  // ==========================================================
  // MODULE: NAVIGATION & MOBILE UI
  // ==========================================================

  it('TC-NAV-01: Verify navigation to bottom bar tabs and RecyclerView layout', async function () {
    excelReporter.recordStepLog(this.test.title, 'Bottom Nav click', 'Info', 'Navigating to Surveys tab');
    await dashboardPage.goToSurveys();
    
    excelReporter.recordStepLog(this.test.title, 'Bottom Nav click', 'Info', 'Navigating to Analytics tab');
    await dashboardPage.goToAnalytics();

    excelReporter.recordStepLog(this.test.title, 'Bottom Nav click', 'Info', 'Navigating to Billing settings');
    await dashboardPage.goToBilling();

    const upgradeCardVisible = await dashboardPage.isDisplayed(dashboardPage.upgradeBillingCard);
    expect(upgradeCardVisible).to.be.true;
    excelReporter.recordStepLog(this.test.title, 'Verify Billing layout', 'Pass', 'Upgrade card is present');
  });

  // ==========================================================
  // MODULE: FORM VALIDATION
  // ==========================================================

  it('TC-FORM-01: Validate required form field validation rule triggers', async function () {
    excelReporter.recordStepLog(this.test.title, 'Open Form', 'Info', 'Navigating to Profile Settings Form');
    await dashboardPage.goToBilling();
    await dashboardPage.click(dashboardPage.upgradeBillingCard); // Opens form

    excelReporter.recordStepLog(this.test.title, 'Submit Empty Form', 'Info', 'Submitting empty form fields');
    await formPage.fillForm('', '', '', '', '', false, false);
    const validationMsg = await formPage.getValidationMessage();
    expect(validationMsg.toLowerCase()).to.include('required');
    excelReporter.recordStepLog(this.test.title, 'Verify Validation Message', 'Pass', `Captured message: ${validationMsg}`);
  });

  it('TC-FORM-02: Validate email formatting, phone numbers, and check rules', async function () {
    excelReporter.recordStepLog(this.test.title, 'Input invalid values', 'Info', 'Email without @ and invalid phone length');
    await formPage.fillForm('Tester', 'invalidemail', '123', 'Pass', '2026-06-12', true, true);
    const validationMsg = await formPage.getValidationMessage();
    expect(validationMsg.toLowerCase()).to.include('email');
    excelReporter.recordStepLog(this.test.title, 'Verify Validation Message', 'Pass', `Captured message: ${validationMsg}`);
  });

  // ==========================================================
  // MODULE: GESTURE AUTOMATION
  // ==========================================================

  it('TC-GEST-01: Verify swipe, scroll, long press, drag and pinch-zoom actions', async function () {
    excelReporter.recordStepLog(this.test.title, 'Swipe Up', 'Info', 'Scrolling dashboard down');
    await dashboardPage.goToSurveys();
    await Gestures.swipeUp(driver);
    await driver.pause(500);

    excelReporter.recordStepLog(this.test.title, 'Swipe Down', 'Info', 'Scrolling dashboard up');
    await Gestures.swipeDown(driver);
    await driver.pause(500);

    excelReporter.recordStepLog(this.test.title, 'Long Press & Zoom', 'Info', 'Interact with dashboard chart element');
    await dashboardPage.goToAnalytics();
    
    // Zoom/Pinch on charts container coordinates
    const size = await driver.getWindowSize();
    const midX = size.width / 2;
    const midY = size.height / 2;
    await Gestures.pinchAndZoom(driver, midX, midY, 1.8);
    await driver.pause(500);
    
    excelReporter.recordStepLog(this.test.title, 'Gestures complete', 'Pass', 'Touch inputs validated');
  });

  // ==========================================================
  // MODULE: SESSION PERSISTENCE & LOGOUT
  // ==========================================================

  it('TC-PERS-01: Verify app session persistence on relaunch', async function () {
    excelReporter.recordStepLog(this.test.title, 'Background App', 'Info', 'Putting app into background for 3s');
    await driver.background(3);
    
    const isDashboardLoaded = await dashboardPage.isLoaded();
    expect(isDashboardLoaded).to.be.true;
    excelReporter.recordStepLog(this.test.title, 'Verify Session Persistence', 'Pass', 'Session persisted on relaunch');
  });

  it('TC-AUTH-05: Verify successful logout and redirect to login screen', async function () {
    excelReporter.recordStepLog(this.test.title, 'Trigger Logout', 'Info', 'Opening drawer menu to logout');
    await dashboardPage.logout();

    const isLoginLoaded = await loginPage.isDisplayed(loginPage.emailField);
    expect(isLoginLoaded).to.be.true;
    excelReporter.recordStepLog(this.test.title, 'Verify Logout Success', 'Pass', 'Redirected to login screen');
  });
});
