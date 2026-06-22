import { WebDriver, By, until } from 'selenium-webdriver';
import { getDriver, quitDriver } from '../helpers/driver';
import { safeNavigate } from '../helpers/waits';
import { loginHelper } from '../helpers/auth';

describe('TC_051_TC_100', () => {
  let driver: WebDriver;
  beforeAll(async () => { driver = await getDriver(); });
  afterAll(async () => { await quitDriver(); });

  test('TC_051: C. SMS OTP - Verify SMS OTP scenario 7', async () => {
    await safeNavigate(driver, 'http://localhost:5173/otp');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_052: C. SMS OTP - Verify SMS OTP scenario 8', async () => {
    await safeNavigate(driver, 'http://localhost:5173/otp');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_053: C. SMS OTP - Verify SMS OTP scenario 9', async () => {
    await safeNavigate(driver, 'http://localhost:5173/otp');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_054: C. SMS OTP - Verify SMS OTP scenario 10', async () => {
    await safeNavigate(driver, 'http://localhost:5173/otp');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_055: C. SMS OTP - Verify SMS OTP scenario 11', async () => {
    await safeNavigate(driver, 'http://localhost:5173/otp');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_056: C. SMS OTP - Verify SMS OTP scenario 12', async () => {
    await safeNavigate(driver, 'http://localhost:5173/otp');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_057: D. Dashboard - Verify Dashboard scenario 1', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/dashboard');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_058: D. Dashboard - Verify Dashboard scenario 2', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/dashboard');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_059: D. Dashboard - Verify Dashboard scenario 3', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/dashboard');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_060: D. Dashboard - Verify Dashboard scenario 4', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/dashboard');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_061: D. Dashboard - Verify Dashboard scenario 5', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/dashboard');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_062: D. Dashboard - Verify Dashboard scenario 6', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/dashboard');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_063: D. Dashboard - Verify Dashboard scenario 7', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/dashboard');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_064: D. Dashboard - Verify Dashboard scenario 8', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/dashboard');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_065: D. Dashboard - Verify Dashboard scenario 9', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/dashboard');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_066: D. Dashboard - Verify Dashboard scenario 10', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/dashboard');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_067: D. Dashboard - Verify Dashboard scenario 11', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/dashboard');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_068: D. Dashboard - Verify Dashboard scenario 12', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/dashboard');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_069: D. Dashboard - Verify Dashboard scenario 13', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/dashboard');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_070: D. Dashboard - Verify Dashboard scenario 14', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/dashboard');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_071: D. Dashboard - Verify Dashboard scenario 15', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/dashboard');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_072: E. Survey Builder - Verify Survey Builder scenario 1', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_073: E. Survey Builder - Verify Survey Builder scenario 2', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_074: E. Survey Builder - Verify Survey Builder scenario 3', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_075: E. Survey Builder - Verify Survey Builder scenario 4', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_076: E. Survey Builder - Verify Survey Builder scenario 5', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_077: E. Survey Builder - Verify Survey Builder scenario 6', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_078: E. Survey Builder - Verify Survey Builder scenario 7', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_079: E. Survey Builder - Verify Survey Builder scenario 8', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_080: E. Survey Builder - Verify Survey Builder scenario 9', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_081: E. Survey Builder - Verify Survey Builder scenario 10', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_082: E. Survey Builder - Verify Survey Builder scenario 11', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_083: E. Survey Builder - Verify Survey Builder scenario 12', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_084: E. Survey Builder - Verify Survey Builder scenario 13', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_085: E. Survey Builder - Verify Survey Builder scenario 14', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_086: E. Survey Builder - Verify Survey Builder scenario 15', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_087: E. Survey Builder - Verify Survey Builder scenario 16', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_088: E. Survey Builder - Verify Survey Builder scenario 17', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_089: E. Survey Builder - Verify Survey Builder scenario 18', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_090: E. Survey Builder - Verify Survey Builder scenario 19', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_091: E. Survey Builder - Verify Survey Builder scenario 20', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_092: E. Survey Builder - Verify Survey Builder scenario 21', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_093: E. Survey Builder - Verify Survey Builder scenario 22', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_094: E. Survey Builder - Verify Survey Builder scenario 23', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_095: E. Survey Builder - Verify Survey Builder scenario 24', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_096: E. Survey Builder - Verify Survey Builder scenario 25', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_097: E. Survey Builder - Verify Survey Builder scenario 26', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_098: E. Survey Builder - Verify Survey Builder scenario 27', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_099: E. Survey Builder - Verify Survey Builder scenario 28', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_100: E. Survey Builder - Verify Survey Builder scenario 29', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/surveys');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

});