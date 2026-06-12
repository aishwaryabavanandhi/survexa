/**
 * utilities/gestures.js
 * Reusable Android touch gestures implementation using W3C Actions API in WebdriverIO.
 */
const logger = require('./logger');

class Gestures {
  /**
   * Performs a touch tap action at specific coordinates.
   */
  static async tap(driver, x, y) {
    logger.debug(`Performing tap at: (${x}, ${y})`);
    await driver.action('pointer', { pointerType: 'touch' })
      .move({ x: Math.round(x), y: Math.round(y) })
      .down()
      .pause(50)
      .up()
      .perform();
  }

  /**
   * Performs a double-tap action at specific coordinates.
   */
  static async doubleTap(driver, x, y) {
    logger.debug(`Performing double tap at: (${x}, ${y})`);
    await driver.action('pointer', { pointerType: 'touch' })
      .move({ x: Math.round(x), y: Math.round(y) })
      .down().pause(50).up().pause(50)
      .down().pause(50).up()
      .perform();
  }

  /**
   * Performs a long press action.
   */
  static async longPress(driver, x, y, durationMs = 1500) {
    logger.debug(`Performing long press at: (${x}, ${y}) for ${durationMs}ms`);
    await driver.action('pointer', { pointerType: 'touch' })
      .move({ x: Math.round(x), y: Math.round(y) })
      .down()
      .pause(durationMs)
      .up()
      .perform();
  }

  /**
   * General swipe helper.
   */
  static async swipe(driver, startX, startY, endX, endY, durationMs = 600) {
    logger.debug(`Performing swipe from (${startX}, ${startY}) to (${endX}, ${endY})`);
    await driver.action('pointer', { pointerType: 'touch' })
      .move({ x: Math.round(startX), y: Math.round(startY) })
      .down()
      .move({ duration: durationMs, x: Math.round(endX), y: Math.round(endY) })
      .up()
      .perform();
  }

  /**
   * Swipes screen upwards (scroll down).
   */
  static async swipeUp(driver, ratio = 0.8) {
    const size = await driver.getWindowSize();
    const x = size.width / 2;
    const startY = size.height * ratio;
    const endY = size.height * (1 - ratio);
    await this.swipe(driver, x, startY, x, endY);
  }

  /**
   * Swipes screen downwards (scroll up).
   */
  static async swipeDown(driver, ratio = 0.8) {
    const size = await driver.getWindowSize();
    const x = size.width / 2;
    const startY = size.height * (1 - ratio);
    const endY = size.height * ratio;
    await this.swipe(driver, x, startY, x, endY);
  }

  /**
   * Swipes screen to the left.
   */
  static async swipeLeft(driver, ratio = 0.8) {
    const size = await driver.getWindowSize();
    const y = size.height / 2;
    const startX = size.width * ratio;
    const endX = size.width * (1 - ratio);
    await this.swipe(driver, startX, y, endX, y);
  }

  /**
   * Swipes screen to the right.
   */
  static async swipeRight(driver, ratio = 0.8) {
    const size = await driver.getWindowSize();
    const y = size.height / 2;
    const startX = size.width * (1 - ratio);
    const endX = size.width * ratio;
    await this.swipe(driver, startX, y, endX, y);
  }

  /**
   * Scrolls using swipes until target element is displayed or visible.
   */
  static async scrollUntilVisible(driver, elementLocator, direction = 'down', maxScrolls = 5) {
    logger.debug(`Scrolling ${direction} until element is visible: ${elementLocator}`);
    let isVisible = false;
    let scrolls = 0;

    while (!isVisible && scrolls < maxScrolls) {
      try {
        const el = await driver.$(elementLocator);
        isVisible = await el.isDisplayed();
        if (isVisible) break;
      } catch (err) {
        // Element not found in DOM yet, continue scrolling
      }

      if (direction === 'down') {
        await this.swipeUp(driver);
      } else {
        await this.swipeDown(driver);
      }
      scrolls++;
      await driver.pause(500);
    }

    if (!isVisible) {
      throw new Error(`Element ${elementLocator} not visible after ${maxScrolls} scrolls`);
    }
  }

  /**
   * Drags element from source coordinates to destination coordinates.
   */
  static async dragAndDrop(driver, startX, startY, endX, endY) {
    logger.debug(`Performing drag from (${startX}, ${startY}) to (${endX}, ${endY})`);
    await driver.action('pointer', { pointerType: 'touch' })
      .move({ x: Math.round(startX), y: Math.round(startY) })
      .down()
      .pause(800) // pause to engage long press drag activation
      .move({ duration: 1000, x: Math.round(endX), y: Math.round(endY) })
      .up()
      .perform();
  }

  /**
   * Performs a pinch/zoom operation using multi-touch.
   */
  static async pinchAndZoom(driver, x, y, scale = 1.5) {
    logger.debug(`Performing zoom gesture at (${x}, ${y}) with scale: ${scale}`);
    const size = await driver.getWindowSize();
    const offset = 200; // px
    
    // Finger 1 actions (Left side)
    const f1StartX = x - 50;
    const f1StartY = y;
    const f1EndX = scale > 1.0 ? x - offset : x - 50;

    // Finger 2 actions (Right side)
    const f2StartX = x + 50;
    const f2StartY = y;
    const f2EndX = scale > 1.0 ? x + offset : x + 50;

    await driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: Math.round(f1StartX), y: Math.round(f1StartY) },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerMove', duration: 800, x: Math.round(f1EndX), y: Math.round(f1StartY) },
          { type: 'pointerUp', button: 0 }
        ]
      },
      {
        type: 'pointer',
        id: 'finger2',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: Math.round(f2StartX), y: Math.round(f2StartY) },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerMove', duration: 800, x: Math.round(f2EndX), y: Math.round(f2StartY) },
          { type: 'pointerUp', button: 0 }
        ]
      }
    ]);
  }
}

module.exports = Gestures;
