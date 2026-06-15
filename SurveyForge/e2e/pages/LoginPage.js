const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class LoginPage extends BasePage {
    constructor(driver) {
        super(driver);
        // Updating locators as placeholders. Real React IDs or generic attributes.
        this.emailInput = By.css('input[type="email"]');
        this.passwordInput = By.css('input[type="password"]');
        this.submitButton = By.css('button[type="submit"]');
        this.errorMessage = By.css('.text-red-500, .error-message'); 
    }

    async open() {
        await this.navigateTo('/login');
    }

    async login(email, password) {
        if (email) await this.utils.type(this.emailInput, email);
        if (password) await this.utils.type(this.passwordInput, password);
        await this.utils.click(this.submitButton);
    }

    async getErrorMessage() {
        if (await this.utils.isDisplayed(this.errorMessage)) {
            return await this.utils.getText(this.errorMessage);
        }
        return null;
    }
}

module.exports = LoginPage;
