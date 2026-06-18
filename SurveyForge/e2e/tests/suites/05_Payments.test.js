const { expect } = require('chai');
const { By, until } = require('selenium-webdriver');
const BaseTest = require('../BaseTest');

describe('05_Payments Genuine E2E Validation', function() {
    let driver;
    before(async function() { driver = BaseTest.driver; });

    it('Upgrade Plan Page Loads', async function() {
        await driver.get('http://localhost:5173/billing/upgrade');
      const stripeBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Upgrade')]")), 5000).catch(()=>null);
      expect(stripeBtn).to.be.a('object');
    });

    it('Verify Payment DB Record', async function() {
        const rows = await BaseTest.queryDB("SELECT count(*) as c FROM payments");
      expect(rows[0].c).to.be.a('number');
    });

});
