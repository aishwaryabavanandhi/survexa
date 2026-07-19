import { Builder, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

export async function createDriver(): Promise<WebDriver> {
    const options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--disable-gpu');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--window-size=1920,1080');

    const driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
    
    return driver;
}
