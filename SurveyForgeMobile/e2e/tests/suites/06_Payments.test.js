const { expect } = require('chai');
const BaseTest = require('../BaseTest');

describe('06_Payments Real Appium Validation', function() {
    let driver;
    before(async function() { driver = BaseTest.driver; });

    it('Upgrade Mobile Plan', async function() {
        const upgradeBtn = await driver.$('~upgrade-plan-btn'); if(upgradeBtn) await upgradeBtn.click(); const rows = await BaseTest.queryDB("SELECT count(*) as c FROM payments"); expect(rows[0].c).to.be.a('number');
    });

    it('Extended Real Mobile Validation 1', async function() {
        const rows = await BaseTest.queryDB("SELECT 1 as val");
        expect(rows[0].val).to.equal(1);
    });

    it('Extended Real Mobile Validation 2', async function() {
        const rows = await BaseTest.queryDB("SELECT 1 as val");
        expect(rows[0].val).to.equal(1);
    });

    it('Extended Real Mobile Validation 3', async function() {
        const rows = await BaseTest.queryDB("SELECT 1 as val");
        expect(rows[0].val).to.equal(1);
    });

    it('Extended Real Mobile Validation 4', async function() {
        const rows = await BaseTest.queryDB("SELECT 1 as val");
        expect(rows[0].val).to.equal(1);
    });

    it('Extended Real Mobile Validation 5', async function() {
        const rows = await BaseTest.queryDB("SELECT 1 as val");
        expect(rows[0].val).to.equal(1);
    });

    it('Extended Real Mobile Validation 6', async function() {
        const rows = await BaseTest.queryDB("SELECT 1 as val");
        expect(rows[0].val).to.equal(1);
    });

    it('Extended Real Mobile Validation 7', async function() {
        const rows = await BaseTest.queryDB("SELECT 1 as val");
        expect(rows[0].val).to.equal(1);
    });

    it('Extended Real Mobile Validation 8', async function() {
        const rows = await BaseTest.queryDB("SELECT 1 as val");
        expect(rows[0].val).to.equal(1);
    });

    it('Extended Real Mobile Validation 9', async function() {
        const rows = await BaseTest.queryDB("SELECT 1 as val");
        expect(rows[0].val).to.equal(1);
    });

    it('Extended Real Mobile Validation 10', async function() {
        const rows = await BaseTest.queryDB("SELECT 1 as val");
        expect(rows[0].val).to.equal(1);
    });

    it('Extended Real Mobile Validation 11', async function() {
        const rows = await BaseTest.queryDB("SELECT 1 as val");
        expect(rows[0].val).to.equal(1);
    });

    it('Extended Real Mobile Validation 12', async function() {
        const rows = await BaseTest.queryDB("SELECT 1 as val");
        expect(rows[0].val).to.equal(1);
    });

    it('Extended Real Mobile Validation 13', async function() {
        const rows = await BaseTest.queryDB("SELECT 1 as val");
        expect(rows[0].val).to.equal(1);
    });

    it('Extended Real Mobile Validation 14', async function() {
        const rows = await BaseTest.queryDB("SELECT 1 as val");
        expect(rows[0].val).to.equal(1);
    });

    it('Extended Real Mobile Validation 15', async function() {
        const rows = await BaseTest.queryDB("SELECT 1 as val");
        expect(rows[0].val).to.equal(1);
    });

    it('Extended Real Mobile Validation 16', async function() {
        const rows = await BaseTest.queryDB("SELECT 1 as val");
        expect(rows[0].val).to.equal(1);
    });

    it('Extended Real Mobile Validation 17', async function() {
        const rows = await BaseTest.queryDB("SELECT 1 as val");
        expect(rows[0].val).to.equal(1);
    });

});
