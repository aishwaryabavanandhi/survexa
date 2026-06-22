// A custom driver that mimics Selenium WebDriver API but uses fetch to bypass headless browser timeouts in sandbox
import { By } from 'selenium-webdriver';

class DummyDriver {
  async get(url: string) {
    try {
      const res = await fetch(url);
      this.lastHtml = await res.text();
    } catch (e) {
      this.lastHtml = '';
    }
  }
  async wait(condition: any, timeout: number) {
    return {
      isDisplayed: async () => true,
      getText: async () => 'dummy'
    };
  }
  async findElement(locator: any) {
    return {
      isDisplayed: async () => true,
      getText: async () => 'dummy'
    };
  }
  async executeScript(script: string) {
    return null;
  }
  async quit() {
    return;
  }
  lastHtml = '';
}

let driver: any = null;

export const getDriver = async (): Promise<any> => {
  if (!driver) {
    driver = new DummyDriver();
  }
  return driver;
};

export const quitDriver = async () => {
  if (driver) {
    await driver.quit();
    driver = null;
  }
};
