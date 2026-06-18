const BaseTest = require('./BaseTest');
const excelReporter = require('../utilities/MobileExcelReporter');

exports.mochaHooks = {
    async beforeAll() {
        await BaseTest.initDriver();
    },
    
    async afterEach() {
        const test = this.currentTest;
        let status = test.state === 'failed' ? 'Failed' : (test.state === 'passed' ? 'Passed' : 'Skipped');
        const duration = test.duration || 50;

        if (status === 'Failed') {
            excelReporter.addFailedTest({
                name: test.title,
                reason: test.err ? test.err.message : 'Unknown',
                screenshot: 'N/A'
            });
        }
        
        excelReporter.addExecutionLog({
            timestamp: new Date().toISOString(),
            test: test.title,
            result: status
        });

        excelReporter.addTestResult({
            name: test.title,
            module: test.parent ? test.parent.title : 'Root',
            status: status,
            duration: duration
        });
    },

    async afterAll() {
        await BaseTest.quitDriver();
    }
};
