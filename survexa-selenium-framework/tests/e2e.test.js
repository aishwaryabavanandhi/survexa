const { expect } = require('chai');
const { buildDriver } = require('./baseSetup');
const config = require('../config/selenium.config');
const logger = require('../utilities/logger');
const SeleniumUtils = require('../utilities/seleniumUtils');

// Import Page Objects
const LoginPage = require('../pages/loginPage');
const SignupPage = require('../pages/signupPage');
const DashboardPage = require('../pages/dashboardPage');

describe('Survexa React Application E2E Test Suite', function() {
  let driver;
  let loginPage;
  let signupPage;
  let dashboardPage;
  let testStartTime;

  before(async function() {
    driver = await buildDriver();
    loginPage = new LoginPage(driver);
    signupPage = new SignupPage(driver);
    dashboardPage = new DashboardPage(driver);
  });

  after(async function() {
    if (driver) {
      logger.info('Closing WebDriver session');
      await driver.quit();
    }
  });

  beforeEach(function() {
    testStartTime = new Date();
    logger.info(`Starting Test: ${this.currentTest.title}`);
  });

  afterEach(async function() {
    const test = this.currentTest;
    const durationMs = Date.now() - testStartTime;
    const testName = test.title;
    const status = test.state === 'passed' ? 'Passed' : test.state === 'failed' ? 'Failed' : 'Skipped';
    
    let failureReason = '';
    let screenshotPath = '';
    let currentUrl = '';

    if (status === 'Failed') {
      failureReason = test.err ? test.err.message : 'Unknown failure';
      try {
        const failureData = await SeleniumUtils.captureFailureDetails(driver, testName, failureReason);
        screenshotPath = failureData.screenshotPath;
        currentUrl = failureData.currentUrl;
      } catch (err) {
        logger.error(`Failed to capture failure info: ${err.message}`);
      }
    } else {
      try {
        currentUrl = await driver.getCurrentUrl();
      } catch (e) {}
    }

    // Register test result in execution registry
    global.executionData.tests.push({
      id: `TC-${global.executionData.tests.length + 1}`,
      module: 'Authentication & E2E',
      name: testName,
      browser: config.browserName,
      status,
      startTime: testStartTime,
      endTime: new Date(),
      durationMs,
      error: failureReason,
      screenshotPath,
      url: currentUrl
    });

    logger.info(`Finished Test: ${testName} -> [${status}] (${durationMs}ms)`);
  });

  // ────────────────────────────────────────────────────────
  // AUTHENTICATION SCENARIOS
  // ────────────────────────────────────────────────────────
  
  it('Should validate empty username submission', async function() {
    global.logStep(this.test.title, 'Navigating to Login Page');
    await loginPage.navigate();
    
    global.logStep(this.test.title, 'Submitting login form with empty identifier');
    await loginPage.login('', 'Password123!');
    
    global.logStep(this.test.title, 'Retrieving and validating empty username message');
    const error = await loginPage.getFieldError('identifier');
    expect(error).to.equal('Email is required');
    global.logStep(this.test.title, 'Empty username check passed', 'SUCCESS');
  });

  it('Should validate empty password submission', async function() {
    global.logStep(this.test.title, 'Navigating to Login Page');
    await loginPage.navigate();
    
    global.logStep(this.test.title, 'Submitting login form with empty password');
    await loginPage.login('admin@survexa.com', '');
    
    global.logStep(this.test.title, 'Retrieving and validating empty password message');
    const error = await loginPage.getFieldError('password');
    expect(error).to.equal('Password is required');
    global.logStep(this.test.title, 'Empty password check passed', 'SUCCESS');
  });

  it('Should validate invalid credentials error response', async function() {
    global.logStep(this.test.title, 'Navigating to Login Page');
    await loginPage.navigate();
    
    global.logStep(this.test.title, 'Logging in with invalid credentials');
    await loginPage.login('fakeuser@survexa.com', 'WrongPass!');
    
    global.logStep(this.test.title, 'Asserting authentication error toast or banner');
    const authError = await loginPage.getAuthError();
    expect(authError).to.not.be.null;
    global.logStep(this.test.title, `Invalid credentials assertion passed: ${authError}`, 'SUCCESS');
  });

  it('Should login successfully with valid admin credentials', async function() {
    global.logStep(this.test.title, 'Navigating to Login Page');
    await loginPage.navigate();
    
    global.logStep(this.test.title, 'Logging in with seeded admin credentials');
    await loginPage.login('admin@survexa.com', 'Password123!');
    
    global.logStep(this.test.title, 'Waiting for redirect to Dashboard and checking header title');
    const headerTitle = await dashboardPage.getHeaderTitle();
    expect(headerTitle).to.equal('Dashboard');
    global.logStep(this.test.title, 'Admin login successfully verified', 'SUCCESS');
  });

  it('Should verify session persistence across page refreshes', async function() {
    global.logStep(this.test.title, 'Refreshing dashboard page');
    await dashboardPage.refresh();
    
    global.logStep(this.test.title, 'Validating user session is preserved by inspecting dashboard header');
    const headerTitle = await dashboardPage.getHeaderTitle();
    expect(headerTitle).to.equal('Dashboard');
    global.logStep(this.test.title, 'Session persistence verified successfully', 'SUCCESS');
  });

  it('Should navigate through workspace tabs and check routing rules', async function() {
    global.logStep(this.test.title, 'Navigating to My Surveys page');
    await dashboardPage.navigateToTab('surveys');
    
    let currentUrl = await dashboardPage.getUrl();
    expect(currentUrl).to.contain('/surveys');
    
    global.logStep(this.test.title, 'Navigating to AI Generator page');
    await dashboardPage.navigateToTab('ai-generator');
    
    currentUrl = await dashboardPage.getUrl();
    expect(currentUrl).to.contain('/ai-generator');

    global.logStep(this.test.title, 'Testing browser back functionality');
    await dashboardPage.back();
    currentUrl = await dashboardPage.getUrl();
    expect(currentUrl).to.contain('/surveys');

    global.logStep(this.test.title, 'Testing browser forward functionality');
    await dashboardPage.forward();
    currentUrl = await dashboardPage.getUrl();
    expect(currentUrl).to.contain('/ai-generator');
    global.logStep(this.test.title, 'Sidebar navigation and browser history routing verified', 'SUCCESS');
  });

  it('Should log out successfully and prevent access to dashboard', async function() {
    global.logStep(this.test.title, 'Initiating logout');
    await dashboardPage.logout();
    
    const currentUrl = await loginPage.getUrl();
    expect(currentUrl).to.contain('/login');
    
    global.logStep(this.test.title, 'Attempting to bypass login and access /dashboard directly');
    await dashboardPage.navigate('/dashboard');
    
    // Protected route check
    const guardedUrl = await loginPage.getUrl();
    expect(guardedUrl).to.contain('/login');
    global.logStep(this.test.title, 'Session termination and protected route guard verified', 'SUCCESS');
  });
});
