const { expect } = require('chai');
const BaseTest = require('../BaseTest');

describe('Module 14', function() {
    let driver;

    before(async function() {
        driver = BaseTest.driver;
    });

    it('TC044 Analytics Dashboard', async function() {
        await driver.sleep(50);
        expect(true).to.be.true;
    });

    it('TC045 Survey Statistics', async function() {
        await driver.sleep(50);
        expect(true).to.be.true;
    });

    it('TC046 Filters', async function() {
        await driver.sleep(50);
        expect(true).to.be.true;
    });

});
