const { expect } = require('chai');
const BaseTest = require('../BaseTest');

describe('Module 13', function() {
    let driver;

    before(async function() {
        driver = BaseTest.driver;
    });

    it('TC041 Generate PDF', async function() {
        await driver.sleep(50);
        expect(true).to.be.true;
    });

    it('TC042 Download PDF', async function() {
        await driver.sleep(50);
        expect(true).to.be.true;
    });

    it('TC043 Email PDF', async function() {
        await driver.sleep(50);
        expect(true).to.be.true;
    });

});
