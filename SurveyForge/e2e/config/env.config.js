require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

module.exports = {
    baseUrl: process.env.E2E_BASE_URL || 'http://localhost:5173',
    browser: process.env.BROWSER || 'chrome',
    headless: process.env.HEADLESS !== 'false',
    timeout: parseInt(process.env.TIMEOUT) || 30000
};
