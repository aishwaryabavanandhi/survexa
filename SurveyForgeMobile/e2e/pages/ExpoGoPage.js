class ExpoGoPage {
    constructor(driver) {
        this.driver = driver;
    }
    async execute() {
        await this.driver.sleep(20);
        return true;
    }
}
module.exports = ExpoGoPage;
