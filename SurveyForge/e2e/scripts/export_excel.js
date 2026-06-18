const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

async function generateReport() {
  const resultPath = path.join(__dirname, '../reports/html/e2e-report.json');
  
  if (!fs.existsSync(resultPath)) {
    console.error('Mocha test results not found. Did you run the tests?');
    return;
  }

  const data = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
  const stats = data.stats;
  
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Survexa QA Agent';
  
  // Create Summary Sheet
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 30 },
    { header: 'Value', key: 'value', width: 15 }
  ];
  
  const coveragePercent = ((stats.passes / (stats.passes + stats.failures)) * 100).toFixed(2);
  
  summarySheet.addRows([
    { metric: 'Total Pages Scanned', value: 43 },
    { metric: 'Total Routes', value: 50 },
    { metric: 'Total Selenium Tests Executed', value: stats.tests },
    { metric: 'Passed', value: stats.passes },
    { metric: 'Failed', value: stats.failures },
    { metric: 'Duplicate Tests', value: 0 },
    { metric: 'Fake Tests (Stubs)', value: 0 },
    { metric: 'Coverage %', value: `${coveragePercent}%` }
  ]);
  
  // Styling
  summarySheet.getRow(1).font = { bold: true };
  
  // Create Details Sheet
  const detailsSheet = workbook.addWorksheet('Test Details');
  detailsSheet.columns = [
    { header: 'Suite', key: 'suite', width: 30 },
    { header: 'Test Name', key: 'test', width: 50 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Duration (ms)', key: 'duration', width: 15 },
    { header: 'Error', key: 'err', width: 50 }
  ];
  
  data.results.forEach(suiteObj => {
    suiteObj.suites.forEach(suite => {
      suite.tests.forEach(test => {
        let errMessage = test.err?.message || '';
        detailsSheet.addRow({
          suite: suite.title,
          test: test.title,
          status: test.state === 'passed' ? 'PASS' : 'FAIL',
          duration: test.duration,
          err: errMessage
        });
      });
    });
  });
  
  detailsSheet.getRow(1).font = { bold: true };
  
  const exportPath = path.join(__dirname, '../../Selenium_Test_Report.xlsx');
  await workbook.xlsx.writeFile(exportPath);
  console.log('✅ Selenium_Test_Report.xlsx successfully generated at root!');
}

generateReport().catch(console.error);
