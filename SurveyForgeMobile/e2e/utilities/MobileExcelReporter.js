const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

class MobileExcelReporter {
    constructor() {
        this.workbook = new ExcelJS.Workbook();
        this.summarySheet = this.workbook.addWorksheet('Summary');
        this.testCasesSheet = this.workbook.addWorksheet('Test Cases');
        this.failedTestsSheet = this.workbook.addWorksheet('Failed Cases');
        this.executionLogsSheet = this.workbook.addWorksheet('Execution Logs');

        this.reportPath1 = path.join(__dirname, '../../Mobile_E2E_Report.xlsx');
        this.reportPath2 = path.join(__dirname, '../../Appium_Test_Report.xlsx');

        this._initializeSheets();
        this.testResults = [];
        this.failedTests = [];
        this.logs = [];
        this.startTime = Date.now();
    }

    _initializeSheets() {
        this.summarySheet.columns = [
            { header: 'Execution Date', key: 'date', width: 20 },
            { header: 'Environment', key: 'env', width: 15 },
            { header: 'Total Tests', key: 'total', width: 15 },
            { header: 'Passed', key: 'passed', width: 15 },
            { header: 'Failed', key: 'failed', width: 15 },
            { header: 'Pass Percentage', key: 'percentage', width: 20 },
            { header: 'Execution Duration', key: 'duration', width: 25 },
        ];

        this.testCasesSheet.columns = [
            { header: 'Test ID', key: 'id', width: 10 },
            { header: 'Module', key: 'module', width: 20 },
            { header: 'Scenario Name', key: 'name', width: 40 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Duration (ms)', key: 'duration', width: 15 },
        ];

        this.failedTestsSheet.columns = [
            { header: 'Test Name', key: 'name', width: 40 },
            { header: 'Failure Reason', key: 'reason', width: 50 },
            { header: 'Screenshot Path', key: 'screenshot', width: 40 },
        ];

        this.executionLogsSheet.columns = [
            { header: 'Timestamp', key: 'timestamp', width: 20 },
            { header: 'Test Name', key: 'test', width: 30 },
            { header: 'Result', key: 'result', width: 15 },
        ];
    }

    addTestResult(result) { this.testResults.push(result); }
    addFailedTest(failed) { this.failedTests.push(failed); }
    addExecutionLog(log) { this.logs.push(log); }

    async generateReport() {
        const total = this.testResults.length;
        const passed = this.testResults.filter(t => t.status === 'Passed').length;
        const failed = this.testResults.filter(t => t.status === 'Failed').length;
        const percentage = total > 0 ? ((passed / total) * 100).toFixed(2) + '%' : '0%';
        const durationSecs = ((Date.now() - this.startTime) / 1000).toFixed(2) + 's';

        this.summarySheet.addRow({
            date: new Date().toLocaleDateString(),
            env: 'Appium-Mobile',
            total, passed, failed, percentage, duration: durationSecs
        });

        // Test Cases start at TC031
        this.testResults.forEach((t, index) => {
            this.testCasesSheet.addRow({
                id: `TC${(index + 31).toString().padStart(3, '0')}`,
                module: t.module,
                name: t.name,
                status: t.status,
                duration: t.duration || 0
            });
        });

        this.failedTests.forEach(f => this.failedTestsSheet.addRow(f));
        this.logs.forEach(l => this.executionLogsSheet.addRow(l));

        try {
            await this.workbook.xlsx.writeFile(this.reportPath1);
            await this.workbook.xlsx.writeFile(this.reportPath2);
            console.log('Mobile Excel reports successfully generated.');
        } catch (error) {
            console.error('Failed to generate Excel reports:', error);
        }
    }
}
module.exports = new MobileExcelReporter();
