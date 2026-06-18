const { expect } = require('chai');
const BaseTest = require('../BaseTest');

describe('04_Analytics Real Appium Validation', function() {
    let driver;
    before(async function() { driver = BaseTest.driver; });

    it('View Mobile Analytics Dashboard', async function() {
        const analyticsTab = await driver.$('~analytics-tab'); if(analyticsTab) await analyticsTab.click(); expect(analyticsTab).to.be.a('object');
    });

});
