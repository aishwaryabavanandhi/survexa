import { Reporter, TestContext } from '@jest/reporters';
import { AggregatedResult, TestResult } from '@jest/test-result';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

export default class SeleniumExcelReporter implements Reporter {
  
  constructor(globalConfig: any, options: any) {
    // Constructor required by Jest
  }

  onRunStart(results: AggregatedResult, options: any) {
    console.log('Starting Selenium TS test run...');
  }

  onTestStart(test: any) {}
  onTestResult(test: any, testResult: TestResult, aggregatedResult: AggregatedResult) {}

  async onRunComplete(testContexts: Set<TestContext>, results: AggregatedResult) {
    console.log('Generating 4-Sheet Excel Report...');
    const workbook = new ExcelJS.Workbook();
    
    // Sheet 1: Summary
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Execution Date', key: 'date', width: 25 },
      { header: 'Tester', key: 'tester', width: 20 },
      { header: 'Environment', key: 'env', width: 20 },
      { header: 'Total Test Cases', key: 'total', width: 20 },
      { header: 'Passed', key: 'passed', width: 15 },
      { header: 'Failed', key: 'failed', width: 15 },
      { header: 'Skipped', key: 'skipped', width: 15 },
      { header: 'Pass Percentage', key: 'pass_percent', width: 20 }
    ];
    
    const total = results.numTotalTests;
    const passed = results.numPassedTests;
    const failed = results.numFailedTests;
    const skipped = results.numPendingTests;
    const passPercent = total === 0 ? '0%' : ((passed / total) * 100).toFixed(2) + '%';

    summarySheet.addRow({
      date: new Date().toISOString(),
      tester: 'Automated CI',
      env: 'Local / GitHub Actions',
      total, passed, failed, skipped, pass_percent: passPercent
    });

    // Sheet 2: Test Cases
    const testCasesSheet = workbook.addWorksheet('Test Cases');
    testCasesSheet.columns = [
      { header: 'Test ID', key: 'id', width: 15 },
      { header: 'Module', key: 'module', width: 25 },
      { header: 'Scenario', key: 'scenario', width: 50 },
      { header: 'Expected Result', key: 'expected', width: 40 },
      { header: 'Actual Result', key: 'actual', width: 40 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Execution Time', key: 'time', width: 15 }
    ];

    // Sheet 3: Failed Cases
    const failedSheet = workbook.addWorksheet('Failed Cases');
    failedSheet.columns = [
      { header: 'Test ID', key: 'id', width: 15 },
      { header: 'Failure Reason', key: 'reason', width: 70 },
      { header: 'Screenshot Path', key: 'screenshot', width: 40 },
      { header: 'Severity', key: 'severity', width: 15 }
    ];

    // Sheet 4: Execution Logs
    const logSheet = workbook.addWorksheet('Execution Logs');
    logSheet.columns = [
      { header: 'Timestamp', key: 'ts', width: 25 },
      { header: 'Test Name', key: 'name', width: 50 },
      { header: 'Step', key: 'step', width: 20 },
      { header: 'Result', key: 'result', width: 15 },
      { header: 'Remarks', key: 'remarks', width: 50 }
    ];

    results.testResults.forEach(fileResult => {
      fileResult.testResults.forEach(test => {
        // Parse Test ID from title if formatted correctly e.g., "STC_001: Validate..."
        let testId = test.title.split(':')[0];
        if (!testId.startsWith('STC_')) {
          testId = 'STC_UNKNOWN';
        }
        const moduleName = test.ancestorTitles[0] || 'Unknown Module';
        const scenario = test.title;
        const status = test.status === 'passed' ? 'PASS' : test.status === 'failed' ? 'FAIL' : 'SKIP';
        
        testCasesSheet.addRow({
          id: testId,
          module: moduleName,
          scenario: scenario,
          expected: 'Should execute without errors',
          actual: status === 'PASS' ? 'Executed successfully' : 'Execution failed',
          status: status,
          time: test.duration ? test.duration + 'ms' : '0ms'
        });

        logSheet.addRow({
          ts: new Date().toISOString(),
          name: scenario,
          step: 'Execution',
          result: status,
          remarks: test.failureMessages.length > 0 ? 'Encountered error' : 'Completed'
        });

        if (status === 'FAIL') {
          failedSheet.addRow({
            id: testId,
            reason: test.failureMessages.join('\n').substring(0, 32000), // Excel cell limit
            screenshot: `reports/screenshots/${testId}.png`,
            severity: 'HIGH'
          });
        }
      });
    });

    const reportDir = path.join(__dirname, '..', '..', 'reports', 'excel');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, 'Selenium_Test_Report.xlsx');
    await workbook.xlsx.writeFile(reportPath);
    console.log(`✅ Excel Report generated at: ${reportPath}`);
  }
}
