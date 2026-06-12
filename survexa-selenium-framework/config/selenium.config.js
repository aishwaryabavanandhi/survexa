require('dotenv').config();
const path = require('path');

module.exports = {
  baseUrl: process.env.BASE_URL || 'http://localhost:5173',
  browserName: process.env.BROWSER || 'chrome',
  headless: process.env.HEADLESS === 'true',
  implicitTimeout: parseInt(process.env.IMPLICIT_TIMEOUT || '5000', 10),
  explicitTimeout: parseInt(process.env.EXPLICIT_TIMEOUT || '10000', 10),
  screenshotPath: path.resolve(__dirname, '../reports/failures'),
  logPath: path.resolve(__dirname, '../logs'),
  excelReportPath: path.resolve(__dirname, '../excel/E2E_Report.xlsx'),
  
  // React source directories for dynamic test generation
  reactRoutesPath: path.resolve(__dirname, '../../SurveyForge/src/config/screenRoutes.js'),
  reactValidatorsPath: path.resolve(__dirname, '../../SurveyForge/src/utils/validators.js'),
  reactPagesDir: path.resolve(__dirname, '../../SurveyForge/src/pages'),
};
