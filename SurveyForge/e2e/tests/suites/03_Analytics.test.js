const { expect } = require('chai');
const { By, until } = require('selenium-webdriver');
const BaseTest = require('../BaseTest');

describe('03_Analytics Genuine E2E Validation', function() {
    let driver;
    before(async function() { driver = BaseTest.driver; });

    it('View Analytics Dashboard', async function() {
        await driver.get('http://localhost:5173/analytics');
      const dashboard = await driver.wait(until.elementLocated(By.css('.analytics-dashboard')), 5000).catch(()=>null);
      expect(dashboard).to.be.a('object');
    });

    it('Verify Charts Rendering', async function() {
        await driver.get('http://localhost:5173/analytics');
      const chart = await driver.wait(until.elementLocated(By.css('canvas, svg')), 5000).catch(()=>null);
      expect(chart).to.be.a('object');
    });

});
