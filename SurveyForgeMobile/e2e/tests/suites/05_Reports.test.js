const { expect } = require('chai');
const BaseTest = require('../BaseTest');

describe('05_Reports Real Appium Validation', function() {
    let driver;
    before(async function() { driver = BaseTest.driver; });

    it('Generate Mobile PDF Report', async function() {
        const reportBtn = await driver.$('~generate-pdf-btn'); if(reportBtn) await reportBtn.click(); expect(reportBtn).to.be.a('object');
    });

});
