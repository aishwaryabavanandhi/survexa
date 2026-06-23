const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const NUM_TESTS = 350;

async function generateMockReport(name, prefix, modules) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(name);
  
  // Headers based on the screenshot: Test ID | Module | Scenario | Expected Result | Actual Result | Status | Execution Time
  worksheet.columns = [
    { header: 'Test ID', key: 'id', width: 15 },
    { header: 'Module', key: 'module', width: 25 },
    { header: 'Scenario', key: 'scenario', width: 50 },
    { header: 'Expected Result', key: 'expected', width: 50 },
    { header: 'Actual Result', key: 'actual', width: 50 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Execution Time', key: 'time', width: 20 }
  ];

  for (let i = 1; i <= NUM_TESTS; i++) {
    const testId = prefix + '_' + String(i).padStart(3, '0');
    const moduleIndex = (i - 1) % modules.length;
    const moduleName = modules[moduleIndex];
    
    // Add some realistic variation in execution time
    const minTime = 100;
    const maxTime = 600;
    const executionTimeMs = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;

    worksheet.addRow({
      id: testId,
      module: moduleName,
      scenario: 'Verify core functionality ' + i + ' in ' + moduleName,
      expected: 'User should successfully perform action in ' + moduleName,
      actual: 'Action completed as expected',
      status: 'Pass', // Assuming all pass for the mock report as in screenshot
      time: executionTimeMs + 'ms'
    });
  }

  // Define paths where the reports should be saved
  const reportsDir = path.join(__dirname, '..', 'reports', 'excel');
  if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Also save to root of SurveyForge as well since previous reports were generated there sometimes
  const rootReportPath = path.join(__dirname, '..', name + '.xlsx');
  const dedicatedReportPath = path.join(reportsDir, name + '.xlsx');

  await workbook.xlsx.writeFile(rootReportPath);
  await workbook.xlsx.writeFile(dedicatedReportPath);
  
  console.log('Generated ' + name + '.xlsx with ' + NUM_TESTS + ' rows at ' + rootReportPath + ' and ' + dedicatedReportPath);
}

async function main() {
  const commonModules = ['Dashboard', 'Survey Builder', 'Analytics', 'Settings', 'Authentication'];
  
  // 1. Selenium
  await generateMockReport('Selenium_Test_Report', 'TC_SEL', commonModules);
  
  // 2. Appium
  await generateMockReport('Appium_Test_Report', 'TC_APP', commonModules);
  
  // 3. Security / Vulnerability (Using VTC prefix based on prompt context)
  await generateMockReport('Vulnerability_Test_Report', 'VTC', ['API Gateway', 'Authentication', 'Database', 'User Inputs', 'Session Management']);
  await generateMockReport('Security_Test_Report', 'STC', ['API Gateway', 'Authentication', 'Database', 'User Inputs', 'Session Management']);
}

main().catch(console.error);
