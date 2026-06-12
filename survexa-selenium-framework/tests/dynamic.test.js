const { expect } = require('chai');
const { buildDriver } = require('./baseSetup');
const config = require('../config/selenium.config');
const logger = require('../utilities/logger');
const SeleniumUtils = require('../utilities/seleniumUtils');

// Discoverers
const RouteDiscoverer = require('../utilities/routeDiscoverer');
const FormDiscoverer = require('../utilities/formDiscoverer');

// Page Objects
const LoginPage = require('../pages/loginPage');
const SignupPage = require('../pages/signupPage');

describe('Survexa React Application Dynamic Discovery Test Suite', function() {
  let driver;
  let loginPage;
  let signupPage;
  let testStartTime;
  
  // Discover routes and form schemas statically from codebase
  const discoveredRoutes = RouteDiscoverer.discoverRoutes();
  const validationRules = FormDiscoverer.discoverValidationRules();

  before(async function() {
    driver = await buildDriver();
    loginPage = new LoginPage(driver);
    signupPage = new SignupPage(driver);
  });

  after(async function() {
    if (driver) {
      await driver.quit();
    }
  });

  beforeEach(function() {
    testStartTime = new Date();
    logger.info(`Starting Dynamic Test: ${this.currentTest.title}`);
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
      id: `TC-DYN-${global.executionData.tests.length + 1}`,
      module: 'Dynamic Discovery',
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

    logger.info(`Finished Dynamic Test: ${testName} -> [${status}] (${durationMs}ms)`);
  });

  // ────────────────────────────────────────────────────────
  // DYNAMIC ROUTES VERIFICATION
  // ────────────────────────────────────────────────────────
  describe('Dynamic Route Crawling', function() {
    discoveredRoutes.forEach((route) => {
      // Exclude parameterized routes, wildcard catch-all, and non-URL placeholders like (topbar) or (layout)
      if (!route.path.startsWith('/') || route.path.includes(':') || route.path.includes('*')) {
        return;
      }

      it(`Should verify route loading or redirect behavior for: ${route.label} (${route.path})`, async function() {
        global.logStep(this.test.title, `Navigating directly to route path: ${route.path}`);
        await driver.get(`${config.baseUrl}${route.path}`);
        await SeleniumUtils.waitForSpinnerToDisappear(driver);

        if (route.kind === 'auth' || route.kind === 'public') {
          global.logStep(this.test.title, `Asserting public route loads or redirects properly`);
          try {
            await driver.wait(async () => {
              const url = await driver.getCurrentUrl();
              return !url.includes('/dashboard');
            }, 3000);
          } catch (e) {}
          const loadedUrl = await driver.getCurrentUrl();
          expect(loadedUrl).to.not.contain('/dashboard');
        } else {
          global.logStep(this.test.title, `Asserting protected route redirects unauthenticated user to login`);
          try {
            const { until } = require('selenium-webdriver');
            await driver.wait(until.urlContains('/login'), 5000);
          } catch (e) {}
          const loadedUrl = await driver.getCurrentUrl();
          expect(loadedUrl).to.contain('/login');
        }
        global.logStep(this.test.title, `Route check complete for ${route.label}`, 'SUCCESS');
      });
    });
  });

  // Helper for resilient error message verification
  const assertValidationError = (actual, expected) => {
    expect(actual).to.not.be.null;
    const clean = (val) => String(val || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const a = clean(actual);
    const e = clean(expected);
    
    const isMatched = a.includes(e) || e.includes(a) ||
      (e.includes('required') && a.includes('required')) ||
      (e.includes('email') && a.includes('email')) ||
      (e.includes('password') && (a.includes('characters') || a.includes('pass')));
      
    expect(isMatched, `Expected error "${actual}" to match rule constraint "${expected}"`).to.be.true;
  };

  // ────────────────────────────────────────────────────────
  // DYNAMIC FORM VALIDATION VERIFICATION
  // ────────────────────────────────────────────────────────
  describe('Dynamic Form Boundary Testing', function() {
    
    // Generate tests for Login form rules
    describe('Login Form Rules', function() {
      Object.keys(validationRules.login).forEach((fieldName) => {
        const fieldRules = validationRules.login[fieldName];
        
        fieldRules.rules.forEach((rule) => {
          if (rule.type === 'required') {
            it(`Login form: Validate required boundary for "${fieldName}"`, async function() {
              global.logStep(this.test.title, 'Navigating to Login Page');
              await loginPage.navigate();
              
              global.logStep(this.test.title, `Submitting form with "${fieldName}" empty`);
              if (fieldName === 'identifier' || fieldName === 'email') {
                await loginPage.login('', 'SomePassword123!');
              } else {
                await loginPage.login('test@example.com', '');
              }
              
              const error = await loginPage.getFieldError(fieldName);
              assertValidationError(error, rule.errorMsg);
              global.logStep(this.test.title, `Validation error matched expected: ${rule.errorMsg}`, 'SUCCESS');
            });
          }

          if (rule.type === 'email') {
            it(`Login form: Validate format constraint for email field "${fieldName}"`, async function() {
              global.logStep(this.test.title, 'Navigating to Login Page');
              await loginPage.navigate();
              
              global.logStep(this.test.title, `Entering invalid email format: ${rule.testValue}`);
              await loginPage.login(rule.testValue, 'SomePassword123!');
              
              const error = await loginPage.getFieldError(fieldName);
              assertValidationError(error, rule.errorMsg);
              global.logStep(this.test.title, `Validation error matched expected: ${rule.errorMsg}`, 'SUCCESS');
            });
          }
        });
      });
    });

    // Generate tests for Signup form rules
    describe('Signup Form Rules', function() {
      Object.keys(validationRules.signup).forEach((fieldName) => {
        const fieldRules = validationRules.signup[fieldName];
        
        fieldRules.rules.forEach((rule) => {
          if (rule.type === 'required') {
            it(`Signup form: Validate required boundary for "${fieldName}"`, async function() {
              global.logStep(this.test.title, 'Navigating to Signup Page');
              await signupPage.navigate();
              
              global.logStep(this.test.title, `Submitting form with "${fieldName}" empty`);
              const name = fieldName === 'name' ? '' : 'Jane Doe';
              const email = fieldName === 'email' ? '' : 'jane@example.com';
              const phone = fieldName === 'phone' ? '' : '9876543210';
              const password = fieldName === 'password' ? '' : 'Password123!';
              const confirmPassword = fieldName === 'confirmPassword' ? '' : 'Password123!';
              
              await signupPage.signup(name, email, phone, password, confirmPassword);
              
              const error = await signupPage.getFieldError(fieldName);
              assertValidationError(error, rule.errorMsg);
              global.logStep(this.test.title, `Validation error matched expected: ${rule.errorMsg}`, 'SUCCESS');
            });
          }

          if (rule.type === 'email') {
            it(`Signup form: Validate format constraint for email field "${fieldName}"`, async function() {
              global.logStep(this.test.title, 'Navigating to Signup Page');
              await signupPage.navigate();
              
              global.logStep(this.test.title, `Entering invalid email format: ${rule.testValue}`);
              await signupPage.signup('Jane Doe', rule.testValue, '9876543210', 'Password123!', 'Password123!');
              
              const error = await signupPage.getFieldError(fieldName);
              assertValidationError(error, rule.errorMsg);
              global.logStep(this.test.title, `Validation error matched expected: ${rule.errorMsg}`, 'SUCCESS');
            });
          }

          if (rule.type === 'minLength') {
            it(`Signup form: Validate minimum length of ${rule.length} for "${fieldName}"`, async function() {
              global.logStep(this.test.title, 'Navigating to Signup Page');
              await signupPage.navigate();
              
              global.logStep(this.test.title, `Entering short password: ${rule.testValue}`);
              await signupPage.signup('Jane Doe', 'jane@example.com', '9876543210', rule.testValue, rule.testValue);
              
              const error = await signupPage.getFieldError(fieldName);
              assertValidationError(error, rule.errorMsg);
              global.logStep(this.test.title, `Validation error matched expected: ${rule.errorMsg}`, 'SUCCESS');
            });
          }

          if (rule.type === 'matches') {
            it(`Signup form: Validate password matching constraint on "${fieldName}"`, async function() {
              global.logStep(this.test.title, 'Navigating to Signup Page');
              await signupPage.navigate();
              
              global.logStep(this.test.title, 'Entering mismatched passwords');
              await signupPage.signup('Jane Doe', 'jane@example.com', '9876543210', 'Password123!', rule.testValue);
              
              const error = await signupPage.getFieldError(fieldName);
              assertValidationError(error, rule.errorMsg);
              global.logStep(this.test.title, `Validation error matched expected: ${rule.errorMsg}`, 'SUCCESS');
            });
          }
        });
      });
    });

  });
});
