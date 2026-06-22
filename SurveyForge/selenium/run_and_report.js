const jest = require('jest');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function main() {
  const options = {
    projects: [__dirname],
    silent: false,
    runInBand: true,
    testTimeout: 120000
  };

  console.log('Running 340 Selenium Tests...');
  const { results } = await jest.runCLI(options, [__dirname]);

  console.log('Generating Excel Report...');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Selenium Report');

  worksheet.columns = [
    { header: 'Test ID', key: 'id', width: 10 },
    { header: 'Test Name', key: 'name', width: 40 },
    { header: 'Module / Category', key: 'module', width: 30 },
    { header: 'Status (PASS/FAIL)', key: 'status', width: 15 },
    { header: 'Error Message', key: 'error', width: 40 },
    { header: 'Duration (ms)', key: 'duration', width: 15 },
    { header: 'Timestamp', key: 'timestamp', width: 25 },
    { header: 'Screenshot Path', key: 'screenshot', width: 30 }
  ];

  let testCount = 0;
  
  for (const testResult of results.testResults) {
    for (const assertion of testResult.testResults) {
      // test name format: 'TC_001: Authentication - Verify Auth scenario 1'
      const titleParts = assertion.title.split(': ');
      const testId = titleParts[0] || 'Unknown';
      const rest = titleParts[1] || '';
      const moduleParts = rest.split(' - ');
      const module = moduleParts[0] || 'Unknown';
      
      const status = assertion.status === 'passed' ? 'PASS' : 'FAIL';
      const error = assertion.failureMessages.join('\n').substring(0, 500);
      
      worksheet.addRow({
        id: testId,
        name: assertion.title,
        module: module,
        status: status,
        error: error,
        duration: assertion.duration || 0,
        timestamp: new Date().toISOString(),
        screenshot: status === 'FAIL' ? 'screenshots/error.png' : ''
      });
      testCount++;
    }
  }

  const reportPath = path.join(__dirname, '..', 'reports', 'selenium-report.xlsx');
  
  if (!fs.existsSync(path.dirname(reportPath))) {
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  }

  await workbook.xlsx.writeFile(reportPath);
  console.log(`Excel report generated successfully at ${reportPath} with ${testCount} rows.`);

  if (!results.success) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
