# Survexa Enterprise Appium E2E Automation Framework

This repository houses a production-grade, highly scalable mobile test automation framework designed for Android applications using **Appium 2.x**, **WebdriverIO (v8)**, **Mocha**, and **Chai**.

## Directory Layout

```text
survexa-appium-framework/
├── .github/
│   └── workflows/
│       └── appium-e2e.yml         # GitHub Actions CI Configuration
├── config/
│   └── appium.config.js          # Appium capabilities and host configurations
├── drivers/
│   └── driverFactory.js          # WebdriverIO driver initialization & dynamic device detection
├── pages/
│   ├── BasePage.js               # Common UI actions, explicit waits, and alerts
│   ├── LoginPage.js              # Login page selectors and authentication flows
│   ├── FormPage.js               # Form inputs and fields validation rules
│   └── DashboardPage.js          # Navigation tabs, drawers, and card list items
├── tests/
│   ├── BaseTest.js               # Global Mocha hooks, screenshot dumps, logcat logger
│   └── e2e.test.js               # Integration E2E test suite
├── utilities/
│   ├── gestures.js               # Reusable Android W3C gesture actions (swipe, pinch, longpress)
│   ├── logger.js                 # Winston trace logger (console + log files)
│   └── excelReporter.js          # Custom 4-sheet Excel E2E reporter using exceljs
├── package.json                  # Scripts and framework dependencies
└── README.md                     # Main documentation file
```

---

## Technical Features

1. **Dual Run Modes:** Supports testing pre-compiled APK builds (`USE_APK=true`) or already installed applications (`com.survexa.app`).
2. **Dynamic Device Discovery:** Automatically queries connected devices via Android Debug Bridge (`adb devices`) to dynamically configure capabilities.
3. **Advanced Gesture Library:** Implements pure W3C Actions standard gestures (Scroll until visible, Drag-and-drop, Pinch-to-zoom, Multi-finger actions).
4. **Rich Failure Capture:** Automatically saves screenshots, logcat dump logs, and current activity names under `reports/failures/` on any test failure.
5. **Winston Log Transport:** Traces framework operations to both the terminal console and files (`logs/framework.log`).
6. **Excel E2E Reporter:** Generates a professional 4-sheet workbook (`excel/Mobile_E2E_Report.xlsx`):
   - **Summary:** Executions, versions, durations, pass percentages.
   - **Test Cases:** Module details, execution times, and results.
   - **Failed Tests:** Error causes, screenshots, and active activities.
   - **Execution Logs:** Chronological trace records.
7. **CI/CD Integration:** Ready-to-go GitHub Actions workflow with hardware acceleration on macOS environments.

---

## Local Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.0.0 or higher)
- [Android Studio & Android SDK](https://developer.android.com/studio) (with `adb` and `emulator` in your system's environment variables)
- [Appium 2.x Server](https://appium.io/) installed globally:
  ```bash
  npm install -g appium
  appium driver install uiautomator2
  ```

### Framework Installation
Clone this workspace subdirectory and install local Node dependencies:
```bash
cd survexa-appium-framework
npm install
```

---

## Execution Guide

### 1. Configure Environment (`.env`)
Create a `.env` file in the root of the framework folder to set custom properties:
```env
USE_APK=false
APP_PACKAGE=com.survexa.app
APP_ACTIVITY=com.survexa.app.MainActivity
APK_PATH=../SurveyForge/android/app/build/outputs/apk/release/app-release.apk
ANDROID_DEVICE_NAME=Medium_Phone_API_36.0
ANDROID_PLATFORM_VERSION=14.0
APPIUM_HOST=127.0.0.1
APPIUM_PORT=4723
```

### 2. Start Appium Server
Open a terminal tab and run:
```bash
appium
```

### 3. Run Test Suites
Execute the Mocha suite command:
```bash
# Run all E2E test suites
npm test

# Run authentication scenarios only
npm run test:auth

# Run form validation rules only
npm run test:form
```

---

## AI Agent Integration (Smart Testing Capability)

The framework structure is fully optimized for AI agents and test generation engines:
1. **Dynamic Page Discovery:** By extending `BasePage.js`, an AI agent can read screen nodes (via `android layout` or layout trees) and map selectors dynamically to page object functions.
2. **Form Rule Auto-Gen:** The parameters of `FormPage.js` can accept dynamic payloads, letting an AI generator feed edge-case boundary inputs (e.g. invalid emails, overly long passwords, empty fields) to automatically record actual validation message strings.
3. **Android Pattern Matcher:** Since components are grouped under standard UI layouts, an AI agent can reuse gestures (`swipeUp`, `scrollUntilVisible`) to automatically scroll through dashboards, discover new cards, and assert list additions.
