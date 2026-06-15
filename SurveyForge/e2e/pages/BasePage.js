const BrowserUtils = require('../utilities/BrowserUtils');
const envConfig = require('../config/env.config');

class BasePage {
    constructor(driver) {
        this.driver = driver;
        this.utils = new BrowserUtils(driver);
        this.baseUrl = envConfig.baseUrl;
    }

    async navigateTo(path) {
        const url = `${this.baseUrl}${path}`;
        await this.driver.get(url);
    }

    async getTitle() {
        return await this.driver.getTitle();
    }
}

module.exports = BasePage;
