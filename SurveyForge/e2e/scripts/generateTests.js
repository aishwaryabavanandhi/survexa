const fs = require('fs');
const path = require('path');

const routesFilePath = path.join(__dirname, '../../src/routes/AppRoutes.jsx');
const testOutputDir = path.join(__dirname, '../tests/generated');
if (!fs.existsSync(testOutputDir)) {
    fs.mkdirSync(testOutputDir, { recursive: true });
}
const outputFilePath = path.join(testOutputDir, 'dynamicRoutes.test.js');

function generateTests() {
    console.log('Generating dynamic tests from React routes...');
    if (!fs.existsSync(routesFilePath)) {
        console.error(`Routes file not found at ${routesFilePath}`);
        return;
    }

    const content = fs.readFileSync(routesFilePath, 'utf8');
    const routeRegex = /<Route[^>]*path="([^"]+)"/g;
    const routes = [];
    let match;

    while ((match = routeRegex.exec(content)) !== null) {
        let routePath = match[1];
        // Skip dynamic parameterized routes for simple navigation tests
        if (!routePath.includes(':') && routePath !== '*') {
            routes.push(routePath);
        }
    }

    if (routes.length === 0) {
        console.log('No static routes found to generate tests.');
        return;
    }

    let testCode = `
// AUTO-GENERATED TEST FILE
const { Builder, By } = require('selenium-webdriver');
const { expect } = require('chai');
const envConfig = require('../../config/env.config');
const BaseTest = require('../BaseTest');

describe('Dynamic Route Navigation Tests', function () {
    let driver;

    before(async function () {
        driver = BaseTest.driver; // Use the globally initialized driver from Mocha root hooks or BaseTest
    });

`;

    routes.forEach(route => {
        testCode += `
    it('Should successfully navigate to ${route} without crashing', async function () {
        await driver.get(\`\${envConfig.baseUrl}${route}\`);
        const body = await driver.findElement(By.css('body'));
        const bodyText = await body.getText();
        expect(bodyText).to.not.be.empty;
        
        // Dynamic form validation check if form exists
        const forms = await driver.findElements(By.css('form'));
        if (forms.length > 0) {
            const submitBtn = await driver.findElements(By.css('button[type="submit"]'));
            if (submitBtn.length > 0) {
                // If it's a form, we could test empty submit, but this might trigger unwanted state.
                // We just log that form was found.
                console.log('    Form detected on ${route}');
            }
        }
    });
`;
    });

    testCode += `
});
`;

    fs.writeFileSync(outputFilePath, testCode, 'utf8');
    console.log(`Generated dynamic tests for ${routes.length} routes at ${outputFilePath}`);
}

generateTests();
