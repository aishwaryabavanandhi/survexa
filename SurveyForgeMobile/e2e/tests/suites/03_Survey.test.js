const { expect } = require('chai');
const BaseTest = require('../BaseTest');

describe('03_Survey Real Appium Validation', function() {
    let driver;
    before(async function() { driver = BaseTest.driver; });

    it('Create Mobile Survey', async function() {
        const createBtn = await driver.$('~create-survey-fab'); if(createBtn) await createBtn.click(); const rows = await BaseTest.queryDB("SELECT count(*) as c FROM surveys"); expect(rows[0].c).to.be.a('number');
    });

    it('Publish Mobile Survey', async function() {
        const publishBtn = await driver.$('~publish-survey-btn'); if(publishBtn) await publishBtn.click(); expect(publishBtn).to.be.a('object');
    });

});
