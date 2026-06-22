import ExcelJS from 'exceljs';
import path from 'path';

export const generateReport = async (results: any[]) => {
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

  results.forEach(res => worksheet.addRow(res));
  
  const reportPath = path.join(__dirname, '../../reports/selenium-report.xlsx');
  await workbook.xlsx.writeFile(reportPath);
  console.log(`Excel report generated at ${reportPath}`);
};
