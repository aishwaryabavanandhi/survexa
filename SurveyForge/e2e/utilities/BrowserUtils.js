const { By, until, Key } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');
const logger = require('./Logger');

class BrowserUtils {
    constructor(driver) {
        this.driver = driver;
        this.defaultTimeout = 10000;
    }

    async waitForElement(locator, timeout = this.defaultTimeout) {
        logger.info(`Waiting for element: ${locator}`);
        return await this.driver.wait(until.elementLocated(locator), timeout);
    }

    async click(locator, timeout = 10000) {
        try {
            const element = await this.waitForElement(locator, timeout);
            await this.driver.wait(until.elementIsVisible(element), timeout);
            await this.driver.wait(until.elementIsEnabled(element), timeout);
            await element.click();
        } catch (error) {
            if (error.name === 'ElementClickInterceptedError') {
                logger.warn(`Click intercepted on ${locator}. Falling back to JS click.`);
                const element = await this.driver.findElement(locator);
                await this.driver.executeScript("arguments[0].click();", element);
            } else {
                throw error;
            }
        }
    }

    async type(locator, text, timeout = this.defaultTimeout) {
        logger.info(`Typing text into element: ${locator}`);
        const element = await this.waitForElement(locator, timeout);
        await this.driver.wait(until.elementIsVisible(element), timeout);
        await element.clear();
        await element.sendKeys(text);
    }

    async getText(locator, timeout = this.defaultTimeout) {
        logger.info(`Getting text from element: ${locator}`);
        const element = await this.waitForElement(locator, timeout);
        return await element.getText();
    }

    async isDisplayed(locator, timeout = 5000) {
        try {
            logger.info(`Checking if element is displayed: ${locator}`);
            const element = await this.waitForElement(locator, timeout);
            return await element.isDisplayed();
        } catch (error) {
            logger.info(`Element is not displayed: ${locator}`);
            return false;
        }
    }

    async executeJS(script, ...args) {
        logger.info(`Executing JS snippet`);
        return await this.driver.executeScript(script, ...args);
    }

    async scrollToElement(locator) {
        logger.info(`Scrolling to element: ${locator}`);
        const element = await this.waitForElement(locator);
        await this.executeJS("arguments[0].scrollIntoView(true);", element);
    }

    async takeScreenshot(testName) {
        const screenshotDir = path.join(__dirname, '../reports/failures');
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
        }
        const safeTestName = testName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filePath = path.join(screenshotDir, `${safeTestName}_${Date.now()}.png`);
        
        try {
            const image = await this.driver.takeScreenshot();
            fs.writeFileSync(filePath, image, 'base64');
            logger.info(`Screenshot saved to ${filePath}`);
            return filePath;
        } catch (error) {
            logger.error(`Failed to take screenshot: ${error.message}`);
            return null;
        }
    }
}

module.exports = BrowserUtils;
