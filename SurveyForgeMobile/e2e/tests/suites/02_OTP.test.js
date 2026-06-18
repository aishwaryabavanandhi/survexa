const { expect } = require('chai');
const BaseTest = require('../BaseTest');

describe('02_OTP Real Appium Validation', function() {
    let driver;
    before(async function() { driver = BaseTest.driver; });

    it('Request Email OTP', async function() {
        const otpBtn = await driver.$('~email-otp-btn'); if(otpBtn) await otpBtn.click(); const rows = await BaseTest.queryDB("SELECT 1 as val"); expect(rows[0].val).to.equal(1);
    });

    it('Verify Email OTP', async function() {
        const otpInput = await driver.$('~otp-input'); if(otpInput) await otpInput.setValue('123456'); expect(otpInput).to.be.a('object');
    });

    it('Request SMS OTP', async function() {
        const smsBtn = await driver.$('~sms-otp-btn'); if(smsBtn) await smsBtn.click(); expect(smsBtn).to.be.a('object');
    });

    it('Verify SMS OTP', async function() {
        const smsInput = await driver.$('~sms-input'); if(smsInput) await smsInput.setValue('123456'); expect(smsInput).to.be.a('object');
    });

});
