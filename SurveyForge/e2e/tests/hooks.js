const BaseTest = require('./BaseTest');
const BrowserUtils = require('../utilities/BrowserUtils');
const excelReporter = require('../utilities/ExcelReporter');

exports.mochaHooks = {
    async beforeAll() {
        await BaseTest.initDriver();
    },
    
    async afterEach() {
        const test = this.currentTest;
        if (!BaseTest.driver) return;

        const utils = new BrowserUtils(BaseTest.driver);
        let screenshotPath = '';
        const duration = test.duration;
        let status = test.state === 'failed' ? 'Failed' : (test.state === 'passed' ? 'Passed' : 'Skipped');

        if (status === 'Failed') {
            screenshotPath = await utils.takeScreenshot(test.title);
            let url = 'N/A';
            try { url = await BaseTest.driver.getCurrentUrl(); } catch(e){}
            
            excelReporter.addFailedTest({
                name: test.title,
                reason: test.err ? test.err.message : 'Unknown error',
                screenshot: screenshotPath || 'N/A',
                url: url
            });
            excelReporter.addExecutionLog({
                timestamp: new Date().toISOString(),
                test: test.title,
                step: 'Execution Failed',
                result: 'FAIL',
                remarks: test.err ? test.err.message : ''
            });
        } else if (status === 'Passed') {
            excelReporter.addExecutionLog({
                timestamp: new Date().toISOString(),
                test: test.title,
                step: 'Execution Passed',
                result: 'PASS',
                remarks: ''
            });
        }

        excelReporter.addTestResult({
            name: test.title,
            module: test.parent ? test.parent.title : 'Root',
            status: status,
            start: new Date(Date.now() - (duration || 0)).toISOString(),
            end: new Date().toISOString(),
            duration: duration || 0
        });
    },

    async afterAll() {
        await BaseTest.quitDriver();
    }
};
