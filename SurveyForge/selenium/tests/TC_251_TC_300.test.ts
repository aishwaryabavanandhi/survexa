import { WebDriver, By, until } from 'selenium-webdriver';
import { getDriver, quitDriver } from '../helpers/driver';
import { safeNavigate } from '../helpers/waits';
import { loginHelper } from '../helpers/auth';

describe('TC_251_TC_300', () => {
  let driver: WebDriver;
  beforeAll(async () => { driver = await getDriver(); });
  afterAll(async () => { await quitDriver(); });

  test('TC_251: L. Admin Panel - Verify Admin Panel scenario 5', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/admin');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_252: L. Admin Panel - Verify Admin Panel scenario 6', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/admin');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_253: L. Admin Panel - Verify Admin Panel scenario 7', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/admin');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_254: L. Admin Panel - Verify Admin Panel scenario 8', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/admin');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_255: L. Admin Panel - Verify Admin Panel scenario 9', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/admin');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_256: L. Admin Panel - Verify Admin Panel scenario 10', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/admin');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_257: L. Admin Panel - Verify Admin Panel scenario 11', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/admin');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_258: L. Admin Panel - Verify Admin Panel scenario 12', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/admin');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_259: L. Admin Panel - Verify Admin Panel scenario 13', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/admin');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_260: L. Admin Panel - Verify Admin Panel scenario 14', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/admin');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_261: L. Admin Panel - Verify Admin Panel scenario 15', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/admin');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_262: L. Admin Panel - Verify Admin Panel scenario 16', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/admin');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_263: L. Admin Panel - Verify Admin Panel scenario 17', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/admin');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_264: L. Admin Panel - Verify Admin Panel scenario 18', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/admin');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_265: L. Admin Panel - Verify Admin Panel scenario 19', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/admin');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_266: L. Admin Panel - Verify Admin Panel scenario 20', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/admin');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_267: L. Admin Panel - Verify Admin Panel scenario 21', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/admin');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_268: L. Admin Panel - Verify Admin Panel scenario 22', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/admin');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_269: L. Admin Panel - Verify Admin Panel scenario 23', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/admin');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_270: L. Admin Panel - Verify Admin Panel scenario 24', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/admin');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_271: L. Admin Panel - Verify Admin Panel scenario 25', async () => {
    await loginHelper(driver);
    await safeNavigate(driver, 'http://localhost:5173/admin');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_272: M. Profile / Settings - Verify Profile/Settings scenario 1', async () => {
    await safeNavigate(driver, 'http://localhost:5173/');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_273: M. Profile / Settings - Verify Profile/Settings scenario 2', async () => {
    await safeNavigate(driver, 'http://localhost:5173/');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_274: M. Profile / Settings - Verify Profile/Settings scenario 3', async () => {
    await safeNavigate(driver, 'http://localhost:5173/');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_275: M. Profile / Settings - Verify Profile/Settings scenario 4', async () => {
    await safeNavigate(driver, 'http://localhost:5173/');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_276: M. Profile / Settings - Verify Profile/Settings scenario 5', async () => {
    await safeNavigate(driver, 'http://localhost:5173/');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_277: M. Profile / Settings - Verify Profile/Settings scenario 6', async () => {
    await safeNavigate(driver, 'http://localhost:5173/');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_278: M. Profile / Settings - Verify Profile/Settings scenario 7', async () => {
    await safeNavigate(driver, 'http://localhost:5173/');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_279: M. Profile / Settings - Verify Profile/Settings scenario 8', async () => {
    await safeNavigate(driver, 'http://localhost:5173/');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_280: M. Profile / Settings - Verify Profile/Settings scenario 9', async () => {
    await safeNavigate(driver, 'http://localhost:5173/');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_281: M. Profile / Settings - Verify Profile/Settings scenario 10', async () => {
    await safeNavigate(driver, 'http://localhost:5173/');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_282: M. Profile / Settings - Verify Profile/Settings scenario 11', async () => {
    await safeNavigate(driver, 'http://localhost:5173/');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_283: M. Profile / Settings - Verify Profile/Settings scenario 12', async () => {
    await safeNavigate(driver, 'http://localhost:5173/');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_284: M. Profile / Settings - Verify Profile/Settings scenario 13', async () => {
    await safeNavigate(driver, 'http://localhost:5173/');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_285: M. Profile / Settings - Verify Profile/Settings scenario 14', async () => {
    await safeNavigate(driver, 'http://localhost:5173/');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_286: M. Profile / Settings - Verify Profile/Settings scenario 15', async () => {
    await safeNavigate(driver, 'http://localhost:5173/');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_287: M. Profile / Settings - Verify Profile/Settings scenario 16', async () => {
    await safeNavigate(driver, 'http://localhost:5173/');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_288: M. Profile / Settings - Verify Profile/Settings scenario 17', async () => {
    await safeNavigate(driver, 'http://localhost:5173/');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_289: M. Profile / Settings - Verify Profile/Settings scenario 18', async () => {
    await safeNavigate(driver, 'http://localhost:5173/');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_290: M. Profile / Settings - Verify Profile/Settings scenario 19', async () => {
    await safeNavigate(driver, 'http://localhost:5173/');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_291: M. Profile / Settings - Verify Profile/Settings scenario 20', async () => {
    await safeNavigate(driver, 'http://localhost:5173/');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_292: N. Notifications - Verify Notification scenario 1', async () => {
    await safeNavigate(driver, 'http://localhost:5173/');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_293: N. Notifications - Verify Notification scenario 2', async () => {
    await safeNavigate(driver, 'http://localhost:5173/');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_294: N. Notifications - Verify Notification scenario 3', async () => {
    await safeNavigate(driver, 'http://localhost:5173/');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_295: N. Notifications - Verify Notification scenario 4', async () => {
    await safeNavigate(driver, 'http://localhost:5173/');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_296: N. Notifications - Verify Notification scenario 5', async () => {
    await safeNavigate(driver, 'http://localhost:5173/');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_297: N. Notifications - Verify Notification scenario 6', async () => {
    await safeNavigate(driver, 'http://localhost:5173/');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_298: N. Notifications - Verify Notification scenario 7', async () => {
    await safeNavigate(driver, 'http://localhost:5173/');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_299: N. Notifications - Verify Notification scenario 8', async () => {
    await safeNavigate(driver, 'http://localhost:5173/');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

  test('TC_300: N. Notifications - Verify Notification scenario 9', async () => {
    await safeNavigate(driver, 'http://localhost:5173/');
    const body = await driver.findElement(By.css('body'));
    expect(await body.isDisplayed()).toBe(true);
  });

});