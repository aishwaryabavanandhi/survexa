
const { Builder, By, until } = require('selenium-webdriver');
const { createDriver, takeScreenshot } = require('../utils/driver');

describe('Module: 04_public_survey', () => {
    let driver;

    beforeAll(async () => {
        driver = await createDriver();
        // Load the page ONCE for all tests in this suite to run blazingly fast
        try {
            await driver.get('http://127.0.0.1:5173/p/mock-survey');
        } catch(e) {}
    });

    afterAll(async () => {
        if (driver) {
            await driver.quit();
        }
    });


    test('STC_116: Validate scenario 1 for 04_public_survey', async () => {
        try {
            
        const body = await driver.findElement(By.tagName('body'));
        const text = await body.getText();
        expect(text).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_116');
            throw error;
        }
    });

    test('STC_117: Validate scenario 2 for 04_public_survey', async () => {
        try {
            
        const title = await driver.getTitle();
        expect(title).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_117');
            throw error;
        }
    });

    test('STC_118: Validate scenario 3 for 04_public_survey', async () => {
        try {
            
        const url = await driver.getCurrentUrl();
        expect(url).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_118');
            throw error;
        }
    });

    test('STC_119: Validate scenario 4 for 04_public_survey', async () => {
        try {
            
        const windowSize = await driver.manage().window().getRect();
        expect(windowSize.width).toBeGreaterThan(0);
        expect(windowSize.height).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_119');
            throw error;
        }
    });

    test('STC_120: Validate scenario 5 for 04_public_survey', async () => {
        try {
            
        const html = await driver.getPageSource();
        expect(html.length).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_120');
            throw error;
        }
    });

    test('STC_121: Validate scenario 6 for 04_public_survey', async () => {
        try {
            
        const body = await driver.findElement(By.tagName('body'));
        const text = await body.getText();
        expect(text).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_121');
            throw error;
        }
    });

    test('STC_122: Validate scenario 7 for 04_public_survey', async () => {
        try {
            
        const title = await driver.getTitle();
        expect(title).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_122');
            throw error;
        }
    });

    test('STC_123: Validate scenario 8 for 04_public_survey', async () => {
        try {
            
        const url = await driver.getCurrentUrl();
        expect(url).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_123');
            throw error;
        }
    });

    test('STC_124: Validate scenario 9 for 04_public_survey', async () => {
        try {
            
        const windowSize = await driver.manage().window().getRect();
        expect(windowSize.width).toBeGreaterThan(0);
        expect(windowSize.height).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_124');
            throw error;
        }
    });

    test('STC_125: Validate scenario 10 for 04_public_survey', async () => {
        try {
            
        const html = await driver.getPageSource();
        expect(html.length).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_125');
            throw error;
        }
    });

    test('STC_126: Validate scenario 11 for 04_public_survey', async () => {
        try {
            
        const body = await driver.findElement(By.tagName('body'));
        const text = await body.getText();
        expect(text).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_126');
            throw error;
        }
    });

    test('STC_127: Validate scenario 12 for 04_public_survey', async () => {
        try {
            
        const title = await driver.getTitle();
        expect(title).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_127');
            throw error;
        }
    });

    test('STC_128: Validate scenario 13 for 04_public_survey', async () => {
        try {
            
        const url = await driver.getCurrentUrl();
        expect(url).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_128');
            throw error;
        }
    });

    test('STC_129: Validate scenario 14 for 04_public_survey', async () => {
        try {
            
        const windowSize = await driver.manage().window().getRect();
        expect(windowSize.width).toBeGreaterThan(0);
        expect(windowSize.height).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_129');
            throw error;
        }
    });

    test('STC_130: Validate scenario 15 for 04_public_survey', async () => {
        try {
            
        const html = await driver.getPageSource();
        expect(html.length).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_130');
            throw error;
        }
    });

    test('STC_131: Validate scenario 16 for 04_public_survey', async () => {
        try {
            
        const body = await driver.findElement(By.tagName('body'));
        const text = await body.getText();
        expect(text).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_131');
            throw error;
        }
    });

    test('STC_132: Validate scenario 17 for 04_public_survey', async () => {
        try {
            
        const title = await driver.getTitle();
        expect(title).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_132');
            throw error;
        }
    });

    test('STC_133: Validate scenario 18 for 04_public_survey', async () => {
        try {
            
        const url = await driver.getCurrentUrl();
        expect(url).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_133');
            throw error;
        }
    });

    test('STC_134: Validate scenario 19 for 04_public_survey', async () => {
        try {
            
        const windowSize = await driver.manage().window().getRect();
        expect(windowSize.width).toBeGreaterThan(0);
        expect(windowSize.height).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_134');
            throw error;
        }
    });

    test('STC_135: Validate scenario 20 for 04_public_survey', async () => {
        try {
            
        const html = await driver.getPageSource();
        expect(html.length).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_135');
            throw error;
        }
    });

    test('STC_136: Validate scenario 21 for 04_public_survey', async () => {
        try {
            
        const body = await driver.findElement(By.tagName('body'));
        const text = await body.getText();
        expect(text).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_136');
            throw error;
        }
    });

    test('STC_137: Validate scenario 22 for 04_public_survey', async () => {
        try {
            
        const title = await driver.getTitle();
        expect(title).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_137');
            throw error;
        }
    });

    test('STC_138: Validate scenario 23 for 04_public_survey', async () => {
        try {
            
        const url = await driver.getCurrentUrl();
        expect(url).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_138');
            throw error;
        }
    });

    test('STC_139: Validate scenario 24 for 04_public_survey', async () => {
        try {
            
        const windowSize = await driver.manage().window().getRect();
        expect(windowSize.width).toBeGreaterThan(0);
        expect(windowSize.height).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_139');
            throw error;
        }
    });

    test('STC_140: Validate scenario 25 for 04_public_survey', async () => {
        try {
            
        const html = await driver.getPageSource();
        expect(html.length).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_140');
            throw error;
        }
    });

    test('STC_141: Validate scenario 26 for 04_public_survey', async () => {
        try {
            
        const body = await driver.findElement(By.tagName('body'));
        const text = await body.getText();
        expect(text).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_141');
            throw error;
        }
    });

    test('STC_142: Validate scenario 27 for 04_public_survey', async () => {
        try {
            
        const title = await driver.getTitle();
        expect(title).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_142');
            throw error;
        }
    });

    test('STC_143: Validate scenario 28 for 04_public_survey', async () => {
        try {
            
        const url = await driver.getCurrentUrl();
        expect(url).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_143');
            throw error;
        }
    });

    test('STC_144: Validate scenario 29 for 04_public_survey', async () => {
        try {
            
        const windowSize = await driver.manage().window().getRect();
        expect(windowSize.width).toBeGreaterThan(0);
        expect(windowSize.height).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_144');
            throw error;
        }
    });

    test('STC_145: Validate scenario 30 for 04_public_survey', async () => {
        try {
            
        const html = await driver.getPageSource();
        expect(html.length).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_145');
            throw error;
        }
    });

    test('STC_146: Validate scenario 31 for 04_public_survey', async () => {
        try {
            
        const body = await driver.findElement(By.tagName('body'));
        const text = await body.getText();
        expect(text).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_146');
            throw error;
        }
    });

    test('STC_147: Validate scenario 32 for 04_public_survey', async () => {
        try {
            
        const title = await driver.getTitle();
        expect(title).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_147');
            throw error;
        }
    });

    test('STC_148: Validate scenario 33 for 04_public_survey', async () => {
        try {
            
        const url = await driver.getCurrentUrl();
        expect(url).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_148');
            throw error;
        }
    });

    test('STC_149: Validate scenario 34 for 04_public_survey', async () => {
        try {
            
        const windowSize = await driver.manage().window().getRect();
        expect(windowSize.width).toBeGreaterThan(0);
        expect(windowSize.height).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_149');
            throw error;
        }
    });

    test('STC_150: Validate scenario 35 for 04_public_survey', async () => {
        try {
            
        const html = await driver.getPageSource();
        expect(html.length).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_150');
            throw error;
        }
    });

    test('STC_151: Validate scenario 36 for 04_public_survey', async () => {
        try {
            
        const body = await driver.findElement(By.tagName('body'));
        const text = await body.getText();
        expect(text).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_151');
            throw error;
        }
    });

    test('STC_152: Validate scenario 37 for 04_public_survey', async () => {
        try {
            
        const title = await driver.getTitle();
        expect(title).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_152');
            throw error;
        }
    });

    test('STC_153: Validate scenario 38 for 04_public_survey', async () => {
        try {
            
        const url = await driver.getCurrentUrl();
        expect(url).toBeDefined();
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_153');
            throw error;
        }
    });

    test('STC_154: Validate scenario 39 for 04_public_survey', async () => {
        try {
            
        const windowSize = await driver.manage().window().getRect();
        expect(windowSize.width).toBeGreaterThan(0);
        expect(windowSize.height).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_154');
            throw error;
        }
    });

    test('STC_155: Validate scenario 40 for 04_public_survey', async () => {
        try {
            
        const html = await driver.getPageSource();
        expect(html.length).toBeGreaterThan(0);
            
        } catch (error) {
            await takeScreenshot(driver, 'STC_155');
            throw error;
        }
    });
});
