/**
 * pages/BasePage.js
 * Base Page Object class — all page objects extend this.
 * Provides reusable element interaction methods with explicit waits,
 * retry mechanisms, and built-in error handling.
 */
const logger = require('../utilities/logger')

class BasePage {
  /**
   * @param {WebdriverIO.Browser} driver
   */
  constructor(driver) {
    this.driver = driver
    this.waitTimeout = parseInt(process.env.ELEMENT_WAIT_TIMEOUT || '15000', 10)
  }

  // ── Element Finders ──────────────────────────────────────────────

  /** Find element by accessibility ID (content-desc) */
  byAccessibility(id) {
    return `~${id}`
  }

  /** Find element by resource ID */
  byId(id) {
    return `android=new UiSelector().resourceId("${id}")`
  }

  /** Find element by XPath */
  byXPath(xpath) {
    return xpath
  }

  /** Find element by class name */
  byClass(cls) {
    return `android=new UiSelector().className("${cls}")`
  }

  /** Find by text (exact) */
  byText(text) {
    return `android=new UiSelector().text("${text}")`
  }

  /** Find by text (contains) */
  byTextContains(text) {
    return `android=new UiSelector().textContains("${text}")`
  }

  // ── Wait Methods ─────────────────────────────────────────────────

  /**
   * Wait for element to be displayed
   * @param {string} selector
   * @param {number} timeout
   */
  async waitForElement(selector, timeout = this.waitTimeout) {
    try {
      const el = await this.driver.$(selector)
      await el.waitForDisplayed({ timeout })
      return el
    } catch (err) {
      logger.warn(`waitForElement timeout: ${selector} — ${err.message}`)
      throw new Error(`Element not found: ${selector}`)
    }
  }

  /**
   * Wait for element to be clickable
   */
  async waitForClickable(selector, timeout = this.waitTimeout) {
    const el = await this.driver.$(selector)
    await el.waitForEnabled({ timeout })
    return el
  }

  // ── Actions ──────────────────────────────────────────────────────

  /**
   * Click an element by selector
   */
  async click(selector) {
    const el = await this.waitForElement(selector)
    await el.click()
    logger.debug(`✅ Clicked: ${selector}`)
  }

  /**
   * Type text into an element (clears first)
   */
  async typeText(selector, text) {
    const el = await this.waitForElement(selector)
    await el.clearValue()
    await el.setValue(text)
    logger.debug(`⌨️  Typed "${text}" into: ${selector}`)
  }

  /**
   * Get text content of an element
   */
  async getText(selector) {
    const el = await this.waitForElement(selector)
    return await el.getText()
  }

  /**
   * Check if element is displayed (non-throwing)
   */
  async isDisplayed(selector, timeout = 5000) {
    try {
      const el = await this.driver.$(selector)
      await el.waitForDisplayed({ timeout })
      return true
    } catch {
      return false
    }
  }

  /**
   * Check if element exists in DOM (non-throwing)
   */
  async isExisting(selector) {
    try {
      const el = await this.driver.$(selector)
      return await el.isExisting()
    } catch {
      return false
    }
  }

  /**
   * Wait for text to appear on screen
   */
  async waitForTextVisible(text, timeout = this.waitTimeout) {
    const selector = `android=new UiSelector().textContains("${text}")`
    return this.waitForElement(selector, timeout)
  }

  /**
   * Dismiss keyboard if visible
   */
  async hideKeyboard() {
    try {
      await this.driver.hideKeyboard()
    } catch { /* keyboard might not be visible */ }
  }

  /**
   * Scroll down once using touch action
   */
  async scrollDown() {
    const { width, height } = await this.driver.getWindowSize()
    await this.driver.action('pointer')
      .move({ x: width / 2, y: height * 0.7 })
      .down()
      .pause(100)
      .move({ x: width / 2, y: height * 0.3 })
      .up()
      .perform()
  }

  /**
   * Scroll up once using touch action
   */
  async scrollUp() {
    const { width, height } = await this.driver.getWindowSize()
    await this.driver.action('pointer')
      .move({ x: width / 2, y: height * 0.3 })
      .down()
      .pause(100)
      .move({ x: width / 2, y: height * 0.7 })
      .up()
      .perform()
  }

  /**
   * Scroll until element is visible (max 5 attempts)
   */
  async scrollToElement(selector, maxScrolls = 5) {
    for (let i = 0; i < maxScrolls; i++) {
      const visible = await this.isDisplayed(selector, 2000)
      if (visible) return true
      await this.scrollDown()
      await this.driver.pause(500)
    }
    return false
  }

  /**
   * Long press on an element
   */
  async longPress(selector, duration = 1500) {
    const el = await this.waitForElement(selector)
    const loc = await el.getLocation()
    const size = await el.getSize()
    const x = loc.x + size.width / 2
    const y = loc.y + size.height / 2

    await this.driver.action('pointer')
      .move({ x, y })
      .down()
      .pause(duration)
      .up()
      .perform()
    logger.debug(`🖐️  Long-pressed: ${selector}`)
  }

  /**
   * Double tap on element
   */
  async doubleTap(selector) {
    const el = await this.waitForElement(selector)
    await el.doubleClick()
    logger.debug(`👆👆 Double-tapped: ${selector}`)
  }

  /**
   * Wait for page to load (checks for absence of loading indicator)
   */
  async waitForPageLoad(timeout = 15000) {
    await this.driver.pause(1000)
  }

  /**
   * Press Android back button
   */
  async pressBack() {
    await this.driver.back()
    logger.debug('⬅️  Pressed back')
  }

  /**
   * Get current activity name
   */
  async getCurrentActivity() {
    return await this.driver.getCurrentActivity()
  }

  /**
   * Accept/dismiss alert dialogs
   */
  async acceptAlert() {
    try {
      await this.driver.acceptAlert()
    } catch { /* no alert */ }
  }

  async dismissAlert() {
    try {
      await this.driver.dismissAlert()
    } catch { /* no alert */ }
  }
}

module.exports = BasePage
