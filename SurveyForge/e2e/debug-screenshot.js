const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('Navigating to /discover...');
  await page.goto('http://localhost:5173/discover');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'discover.png' });
  console.log('Discover body:', await page.innerText('body'));
  
  console.log('Navigating to /admin/billing...');
  await page.goto('http://localhost:5173/admin/billing');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'billing.png' });
  console.log('Billing body:', await page.innerText('body'));

  await browser.close();
})();
