const { remote } = require('webdriverio');

const capabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:app': 'C:/Users/B Aishwarya/OneDrive/Desktop/PDD DOC/SurveyForgeMobile/android/app/build/outputs/apk/debug/app-debug.apk',
  'appium:appPackage': 'com.surveyforgemobile',
  'appium:appActivity': '.MainActivity',
};

const wdOpts = {
  hostname: '127.0.0.1',
  port: 4723,
  logLevel: 'info',
  capabilities,
};

async function runTest() {
  const driver = await remote(wdOpts);
  
  try {
    console.log('Appium Session Started');

    // Wait for the app to load and find the Get Started or Login button
    const getStartedBtn = await driver.$('~Get Started');
    await getStartedBtn.waitForDisplayed({ timeout: 10000 });
    await getStartedBtn.click();

    // Fill in Mobile Number
    const phoneInput = await driver.$('~Phone Number Input');
    await phoneInput.waitForDisplayed({ timeout: 5000 });
    await phoneInput.setValue('9876543210');

    // Click Login/Send OTP
    const sendOtpBtn = await driver.$('~Send OTP Button');
    await sendOtpBtn.click();

    // Verify OTP Input fields appear
    const otpInput = await driver.$('~OTP Input 1');
    await otpInput.waitForDisplayed({ timeout: 5000 });

    // Try Incorrect OTP
    for (let i = 1; i <= 6; i++) {
        const input = await driver.$(`~OTP Input ${i}`);
        await input.setValue('0');
    }
    
    // Wait for error
    const errorMessage = await driver.$('~OTP Error Message');
    await errorMessage.waitForDisplayed({ timeout: 5000 });
    console.log('Verified Incorrect OTP Error');

    // Click Resend
    const resendBtn = await driver.$('~Resend OTP Button');
    await resendBtn.click();
    console.log('Clicked Resend OTP');

    // Enter correct OTP
    // For automation, we assume dev mode where 123456 or a backend fetched code works.
    for (let i = 1; i <= 6; i++) {
        const input = await driver.$(`~OTP Input ${i}`);
        await input.setValue(i.toString()); // E.g., 123456
    }
    
    // Verify Dashboard loads
    const dashboardTitle = await driver.$('~Dashboard Title');
    await dashboardTitle.waitForDisplayed({ timeout: 10000 });
    console.log('Mobile OTP Verification Successful');

  } finally {
    await driver.deleteSession();
  }
}

runTest().catch(console.error);
