# Survexa E2E Selenium WebDriver Automation Framework

A production-ready, enterprise-grade End-to-End (E2E) test automation framework built using **Node.js**, **JavaScript (ES6+)**, **Selenium WebDriver**, **Mocha**, and **Chai**. 

It is designed for the Survexa React application and includes:
- **Page Object Model (POM)** pattern.
- **Config-Driven design** via environment variables.
- **Auto-launched browser management** (Chrome, Firefox, Edge) in both headed and headless modes.
- **Dynamic test case generation** from application routes and validator source code.
- **Automated failure logs & screenshots** stored in `reports/failures/`.
- **Rich formatted Excel reports** generated with `exceljs`.
- **Beautiful HTML reports** via `mochawesome`.
- **CI/CD pipeline integration** via GitHub Actions.

---

## Directory Structure

```text
survexa-selenium-framework/
├── config/
│   └── selenium.config.js    # Centralized framework configurations
├── excel/
│   └── E2E_Report.xlsx       # Output Excel sheets (Summary, Tests, Failures, Logs)
├── logs/
│   └── execution.log         # Streamed Winston application execution logs
├── pages/
│   ├── basePage.js           # Reusable generic web operations
│   ├── loginPage.js          # Authentication elements & action selectors
│   ├── signupPage.js         # Register inputs & validation selectors
│   └── dashboardPage.js      # Sidebar tabs & workspace controllers
├── reports/
│   └── failures/             # Captures screenshots, URLs, logs on failure
├── tests/
│   ├── baseSetup.js          # Global hooks, webdriver hooks & metrics
│   ├── e2e.test.js           # Hardcoded validation & user lifecycle tests
│   └── dynamic.test.js       # Programmatic code-scanning dynamic runner
├── utilities/
│   ├── excelReporter.js      # Formatted Excel compiler
│   ├── formDiscoverer.js     # Parses validator.js code validations
│   ├── logger.js             # Winston logger setup
│   ├── routeDiscoverer.js    # Parses screenRoutes.js configuration
│   └── seleniumUtils.js      # Explicit waits, capture helpers, retries
├── .env                      # Local parameters config override
├── package.json              # Script runners and package configurations
└── README.md                 # User documentation
```

---

## Local Setup Instructions

### Prerequisites
1. **Node.js**: Recommended `v18.x` or `v20.x`.
2. **Browsers**: Ensure Google Chrome, Microsoft Edge, or Mozilla Firefox is installed on your local operating system.

### Installation
1. Navigate to the automation framework root:
   ```bash
   cd survexa-selenium-framework
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```

---

## Configuration (`.env`)

Configure local settings inside the `.env` file at the root of the project:

```env
BASE_URL=http://localhost:5173        # SurveyForge frontend local host
BROWSER=chrome                        # Target browser: chrome | firefox | msedge
HEADLESS=true                         # Run browser in headless mode: true | false
IMPLICIT_TIMEOUT=5000                 # Implicit wait timeout in ms
EXPLICIT_TIMEOUT=15000                # Explicit wait timeout in ms
NODE_ENV=development                  # Run environment context
```

---

## Execution Commands

### Launch all E2E & Dynamic Tests
```bash
npm run test
```

### Launch on Specific Browsers
```bash
# Google Chrome
npm run test:chrome

# Mozilla Firefox
npm run test:firefox

# Microsoft Edge
npm run test:edge
```

### Run Specific Test Modules
```bash
# Only run core E2E flows (Authentication, Navigation)
npm run test:e2e

# Only run dynamic route crawlers and boundary validations
npm run test:dynamic
```

---

## Code-Based Dynamic Test Case Generation

This framework implements an advanced automated test discovery pattern. Instead of relying purely on hardcoded test suites, it scans the React codebase at runtime:

1. **`routeDiscoverer.js`**: Parses the screen route specifications in `SurveyForge/src/config/screenRoutes.js` statically. It compiles all URL layouts to verify link stability, loader renders, page transitions, and login guard redirects automatically.
2. **`formDiscoverer.js`**: Parses the validation helpers in `SurveyForge/src/utils/validators.js`. It extracts boundary rules (email syntax, password lengths, matching passwords) and programmatically runs boundaries against the UI forms. This guarantees E2E form testing always keeps pace with code changes!

---

## Reporting & Artifacts

### 1. Excel Report (`excel/E2E_Report.xlsx`)
Automatically compiled at the end of each run with four worksheets:
- **Summary**: Key execution KPIs (Total tests, pass rate, runtime, environment).
- **Test Cases**: Granular log of every test case scenario name, browser, and duration.
- **Failed Tests**: Detailed reason of any failure, URL context, and screenshot path.
- **Execution Logs**: Micro-steps and actions taken inside tests with timestamps.

### 2. HTML Reports (`mochawesome-report/`)
Interactive charts and summaries generated at the end of test runs showing assertions and logs.

### 3. Failure Screenshots (`reports/failures/`)
If a test fails, the framework immediately:
- Captures a high-resolution PNG screenshot.
- Dumps the browser's console error logs.
- Captures the exact URL at failure.
- Writes exception stack traces to a JSON companion file.
