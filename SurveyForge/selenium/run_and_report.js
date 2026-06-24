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

  console.log('Running 350 Selenium Tests...');
  const { results } = await jest.runCLI(options, [__dirname]);

  console.log('Generating Excel Report according to exact requirements...');
  const workbook = new ExcelJS.Workbook();
  
  // Sheet 1: Summary
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Execution Date', key: 'date', width: 20 },
    { header: 'Tester', key: 'tester', width: 20 },
    { header: 'Environment', key: 'env', width: 20 },
    { header: 'Total Test Cases', key: 'total', width: 15 },
    { header: 'Passed', key: 'passed', width: 15 },
    { header: 'Failed', key: 'failed', width: 15 },
    { header: 'Skipped', key: 'skipped', width: 15 },
    { header: 'Pass Percentage', key: 'passPercent', width: 15 }
  ];
  
  const total = results.numTotalTests;
  const passed = results.numPassedTests;
  const failed = results.numFailedTests;
  const skipped = results.numPendingTests;
  const passPercent = total === 0 ? 0 : ((passed / total) * 100).toFixed(2) + '%';
  
  summarySheet.addRow({
    date: new Date().toISOString().split('T')[0],
    tester: 'Automation Suite',
    env: 'Local / GitHub Actions',
    total: total,
    passed: passed,
    failed: failed,
    skipped: skipped,
    passPercent: passPercent
  });

  // Sheet 2: Test Cases
  const testCasesSheet = workbook.addWorksheet('Test Cases');
  testCasesSheet.columns = [
    { header: 'Test ID', key: 'id', width: 10 },
    { header: 'Module', key: 'module', width: 25 },
    { header: 'Scenario', key: 'scenario', width: 50 },
    { header: 'Expected Result', key: 'expected', width: 40 },
    { header: 'Actual Result', key: 'actual', width: 40 },
    { header: 'Status', key: 'status', width: 10 },
    { header: 'Execution Time', key: 'duration', width: 15 }
  ];

  // Sheet 3: Failed Cases
  const failedSheet = workbook.addWorksheet('Failed Cases');
  failedSheet.columns = [
    { header: 'Test ID', key: 'id', width: 10 },
    { header: 'Failure Reason', key: 'reason', width: 60 },
    { header: 'Screenshot Path', key: 'screenshot', width: 40 },
    { header: 'Severity', key: 'severity', width: 15 }
  ];

  // Sheet 4: Execution Logs
  const logsSheet = workbook.addWorksheet('Execution Logs');
  logsSheet.columns = [
    { header: 'Timestamp', key: 'timestamp', width: 25 },
    { header: 'Test Name', key: 'testName', width: 40 },
    { header: 'Step', key: 'step', width: 30 },
    { header: 'Result', key: 'result', width: 15 },
    { header: 'Remarks', key: 'remarks', width: 40 }
  ];

  let testCount = 0;
  
  for (const testResult of results.testResults) {
    for (const assertion of testResult.testResults) {
      const match = assertion.title.match(/^(STC_\d{3}):\s?(.*)$/);
      const testId = match ? match[1] : 'Unknown';
      const scenario = match ? match[2] : assertion.title;
      // Extract module roughly from ancestor titles if available
      const module = assertion.ancestorTitles.length > 0 ? assertion.ancestorTitles[0] : 'General';
      
      const status = assertion.status === 'passed' ? 'PASS' : (assertion.status === 'pending' ? 'SKIPPED' : 'FAIL');
      const error = assertion.failureMessages.length > 0 ? assertion.failureMessages.join('\n').substring(0, 300) : '';
      
      testCasesSheet.addRow({
        id: testId,
        module: module,
        scenario: scenario,
        expected: 'System executes scenario successfully',
        actual: status === 'PASS' ? 'Execution completed as expected' : 'Execution failed or encountered error',
        status: status,
        duration: `${assertion.duration || 0} ms`
      });
      
      if (status === 'FAIL') {
        failedSheet.addRow({
          id: testId,
          reason: error,
          screenshot: `screenshots/${testId}_fail.png`,
          severity: 'HIGH'
        });
      }
      
      logsSheet.addRow({
        timestamp: new Date().toISOString(),
        testName: testId,
        step: 'Test Execution',
        result: status,
        remarks: status === 'FAIL' ? 'See Failed Cases sheet' : 'Ok'
      });
      
      testCount++;
    }
  }

  // Exact path required by prompt
  const reportPath = path.join(__dirname, '..', 'reports', 'excel', 'Selenium_Test_Report.xlsx');
  
  if (!fs.existsSync(path.dirname(reportPath))) {
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  }

  await workbook.xlsx.writeFile(reportPath);
  console.log(`Excel report generated successfully at ${reportPath} with ${testCount} tests logged.`);

  if (!results.success) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
