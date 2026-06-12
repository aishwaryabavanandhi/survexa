/**
 * utilities/excelReporter.js
 * Generates Mobile_E2E_Report.xlsx with 4 sheets (Summary, Test Cases, Failed Tests, Execution Logs).
 */
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

class ExcelReporter {
  constructor() {
    this.testCases = [];
    this.failedTests = [];
    this.logs = [];
    this.startTime = new Date();
  }

  /**
   * Records a test case result.
   */
  recordTestCase(testId, module, scenario, device, status, startTime, endTime, duration) {
    this.testCases.push({
      testId,
      module,
      scenario,
      device,
      status,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: `${(duration / 1000).toFixed(2)}s`
    });
  }

  /**
   * Records details of a failed test.
   */
  recordFailure(testName, failureReason, screenshotPath, device, androidVersion, activityName) {
    this.failedTests.push({
      testName,
      failureReason,
      screenshotPath,
      device,
      androidVersion,
      activityName
    });
  }

  /**
   * Records a framework execution step log.
   */
  recordStepLog(testName, step, result, remarks = '') {
    this.logs.push({
      timestamp: new Date().toISOString(),
      testName,
      step,
      result,
      remarks
    });
  }

  /**
   * Compiles data and writes out the Excel workbook to file.
   */
  async generate(deviceName = 'Emulator', androidVersion = '14.0') {
    const workbook = new ExcelJS.Workbook();
    const endTime = new Date();
    const totalDuration = `${((endTime - this.startTime) / 1000).toFixed(2)}s`;

    // Counts
    const totalTests = this.testCases.length;
    const passed = this.testCases.filter(t => t.status === 'Passed').length;
    const failed = this.testCases.filter(t => t.status === 'Failed').length;
    const skipped = this.testCases.filter(t => t.status === 'Skipped').length;
    const passPercentage = totalTests > 0 ? `${((passed / totalTests) * 100).toFixed(1)}%` : '0%';

    // Create directories
    const reportDir = path.join(__dirname, '../excel');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    const outputPath = path.join(reportDir, 'Mobile_E2E_Report.xlsx');

    // ==========================================
    // SHEET 1: Summary
    // ==========================================
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Execution Date', key: 'execDate', width: 25 },
      { header: 'Device Name', key: 'device', width: 20 },
      { header: 'Android Version', key: 'version', width: 18 },
      { header: 'Total Tests', key: 'total', width: 15 },
      { header: 'Passed', key: 'passed', width: 12 },
      { header: 'Failed', key: 'failed', width: 12 },
      { header: 'Skipped', key: 'skipped', width: 12 },
      { header: 'Pass Percentage', key: 'passRate', width: 18 },
      { header: 'Execution Duration', key: 'duration', width: 22 }
    ];
    summarySheet.addRow({
      execDate: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
      device: deviceName,
      version: androidVersion,
      total: totalTests,
      passed,
      failed,
      skipped,
      passRate: passPercentage,
      duration: totalDuration
    });
    this.styleHeader(summarySheet);

    // ==========================================
    // SHEET 2: Test Cases
    // ==========================================
    const testsSheet = workbook.addWorksheet('Test Cases');
    testsSheet.columns = [
      { header: 'Test ID', key: 'testId', width: 15 },
      { header: 'Module', key: 'module', width: 15 },
      { header: 'Scenario', key: 'scenario', width: 35 },
      { header: 'Device', key: 'device', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Start Time', key: 'startTime', width: 25 },
      { header: 'End Time', key: 'endTime', width: 25 },
      { header: 'Duration', key: 'duration', width: 15 }
    ];
    this.testCases.forEach(row => testsSheet.addRow(row));
    this.styleHeader(testsSheet);

    // ==========================================
    // SHEET 3: Failed Tests
    // ==========================================
    const failedSheet = workbook.addWorksheet('Failed Tests');
    failedSheet.columns = [
      { header: 'Test Name', key: 'testName', width: 30 },
      { header: 'Failure Reason', key: 'failureReason', width: 50 },
      { header: 'Screenshot Path', key: 'screenshotPath', width: 40 },
      { header: 'Device', key: 'device', width: 20 },
      { header: 'Android Version', key: 'androidVersion', width: 18 },
      { header: 'Activity Name', key: 'activityName', width: 30 }
    ];
    this.failedTests.forEach(row => failedSheet.addRow(row));
    this.styleHeader(failedSheet);

    // ==========================================
    // SHEET 4: Execution Logs
    // ==========================================
    const logsSheet = workbook.addWorksheet('Execution Logs');
    logsSheet.columns = [
      { header: 'Timestamp', key: 'timestamp', width: 25 },
      { header: 'Test Name', key: 'testName', width: 25 },
      { header: 'Step', key: 'step', width: 30 },
      { header: 'Result', key: 'result', width: 15 },
      { header: 'Remarks', key: 'remarks', width: 40 }
    ];
    this.logs.forEach(row => logsSheet.addRow(row));
    this.styleHeader(logsSheet);

    // Write file
    try {
      await workbook.xlsx.writeFile(outputPath);
      logger.info(`Excel E2E Report generated at: ${outputPath}`);
    } catch (err) {
      logger.error(`Failed to write Excel E2E Report: ${err.message}`);
    }
  }

  /**
   * Applies clean styles to sheet headers.
   */
  styleHeader(sheet) {
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F497D' } // Premium Deep Blue
    };
    sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  }
}

// Global Singleton Instance
const globalExcelReporter = new ExcelReporter();

module.exports = globalExcelReporter;
