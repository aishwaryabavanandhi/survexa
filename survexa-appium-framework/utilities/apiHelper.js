/**
 * utilities/apiHelper.js
 * Pre-test API validation helper using Axios
 * Validates backend connectivity before running UI tests
 * Also provides test data setup helpers (create test user, get OTP, etc.)
 */
require('dotenv').config()
const axios = require('axios')
const logger = require('./logger')

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'
const TEST_EMAIL = process.env.TEST_EMAIL || 'testuser@survexa.test'
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestPassword123!'

const http = axios.create({
  baseURL: BACKEND_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

let _authToken = null

/**
 * Check backend health endpoint
 */
async function checkBackendHealth() {
  try {
    const { data } = await http.get('/health')
    logger.info(`✅ Backend health: ${data.status} | v${data.version}`)
    return { ok: true, data }
  } catch (err) {
    logger.error(`❌ Backend unreachable at ${BACKEND_URL}: ${err.message}`)
    return { ok: false, error: err.message }
  }
}

/**
 * Login via API and store token
 */
async function loginTestUser(email = TEST_EMAIL, password = TEST_PASSWORD) {
  try {
    const { data } = await http.post('/auth/login', { email, password })
    if (data.success && data.token) {
      _authToken = data.token
      http.defaults.headers.Authorization = `Bearer ${_authToken}`
      logger.info(`✅ API login successful: ${email}`)
      return { ok: true, token: _authToken, user: data.user }
    }
    return { ok: false, error: data.error || 'Login failed' }
  } catch (err) {
    logger.warn(`⚠️ API login failed: ${err.response?.data?.error || err.message}`)
    return { ok: false, error: err.message }
  }
}

/**
 * Get latest OTP codes from test helper endpoint (dev only)
 */
async function getLatestOtps(email = TEST_EMAIL, phone = null) {
  try {
    const params = { email }
    if (phone) params.phone = phone
    const { data } = await http.get('/auth/test-helper/latest-otps', { params })
    logger.info(`📧 Latest OTPs: email=${data.emailOtp}, phone=${data.phoneOtp}`)
    return { ok: true, emailOtp: data.emailOtp, phoneOtp: data.phoneOtp }
  } catch (err) {
    logger.warn(`⚠️ Could not fetch OTPs: ${err.message}`)
    return { ok: false }
  }
}

/**
 * Create a test survey via API (returns survey id and share token)
 */
async function createTestSurvey(title = 'Automation Test Survey') {
  if (!_authToken) await loginTestUser()
  try {
    const { data } = await http.post('/surveys', {
      title,
      description: 'Created by Appium automation framework',
    })
    if (data.success) {
      logger.info(`✅ Test survey created: id=${data.survey?.id}, token=${data.survey?.share_token}`)
      return { ok: true, survey: data.survey }
    }
    return { ok: false, error: data.error }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

/**
 * Promote user to admin (dev only)
 */
async function promoteToAdmin(email) {
  try {
    const { data } = await http.post('/auth/test-helper/promote-admin', { email })
    logger.info(`✅ Promoted ${email} to admin`)
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

/**
 * Reset usage limits for test user
 */
async function resetUsageLimits(email = TEST_EMAIL) {
  try {
    await http.post('/auth/test-helper/reset-limits', { email })
    logger.info(`✅ Usage limits reset for ${email}`)
    return { ok: true }
  } catch (err) {
    return { ok: false }
  }
}

/**
 * Get a clean auth token (used for API-level test assertions)
 */
function getAuthToken() {
  return _authToken
}

module.exports = {
  checkBackendHealth,
  loginTestUser,
  getLatestOtps,
  createTestSurvey,
  promoteToAdmin,
  resetUsageLimits,
  getAuthToken,
  BACKEND_URL,
  TEST_EMAIL,
  TEST_PASSWORD,
}
