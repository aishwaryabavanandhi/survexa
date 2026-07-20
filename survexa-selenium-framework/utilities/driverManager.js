const { Builder, Browser } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

class DriverManager {
    static async getDriver() {
        const options = new chrome.Options();
        
        // Add headless mode in CI or as default to avoid UI popups if needed
        if (process.env.CI || process.env.HEADLESS) {
            options.addArguments('--headless');
            options.addArguments('--disable-gpu');
            options.addArguments('--no-sandbox');
        }

        const driver = await new Builder()
            .forBrowser(Browser.CHROME)
            .setChromeOptions(options)
            .build();
            
        // Default wait
        await driver.manage().setTimeouts({ implicit: 5000 });
        
        return driver;
    }
}

module.exports = DriverManager;
