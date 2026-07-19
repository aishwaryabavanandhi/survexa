import { WebDriver, By, until, WebElement } from 'selenium-webdriver';

export async function waitForElement(driver: WebDriver, testId: string, timeout = 5000): Promise<WebElement> {
    const selector = By.css(`[data-testid="${testId}"]`);
    return await driver.wait(until.elementLocated(selector), timeout);
}

export async function waitForTitleContains(driver: WebDriver, titleText: string, timeout = 5000): Promise<void> {
    await driver.wait(until.titleContains(titleText), timeout);
}
