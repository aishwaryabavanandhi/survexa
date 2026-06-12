/**
 * pages/FormPage.js
 * Page object for validation forms and profile fields.
 */
const BasePage = require('./BasePage');

class FormPage extends BasePage {
  constructor(driver) {
    super(driver);
    
    // Form Selectors
    this.nameInput = '//*[@resource-id="com.survexa.app:id/form_name"] | //*[@content-desc="form_name_input"]';
    this.emailInput = '//*[@resource-id="com.survexa.app:id/form_email"] | //*[@content-desc="form_email_input"]';
    this.phoneInput = '//*[@resource-id="com.survexa.app:id/form_phone"] | //*[@content-desc="form_phone_input"]';
    this.passwordInput = '//*[@resource-id="com.survexa.app:id/form_password"] | //*[@content-desc="form_password_input"]';
    this.dateInput = '//*[@resource-id="com.survexa.app:id/form_date"] | //*[@content-desc="form_date_input"]';
    this.planDropdown = '//*[@resource-id="com.survexa.app:id/form_plan_dropdown"] | //*[@content-desc="form_plan_select"]';
    this.dropdownOption = '//android.widget.TextView[@text="Professional"]';
    this.termsCheckbox = '//*[@resource-id="com.survexa.app:id/checkbox_terms"] | //*[@content-desc="terms_checkbox"]';
    this.submitButton = '//*[@resource-id="com.survexa.app:id/btn_submit_form"] | //*[@content-desc="submit_form_button"]';
    this.validationText = '//*[@resource-id="com.survexa.app:id/tv_form_error"] | //*[@content-desc="form_error_message"]';
  }

  /**
   * Fills and submits the form.
   */
  async fillForm(name, email, phone, password, dateValue, selectDropdown = true, checkTerms = true) {
    if (name !== null) await this.sendKeys(this.nameInput, name);
    if (email !== null) await this.sendKeys(this.emailInput, email);
    if (phone !== null) await this.sendKeys(this.phoneInput, phone);
    if (password !== null) await this.sendKeys(this.passwordInput, password);
    if (dateValue !== null) await this.sendKeys(this.dateInput, dateValue);

    await this.hideKeyboard();

    if (selectDropdown) {
      await this.click(this.planDropdown);
      await this.click(this.dropdownOption);
    }

    if (checkTerms) {
      await this.click(this.termsCheckbox);
    }

    await this.click(this.submitButton);
  }

  /**
   * Captures the validation message.
   */
  async getValidationMessage() {
    return await this.getText(this.validationText);
  }
}

module.exports = FormPage;
