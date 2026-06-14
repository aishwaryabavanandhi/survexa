# 📱 Survexa Enterprise Appium E2E Framework

**Version:** 2.0.0 | **Stack:** Appium 2.x + WebdriverIO + Mocha + Chai + ExcelJS

---

## 📐 Architecture

```
survexa-appium-framework/
├── config/
│   └── appium.config.js       # Appium 2.x WebdriverIO config (real + emulator)
├── drivers/
│   └── DriverFactory.js       # Session lifecycle, screenshots, logcat
├── pages/                     # Page Object Model (POM)
│   ├── BasePage.js            # Base class with common element methods
│   ├── SplashPage.js          # Splash/Welcome screen
│   ├── LoginPage.js           # Login screen
│   ├── SignupPage.js          # Signup screen  
│   ├── OtpPage.js             # OTP verification
│   ├── DashboardPage.js       # Main dashboard + navigation
│   ├── SurveyPage.js          # Survey builder
│   └── FormPage.js            # Generic form validation
├── tests/
│   ├── BaseTest.js            # Mocha lifecycle hooks (before/after/screenshot)
│   ├── auth.test.js           # TC-AUTH: 8 authentication tests
│   ├── survey.test.js         # TC-SURVEY: 7 survey management tests
│   ├── navigation.test.js     # TC-NAV: 7 navigation tests
│   ├── gestures.test.js       # TC-GEST: 7 gesture automation tests
│   └── payments.test.js       # TC-PAY: 5 billing/payment tests
├── utilities/
│   ├── gestures.js            # Tap, Swipe, LongPress, Pinch/Zoom, Drag
│   ├── excelReporter.js       # 4-sheet Excel report generator
│   ├── logger.js              # Winston logger
│   └── apiHelper.js           # Backend API pre-validation + test data
├── .github/workflows/
│   └── appium-e2e.yml         # GitHub Actions CI/CD
├── .env.example               # Environment config template
├── .mocharc.json              # Mocha + mochawesome configuration
└── package.json
```

---

## ⚡ Quick Start

### 1. Prerequisites

```powershell
# Node.js 18+
node --version

# Appium 2.x
npm install -g appium@latest
appium driver install uiautomator2

# Android SDK
$env:ANDROID_HOME = "C:\Users\<you>\AppData\Local\Android\Sdk"
adb devices
```

### 2. Configure Environment

```powershell
cd "c:\Users\B Aishwarya\OneDrive\Desktop\PDD DOC\survexa-appium-framework"
copy .env.example .env
# Edit .env with your device UDID, test credentials, backend URL
```

### 3. Install Dependencies

```powershell
npm install
```

### 4. Critical: Fix APK Backend URL

> Before running tests, ensure the APK connects to your backend:

**Option A — Rebuild APK with correct URL:**
```powershell
# 1. Set VITE_API_URL in SurveyForge/.env
echo "VITE_API_URL=http://192.168.1.XXX:5000" > .env
# 2. Build
cd SurveyForge && npm run build && npx cap sync android
# 3. Build APK
cd android && .\gradlew assembleRelease
```

**Option B — Use localStorage override at runtime:**
The app supports setting a custom backend URL via `localStorage.setItem('survexa_backend_url', 'http://192.168.1.XXX:5000')` in the WebView dev console.

### 5. Start Appium Server

```powershell
appium --port 4723 --log-level info
```

### 6. Run Tests

```powershell
# Run all tests
npm run test:all

# Run only authentication tests
npm run test:auth

# Run only survey tests  
npm run test:survey

# Run navigation tests
npm run test:navigation

# Run gesture tests
npm run test:gestures

# Run payment tests
npm run test:payments
```

---

## 📊 Reports

After test execution, find reports in:

| Report Type | Location |
|-------------|----------|
| **Excel (4-sheet)** | `excel/Mobile_E2E_Report_<timestamp>.xlsx` |
| **HTML (Mochawesome)** | `reports/html/SurveyaE2EReport.html` |
| **Failure Screenshots** | `reports/screenshots/*.png` |
| **Device Logcat** | `logs/logcat_*.txt` |
| **Framework Log** | `logs/framework.log` |

### Excel Report Sheets:
1. **Summary** — Date, Device, Android Version, Pass%, Duration
2. **Test Cases** — All tests with status, timing, screenshots
3. **Failed Tests** — Failure reasons, screenshots, activity names
4. **Execution Logs** — Step-by-step with timestamps

---

## 🔧 Configuration

### .env Settings

```ini
# Device
DEVICE_TYPE=real          # 'real' or 'emulator'
DEVICE_UDID=XXXX          # adb devices output
AVD_NAME=Pixel_6_API_34   # For emulator

# APK
APK_PATH=../app-release.apk
APP_PACKAGE=com.survexa.app
APP_ACTIVITY=com.survexa.app.MainActivity

# Test Accounts
TEST_EMAIL=testuser@survexa.test
TEST_PASSWORD=TestPassword123!

# Backend (for API pre-validation)
BACKEND_URL=http://localhost:5000

# Timeouts (ms)
ELEMENT_WAIT_TIMEOUT=15000
PAGE_LOAD_TIMEOUT=30000
```

---

## 🧪 Test Coverage

| Module | Tests | Description |
|--------|-------|-------------|
| Authentication | 8 | Login, signup, logout, OTP, session persistence |
| Survey Management | 7 | Create, build, publish, AI generator, analytics |
| Navigation | 7 | Bottom nav, back button, deep links, app relaunch |
| Gestures | 7 | Swipe, scroll, long press, pinch/zoom, pull-to-refresh |
| Payments | 5 | Billing UI, plan cards, upgrade, API verification |
| **Total** | **34** | |

---

## 🤖 GitHub Actions

Trigger manually via:
1. Go to **Actions** tab on GitHub
2. Select **Survexa Mobile E2E Tests**
3. Click **Run workflow**
4. Choose test suite: `all` / `auth` / `survey` / etc.

**Artifacts uploaded automatically:**
- `Mobile_E2E_Excel_Report` — Excel report (30 days)
- `Mochawesome_HTML_Report` — HTML report (30 days)
- `Failure_Screenshots` — All failure screenshots (30 days)
- `Device_Logs` — Logcat files (30 days)

---

## 📱 Supported Devices

| Device | Status |
|--------|--------|
| Real Android device (USB debug) | ✅ |
| Android Emulator (Pixel 6 API 34) | ✅ |
| Android 10+ (API 29+) | ✅ |
| Android 12 (API 31) | ✅ |
| Android 13 (API 33) | ✅ |
| Android 14 (API 34) | ✅ |
| Android 15 (API 35) | ✅ |

---

## ⚠️ Known Issues & Root Cause

> The current APK has a critical issue: **`VITE_API_URL=http://localhost:5000` in the frontend .env prevents the Android WebView from connecting to the backend.**

**Root Cause:** Android devices cannot access `localhost` of the host machine.

**Fix Required Before Testing:**
```
# SurveyForge/.env
VITE_API_URL=http://<YOUR_LAN_IP>:5000
# Then rebuild APK and add android:usesCleartextTraffic="true" to AndroidManifest.xml
```

See `APK_AUDIT_REPORT.md` for full analysis.
