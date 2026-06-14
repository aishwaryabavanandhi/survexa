/**
 * utilities/retry.js
 * Retry utility to execute operations with retries on failure.
 */
const logger = require('./logger');

class Retry {
  /**
   * Retries an async function multiple times before failing.
   * @param {Function} fn - Async function to run.
   * @param {number} retries - Number of retry attempts (default 3).
   * @param {number} delay - Delay between retries in milliseconds (default 1000).
   * @returns {Promise<any>}
   */
  static async execute(fn, retries = 3, delay = 1000) {
    let lastError;
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        logger.warn(`Operation failed (Attempt ${i + 1}/${retries}): ${err.message}. Retrying in ${delay}ms...`);
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    logger.error(`Operation failed after ${retries} attempts.`);
    throw lastError;
  }
}

module.exports = Retry;
