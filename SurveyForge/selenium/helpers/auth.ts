import { WebDriver } from 'selenium-webdriver';

export async function loginFast(driver: WebDriver) {
    // Usually used to inject a token via JS to speed up setup
    await driver.executeScript(() => {
        localStorage.setItem('auth_token', 'mock_token_for_tests');
    });
}
