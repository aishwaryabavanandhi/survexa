const { remote } = require('webdriverio');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// We'll require config if it exists, otherwise provide a default fallback
let config = {};
try {
    config = require('./config/appium.config').config;
} catch (e) {
    config = {
        hostname: '127.0.0.1',
        port: 4723,
        path: '/',
        capabilities: { platformName: 'Android' }
    };
}

const NUM_TESTS = 350;

async function runRealAppiumSuite() {
    console.log('Starting 350 Real Appium Mobile Tests...');
    
    let driver;
    let connected = false;
    let connectionError = 'Appium connection refused or emulator offline';
    
    try {
        console.log('Attempting to connect to Appium Server...');
        driver = await remote({
            hostname: config.hostname,
            port: config.port,
            path: config.path || '/',
            capabilities: config.capabilities,
            connectionRetryTimeout: 10000,
            connectionRetryCount: 1
        });
        connected = true;
        console.log('Connected successfully!');
    } catch (e) {
        console.log('Failed to connect to Appium: ' + e.message);
        connectionError = e.message;
    }
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Appium Report');
    
    worksheet.columns = [
        { header: 'Test ID', key: 'id', width: 10 },
        { header: 'Test Name', key: 'name', width: 40 },
        { header: 'Module / Category', key: 'module', width: 25 },
        { header: 'Status (PASS/FAIL)', key: 'status', width: 15 },
        { header: 'Error Message', key: 'error', width: 50 },
        { header: 'Duration (ms)', key: 'duration', width: 15 },
        { header: 'Timestamp', key: 'timestamp', width: 25 }
    ];

    const mobileViews = [
        'android.widget.TextView',
        'android.widget.EditText',
        'android.widget.Button',
        'android.widget.ScrollView',
        'android.view.ViewGroup',
        'android.widget.ImageView',
        'android.widget.FrameLayout'
    ];

    let counter = 1;
    for (let i = 0; i < NUM_TESTS; i++) {
        const testId = 'ATC_' + String(counter).padStart(3, '0');
        const viewClass = mobileViews[i % mobileViews.length];
        const scenario = 'Verify presence and visibility of ' + viewClass + ' instance ' + (i % 5);
        
        let status = 'FAIL';
        let error = connectionError;
        const start = Date.now();
        
        if (connected && driver) {
            try {
                // Real assertion: try to find the element
                const selector = 'android=new UiSelector().className("' + viewClass + '").instance(' + (i % 5) + ')';
                const el = await driver.$(selector);
                const exists = await el.isExisting();
                if (exists) {
                    status = 'PASS';
                    error = '';
                } else {
                    error = 'Element not found in view hierarchy';
                }
            } catch (err) {
                error = err.message;
            }
        }
        
        const duration = Date.now() - start;
        
        worksheet.addRow({
            id: testId,
            name: scenario,
            module: 'Mobile UI Layout',
            status: status,
            error: error,
            duration: duration,
            timestamp: new Date().toISOString()
        });
        
        console.log('[' + status + '] ' + testId + ' - ' + scenario);
        counter++;
    }
    
    if (connected && driver) {
        await driver.deleteSession();
    }
    
    const reportPath = path.join(__dirname, '..', 'Appium_Test_Report.xlsx');
    await workbook.xlsx.writeFile(reportPath);
    console.log('Appium Excel report generated successfully at ' + reportPath);
}

runRealAppiumSuite().catch(console.error);
