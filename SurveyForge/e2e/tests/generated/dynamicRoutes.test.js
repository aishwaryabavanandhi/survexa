
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


    it('Should successfully navigate to /splash without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/splash`);
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
                console.log('    Form detected on /splash');
            }
        }
    });

    it('Should successfully navigate to /welcome without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/welcome`);
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
                console.log('    Form detected on /welcome');
            }
        }
    });

    it('Should successfully navigate to /login without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/login`);
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
                console.log('    Form detected on /login');
            }
        }
    });

    it('Should successfully navigate to /signup without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/signup`);
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
                console.log('    Form detected on /signup');
            }
        }
    });

    it('Should successfully navigate to /forgot-password without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/forgot-password`);
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
                console.log('    Form detected on /forgot-password');
            }
        }
    });

    it('Should successfully navigate to /reset-password without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/reset-password`);
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
                console.log('    Form detected on /reset-password');
            }
        }
    });

    it('Should successfully navigate to /otp without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/otp`);
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
                console.log('    Form detected on /otp');
            }
        }
    });

    it('Should successfully navigate to /verify-phone without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/verify-phone`);
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
                console.log('    Form detected on /verify-phone');
            }
        }
    });

    it('Should successfully navigate to /phone/enter without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/phone/enter`);
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
                console.log('    Form detected on /phone/enter');
            }
        }
    });

    it('Should successfully navigate to /phone/otp without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/phone/otp`);
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
                console.log('    Form detected on /phone/otp');
            }
        }
    });

    it('Should successfully navigate to /phone/resend without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/phone/resend`);
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
                console.log('    Form detected on /phone/resend');
            }
        }
    });

    it('Should successfully navigate to /onboarding without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/onboarding`);
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
                console.log('    Form detected on /onboarding');
            }
        }
    });

    it('Should successfully navigate to /pricing without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/pricing`);
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
                console.log('    Form detected on /pricing');
            }
        }
    });

    it('Should successfully navigate to /dashboard without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/dashboard`);
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
                console.log('    Form detected on /dashboard');
            }
        }
    });

    it('Should successfully navigate to /create without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/create`);
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
                console.log('    Form detected on /create');
            }
        }
    });

    it('Should successfully navigate to /templates without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/templates`);
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
                console.log('    Form detected on /templates');
            }
        }
    });

    it('Should successfully navigate to /surveys without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/surveys`);
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
                console.log('    Form detected on /surveys');
            }
        }
    });

    it('Should successfully navigate to /surveys/builder without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/surveys/builder`);
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
                console.log('    Form detected on /surveys/builder');
            }
        }
    });

    it('Should successfully navigate to /distribution without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/distribution`);
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
                console.log('    Form detected on /distribution');
            }
        }
    });

    it('Should successfully navigate to /notifications without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/notifications`);
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
                console.log('    Form detected on /notifications');
            }
        }
    });

    it('Should successfully navigate to /help without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/help`);
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
                console.log('    Form detected on /help');
            }
        }
    });

    it('Should successfully navigate to /discover without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/discover`);
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
                console.log('    Form detected on /discover');
            }
        }
    });

    it('Should successfully navigate to /activity without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/activity`);
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
                console.log('    Form detected on /activity');
            }
        }
    });

    it('Should successfully navigate to /trash without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/trash`);
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
                console.log('    Form detected on /trash');
            }
        }
    });

    it('Should successfully navigate to /compare without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/compare`);
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
                console.log('    Form detected on /compare');
            }
        }
    });

    it('Should successfully navigate to /live without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/live`);
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
                console.log('    Form detected on /live');
            }
        }
    });

    it('Should successfully navigate to /ai-generator without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/ai-generator`);
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
                console.log('    Form detected on /ai-generator');
            }
        }
    });

    it('Should successfully navigate to /responses without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/responses`);
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
                console.log('    Form detected on /responses');
            }
        }
    });

    it('Should successfully navigate to /analytics without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/analytics`);
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
                console.log('    Form detected on /analytics');
            }
        }
    });

    it('Should successfully navigate to /insights without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/insights`);
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
                console.log('    Form detected on /insights');
            }
        }
    });

    it('Should successfully navigate to /reports without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/reports`);
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
                console.log('    Form detected on /reports');
            }
        }
    });

    it('Should successfully navigate to /settings without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/settings`);
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
                console.log('    Form detected on /settings');
            }
        }
    });

    it('Should successfully navigate to /billing without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/billing`);
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
                console.log('    Form detected on /billing');
            }
        }
    });

    it('Should successfully navigate to /upgrade without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/upgrade`);
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
                console.log('    Form detected on /upgrade');
            }
        }
    });

    it('Should successfully navigate to /admin without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/admin`);
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
                console.log('    Form detected on /admin');
            }
        }
    });

    it('Should successfully navigate to /admin/billing without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/admin/billing`);
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
                console.log('    Form detected on /admin/billing');
            }
        }
    });

    it('Should successfully navigate to /admin/payments without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/admin/payments`);
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
                console.log('    Form detected on /admin/payments');
            }
        }
    });

    it('Should successfully navigate to /admin/settings/payments without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/admin/settings/payments`);
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
                console.log('    Form detected on /admin/settings/payments');
            }
        }
    });

    it('Should successfully navigate to /admin/activity without crashing', async function () {
        await driver.get(`${envConfig.baseUrl}/admin/activity`);
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
                console.log('    Form detected on /admin/activity');
            }
        }
    });

});
