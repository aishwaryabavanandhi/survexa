/**
 * pages/SurveyPage.js
 * Survey creation, editing, and publishing page object
 */
const BasePage = require('./BasePage')

class SurveyPage extends BasePage {
  constructor(driver) {
    super(driver)

    // Survey Builder selectors
    this.surveyTitleInput  = `android=new UiSelector().className("android.widget.EditText").instance(0)`
    this.surveyDescInput   = `android=new UiSelector().className("android.widget.EditText").instance(1)`
    this.addQuestionBtn    = `android=new UiSelector().textContains("Add Question")`
    this.publishBtn        = `android=new UiSelector().textContains("Publish")`
    this.saveBtn           = `android=new UiSelector().textContains("Save")`
    this.publishedBadge    = `android=new UiSelector().textContains("Published")`
    this.shareLink         = `android=new UiSelector().textContains("Share")`
    this.editBtn           = `android=new UiSelector().textContains("Edit")`
    this.deleteBtn         = `android=new UiSelector().textContains("Delete")`

    // Question type selectors
    this.questionTypeText  = `android=new UiSelector().textContains("Short Text")`
    this.questionTypeMcq   = `android=new UiSelector().textContains("Multiple Choice")`
    this.questionTypeRating = `android=new UiSelector().textContains("Rating")`

    // Question input
    this.questionTextInput  = `android=new UiSelector().className("android.widget.EditText")`
    this.questionOptionInput = `android=new UiSelector().className("android.widget.EditText")`
  }

  /**
   * Create a new survey with title and description
   */
  async createSurvey(title, description = '') {
    await this.waitForElement(this.surveyTitleInput)
    await this.typeText(this.surveyTitleInput, title)

    if (description) {
      await this.typeText(this.surveyDescInput, description)
    }

    await this.hideKeyboard()
    await this.driver.pause(500)
  }

  /**
   * Add a question to the survey
   */
  async addQuestion(questionText, type = 'text') {
    await this.click(this.addQuestionBtn)
    await this.driver.pause(1000)

    // Select question type if not default
    if (type === 'mcq') {
      await this.click(this.questionTypeMcq)
    } else if (type === 'rating') {
      await this.click(this.questionTypeRating)
    }

    // Fill question text
    const inputs = await this.driver.$$(`android=new UiSelector().className("android.widget.EditText")`)
    if (inputs.length > 0) {
      await inputs[inputs.length - 1].setValue(questionText)
    }

    await this.hideKeyboard()
    await this.driver.pause(500)
  }

  /**
   * Save the survey (auto-save trigger)
   */
  async saveSurvey() {
    const saveVisible = await this.isDisplayed(this.saveBtn, 3000)
    if (saveVisible) {
      await this.click(this.saveBtn)
      await this.driver.pause(2000)
    }
  }

  /**
   * Publish the survey
   */
  async publishSurvey() {
    await this.click(this.publishBtn)
    await this.driver.pause(2000)

    // Confirm dialog if present
    const confirmBtn = `android=new UiSelector().textContains("Confirm")`
    if (await this.isDisplayed(confirmBtn, 3000)) {
      await this.click(confirmBtn)
      await this.driver.pause(2000)
    }
  }

  /**
   * Check if survey is now published
   */
  async isPublished() {
    return this.isDisplayed(this.publishedBadge, 5000)
  }

  /**
   * Get the share link/token for the survey
   */
  async getShareLink() {
    const shareLinkVisible = await this.isDisplayed(this.shareLink, 5000)
    if (shareLinkVisible) {
      await this.click(this.shareLink)
      await this.driver.pause(1000)
      // Read the URL from clipboard or visible text
      return await this.getText(`android=new UiSelector().className("android.widget.EditText")`)
    }
    return null
  }
}

module.exports = SurveyPage
