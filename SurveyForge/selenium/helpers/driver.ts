import { Builder, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

let driver: WebDriver | null = null;

export const getDriver = async (): Promise<WebDriver> => {
  if (!driver) {
    const options = new chrome.Options();
    options.addArguments('--headless=new');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--window-size=1280,800');
    options.addArguments('--disable-gpu');

    const builder = new Builder().forBrowser('chrome').setChromeOptions(options);
    if (process.env.SELENIUM_REMOTE_URL) {
      builder.usingServer(process.env.SELENIUM_REMOTE_URL);
    }
    driver = await builder.build();
  }
  return driver;
};

export const quitDriver = async () => {
  if (driver) {
    await driver.quit();
    driver = null;
  }
};
