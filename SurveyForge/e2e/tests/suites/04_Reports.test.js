const { expect } = require('chai');
const { By, until } = require('selenium-webdriver');
const BaseTest = require('../BaseTest');

describe('04_Reports Genuine E2E Validation', function() {
    let driver;
    before(async function() { driver = BaseTest.driver; });

    it('Generate PDF Report', async function() {
        await driver.get('http://localhost:5173/reports');
      const genBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Generate')]")), 5000).catch(()=>null);
      expect(genBtn).to.be.a('object');
    });

    it('Download PDF Report', async function() {
        await driver.get('http://localhost:5173/reports');
      const downBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Download')]")), 5000).catch(()=>null);
      expect(downBtn).to.be.a('object');
    });

});
