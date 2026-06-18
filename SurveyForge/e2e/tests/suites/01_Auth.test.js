const { expect } = require('chai');
const { By, until } = require('selenium-webdriver');
const BaseTest = require('../BaseTest');

describe('01_Auth Genuine E2E Validation', function() {
    let driver;
    before(async function() { driver = BaseTest.driver; });

    it('Login with valid credentials', async function() {
        await driver.get('http://localhost:5173/login');
      await driver.wait(until.elementLocated(By.name('identifier')), 5000);
      await driver.findElement(By.name('identifier')).sendKeys('admin@survexa.com');
      await driver.findElement(By.name('password')).sendKeys('admin123');
      await driver.findElement(By.css('button[type="submit"]')).click();
      await driver.wait(until.urlContains('/dashboard'), 10000);
      const url = await driver.getCurrentUrl();
      expect(url).to.include('/dashboard');
    });

    it('Signup new user', async function() {
        await driver.get('http://localhost:5173/signup');
      await driver.wait(until.elementLocated(By.name('email')), 5000);
      const uniqueEmail = 'test' + Date.now() + '@example.com';
      await driver.findElement(By.name('email')).sendKeys(uniqueEmail);
      await driver.findElement(By.name('password')).sendKeys('Password123!');
      await driver.findElement(By.name('name')).sendKeys('Test User');
      await driver.findElement(By.css('button[type="submit"]')).click();
      await driver.sleep(2000);
      const rows = await BaseTest.queryDB("SELECT * FROM users WHERE email = ?", [uniqueEmail]);
      expect(rows.length).to.equal(1);
    });

    it('Logout', async function() {
        await driver.get('http://localhost:5173/dashboard');
      const logoutBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Logout')]")), 5000).catch(() => null);
      if (logoutBtn) { await logoutBtn.click(); await driver.wait(until.urlContains('/login'), 5000); }
      const url = await driver.getCurrentUrl();
      expect(url).to.include('/login');
    });

    it('Forgot Password', async function() {
        await driver.get('http://localhost:5173/forgot-password');
      await driver.wait(until.elementLocated(By.name('email')), 5000);
      await driver.findElement(By.name('email')).sendKeys('admin@survexa.com');
      await driver.findElement(By.css('button[type="submit"]')).click();
      const toast = await driver.wait(until.elementLocated(By.css('.go3958317564')), 5000).catch(()=>null);
      expect(toast).to.not.be.null;
    });

});
