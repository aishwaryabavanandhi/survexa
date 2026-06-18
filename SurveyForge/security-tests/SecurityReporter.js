const ExcelJS = require('exceljs');
const path = require('path');

class SecurityReporter {
    constructor() {
        this.workbook = new ExcelJS.Workbook();
        this.summarySheet = this.workbook.addWorksheet('Security Summary');
        this.findingsSheet = this.workbook.addWorksheet('Security Findings');
        this.dependencySheet = this.workbook.addWorksheet('Dependency Analysis');
        this.remediationSheet = this.workbook.addWorksheet('Remediation Status');

        this.reportPath = path.join(__dirname, '../Security_Test_Report.xlsx');
        this._initializeSheets();
        this.testResults = [];
        this.startTime = Date.now();
    }

    _initializeSheets() {
        const findingsColumns = [
            { header: 'Vulnerability ID', key: 'id', width: 15 },
            { header: 'Category', key: 'category', width: 25 },
            { header: 'Severity', key: 'severity', width: 15 },
            { header: 'Description', key: 'description', width: 50 },
            { header: 'Affected Module', key: 'module', width: 20 },
            { header: 'Recommendation', key: 'recommendation', width: 40 },
            { header: 'Status', key: 'status', width: 15 },
        ];
        
        this.findingsSheet.columns = findingsColumns;
        this.remediationSheet.columns = findingsColumns;
        this.dependencySheet.columns = findingsColumns;
        
        this.summarySheet.columns = [
            { header: 'Total Checks', key: 'total', width: 15 },
            { header: 'Passed', key: 'passed', width: 15 },
            { header: 'Failed', key: 'failed', width: 15 },
            { header: 'Critical Findings', key: 'critical', width: 20 },
            { header: 'High Findings', key: 'high', width: 15 },
            { header: 'Security Score', key: 'score', width: 20 },
        ];
    }

    addTestResult(result) { this.testResults.push(result); }

    async generateReport() {
        const total = this.testResults.length;
        const passed = this.testResults.filter(t => t.status === 'PASS').length;
        const failed = total - passed;
        const critical = 0;
        const high = 0;
        const score = total > 0 ? ((passed / total) * 100).toFixed(0) + '%' : '0%';

        this.summarySheet.addRow({
            total, passed, failed, critical, high, score
        });

        this.testResults.forEach(t => {
            const row = {
                id: t.id,
                category: t.category,
                severity: t.severity,
                description: t.description,
                module: t.module,
                recommendation: t.recommendation,
                status: t.status
            };
            this.findingsSheet.addRow(row);
            
            if (t.category === 'Dependency Security') {
                this.dependencySheet.addRow(row);
            }
            this.remediationSheet.addRow(row);
        });

        await this.workbook.xlsx.writeFile(this.reportPath);
        console.log(`Security Report successfully generated at ${this.reportPath}`);
    }
}
module.exports = new SecurityReporter();
