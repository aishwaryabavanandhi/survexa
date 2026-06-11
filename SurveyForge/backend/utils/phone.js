/**
 * International phone normalization & validation (E.164)
 */
const { parsePhoneNumberFromString, isValidPhoneNumber } = require('libphonenumber-js')

const DEFAULT_REGION = process.env.DEFAULT_PHONE_REGION || 'IN'

/**
 * @param {string} raw
 * @param {string} [defaultRegion]
 * @returns {{ valid: boolean, e164?: string, error?: string }}
 */
function normalizePhone(raw, defaultRegion = DEFAULT_REGION) {
  const input = String(raw || '').trim()
  if (!input) {
    return { valid: false, error: 'Phone number is required' }
  }

  try {
    const parsed = parsePhoneNumberFromString(input, defaultRegion)
    if (!parsed || !parsed.isValid()) {
      return { valid: false, error: 'Enter a valid international phone number (e.g. +91 9876543210)' }
    }
    return { valid: true, e164: parsed.format('E.164') }
  } catch {
    return { valid: false, error: 'Invalid phone number format' }
  }
}

function isValidInternationalPhone(raw, defaultRegion = DEFAULT_REGION) {
  try {
    return isValidPhoneNumber(String(raw || '').trim(), defaultRegion)
  } catch {
    return false
  }
}

module.exports = { normalizePhone, isValidInternationalPhone, DEFAULT_REGION }
