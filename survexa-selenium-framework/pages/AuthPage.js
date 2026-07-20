const { By, until } = require('selenium-webdriver');

class AuthPage {
    constructor(driver) {
        this.driver = driver;
        this.url = 'http://localhost:5173/login'; // default Vite port
    }

    async navigate() {
        await this.driver.get(this.url);
    }

    async login(email, password) {
        // Wait until email input is present
        const emailInput = await this.driver.wait(until.elementLocated(By.css('input[type="email"]')), 10000);
        await emailInput.sendKeys(email);
        
        const passwordInput = await this.driver.findElement(By.css('input[type="password"]'));
        await passwordInput.sendKeys(password);
        
        const submitBtn = await this.driver.findElement(By.css('button[type="submit"]'));
        await submitBtn.click();
    }
}

module.exports = AuthPage;
