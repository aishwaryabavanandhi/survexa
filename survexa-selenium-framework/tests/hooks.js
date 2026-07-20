const excelReporter = require('../utilities/excelReporter');
const DriverManager = require('../utilities/driverManager');

// We can make the driver globally available if we want, or tests can instantiate it themselves.
// For simplicity, tests will instantiate it.

exports.mochaHooks = {
    afterEach: function() {
        excelReporter.addResult(this.currentTest);
    },
    afterAll: async function() {
        await excelReporter.generateReport();
    }
};
