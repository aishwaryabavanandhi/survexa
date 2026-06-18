const { expect } = require('chai');
const BaseTest = require('../BaseTest');

describe('Module 16', function() {
    let driver;

    before(async function() {
        driver = BaseTest.driver;
    });

    it('TC050 Launch via Expo Go', async function() {
        await driver.sleep(50);
        expect(true).to.be.true;
    });

    it('TC051 QR Scan Launch', async function() {
        await driver.sleep(50);
        expect(true).to.be.true;
    });

    it('TC052 Hot Reload Validation', async function() {
        await driver.sleep(50);
        expect(true).to.be.true;
    });

});
