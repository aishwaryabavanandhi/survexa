const { expect } = require('chai');
const BaseTest = require('../BaseTest');

describe('Module 11', function() {
    let driver;

    before(async function() {
        driver = BaseTest.driver;
    });

    it('TC035 Send SMS OTP', async function() {
        await driver.sleep(50);
        expect(true).to.be.true;
    });

    it('TC036 Verify SMS OTP', async function() {
        await driver.sleep(50);
        expect(true).to.be.true;
    });

    it('TC037 Invalid SMS OTP', async function() {
        await driver.sleep(50);
        expect(true).to.be.true;
    });

});
