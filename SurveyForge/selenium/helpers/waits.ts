import { WebDriver, until, By } from 'selenium-webdriver';

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
  
};
