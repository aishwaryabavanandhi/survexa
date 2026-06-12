const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const config = require('../config/selenium.config');
const logger = require('./logger');

class ExcelReporter {
  
  /**
   * Generates the Excel report from raw execution metadata
   * @param {Object} executionData 
   * @param {string} executionData.environment
   * @param {Date} executionData.startDate
   * @param {Date} executionData.endDate
   * @param {Array} executionData.tests - Array of test results
   * @param {Array} executionData.logs - Step-by-step logs
   */
  static async generateReport(executionData) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Survexa Selenium Framework';
    workbook.created = new Date();

    const start = new Date(executionData.startDate);
    const end = new Date(executionData.endDate);
    const durationSec = Math.round((end - start) / 1000);
    const durationStr = `${Math.floor(durationSec / 60)}m ${durationSec % 60}s`;

    const totalTests = executionData.tests.length;
    const passed = executionData.tests.filter(t => t.status === 'Passed').length;
    const failed = executionData.tests.filter(t => t.status === 'Failed').length;
    const skipped = executionData.tests.filter(t => t.status === 'Skipped').length;
    const passRate = totalTests > 0 ? `${Math.round((passed / totalTests) * 100)}%` : '0%';

    // Styling constants
    const headerFill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F4E78' } // Navy Blue
    };
    
    const headerFont = {
      name: 'Calibri',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' }
    };

    const dataFont = {
      name: 'Calibri',
      size: 10
    };

    const centerAlignment = { vertical: 'middle', horizontal: 'center' };
    const leftAlignment = { vertical: 'middle', horizontal: 'left' };
    
    const thinBorder = {
      top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
      left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
      bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
      right: { style: 'thin', color: { argb: 'FFD9D9D9' } }
    };

    // ────────────────────────────────────────────────────────
    // SHEET 1: SUMMARY
    // ────────────────────────────────────────────────────────
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.views = [{ showGridLines: true }];
    summarySheet.columns = [
      { header: 'Execution Date', key: 'execDate', width: 22 },
      { header: 'Environment', key: 'env', width: 15 },
      { header: 'Total Tests', key: 'total', width: 12 },
      { header: 'Passed', key: 'passed', width: 10 },
      { header: 'Failed', key: 'failed', width: 10 },
      { header: 'Skipped', key: 'skipped', width: 10 },
      { header: 'Pass Percentage', key: 'passRate', width: 16 },
      { header: 'Execution Duration', key: 'duration', width: 20 }
    ];

    summarySheet.addRow({
      execDate: start.toISOString().replace('T', ' ').slice(0, 19),
      env: executionData.environment,
      total: totalTests,
      passed: passed,
      failed: failed,
      skipped: skipped,
      passRate: passRate,
      duration: durationStr
    });

    // Format Summary sheet
    const summaryHeader = summarySheet.getRow(1);
    summaryHeader.height = 25;
    summaryHeader.eachCell(cell => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = centerAlignment;
    });

    summarySheet.getRow(2).height = 22;
    summarySheet.getRow(2).eachCell((cell, colNum) => {
      cell.font = dataFont;
      cell.border = thinBorder;
      cell.alignment = centerAlignment;
      
      // Color-code Pass Rate
      if (colNum === 7) {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: failed > 0 ? 'FFC00000' : '00375623' } };
      }
    });

    // ────────────────────────────────────────────────────────
    // SHEET 2: TEST CASES
    // ────────────────────────────────────────────────────────
    const testCasesSheet = workbook.addWorksheet('Test Cases');
    testCasesSheet.views = [{ showGridLines: true }];
    testCasesSheet.columns = [
      { header: 'Test ID', key: 'id', width: 12 },
      { header: 'Module', key: 'module', width: 18 },
      { header: 'Scenario Name', key: 'name', width: 35 },
      { header: 'Browser', key: 'browser', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Start Time', key: 'start', width: 15 },
      { header: 'End Time', key: 'end', width: 15 },
      { header: 'Duration', key: 'duration', width: 12 }
    ];

    executionData.tests.forEach(test => {
      testCasesSheet.addRow({
        id: test.id,
        module: test.module,
        name: test.name,
        browser: test.browser,
        status: test.status,
        start: new Date(test.startTime).toISOString().slice(11, 19),
        end: new Date(test.endTime).toISOString().slice(11, 19),
        duration: `${Math.round(test.durationMs / 1000)}s`
      });
    });

    const casesHeader = testCasesSheet.getRow(1);
    casesHeader.height = 25;
    casesHeader.eachCell(cell => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = centerAlignment;
    });

    testCasesSheet.eachRow((row, rowNum) => {
      if (rowNum === 1) return;
      row.height = 20;
      row.eachCell((cell, colNum) => {
        cell.font = dataFont;
        cell.border = thinBorder;
        cell.alignment = (colNum === 3) ? leftAlignment : centerAlignment;

        if (colNum === 5) {
          const val = cell.value;
          if (val === 'Passed') cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } }; // Light green
          else if (val === 'Failed') cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE4D6' } }; // Light red
          else cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } }; // Light yellow
        }
      });
    });

    // ────────────────────────────────────────────────────────
    // SHEET 3: FAILED TESTS
    // ────────────────────────────────────────────────────────
    const failedSheet = workbook.addWorksheet('Failed Tests');
    failedSheet.views = [{ showGridLines: true }];
    failedSheet.columns = [
      { header: 'Test Name', key: 'name', width: 35 },
      { header: 'Failure Reason', key: 'reason', width: 45 },
      { header: 'Screenshot Path', key: 'screenshot', width: 45 },
      { header: 'Browser', key: 'browser', width: 12 },
      { header: 'URL', key: 'url', width: 35 }
    ];

    const failedTests = executionData.tests.filter(t => t.status === 'Failed');
    failedTests.forEach(test => {
      failedSheet.addRow({
        name: test.name,
        reason: test.error || 'N/A',
        screenshot: test.screenshotPath || 'N/A',
        browser: test.browser,
        url: test.url || 'N/A'
      });
    });

    const failedHeader = failedSheet.getRow(1);
    failedHeader.height = 25;
    failedHeader.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC00000' } }; // Red
      cell.font = headerFont;
      cell.alignment = centerAlignment;
    });

    failedSheet.eachRow((row, rowNum) => {
      if (rowNum === 1) return;
      row.height = 22;
      row.eachCell((cell, colNum) => {
        cell.font = dataFont;
        cell.border = thinBorder;
        cell.alignment = leftAlignment;
        if (colNum === 4) cell.alignment = centerAlignment;
      });
    });

    // ────────────────────────────────────────────────────────
    // SHEET 4: EXECUTION LOGS
    // ────────────────────────────────────────────────────────
    const logsSheet = workbook.addWorksheet('Execution Logs');
    logsSheet.views = [{ showGridLines: true }];
    logsSheet.columns = [
      { header: 'Timestamp', key: 'time', width: 15 },
      { header: 'Test Name', key: 'testName', width: 30 },
      { header: 'Step Description', key: 'desc', width: 45 },
      { header: 'Result', key: 'result', width: 12 },
      { header: 'Remarks', key: 'remarks', width: 30 }
    ];

    executionData.logs.forEach(log => {
      logsSheet.addRow({
        time: new Date(log.timestamp).toISOString().slice(11, 19),
        testName: log.testName,
        desc: log.description,
        result: log.result,
        remarks: log.remarks || ''
      });
    });

    const logsHeader = logsSheet.getRow(1);
    logsHeader.height = 25;
    logsHeader.eachCell(cell => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = centerAlignment;
    });

    logsSheet.eachRow((row, rowNum) => {
      if (rowNum === 1) return;
      row.height = 18;
      row.eachCell((cell, colNum) => {
        cell.font = dataFont;
        cell.border = thinBorder;
        cell.alignment = (colNum === 1 || colNum === 4) ? centerAlignment : leftAlignment;
        
        if (colNum === 4) {
          const val = cell.value;
          if (val === 'SUCCESS') cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF375623' } };
          else if (val === 'FAIL') cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFC00000' } };
        }
      });
    });

    // Save Workbook
    const reportDir = path.dirname(config.excelReportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    await workbook.xlsx.writeFile(config.excelReportPath);
    logger.info(`Excel E2E Report generated successfully at: ${config.excelReportPath}`);
  }
}

module.exports = ExcelReporter;
