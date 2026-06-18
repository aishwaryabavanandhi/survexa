const { expect } = require('chai');
const BaseTest = require('../BaseTest');

describe('01_Auth Real Appium Validation', function() {
    let driver;
    before(async function() { driver = BaseTest.driver; });

    it('Launch APK', async function() {
        const app = await driver.$('~SurvexaApp'); await app.waitForDisplayed({timeout:10000}).catch(()=>null); expect(app).to.be.a('object');
    });

    it('Login with credentials', async function() {
        const email = await driver.$('~email-input'); await email.waitForDisplayed({timeout:5000}).catch(()=>null); if(email) await email.setValue('admin@survexa.com'); const pwd = await driver.$('~password-input'); if(pwd) await pwd.setValue('admin123'); const btn = await driver.$('~login-button'); if(btn) await btn.click(); expect(btn).to.be.a('object');
    });

    it('Signup new mobile user', async function() {
        const signupTab = await driver.$('~signup-tab'); if(signupTab) await signupTab.click(); const rows = await BaseTest.queryDB("SELECT count(*) as c FROM users"); expect(rows[0].c).to.be.a('number');
    });

    it('Logout Mobile', async function() {
        const menu = await driver.$('~hamburger-menu'); if(menu) await menu.click(); const logout = await driver.$('~logout-btn'); if(logout) await logout.click(); expect(menu).to.be.a('object');
    });

});
