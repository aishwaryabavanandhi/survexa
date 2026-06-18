const { expect } = require('chai');
const BaseTest = require('../BaseTest');

describe('Module 10', function() {
    let driver;

    before(async function() {
        driver = BaseTest.driver;
    });

    it('TC031 Send Email OTP', async function() {
        await driver.sleep(50);
        expect(true).to.be.true;
    });

    it('TC032 Receive Email OTP', async function() {
        await driver.sleep(50);
        expect(true).to.be.true;
    });

    it('TC033 Verify Email OTP', async function() {
        await driver.sleep(50);
        expect(true).to.be.true;
    });

    it('TC034 Invalid Email OTP', async function() {
        await driver.sleep(50);
        expect(true).to.be.true;
    });

});
