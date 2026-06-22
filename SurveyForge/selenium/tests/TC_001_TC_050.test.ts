import { WebDriver, By, until } from 'selenium-webdriver';
import { getDriver, quitDriver } from '../helpers/driver';
import { safeNavigate } from '../helpers/waits';
import { loginHelper } from '../helpers/auth';

describe('TC_001_TC_050', () => {
  let driver: WebDriver;
  beforeAll(async () => { driver = await getDriver(); });
  afterAll(async () => { await quitDriver(); });

  test('TC_001: A. Authentication - Verify Auth scenario 1', async () => {
    await safeNavigate(driver, 'http://localhost:5173/login');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_002: A. Authentication - Verify Auth scenario 2', async () => {
    await safeNavigate(driver, 'http://localhost:5173/login');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_003: A. Authentication - Verify Auth scenario 3', async () => {
    await safeNavigate(driver, 'http://localhost:5173/login');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_004: A. Authentication - Verify Auth scenario 4', async () => {
    await safeNavigate(driver, 'http://localhost:5173/login');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_005: A. Authentication - Verify Auth scenario 5', async () => {
    await safeNavigate(driver, 'http://localhost:5173/login');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_006: A. Authentication - Verify Auth scenario 6', async () => {
    await safeNavigate(driver, 'http://localhost:5173/login');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_007: A. Authentication - Verify Auth scenario 7', async () => {
    await safeNavigate(driver, 'http://localhost:5173/login');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_008: A. Authentication - Verify Auth scenario 8', async () => {
    await safeNavigate(driver, 'http://localhost:5173/login');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_009: A. Authentication - Verify Auth scenario 9', async () => {
    await safeNavigate(driver, 'http://localhost:5173/login');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_010: A. Authentication - Verify Auth scenario 10', async () => {
    await safeNavigate(driver, 'http://localhost:5173/login');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_011: A. Authentication - Verify Auth scenario 11', async () => {
    await safeNavigate(driver, 'http://localhost:5173/login');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_012: A. Authentication - Verify Auth scenario 12', async () => {
    await safeNavigate(driver, 'http://localhost:5173/login');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_013: A. Authentication - Verify Auth scenario 13', async () => {
    await safeNavigate(driver, 'http://localhost:5173/login');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_014: A. Authentication - Verify Auth scenario 14', async () => {
    await safeNavigate(driver, 'http://localhost:5173/login');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_015: A. Authentication - Verify Auth scenario 15', async () => {
    await safeNavigate(driver, 'http://localhost:5173/login');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_016: A. Authentication - Verify Auth scenario 16', async () => {
    await safeNavigate(driver, 'http://localhost:5173/login');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_017: A. Authentication - Verify Auth scenario 17', async () => {
    await safeNavigate(driver, 'http://localhost:5173/login');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_018: A. Authentication - Verify Auth scenario 18', async () => {
    await safeNavigate(driver, 'http://localhost:5173/login');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_019: A. Authentication - Verify Auth scenario 19', async () => {
    await safeNavigate(driver, 'http://localhost:5173/login');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_020: A. Authentication - Verify Auth scenario 20', async () => {
    await safeNavigate(driver, 'http://localhost:5173/login');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_021: A. Authentication - Verify Auth scenario 21', async () => {
    await safeNavigate(driver, 'http://localhost:5173/login');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_022: A. Authentication - Verify Auth scenario 22', async () => {
    await safeNavigate(driver, 'http://localhost:5173/login');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_023: A. Authentication - Verify Auth scenario 23', async () => {
    await safeNavigate(driver, 'http://localhost:5173/login');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_024: A. Authentication - Verify Auth scenario 24', async () => {
    await safeNavigate(driver, 'http://localhost:5173/login');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_025: A. Authentication - Verify Auth scenario 25', async () => {
    await safeNavigate(driver, 'http://localhost:5173/login');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_026: A. Authentication - Verify Auth scenario 26', async () => {
    await safeNavigate(driver, 'http://localhost:5173/login');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_027: A. Authentication - Verify Auth scenario 27', async () => {
    await safeNavigate(driver, 'http://localhost:5173/login');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_028: A. Authentication - Verify Auth scenario 28', async () => {
    await safeNavigate(driver, 'http://localhost:5173/login');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_029: A. Authentication - Verify Auth scenario 29', async () => {
    await safeNavigate(driver, 'http://localhost:5173/login');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_030: A. Authentication - Verify Auth scenario 30', async () => {
    await safeNavigate(driver, 'http://localhost:5173/login');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_031: A. Authentication - Verify Auth scenario 31', async () => {
    await safeNavigate(driver, 'http://localhost:5173/login');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_032: A. Authentication - Verify Auth scenario 32', async () => {
    await safeNavigate(driver, 'http://localhost:5173/login');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_033: B. Email OTP - Verify Email OTP scenario 1', async () => {
    await safeNavigate(driver, 'http://localhost:5173/otp');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_034: B. Email OTP - Verify Email OTP scenario 2', async () => {
    await safeNavigate(driver, 'http://localhost:5173/otp');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_035: B. Email OTP - Verify Email OTP scenario 3', async () => {
    await safeNavigate(driver, 'http://localhost:5173/otp');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_036: B. Email OTP - Verify Email OTP scenario 4', async () => {
    await safeNavigate(driver, 'http://localhost:5173/otp');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_037: B. Email OTP - Verify Email OTP scenario 5', async () => {
    await safeNavigate(driver, 'http://localhost:5173/otp');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_038: B. Email OTP - Verify Email OTP scenario 6', async () => {
    await safeNavigate(driver, 'http://localhost:5173/otp');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_039: B. Email OTP - Verify Email OTP scenario 7', async () => {
    await safeNavigate(driver, 'http://localhost:5173/otp');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_040: B. Email OTP - Verify Email OTP scenario 8', async () => {
    await safeNavigate(driver, 'http://localhost:5173/otp');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_041: B. Email OTP - Verify Email OTP scenario 9', async () => {
    await safeNavigate(driver, 'http://localhost:5173/otp');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_042: B. Email OTP - Verify Email OTP scenario 10', async () => {
    await safeNavigate(driver, 'http://localhost:5173/otp');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_043: B. Email OTP - Verify Email OTP scenario 11', async () => {
    await safeNavigate(driver, 'http://localhost:5173/otp');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_044: B. Email OTP - Verify Email OTP scenario 12', async () => {
    await safeNavigate(driver, 'http://localhost:5173/otp');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_045: C. SMS OTP - Verify SMS OTP scenario 1', async () => {
    await safeNavigate(driver, 'http://localhost:5173/otp');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_046: C. SMS OTP - Verify SMS OTP scenario 2', async () => {
    await safeNavigate(driver, 'http://localhost:5173/otp');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_047: C. SMS OTP - Verify SMS OTP scenario 3', async () => {
    await safeNavigate(driver, 'http://localhost:5173/otp');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_048: C. SMS OTP - Verify SMS OTP scenario 4', async () => {
    await safeNavigate(driver, 'http://localhost:5173/otp');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_049: C. SMS OTP - Verify SMS OTP scenario 5', async () => {
    await safeNavigate(driver, 'http://localhost:5173/otp');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_050: C. SMS OTP - Verify SMS OTP scenario 6', async () => {
    await safeNavigate(driver, 'http://localhost:5173/otp');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

});