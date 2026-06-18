const { test, expect } = require('@playwright/test');

test.describe('Survexa OTP Verification Flow', () => {
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPhone = `9876543${Math.floor(100 + Math.random() * 900)}`;
  const backendUrl = 'http://localhost:5000';

  test('should complete signup and verify email OTP', async ({ page }) => {
    // 1. Navigate to Signup
    await page.goto('http://localhost:5173/signup');
    
    // 2. Fill form
    await page.fill('input[name="name"]', 'Automation Tester');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="phone"]', testPhone);
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    
    // 3. Submit
    await page.click('button[type="submit"]');
    
    // 4. Verify redirect to OTP page
    await expect(page).toHaveURL(/.*\/otp/);
    
    // Wait for the "Code expires in" timer to appear
    await expect(page.locator('text=Code expires in')).toBeVisible();

    // 5. Test Incorrect OTP
    const inputs = page.locator('input[inputmode="numeric"]');
    for (let i = 0; i < 6; i++) {
      await inputs.nth(i).fill('0');
    }
    await expect(page.locator('text=Invalid OTP')).toBeVisible();

    // 6. Test Resend OTP
    await page.click('button:has-text("Resend OTP")');
    await expect(page.locator('text=New OTP sent')).toBeVisible();

    // 7. Get the latest OTP from backend test-helper
    const response = await page.request.get(`${backendUrl}/api/auth/test-helper/latest-otps?email=${testEmail}`);
    const data = await response.json();
    const latestOtp = data.emailOtp;
    expect(latestOtp).toBeTruthy();

    // 8. Enter correct OTP
    const digits = latestOtp.split('');
    for (let i = 0; i < 6; i++) {
      await inputs.nth(i).fill(digits[i]);
    }

    // 9. Verify success redirect (to phone verification)
    await expect(page).toHaveURL(/.*\/verify-phone/);
  });
});
