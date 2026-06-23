import os
import json

base_dir = r'c:\Users\B Aishwarya\OneDrive\Desktop\PDD DOC\SurveyForge\selenium'

os.makedirs(os.path.join(base_dir, 'helpers'), exist_ok=True)
os.makedirs(os.path.join(base_dir, 'tests'), exist_ok=True)
os.makedirs(os.path.join(base_dir, 'reports'), exist_ok=True)

# 1. package.json
package_json = {
  "name": "survexa-selenium",
  "version": "1.0.0",
  "scripts": {
    "test": "jest --runInBand --testTimeout=30000"
  },
  "dependencies": {
    "selenium-webdriver": "^4.19.0",
    "exceljs": "^4.4.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.2",
    "@types/jest": "^29.5.12",
    "@types/selenium-webdriver": "^4.1.22",
    "typescript": "^5.4.5"
  }
}
with open(os.path.join(base_dir, 'package.json'), 'w') as f:
    json.dump(package_json, f, indent=2)

# 2. tsconfig.json
tsconfig_json = {
  "compilerOptions": {
    "target": "es2022",
    "module": "commonjs",
    "strict": True,
    "esModuleInterop": True,
    "skipLibCheck": True,
    "forceConsistentCasingInFileNames": True
  }
}
with open(os.path.join(base_dir, 'tsconfig.json'), 'w') as f:
    json.dump(tsconfig_json, f, indent=2)

# 3. jest.config.ts
jest_config = """export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  setupFilesAfterEnv: [],
};
"""
with open(os.path.join(base_dir, 'jest.config.ts'), 'w') as f:
    f.write(jest_config)

# 4. Helpers
driver_ts = """import { Builder, WebDriver, Browser } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

let driver: WebDriver | null = null;

export const getDriver = async (): Promise<WebDriver> => {
  if (!driver) {
    const options = new chrome.Options();
    options.addArguments('--headless=new');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1920,1080');
    driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();
  }
  return driver;
};

export const quitDriver = async () => {
  if (driver) {
    await driver.quit();
    driver = null;
  }
};
"""
with open(os.path.join(base_dir, 'helpers', 'driver.ts'), 'w') as f:
    f.write(driver_ts)

waits_ts = """import { WebDriver, until, By } from 'selenium-webdriver';

export const waitForElement = async (driver: WebDriver, testId: string, timeout = 5000) => {
  try {
    const el = await driver.wait(until.elementLocated(By.css(`[data-testid="${testId}"]`)), timeout);
    return await driver.wait(until.elementIsVisible(el), timeout);
  } catch (e) {
    // Return a dummy element to prevent hard crash if we want to handle it, but wait, the prompt says "No fake tests"
    // So we let it throw.
    throw e;
  }
};

export const safeNavigate = async (driver: WebDriver, url: string) => {
  await driver.get(url);
  // Add a small sleep just to be safe
  await new Promise(r => setTimeout(r, 1000));
};
"""
with open(os.path.join(base_dir, 'helpers', 'waits.ts'), 'w') as f:
    f.write(waits_ts)

auth_ts = """import { WebDriver } from 'selenium-webdriver';
import { safeNavigate } from './waits';

export const loginHelper = async (driver: WebDriver) => {
  // We navigate to dashboard, set localstorage to mock auth, and reload
  await safeNavigate(driver, 'http://localhost:5173/');
  await driver.executeScript(() => {
    localStorage.setItem('sb-survexa-auth-token', JSON.stringify({ user: { id: 'test-user', email: 'test@example.com' }, access_token: 'fake-token' }));
    localStorage.setItem('user', JSON.stringify({ id: 'test-user', email: 'test@example.com' }));
  });
  await safeNavigate(driver, 'http://localhost:5173/dashboard');
};
"""
with open(os.path.join(base_dir, 'helpers', 'auth.ts'), 'w') as f:
    f.write(auth_ts)

report_ts = """import ExcelJS from 'exceljs';
import path from 'path';

export const generateReport = async (results: any[]) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Selenium Report');
  
  worksheet.columns = [
    { header: 'Test ID', key: 'id', width: 10 },
    { header: 'Test Name', key: 'name', width: 40 },
    { header: 'Module / Category', key: 'module', width: 30 },
    { header: 'Status (PASS/FAIL)', key: 'status', width: 15 },
    { header: 'Error Message', key: 'error', width: 40 },
    { header: 'Duration (ms)', key: 'duration', width: 15 },
    { header: 'Timestamp', key: 'timestamp', width: 25 },
    { header: 'Screenshot Path', key: 'screenshot', width: 30 }
  ];

  results.forEach(res => worksheet.addRow(res));
  
  const reportPath = path.join(__dirname, '../../reports/selenium-report.xlsx');
  await workbook.xlsx.writeFile(reportPath);
  console.log(`Excel report generated at ${reportPath}`);
};
"""
with open(os.path.join(base_dir, 'helpers', 'report.ts'), 'w') as f:
    f.write(report_ts)

print("Generated core selenium structure.")
