# SurveyForge E2E Selenium Automation Framework

This is a production-ready, highly structured End-to-End automation framework for the SurveyForge React application using Selenium WebDriver, Node.js, Mocha, and Chai.

## Key Features
- **Page Object Model (POM):** Highly maintainable and reusable page classes (`pages/BasePage.js`).
- **Dynamic Test Generation:** Automatically reads `AppRoutes.jsx` to generate navigation and basic form health checks.
- **Advanced Reporting:** Automatically generates a comprehensive `E2E_Report.xlsx` (Summary, Test Cases, Failed Tests, Execution Logs) using ExcelJS, alongside standard Mochawesome HTML reports.
- **Resilience & Logging:** Built-in explicit/implicit waits via `BrowserUtils.js`, file-based execution logging via Winston (`Logger.js`), and automatic screenshot capture on failure.
- **CI/CD Integration:** Fully configured to run cross-browser headed/headless tests in GitHub Actions.

## Setup Instructions

1. Ensure Node.js is installed.
2. Navigate to the `e2e` directory and install dependencies:
   ```bash
   cd e2e
   npm install
   ```
3. Ensure the SurveyForge frontend is running before starting the tests.
   ```bash
   npm run dev # in the project root
   ```

## Execution Commands

- **Generate Dynamic Tests (Parses React Routes):**
  ```bash
  npm run generate
  ```
- **Run all tests (Default: Chrome, Headless):**
  ```bash
  npm test
  ```
- **Run tests in Headed Mode:**
  ```bash
  npm run test:headed
  ```
- **Run tests in Edge:**
  ```bash
  npm run test:edge
  ```

## Reports
After execution, reports will be generated in `e2e/reports/`:
- **HTML Report:** `reports/html/e2e-report.html`
- **Excel Report:** `reports/excel/E2E_Report.xlsx`
- **Failure Screenshots & Logs:** `reports/failures/`
