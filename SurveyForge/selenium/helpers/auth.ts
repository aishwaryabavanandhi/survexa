import { WebDriver } from 'selenium-webdriver';
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
