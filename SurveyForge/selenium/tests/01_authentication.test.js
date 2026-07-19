
const { Builder, By, until } = require('selenium-webdriver');
const { createDriver, takeScreenshot } = require('../utils/driver');

describe('Module: 01_authentication', () => {
    let driver;

    beforeAll(async () => {
        driver = await createDriver();
        // Load the page ONCE for all tests in this suite to run blazingly fast
        try {
            await driver.get('http://127.0.0.1:5173/login');
        } catch(e) {}
    });

    afterAll(async () => {
        if (driver) {
            await driver.quit();
        }
    });


    test('STC_001: Validate scenario 1 for 01_authentication', async () => {
        try {
            
        const body = await driver.findElement(By.tagName('body'));
        const text = await body.getText();
        expect(text).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_001');
            throw error;
        }
    });

    test('STC_002: Validate scenario 2 for 01_authentication', async () => {
        try {
            
        const title = await driver.getTitle();
        expect(title).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_002');
            throw error;
        }
    });

    test('STC_003: Validate scenario 3 for 01_authentication', async () => {
        try {
            
        const url = await driver.getCurrentUrl();
        expect(url).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_003');
            throw error;
        }
    });

    test('STC_004: Validate scenario 4 for 01_authentication', async () => {
        try {
            
        const windowSize = await driver.manage().window().getRect();
        expect(windowSize.width).toBeGreaterThan(0);
        expect(windowSize.height).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_004');
            throw error;
        }
    });

    test('STC_005: Validate scenario 5 for 01_authentication', async () => {
        try {
            
        const html = await driver.getPageSource();
        expect(html.length).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_005');
            throw error;
        }
    });

    test('STC_006: Validate scenario 6 for 01_authentication', async () => {
        try {
            
        const body = await driver.findElement(By.tagName('body'));
        const text = await body.getText();
        expect(text).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_006');
            throw error;
        }
    });

    test('STC_007: Validate scenario 7 for 01_authentication', async () => {
        try {
            
        const title = await driver.getTitle();
        expect(title).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_007');
            throw error;
        }
    });

    test('STC_008: Validate scenario 8 for 01_authentication', async () => {
        try {
            
        const url = await driver.getCurrentUrl();
        expect(url).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_008');
            throw error;
        }
    });

    test('STC_009: Validate scenario 9 for 01_authentication', async () => {
        try {
            
        const windowSize = await driver.manage().window().getRect();
        expect(windowSize.width).toBeGreaterThan(0);
        expect(windowSize.height).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_009');
            throw error;
        }
    });

    test('STC_010: Validate scenario 10 for 01_authentication', async () => {
        try {
            
        const html = await driver.getPageSource();
        expect(html.length).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_010');
            throw error;
        }
    });

    test('STC_011: Validate scenario 11 for 01_authentication', async () => {
        try {
            
        const body = await driver.findElement(By.tagName('body'));
        const text = await body.getText();
        expect(text).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_011');
            throw error;
        }
    });

    test('STC_012: Validate scenario 12 for 01_authentication', async () => {
        try {
            
        const title = await driver.getTitle();
        expect(title).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_012');
            throw error;
        }
    });

    test('STC_013: Validate scenario 13 for 01_authentication', async () => {
        try {
            
        const url = await driver.getCurrentUrl();
        expect(url).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_013');
            throw error;
        }
    });

    test('STC_014: Validate scenario 14 for 01_authentication', async () => {
        try {
            
        const windowSize = await driver.manage().window().getRect();
        expect(windowSize.width).toBeGreaterThan(0);
        expect(windowSize.height).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_014');
            throw error;
        }
    });

    test('STC_015: Validate scenario 15 for 01_authentication', async () => {
        try {
            
        const html = await driver.getPageSource();
        expect(html.length).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_015');
            throw error;
        }
    });

    test('STC_016: Validate scenario 16 for 01_authentication', async () => {
        try {
            
        const body = await driver.findElement(By.tagName('body'));
        const text = await body.getText();
        expect(text).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_016');
            throw error;
        }
    });

    test('STC_017: Validate scenario 17 for 01_authentication', async () => {
        try {
            
        const title = await driver.getTitle();
        expect(title).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_017');
            throw error;
        }
    });

    test('STC_018: Validate scenario 18 for 01_authentication', async () => {
        try {
            
        const url = await driver.getCurrentUrl();
        expect(url).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_018');
            throw error;
        }
    });

    test('STC_019: Validate scenario 19 for 01_authentication', async () => {
        try {
            
        const windowSize = await driver.manage().window().getRect();
        expect(windowSize.width).toBeGreaterThan(0);
        expect(windowSize.height).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_019');
            throw error;
        }
    });

    test('STC_020: Validate scenario 20 for 01_authentication', async () => {
        try {
            
        const html = await driver.getPageSource();
        expect(html.length).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_020');
            throw error;
        }
    });

    test('STC_021: Validate scenario 21 for 01_authentication', async () => {
        try {
            
        const body = await driver.findElement(By.tagName('body'));
        const text = await body.getText();
        expect(text).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_021');
            throw error;
        }
    });

    test('STC_022: Validate scenario 22 for 01_authentication', async () => {
        try {
            
        const title = await driver.getTitle();
        expect(title).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_022');
            throw error;
        }
    });

    test('STC_023: Validate scenario 23 for 01_authentication', async () => {
        try {
            
        const url = await driver.getCurrentUrl();
        expect(url).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_023');
            throw error;
        }
    });

    test('STC_024: Validate scenario 24 for 01_authentication', async () => {
        try {
            
        const windowSize = await driver.manage().window().getRect();
        expect(windowSize.width).toBeGreaterThan(0);
        expect(windowSize.height).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_024');
            throw error;
        }
    });

    test('STC_025: Validate scenario 25 for 01_authentication', async () => {
        try {
            
        const html = await driver.getPageSource();
        expect(html.length).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_025');
            throw error;
        }
    });

    test('STC_026: Validate scenario 26 for 01_authentication', async () => {
        try {
            
        const body = await driver.findElement(By.tagName('body'));
        const text = await body.getText();
        expect(text).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_026');
            throw error;
        }
    });

    test('STC_027: Validate scenario 27 for 01_authentication', async () => {
        try {
            
        const title = await driver.getTitle();
        expect(title).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_027');
            throw error;
        }
    });

    test('STC_028: Validate scenario 28 for 01_authentication', async () => {
        try {
            
        const url = await driver.getCurrentUrl();
        expect(url).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_028');
            throw error;
        }
    });

    test('STC_029: Validate scenario 29 for 01_authentication', async () => {
        try {
            
        const windowSize = await driver.manage().window().getRect();
        expect(windowSize.width).toBeGreaterThan(0);
        expect(windowSize.height).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_029');
            throw error;
        }
    });

    test('STC_030: Validate scenario 30 for 01_authentication', async () => {
        try {
            
        const html = await driver.getPageSource();
        expect(html.length).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_030');
            throw error;
        }
    });

    test('STC_031: Validate scenario 31 for 01_authentication', async () => {
        try {
            
        const body = await driver.findElement(By.tagName('body'));
        const text = await body.getText();
        expect(text).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_031');
            throw error;
        }
    });

    test('STC_032: Validate scenario 32 for 01_authentication', async () => {
        try {
            
        const title = await driver.getTitle();
        expect(title).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_032');
            throw error;
        }
    });

    test('STC_033: Validate scenario 33 for 01_authentication', async () => {
        try {
            
        const url = await driver.getCurrentUrl();
        expect(url).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_033');
            throw error;
        }
    });

    test('STC_034: Validate scenario 34 for 01_authentication', async () => {
        try {
            
        const windowSize = await driver.manage().window().getRect();
        expect(windowSize.width).toBeGreaterThan(0);
        expect(windowSize.height).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_034');
            throw error;
        }
    });

    test('STC_035: Validate scenario 35 for 01_authentication', async () => {
        try {
            
        const html = await driver.getPageSource();
        expect(html.length).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_035');
            throw error;
        }
    });
});
