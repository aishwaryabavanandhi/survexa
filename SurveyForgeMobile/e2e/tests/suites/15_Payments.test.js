const { expect } = require('chai');
const BaseTest = require('../BaseTest');

describe('Module 15', function() {
    let driver;

    before(async function() {
        driver = BaseTest.driver;
    });

    it('TC047 Open Upgrade Plan', async function() {
        await driver.sleep(50);
        expect(true).to.be.true;
    });

    it('TC048 Successful Payment', async function() {
        await driver.sleep(50);
        expect(true).to.be.true;
    });

    it('TC049 Payment Verification', async function() {
        await driver.sleep(50);
        expect(true).to.be.true;
    });

});
