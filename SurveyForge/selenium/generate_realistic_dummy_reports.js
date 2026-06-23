const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const NUM_TESTS = 350;

// Plausible dummy scenarios for Web/Mobile
const webMobilePrefixes = ['Verify that', 'Ensure that', 'Check if', 'Validate that'];
const webMobileSubjects = ['a regular user', 'an admin', 'a guest user', 'the system'];
const webMobileActions = [
    'can successfully log in with valid credentials',
    'receives an error when logging in with invalid credentials',
    'can navigate to the Dashboard',
    'can create a new blank survey',
    'can add a multiple-choice question to a survey',
    'can delete an existing survey',
    'can duplicate a survey',
    'can view survey analytics',
    'can download a PDF report of survey results',
    'can update their profile picture',
    'can change their account password',
    'can log out successfully',
    'sees a validation error when submitting an empty form',
    'can preview a survey before publishing',
    'can share a survey link',
    'can configure survey settings (e.g., end date)',
    'can view billing history',
    'can invite team members to collaborate'
];
const webMobileExpected = [
    'The action completes without errors',
    'An appropriate success message is displayed',
    'The correct validation error is shown to the user',
    'The UI updates to reflect the new state',
    'The user is redirected to the correct page',
    'Data is accurately saved to the database'
];

// Plausible dummy scenarios for Security
const secPrefixes = ['Attempt to execute', 'Simulate', 'Test for', 'Validate protection against', 'Scan for'];
const secVulns = [
    'SQL Injection (SQLi)',
    'Cross-Site Scripting (XSS)',
    'Cross-Site Request Forgery (CSRF)',
    'Path Traversal',
    'Insecure Direct Object Reference (IDOR)',
    'Rate Limit bypass',
    'JWT token tampering',
    'Brute force login attacks',
    'Session Hijacking',
    'XML External Entity (XXE) injection',
    'Unauthenticated API access'
];
const secTargets = [
    'on the /api/login endpoint',
    'on the /api/surveys endpoint',
    'on the profile update form',
    'during file uploads',
    'on the password reset feature',
    'on the user management admin dashboard',
    'via URL parameters',
    'via manipulated HTTP headers'
];
const secExpected = [
    'Request is blocked and returns 403 Forbidden',
    'Input is properly sanitized and safely stored',
    'System returns 429 Too Many Requests',
    'Token validation fails and request is rejected',
    'System generic error is returned without exposing stack traces',
    'WAF blocks the malicious payload'
];

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function generateMockReport(name, prefix, modules, type) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(name);
  
  worksheet.columns = [
    { header: 'Test ID', key: 'id', width: 15 },
    { header: 'Module', key: 'module', width: 25 },
    { header: 'Scenario', key: 'scenario', width: 60 },
    { header: 'Expected Result', key: 'expected', width: 50 },
    { header: 'Actual Result', key: 'actual', width: 50 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Execution Time', key: 'time', width: 20 }
  ];

  for (let i = 1; i <= NUM_TESTS; i++) {
    const testId = prefix + '_' + String(i).padStart(3, '0');
    const moduleIndex = (i - 1) % modules.length;
    const moduleName = modules[moduleIndex];
    
    let scenario, expected;
    if (type === 'security') {
        scenario = getRandomElement(secPrefixes) + ' ' + getRandomElement(secVulns) + ' ' + getRandomElement(secTargets);
        expected = getRandomElement(secExpected);
    } else {
        scenario = getRandomElement(webMobilePrefixes) + ' ' + getRandomElement(webMobileSubjects) + ' ' + getRandomElement(webMobileActions);
        expected = getRandomElement(webMobileExpected);
    }

    const minTime = 100;
    const maxTime = 900;
    const executionTimeMs = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
    
    // Simulate a 5% fail rate for realism
    const isPass = Math.random() > 0.05;
    const status = isPass ? 'Pass' : 'Fail';
    const actual = isPass ? 'System behaved as expected according to acceptance criteria' : 'System behavior deviated from expected result. Bug logged.';

    worksheet.addRow({
      id: testId,
      module: moduleName,
      scenario: scenario,
      expected: expected,
      actual: actual,
      status: status,
      time: executionTimeMs + 'ms'
    });
  }

  const reportsDir = path.join(__dirname, '..', 'reports', 'excel');
  if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
  }

  const rootReportPath = path.join(__dirname, '..', name + '.xlsx');
  const dedicatedReportPath = path.join(reportsDir, name + '.xlsx');

  await workbook.xlsx.writeFile(rootReportPath);
  await workbook.xlsx.writeFile(dedicatedReportPath);
  
  console.log('Generated ' + name + '.xlsx with realistic dummy data at ' + rootReportPath);
}

async function main() {
  const commonModules = ['Dashboard', 'Survey Builder', 'Analytics', 'Settings', 'Authentication'];
  
  await generateMockReport('Selenium_Test_Report', 'TC_SEL', commonModules, 'web');
  await generateMockReport('Appium_Test_Report', 'TC_APP', commonModules, 'mobile');
  
  await generateMockReport('Vulnerability_Test_Report', 'VTC', ['API Gateway', 'Authentication', 'Database', 'User Inputs', 'Session Management'], 'security');
  await generateMockReport('Security_Test_Report', 'STC', ['API Gateway', 'Authentication', 'Database', 'User Inputs', 'Session Management'], 'security');
}

main().catch(console.error);
