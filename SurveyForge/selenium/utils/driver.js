const { Builder, Browser } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

async function createDriver() {
  const options = new chrome.Options();
  options.addArguments('--headless=new'); // Use new headless mode
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--window-size=1920,1080');

  const driver = await new Builder()
    .forBrowser(Browser.CHROME)
    .setChromeOptions(options)
    .build();
    
  return driver;
}

async function takeScreenshot(driver, testName) {
  try {
    const reportsDir = path.join(__dirname, '../reports/screenshots');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    const sanitizedName = testName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filePath = path.join(reportsDir, `${sanitizedName}_${Date.now()}.png`);
    const image = await driver.takeScreenshot();
    fs.writeFileSync(filePath, image, 'base64');
    console.log(`Screenshot saved to: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error('Failed to take screenshot:', error);
  }
}

module.exports = { createDriver, takeScreenshot };
