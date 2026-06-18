const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const logger = require('./Logger');

class ExcelReporter {
    constructor() {
        this.workbook = new ExcelJS.Workbook();
        this.summarySheet = this.workbook.addWorksheet('Summary');
        this.testCasesSheet = this.workbook.addWorksheet('Test Cases');
        this.failedTestsSheet = this.workbook.addWorksheet('Failed Cases');
        this.executionLogsSheet = this.workbook.addWorksheet('Execution Logs');

        this.reportPath = path.join(__dirname, '../../');
        this.filePath = path.join(this.reportPath, 'Selenium_Test_Report.xlsx');

        this._initializeSheets();
        this.testResults = [];
        this.failedTests = [];
        this.logs = [];
        this.startTime = Date.now();
    }

    _initializeSheets() {
        // Summary Sheet
        this.summarySheet.columns = [
            { header: 'Execution Date', key: 'date', width: 20 },
            { header: 'Environment', key: 'env', width: 15 },
            { header: 'Total Tests', key: 'total', width: 15 },
            { header: 'Passed', key: 'passed', width: 15 },
            { header: 'Failed', key: 'failed', width: 15 },
            { header: 'Skipped', key: 'skipped', width: 15 },
            { header: 'Pass Percentage', key: 'percentage', width: 20 },
            { header: 'Execution Duration', key: 'duration', width: 25 },
        ];

        // Test Cases Sheet
        this.testCasesSheet.columns = [
            { header: 'Test ID', key: 'id', width: 10 },
            { header: 'Module', key: 'module', width: 20 },
            { header: 'Scenario Name', key: 'name', width: 40 },
            { header: 'Browser', key: 'browser', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Start Time', key: 'start', width: 20 },
            { header: 'End Time', key: 'end', width: 20 },
            { header: 'Duration (ms)', key: 'duration', width: 15 },
        ];

        // Failed Tests Sheet
        this.failedTestsSheet.columns = [
            { header: 'Test Name', key: 'name', width: 40 },
            { header: 'Failure Reason', key: 'reason', width: 50 },
            { header: 'Screenshot Path', key: 'screenshot', width: 40 },
            { header: 'Browser', key: 'browser', width: 15 },
            { header: 'URL', key: 'url', width: 40 },
        ];

        // Execution Logs Sheet
        this.executionLogsSheet.columns = [
            { header: 'Timestamp', key: 'timestamp', width: 20 },
            { header: 'Test Name', key: 'test', width: 30 },
            { header: 'Step Description', key: 'step', width: 50 },
            { header: 'Result', key: 'result', width: 15 },
            { header: 'Remarks', key: 'remarks', width: 30 },
        ];
        
        // Stylize headers
        [this.summarySheet, this.testCasesSheet, this.failedTestsSheet, this.executionLogsSheet].forEach(sheet => {
            sheet.getRow(1).font = { bold: true };
            sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };
        });
    }

    addTestResult(result) {
        this.testResults.push(result);
    }

    addFailedTest(failed) {
        this.failedTests.push(failed);
    }

    addExecutionLog(log) {
        this.logs.push(log);
    }

    async generateReport(env = 'QA', browser = 'Chrome') {
        const total = this.testResults.length;
        const passed = this.testResults.filter(t => t.status === 'Passed').length;
        const failed = this.testResults.filter(t => t.status === 'Failed').length;
        const skipped = this.testResults.filter(t => t.status === 'Skipped').length;
        const percentage = total > 0 ? ((passed / total) * 100).toFixed(2) + '%' : '0%';
        const durationMs = Date.now() - this.startTime;
        const durationSecs = (durationMs / 1000).toFixed(2) + 's';

        this.summarySheet.addRow({
            date: new Date().toLocaleDateString(),
            env: env,
            total: total,
            passed: passed,
            failed: failed,
            skipped: skipped,
            percentage: percentage,
            duration: durationSecs
        });

        this.testResults.forEach((t, index) => {
            this.testCasesSheet.addRow({
                id: `TC-${index + 1}`,
                module: t.module || 'General',
                name: t.name,
                browser: browser,
                status: t.status,
                start: t.start || '',
                end: t.end || '',
                duration: t.duration || 0
            });
        });

        this.failedTests.forEach(f => {
            this.failedTestsSheet.addRow({
                name: f.name,
                reason: f.reason,
                screenshot: f.screenshot,
                browser: browser,
                url: f.url
            });
        });

        this.logs.forEach(l => {
            this.executionLogsSheet.addRow(l);
        });

        try {
            await this.workbook.xlsx.writeFile(this.filePath);
            logger.info(`Excel report successfully generated at ${this.filePath}`);
        } catch (error) {
            logger.error(`Failed to generate Excel report: ${error.message}`);
        }
    }
}

module.exports = new ExcelReporter();
