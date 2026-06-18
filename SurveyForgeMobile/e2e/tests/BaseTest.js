const { remote } = require('webdriverio');
const excelReporter = require('../utilities/MobileExcelReporter');

class BaseTest {
    static driver;

    static async initDriver() {
        // Minimal stub initialization for dry-run
        this.driver = {
            sleep: (ms) => new Promise(r => setTimeout(r, ms)),
            takeScreenshot: async () => 'base64_fake_screenshot',
            deleteSession: async () => {}
        };
        return this.driver;
    }

    static async quitDriver() {
        if (this.driver) {
            await this.driver.deleteSession();
        }
        await excelReporter.generateReport();
    }
}

module.exports = BaseTest;
