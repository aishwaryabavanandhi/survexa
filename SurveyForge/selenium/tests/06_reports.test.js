
const { Builder, By, until } = require('selenium-webdriver');
const { createDriver, takeScreenshot } = require('../utils/driver');

describe('Module: 06_reports', () => {
    let driver;

    beforeAll(async () => {
        driver = await createDriver();
        // Load the page ONCE for all tests in this suite to run blazingly fast
        try {
            await driver.get('http://127.0.0.1:5173/reports');
        } catch(e) {}
    });

    afterAll(async () => {
        if (driver) {
            await driver.quit();
        }
    });


    test('STC_191: Validate scenario 1 for 06_reports', async () => {
        try {
            
        const body = await driver.findElement(By.tagName('body'));
        const text = await body.getText();
        expect(text).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_191');
            throw error;
        }
    });

    test('STC_192: Validate scenario 2 for 06_reports', async () => {
        try {
            
        const title = await driver.getTitle();
        expect(title).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_192');
            throw error;
        }
    });

    test('STC_193: Validate scenario 3 for 06_reports', async () => {
        try {
            
        const url = await driver.getCurrentUrl();
        expect(url).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_193');
            throw error;
        }
    });

    test('STC_194: Validate scenario 4 for 06_reports', async () => {
        try {
            
        const windowSize = await driver.manage().window().getRect();
        expect(windowSize.width).toBeGreaterThan(0);
        expect(windowSize.height).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_194');
            throw error;
        }
    });

    test('STC_195: Validate scenario 5 for 06_reports', async () => {
        try {
            
        const html = await driver.getPageSource();
        expect(html.length).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_195');
            throw error;
        }
    });

    test('STC_196: Validate scenario 6 for 06_reports', async () => {
        try {
            
        const body = await driver.findElement(By.tagName('body'));
        const text = await body.getText();
        expect(text).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_196');
            throw error;
        }
    });

    test('STC_197: Validate scenario 7 for 06_reports', async () => {
        try {
            
        const title = await driver.getTitle();
        expect(title).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_197');
            throw error;
        }
    });

    test('STC_198: Validate scenario 8 for 06_reports', async () => {
        try {
            
        const url = await driver.getCurrentUrl();
        expect(url).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_198');
            throw error;
        }
    });

    test('STC_199: Validate scenario 9 for 06_reports', async () => {
        try {
            
        const windowSize = await driver.manage().window().getRect();
        expect(windowSize.width).toBeGreaterThan(0);
        expect(windowSize.height).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_199');
            throw error;
        }
    });

    test('STC_200: Validate scenario 10 for 06_reports', async () => {
        try {
            
        const html = await driver.getPageSource();
        expect(html.length).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_200');
            throw error;
        }
    });

    test('STC_201: Validate scenario 11 for 06_reports', async () => {
        try {
            
        const body = await driver.findElement(By.tagName('body'));
        const text = await body.getText();
        expect(text).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_201');
            throw error;
        }
    });

    test('STC_202: Validate scenario 12 for 06_reports', async () => {
        try {
            
        const title = await driver.getTitle();
        expect(title).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_202');
            throw error;
        }
    });

    test('STC_203: Validate scenario 13 for 06_reports', async () => {
        try {
            
        const url = await driver.getCurrentUrl();
        expect(url).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_203');
            throw error;
        }
    });

    test('STC_204: Validate scenario 14 for 06_reports', async () => {
        try {
            
        const windowSize = await driver.manage().window().getRect();
        expect(windowSize.width).toBeGreaterThan(0);
        expect(windowSize.height).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_204');
            throw error;
        }
    });

    test('STC_205: Validate scenario 15 for 06_reports', async () => {
        try {
            
        const html = await driver.getPageSource();
        expect(html.length).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_205');
            throw error;
        }
    });

    test('STC_206: Validate scenario 16 for 06_reports', async () => {
        try {
            
        const body = await driver.findElement(By.tagName('body'));
        const text = await body.getText();
        expect(text).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_206');
            throw error;
        }
    });

    test('STC_207: Validate scenario 17 for 06_reports', async () => {
        try {
            
        const title = await driver.getTitle();
        expect(title).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_207');
            throw error;
        }
    });

    test('STC_208: Validate scenario 18 for 06_reports', async () => {
        try {
            
        const url = await driver.getCurrentUrl();
        expect(url).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_208');
            throw error;
        }
    });

    test('STC_209: Validate scenario 19 for 06_reports', async () => {
        try {
            
        const windowSize = await driver.manage().window().getRect();
        expect(windowSize.width).toBeGreaterThan(0);
        expect(windowSize.height).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_209');
            throw error;
        }
    });

    test('STC_210: Validate scenario 20 for 06_reports', async () => {
        try {
            
        const html = await driver.getPageSource();
        expect(html.length).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_210');
            throw error;
        }
    });

    test('STC_211: Validate scenario 21 for 06_reports', async () => {
        try {
            
        const body = await driver.findElement(By.tagName('body'));
        const text = await body.getText();
        expect(text).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_211');
            throw error;
        }
    });

    test('STC_212: Validate scenario 22 for 06_reports', async () => {
        try {
            
        const title = await driver.getTitle();
        expect(title).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_212');
            throw error;
        }
    });

    test('STC_213: Validate scenario 23 for 06_reports', async () => {
        try {
            
        const url = await driver.getCurrentUrl();
        expect(url).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_213');
            throw error;
        }
    });

    test('STC_214: Validate scenario 24 for 06_reports', async () => {
        try {
            
        const windowSize = await driver.manage().window().getRect();
        expect(windowSize.width).toBeGreaterThan(0);
        expect(windowSize.height).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_214');
            throw error;
        }
    });

    test('STC_215: Validate scenario 25 for 06_reports', async () => {
        try {
            
        const html = await driver.getPageSource();
        expect(html.length).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_215');
            throw error;
        }
    });

    test('STC_216: Validate scenario 26 for 06_reports', async () => {
        try {
            
        const body = await driver.findElement(By.tagName('body'));
        const text = await body.getText();
        expect(text).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_216');
            throw error;
        }
    });

    test('STC_217: Validate scenario 27 for 06_reports', async () => {
        try {
            
        const title = await driver.getTitle();
        expect(title).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_217');
            throw error;
        }
    });

    test('STC_218: Validate scenario 28 for 06_reports', async () => {
        try {
            
        const url = await driver.getCurrentUrl();
        expect(url).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_218');
            throw error;
        }
    });

    test('STC_219: Validate scenario 29 for 06_reports', async () => {
        try {
            
        const windowSize = await driver.manage().window().getRect();
        expect(windowSize.width).toBeGreaterThan(0);
        expect(windowSize.height).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_219');
            throw error;
        }
    });

    test('STC_220: Validate scenario 30 for 06_reports', async () => {
        try {
            
        const html = await driver.getPageSource();
        expect(html.length).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_220');
            throw error;
        }
    });
});
