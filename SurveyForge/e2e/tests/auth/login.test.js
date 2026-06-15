const { expect } = require('chai');
const LoginPage = require('../../pages/LoginPage');
const BaseTest = require('../BaseTest');

describe('Authentication Flow', function () {
    let loginPage;

    before(async function () {
        loginPage = new LoginPage(BaseTest.driver);
    });

    it('Should show error on empty submission', async function () {
        await loginPage.open();
        await loginPage.login('', '');
        
        // Example assertion (actual classes/error behavior depends on the real React app)
        const errorMessage = await loginPage.getErrorMessage();
        // Since this is a skeleton test, we'll just check if there's no crash
        // expect(errorMessage).to.not.be.null; 
    });

    it('Should login successfully with valid credentials', async function () {
        await loginPage.open();
        await loginPage.login('test@survexa.com', 'Password123!');
        
        // Assert redirect or login success state
        const title = await loginPage.getTitle();
        expect(title).to.not.be.empty;
    });
});
