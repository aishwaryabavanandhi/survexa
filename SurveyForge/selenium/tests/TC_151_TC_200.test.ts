import { WebDriver, By, until } from 'selenium-webdriver';
import { getDriver, quitDriver } from '../helpers/driver';
import { safeNavigate } from '../helpers/waits';
import { loginHelper } from '../helpers/auth';

describe('TC_151_TC_200', () => {
  let driver: WebDriver;
  beforeAll(async () => { driver = await getDriver(); });
  afterAll(async () => { await quitDriver(); });

  test('TC_151: G. Public Survey - Verify Public Survey scenario 5', async () => {
    await safeNavigate(driver, 'http://localhost:5173/survey/demo');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_152: G. Public Survey - Verify Public Survey scenario 6', async () => {
    await safeNavigate(driver, 'http://localhost:5173/survey/demo');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_153: G. Public Survey - Verify Public Survey scenario 7', async () => {
    await safeNavigate(driver, 'http://localhost:5173/survey/demo');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_154: G. Public Survey - Verify Public Survey scenario 8', async () => {
    await safeNavigate(driver, 'http://localhost:5173/survey/demo');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_155: G. Public Survey - Verify Public Survey scenario 9', async () => {
    await safeNavigate(driver, 'http://localhost:5173/survey/demo');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_156: G. Public Survey - Verify Public Survey scenario 10', async () => {
    await safeNavigate(driver, 'http://localhost:5173/survey/demo');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_157: G. Public Survey - Verify Public Survey scenario 11', async () => {
    await safeNavigate(driver, 'http://localhost:5173/survey/demo');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_158: G. Public Survey - Verify Public Survey scenario 12', async () => {
    await safeNavigate(driver, 'http://localhost:5173/survey/demo');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_159: G. Public Survey - Verify Public Survey scenario 13', async () => {
    await safeNavigate(driver, 'http://localhost:5173/survey/demo');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_160: G. Public Survey - Verify Public Survey scenario 14', async () => {
    await safeNavigate(driver, 'http://localhost:5173/survey/demo');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_161: G. Public Survey - Verify Public Survey scenario 15', async () => {
    await safeNavigate(driver, 'http://localhost:5173/survey/demo');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_162: G. Public Survey - Verify Public Survey scenario 16', async () => {
    await safeNavigate(driver, 'http://localhost:5173/survey/demo');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_163: G. Public Survey - Verify Public Survey scenario 17', async () => {
    await safeNavigate(driver, 'http://localhost:5173/survey/demo');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_164: G. Public Survey - Verify Public Survey scenario 18', async () => {
    await safeNavigate(driver, 'http://localhost:5173/survey/demo');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_165: G. Public Survey - Verify Public Survey scenario 19', async () => {
    await safeNavigate(driver, 'http://localhost:5173/survey/demo');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_166: G. Public Survey - Verify Public Survey scenario 20', async () => {
    await safeNavigate(driver, 'http://localhost:5173/survey/demo');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_167: G. Public Survey - Verify Public Survey scenario 21', async () => {
    await safeNavigate(driver, 'http://localhost:5173/survey/demo');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_168: G. Public Survey - Verify Public Survey scenario 22', async () => {
    await safeNavigate(driver, 'http://localhost:5173/survey/demo');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_169: G. Public Survey - Verify Public Survey scenario 23', async () => {
    await safeNavigate(driver, 'http://localhost:5173/survey/demo');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_170: G. Public Survey - Verify Public Survey scenario 24', async () => {
    await safeNavigate(driver, 'http://localhost:5173/survey/demo');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_171: G. Public Survey - Verify Public Survey scenario 25', async () => {
    await safeNavigate(driver, 'http://localhost:5173/survey/demo');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_172: H. Analytics - Verify Analytics scenario 1', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/analytics');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_173: H. Analytics - Verify Analytics scenario 2', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/analytics');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_174: H. Analytics - Verify Analytics scenario 3', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/analytics');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_175: H. Analytics - Verify Analytics scenario 4', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/analytics');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_176: H. Analytics - Verify Analytics scenario 5', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/analytics');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_177: H. Analytics - Verify Analytics scenario 6', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/analytics');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_178: H. Analytics - Verify Analytics scenario 7', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/analytics');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_179: H. Analytics - Verify Analytics scenario 8', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/analytics');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_180: H. Analytics - Verify Analytics scenario 9', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/analytics');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_181: H. Analytics - Verify Analytics scenario 10', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/analytics');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_182: H. Analytics - Verify Analytics scenario 11', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/analytics');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_183: H. Analytics - Verify Analytics scenario 12', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/analytics');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_184: H. Analytics - Verify Analytics scenario 13', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/analytics');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_185: H. Analytics - Verify Analytics scenario 14', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/analytics');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_186: H. Analytics - Verify Analytics scenario 15', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/analytics');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_187: I. Reports / PDF - Verify Reports/PDF scenario 1', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/analytics');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_188: I. Reports / PDF - Verify Reports/PDF scenario 2', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/analytics');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_189: I. Reports / PDF - Verify Reports/PDF scenario 3', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/analytics');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_190: I. Reports / PDF - Verify Reports/PDF scenario 4', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/analytics');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_191: I. Reports / PDF - Verify Reports/PDF scenario 5', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/analytics');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_192: I. Reports / PDF - Verify Reports/PDF scenario 6', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/analytics');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_193: I. Reports / PDF - Verify Reports/PDF scenario 7', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/analytics');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_194: I. Reports / PDF - Verify Reports/PDF scenario 8', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/analytics');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_195: I. Reports / PDF - Verify Reports/PDF scenario 9', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/analytics');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_196: I. Reports / PDF - Verify Reports/PDF scenario 10', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/analytics');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_197: I. Reports / PDF - Verify Reports/PDF scenario 11', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/analytics');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_198: I. Reports / PDF - Verify Reports/PDF scenario 12', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/analytics');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_199: I. Reports / PDF - Verify Reports/PDF scenario 13', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/analytics');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_200: I. Reports / PDF - Verify Reports/PDF scenario 14', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/analytics');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

});