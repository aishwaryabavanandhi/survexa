const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const edge = require('selenium-webdriver/edge');
const firefox = require('selenium-webdriver/firefox');
const envConfig = require('../config/env.config');
const excelReporter = require('../utilities/ExcelReporter');
const logger = require('../utilities/Logger');

class BaseTest {
    static driver;

    static async initDriver() {
        logger.info(`Initializing ${envConfig.browser} driver...`);
        let builder = new Builder().forBrowser(envConfig.browser);

        if (envConfig.browser.toLowerCase() === 'chrome') {
            let options = new chrome.Options();
            if (envConfig.headless) {
                options.addArguments('--headless', '--disable-gpu', '--window-size=1920,1080');
            }
            builder.setChromeOptions(options);
        } else if (envConfig.browser.toLowerCase() === 'edge') {
            let options = new edge.Options();
            if (envConfig.headless) {
                options.addArguments('--headless');
            }
            builder.setEdgeOptions(options);
        } else if (envConfig.browser.toLowerCase() === 'firefox') {
            let options = new firefox.Options();
            if (envConfig.headless) {
                options.addArguments('-headless');
            }
            builder.setFirefoxOptions(options);
        }

        this.driver = await builder.build();
        this.driver.manage().setTimeouts({ implicit: 5000 });
        this.driver.manage().window().maximize();
        return this.driver;
    }

    static async quitDriver() {
        if (this.driver) {
            await this.driver.quit();
        }
        await excelReporter.generateReport(process.env.ENV || 'QA', envConfig.browser);
    }
}

module.exports = BaseTest;
