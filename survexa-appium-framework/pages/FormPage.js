/**
 * pages/FormPage.js
 * Generic form validation page object
 */
const BasePage = require('./BasePage')

class FormPage extends BasePage {
  constructor(driver) {
    super(driver)

    this.nameField      = `android=new UiSelector().className("android.widget.EditText").instance(0)`
    this.emailField     = `android=new UiSelector().className("android.widget.EditText").instance(1)`
    this.phoneField     = `android=new UiSelector().className("android.widget.EditText").instance(2)`
    this.passwordField  = `android=new UiSelector().className("android.widget.EditText").instance(3)`
    this.dateField      = `android=new UiSelector().className("android.widget.EditText").instance(4)`
    this.checkbox1      = `android=new UiSelector().className("android.widget.CheckBox").instance(0)`
    this.checkbox2      = `android=new UiSelector().className("android.widget.CheckBox").instance(1)`
    this.submitButton   = `android=new UiSelector().textContains("Submit")`
    this.validationMsg  = `android=new UiSelector().textContains("required")`
  }

  /**
   * Fill a generic form and submit
   */
  async fillForm(name, email, phone, password, date, check1 = false, check2 = false) {
    const allInputs = await this.driver.$$(`android=new UiSelector().className("android.widget.EditText")`)

    if (allInputs.length > 0 && name !== undefined) await allInputs[0].setValue(name)
    if (allInputs.length > 1 && email !== undefined) await allInputs[1].setValue(email)
    if (allInputs.length > 2 && phone !== undefined) await allInputs[2].setValue(phone)
    if (allInputs.length > 3 && password !== undefined) await allInputs[3].setValue(password)
    if (allInputs.length > 4 && date !== undefined) await allInputs[4].setValue(date)

    await this.hideKeyboard()

    if (check1) {
      const cb1 = await this.isDisplayed(this.checkbox1, 2000)
      if (cb1) await this.click(this.checkbox1)
    }
    if (check2) {
      const cb2 = await this.isDisplayed(this.checkbox2, 2000)
      if (cb2) await this.click(this.checkbox2)
    }

    const submitVisible = await this.isDisplayed(this.submitButton, 3000)
    if (submitVisible) {
      await this.click(this.submitButton)
      await this.driver.pause(2000)
    }
  }

  /**
   * Get validation message from the form
   */
  async getValidationMessage() {
    const errorSelectors = [
      `android=new UiSelector().textContains("required")`,
      `android=new UiSelector().textContains("invalid")`,
      `android=new UiSelector().textContains("email")`,
      `android=new UiSelector().textContains("phone")`,
      `android=new UiSelector().textContains("password")`,
      `android=new UiSelector().textContains("error")`,
    ]
    for (const sel of errorSelectors) {
      if (await this.isDisplayed(sel, 3000)) {
        return await this.getText(sel)
      }
    }
    return ''
  }
}

module.exports = FormPage
