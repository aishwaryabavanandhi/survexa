/**
 * utilities/gestures.js
 * Reusable mobile gesture automation utilities
 * Supports: Tap, Double Tap, Long Press, Swipe, Scroll, Drag, Pinch, Zoom
 */

const Gestures = {
  /**
   * Swipe up (scroll down)
   */
  async swipeUp(driver) {
    const { width, height } = await driver.getWindowSize()
    await driver.action('pointer', {
      parameters: { pointerType: 'touch' }
    })
      .move({ x: Math.round(width * 0.5), y: Math.round(height * 0.7) })
      .down()
      .pause(100)
      .move({ x: Math.round(width * 0.5), y: Math.round(height * 0.2) })
      .up()
      .perform()
    await driver.pause(300)
  },

  /**
   * Swipe down (scroll up)
   */
  async swipeDown(driver) {
    const { width, height } = await driver.getWindowSize()
    await driver.action('pointer', {
      parameters: { pointerType: 'touch' }
    })
      .move({ x: Math.round(width * 0.5), y: Math.round(height * 0.2) })
      .down()
      .pause(100)
      .move({ x: Math.round(width * 0.5), y: Math.round(height * 0.7) })
      .up()
      .perform()
    await driver.pause(300)
  },

  /**
   * Swipe left (next page / dismiss)
   */
  async swipeLeft(driver) {
    const { width, height } = await driver.getWindowSize()
    await driver.action('pointer', {
      parameters: { pointerType: 'touch' }
    })
      .move({ x: Math.round(width * 0.8), y: Math.round(height * 0.5) })
      .down()
      .pause(100)
      .move({ x: Math.round(width * 0.2), y: Math.round(height * 0.5) })
      .up()
      .perform()
    await driver.pause(300)
  },

  /**
   * Swipe right (previous page / back)
   */
  async swipeRight(driver) {
    const { width, height } = await driver.getWindowSize()
    await driver.action('pointer', {
      parameters: { pointerType: 'touch' }
    })
      .move({ x: Math.round(width * 0.2), y: Math.round(height * 0.5) })
      .down()
      .pause(100)
      .move({ x: Math.round(width * 0.8), y: Math.round(height * 0.5) })
      .up()
      .perform()
    await driver.pause(300)
  },

  /**
   * Tap at specific coordinates
   */
  async tapAt(driver, x, y) {
    await driver.action('pointer', {
      parameters: { pointerType: 'touch' }
    })
      .move({ x, y })
      .down()
      .pause(50)
      .up()
      .perform()
  },

  /**
   * Double tap at coordinates
   */
  async doubleTapAt(driver, x, y) {
    await Gestures.tapAt(driver, x, y)
    await driver.pause(100)
    await Gestures.tapAt(driver, x, y)
  },

  /**
   * Long press at coordinates
   * @param {number} duration - milliseconds to hold
   */
  async longPressAt(driver, x, y, duration = 1500) {
    await driver.action('pointer', {
      parameters: { pointerType: 'touch' }
    })
      .move({ x, y })
      .down()
      .pause(duration)
      .up()
      .perform()
  },

  /**
   * Drag from one point to another
   */
  async dragAndDrop(driver, fromX, fromY, toX, toY) {
    await driver.action('pointer', {
      parameters: { pointerType: 'touch' }
    })
      .move({ x: fromX, y: fromY })
      .down()
      .pause(500)
      .move({ x: toX, y: toY, duration: 800 })
      .up()
      .perform()
  },

  /**
   * Pinch and zoom gesture (2-finger spread)
   * @param {number} centerX - center X coordinate
   * @param {number} centerY - center Y coordinate
   * @param {number} scale - zoom scale factor (>1 zoom in, <1 zoom out)
   */
  async pinchAndZoom(driver, centerX, centerY, scale = 1.5) {
    const startOffset = 50
    const endOffset = Math.round(startOffset * scale)

    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: centerX - startOffset, y: centerY },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerMove', duration: 600, x: centerX - endOffset, y: centerY },
          { type: 'pointerUp', button: 0 },
        ],
      },
      {
        type: 'pointer',
        id: 'finger2',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: centerX + startOffset, y: centerY },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerMove', duration: 600, x: centerX + endOffset, y: centerY },
          { type: 'pointerUp', button: 0 },
        ],
      },
    ])
    await driver.pause(500)
  },

  /**
   * Pinch to zoom out (2-finger pinch)
   */
  async pinchToZoomOut(driver, centerX, centerY, scale = 0.5) {
    return Gestures.pinchAndZoom(driver, centerX, centerY, scale)
  },

  /**
   * Scroll to find element using UiScrollable
   */
  async scrollToText(driver, text) {
    try {
      const selector = `android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().textContains("${text}"))`
      const el = await driver.$(selector)
      await el.waitForDisplayed({ timeout: 10000 })
      return el
    } catch (err) {
      throw new Error(`Could not scroll to element with text: "${text}" — ${err.message}`)
    }
  },

  /**
   * Pull-to-refresh gesture
   */
  async pullToRefresh(driver) {
    const { width, height } = await driver.getWindowSize()
    await driver.action('pointer', {
      parameters: { pointerType: 'touch' }
    })
      .move({ x: Math.round(width * 0.5), y: Math.round(height * 0.2) })
      .down()
      .pause(200)
      .move({ x: Math.round(width * 0.5), y: Math.round(height * 0.8), duration: 800 })
      .up()
      .perform()
    await driver.pause(2000)
  },
}

module.exports = Gestures
