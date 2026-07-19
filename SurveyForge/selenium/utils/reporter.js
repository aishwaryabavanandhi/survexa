const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

class CustomReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  async onRunComplete(contexts, results) {
    const reportsDir = path.join(__dirname, '../reports/excel');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Test Results');

    sheet.columns = [
      { header: 'Test ID', key: 'id', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Title', key: 'title', width: 60 },
      { header: 'Duration (ms)', key: 'duration', width: 15 },
      { header: 'Error Messages', key: 'errors', width: 80 }
    ];

    results.testResults.forEach(testResult => {
      testResult.testResults.forEach(assertionResult => {
        // Extract STC_XXX from title if present
        const idMatch = assertionResult.title.match(/(STC_\d{3})/);
        const testId = idMatch ? idMatch[1] : 'N/A';

        sheet.addRow({
          id: testId,
          status: assertionResult.status.toUpperCase(),
          title: assertionResult.title,
          duration: assertionResult.duration || 0,
          errors: assertionResult.failureMessages.join('\n').substring(0, 32000) // Excel cell limit
        });
      });
    });

    const reportPath = path.join(reportsDir, 'Selenium_Test_Report.xlsx');
    await workbook.xlsx.writeFile(reportPath);
    console.log(`\n✅ Excel Report generated at: ${reportPath}`);
  }
}

module.exports = CustomReporter;
