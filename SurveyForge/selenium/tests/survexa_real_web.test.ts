import { WebDriver } from 'selenium-webdriver';
import { getDriver, quitDriver } from '../helpers/driver';

const suites = [
  require('../suites/auth.suite.js'),
  require('../suites/dashboard.suite.js'),
  require('../suites/survey.suite.js'),
  require('../suites/public_survey.suite.js'),
  require('../suites/analytics.suite.js'),
  require('../suites/reports.suite.js'),
  require('../suites/billing.suite.js'),
  require('../suites/admin.suite.js'),
  require('../suites/profile.suite.js'),
  require('../suites/settings.suite.js')
];

const assertHelper = {
  ok: (val: any, msg?: string) => {
    if (!val) {
      throw new Error(msg || 'Assertion failed: expected value to be truthy');
    }
  },
  includes: (str: string, substr: string, msg?: string) => {
    if (!str || typeof str !== 'string' || !str.includes(substr)) {
      throw new Error(msg || `Assertion failed: expected "${str}" to include "${substr}"`);
    }
  },
  equal: (a: any, b: any, msg?: string) => {
    if (a !== b) {
      throw new Error(msg || `Assertion failed: expected "${a}" to equal "${b}"`);
    }
  }
};

describe('Real Survexa Web Automation Suite (350 Tests)', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    jest.setTimeout(30000);
    driver = await getDriver();
  }, 30000);

  afterAll(async () => {
    await quitDriver();
  }, 15000);

  for (const suite of suites) {
    for (const testCase of suite) {
      test(`${testCase.id}: ${testCase.scenario}`, async () => {
        const logHelper = (msg: string) => {};
        try {
          const res = await testCase.run(driver, assertHelper, logHelper);
          expect(res.status).toBe('PASS');
        } catch (err: any) {
          throw new Error(`[${testCase.module}] ${testCase.scenario} failed: ${err.message || err}`);
        }
      }, 20000);
    }
  }
});
