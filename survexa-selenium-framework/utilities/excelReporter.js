const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

class ExcelReporter {
    constructor() {
        this.results = [];
    }

    addResult(test) {
        // Example title: "STC_001 [REAL] - Login Scenario"
        // Or "STC_005 [PLACEHOLDER] - Feature XYZ"
        
        const titleRegex = /^(STC_\d{3})\s*\[(REAL|PLACEHOLDER)\]\s*-\s*(.*)$/;
        let testId = 'UNKNOWN';
        let type = 'UNKNOWN';
        let scenario = test.title;
        let module = test.parent ? test.parent.title : 'General';
        
        const match = test.title.match(titleRegex);
        if (match) {
            testId = match[1];
            type = match[2];
            scenario = match[3];
        }

        let status = 'Skipped';
        let result = 'SKIP';
        
        if (test.state === 'passed') {
            status = 'Executed';
            result = 'PASS';
        } else if (test.state === 'failed') {
            status = 'Executed';
            result = 'FAIL';
        } else if (test.pending) {
            status = 'Skipped';
            result = 'SKIP';
        }

        this.results.push({
            testId,
            module,
            scenario,
            type,
            status,
            result,
            duration: test.duration || 0
        });
    }

    async generateReport() {
        const reportsDir = path.join(__dirname, '..', 'reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Test Execution Report');

        // Define columns
        worksheet.columns = [
            { header: 'Test ID', key: 'testId', width: 15 },
            { header: 'Module', key: 'module', width: 25 },
            { header: 'Scenario', key: 'scenario', width: 50 },
            { header: 'Type', key: 'type', width: 15 },
            { header: 'Execution Status', key: 'status', width: 20 },
            { header: 'Result', key: 'result', width: 15 },
            { header: 'Execution Time (ms)', key: 'duration', width: 20 }
        ];

        // Add rows
        this.results.forEach(res => {
            const row = worksheet.addRow(res);
            // Optional: style colors based on Result
            const resultCell = row.getCell('result');
            if (res.result === 'PASS') {
                resultCell.font = { color: { argb: 'FF008000' } }; // Green
            } else if (res.result === 'FAIL') {
                resultCell.font = { color: { argb: 'FFFF0000' } }; // Red
            } else {
                resultCell.font = { color: { argb: 'FF808080' } }; // Gray
            }
        });

        const reportPath = path.join(reportsDir, 'Selenium_Test_Report.xlsx');
        await workbook.xlsx.writeFile(reportPath);
        console.log(`\nExcel Report Generated at: ${reportPath}`);
    }
}

module.exports = new ExcelReporter();
