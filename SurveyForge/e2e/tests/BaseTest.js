const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const excelReporter = require('../utilities/ExcelReporter');

class BaseTest {
    static driver;
    static db;

    static async initDriver() {
        let options = new chrome.Options();
        options.addArguments('--headless=new');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--window-size=1920,1080');

        this.driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
            
        const dbPath = path.join(__dirname, '../../../backend/database.sqlite');
        this.db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
            if (err) console.error('DB Error: ', err.message);
        });

        return this.driver;
    }

    static async quitDriver() {
        if (this.driver) {
            await this.driver.quit();
        }
        if (this.db) {
            this.db.close();
        }
        await excelReporter.generateReport();
    }
    
    static async takeScreenshot(filename) {
        if (!this.driver) return 'N/A';
        try {
            const base64 = await this.driver.takeScreenshot();
            const failuresDir = path.join(__dirname, '../reports/failures');
            if (!fs.existsSync(failuresDir)) fs.mkdirSync(failuresDir, {recursive:true});
            const filePath = path.join(failuresDir, filename + '_' + Date.now() + '.png');
            fs.writeFileSync(filePath, base64, 'base64');
            return filePath;
        } catch(e) {
            console.error('Screenshot failed', e);
            return 'N/A';
        }
    }
    
    static async queryDB(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

module.exports = BaseTest;
