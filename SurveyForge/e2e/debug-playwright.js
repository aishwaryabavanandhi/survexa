const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Log console messages
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  console.log('Navigating to login...');
  await page.goto('http://localhost:5173/login');
  
  // Fill login
  await page.fill('input[name="identifier"]', 'diagnostic.agent.5579@survexa.test');
  await page.fill('input[name="password"]', 'password');
  
  console.log('Clicking login via script (bypassing element interception if any)...');
  await page.evaluate(() => document.querySelector('button[type="submit"]').click());
  
  await page.waitForTimeout(2000);
  
  console.log('Navigating to /discover...');
  await page.goto('http://localhost:5173/discover');
  await page.waitForTimeout(1000);
  
  console.log('Navigating to /admin/billing...');
  await page.goto('http://localhost:5173/admin/billing');
  await page.waitForTimeout(1000);

  await browser.close();
})();
