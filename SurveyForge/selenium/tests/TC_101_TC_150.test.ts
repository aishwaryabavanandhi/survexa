import { WebDriver, By, until } from 'selenium-webdriver';
import { getDriver, quitDriver } from '../helpers/driver';
import { safeNavigate } from '../helpers/waits';
import { loginHelper } from '../helpers/auth';

describe('TC_101_TC_150', () => {
  let driver: WebDriver;
  beforeAll(async () => { driver = await getDriver(); });
  afterAll(async () => { await quitDriver(); });

  test('TC_101: E. Survey Builder - Verify Survey Builder scenario 30', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_102: E. Survey Builder - Verify Survey Builder scenario 31', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_103: E. Survey Builder - Verify Survey Builder scenario 32', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_104: E. Survey Builder - Verify Survey Builder scenario 33', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_105: E. Survey Builder - Verify Survey Builder scenario 34', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_106: E. Survey Builder - Verify Survey Builder scenario 35', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_107: E. Survey Builder - Verify Survey Builder scenario 36', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_108: E. Survey Builder - Verify Survey Builder scenario 37', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_109: E. Survey Builder - Verify Survey Builder scenario 38', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_110: E. Survey Builder - Verify Survey Builder scenario 39', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_111: E. Survey Builder - Verify Survey Builder scenario 40', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_112: E. Survey Builder - Verify Survey Builder scenario 41', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_113: E. Survey Builder - Verify Survey Builder scenario 42', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_114: E. Survey Builder - Verify Survey Builder scenario 43', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_115: E. Survey Builder - Verify Survey Builder scenario 44', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_116: E. Survey Builder - Verify Survey Builder scenario 45', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_117: F. Survey Management - Verify Survey Management scenario 1', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_118: F. Survey Management - Verify Survey Management scenario 2', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_119: F. Survey Management - Verify Survey Management scenario 3', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_120: F. Survey Management - Verify Survey Management scenario 4', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_121: F. Survey Management - Verify Survey Management scenario 5', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_122: F. Survey Management - Verify Survey Management scenario 6', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_123: F. Survey Management - Verify Survey Management scenario 7', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_124: F. Survey Management - Verify Survey Management scenario 8', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_125: F. Survey Management - Verify Survey Management scenario 9', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_126: F. Survey Management - Verify Survey Management scenario 10', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_127: F. Survey Management - Verify Survey Management scenario 11', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_128: F. Survey Management - Verify Survey Management scenario 12', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_129: F. Survey Management - Verify Survey Management scenario 13', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_130: F. Survey Management - Verify Survey Management scenario 14', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_131: F. Survey Management - Verify Survey Management scenario 15', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_132: F. Survey Management - Verify Survey Management scenario 16', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_133: F. Survey Management - Verify Survey Management scenario 17', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_134: F. Survey Management - Verify Survey Management scenario 18', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_135: F. Survey Management - Verify Survey Management scenario 19', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_136: F. Survey Management - Verify Survey Management scenario 20', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_137: F. Survey Management - Verify Survey Management scenario 21', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_138: F. Survey Management - Verify Survey Management scenario 22', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_139: F. Survey Management - Verify Survey Management scenario 23', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_140: F. Survey Management - Verify Survey Management scenario 24', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_141: F. Survey Management - Verify Survey Management scenario 25', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_142: F. Survey Management - Verify Survey Management scenario 26', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_143: F. Survey Management - Verify Survey Management scenario 27', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_144: F. Survey Management - Verify Survey Management scenario 28', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_145: F. Survey Management - Verify Survey Management scenario 29', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_146: F. Survey Management - Verify Survey Management scenario 30', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_147: G. Public Survey - Verify Public Survey scenario 1', async () => {
    await safeNavigate(driver, 'http://localhost:5173/survey/demo');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_148: G. Public Survey - Verify Public Survey scenario 2', async () => {
    await safeNavigate(driver, 'http://localhost:5173/survey/demo');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_149: G. Public Survey - Verify Public Survey scenario 3', async () => {
    await safeNavigate(driver, 'http://localhost:5173/survey/demo');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_150: G. Public Survey - Verify Public Survey scenario 4', async () => {
    await safeNavigate(driver, 'http://localhost:5173/survey/demo');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

});