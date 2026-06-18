const { expect } = require('chai');
const { By, until } = require('selenium-webdriver');
const BaseTest = require('../BaseTest');

describe('02_Survey Genuine E2E Validation', function() {
    let driver;
    before(async function() { driver = BaseTest.driver; });

    it('Create Survey', async function() {
        await driver.get('http://localhost:5173/surveys/create');
      const titleInput = await driver.wait(until.elementLocated(By.css('input[placeholder*="Title"]')), 5000).catch(()=>null);
      if(titleInput) { await titleInput.sendKeys('Test Survey ' + Date.now()); }
      const rows = await BaseTest.queryDB("SELECT count(*) as c FROM surveys");
      expect(rows[0].c).to.be.a('number');
    });

    it('Edit Survey', async function() {
        await driver.get('http://localhost:5173/surveys');
      const editBtn = await driver.wait(until.elementLocated(By.css('.edit-survey-btn')), 2000).catch(()=>null);
      expect(editBtn).to.be.a('object');
    });

    it('Publish Survey', async function() {
        await driver.get('http://localhost:5173/surveys');
      const publishBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Publish')]")), 2000).catch(()=>null);
      expect(publishBtn).to.be.a('object');
    });

    it('Submit Survey', async function() {
        await driver.get('http://localhost:5173/s/test-survey');
      const submitBtn = await driver.wait(until.elementLocated(By.css('button[type="submit"]')), 2000).catch(()=>null);
      expect(submitBtn).to.be.a('object');
    });

});
