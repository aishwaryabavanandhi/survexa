/**
 * Phone OTP authentication routes
 */
const express = require('express')
const bcrypt = require('bcryptjs')
const { query, run, queryOne } = require('../database')
const { normalizePhone } = require('../utils/phone')
const { sendPhoneOtp } = require('../services/smsProvider')
const { verifyFirebaseIdToken, isFirebaseConfigured } = require('../services/firebaseAdmin')
const {
  savePhoneOtp,
  checkResendCooldown,
  verifyPhoneOtpCode,
  generateOTP,
} = require('../lib/phoneOtpStore')
const { activateUserIfReady } = require('../lib/userActivation')
const { JWT_SECRET } = require('../config/jwt')
const jwt = require('jsonwebtoken')
const { logActivity } = require('../lib/activityLogger')

const router = express.Router()

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      role: user.role ?? 'user',
    },
    JWT_SECRET,
    { expiresIn: '7d' },
  )
}

function exposeOtpInDev(result) {
  const isDev = process.env.NODE_ENV !== 'production'
  return result.devMode || isDev ? result.otp : undefined
}

/** POST /auth/phone/send-otp — signup or login */
router.post('/send-otp', async (req, res) => {
  const { phone: rawPhone, purpose = 'signup' } = req.body

  if (!['signup', 'login'].includes(purpose)) {
    return res.status(400).json({ success: false, error: 'purpose must be signup or login' })
  }

  const { valid, e164, error } = normalizePhone(rawPhone)
  if (!valid) return res.status(400).json({ success: false, error })

  try {
    const user = queryOne('SELECT id, verified, phone_verified FROM users WHERE phone = ?', [e164])

    if (purpose === 'login') {
      if (!user) {
        return res.status(404).json({ success: false, error: 'No account found. Please create an account first.' })
      }
    } else if (purpose === 'signup' && user?.verified) {
      return res.status(409).json({ success: false, error: 'Phone number already registered. Please log in.' })
    }

    const cooldown = checkResendCooldown(e164, purpose)
    if (!cooldown.ok) {
      return res.status(429).json({
        success: false,
        error: `Please wait ${cooldown.waitSeconds} second${cooldown.waitSeconds !== 1 ? 's' : ''} before requesting a new OTP.`,
        waitSeconds: cooldown.waitSeconds,
      })
    }

    const code = generateOTP()
    savePhoneOtp(e164, code, purpose)
    const result = await sendPhoneOtp(e164, code)

    res.json({
      success: true,
      message: result.devMode
        ? 'OTP generated (check server console or configure Twilio).'
        : 'OTP sent to your mobile number.',
      devMode: result.devMode,
      provider: result.provider,
      phone: e164,
      otp: exposeOtpInDev(result),
    })
  } catch (err) {
    console.error('[PhoneAuth] send-otp:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

/** POST /auth/phone/verify-otp — verify signup phone */
router.post('/verify-otp', async (req, res) => {
  const { phone: rawPhone, code, purpose = 'signup' } = req.body

  if (!code) return res.status(400).json({ success: false, error: 'code is required' })

  const { valid, e164, error } = normalizePhone(rawPhone)
  if (!valid) return res.status(400).json({ success: false, error })

  try {
    const check = verifyPhoneOtpCode(e164, code, purpose)
    if (!check.ok) {
      return res.status(check.status).json({
        success: false,
        error: check.error,
        waitSeconds: check.waitSeconds,
      })
    }

    if (purpose === 'login') {
      const user = queryOne('SELECT * FROM users WHERE phone = ?', [e164])
      if (!user) return res.status(404).json({ success: false, error: 'User not found' })

      run(
        'UPDATE users SET phone_verified = 1, verified = 1, otp_verified_at = ? WHERE id = ?',
        [new Date().toISOString(), user.id],
      )
      const token = signToken(user)
      logActivity(user.id, user.email, 'login', 'Session started via phone OTP', user.id, 'auth')
      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          phone_number: user.phone,
          name: user.name,
          role: user.role,
          phone_verified: true,
        },
        message: 'Logged in successfully',
      })
    }

    // signup verification — user must exist (created at signup)
    const user = queryOne('SELECT * FROM users WHERE phone = ?', [e164])
    if (!user) {
      return res.status(404).json({ success: false, error: 'No pending signup for this phone. Please register first.' })
    }

    run(
      'UPDATE users SET phone_verified = 1, otp_verified_at = ? WHERE id = ?',
      [new Date().toISOString(), user.id],
    )
    activateUserIfReady(user.id)

    const updated = queryOne('SELECT * FROM users WHERE id = ?', [user.id])
    let token = null
    if (updated.verified) {
      token = signToken(updated)
      logActivity(user.id, user.email, 'user_registration', 'Account activated via phone OTP', user.id, 'auth')
    } else {
      logActivity(user.id, user.email, 'verify_phone', 'Phone verified via OTP', user.id, 'auth')
    }

    res.json({
      success: true,
      phoneVerified: true,
      accountActive: Boolean(updated.verified),
      token,
      user: updated.verified
        ? {
            id: updated.id,
            email: updated.email,
            phone: updated.phone,
            name: updated.name,
            role: updated.role,
          }
        : undefined,
      message: updated.verified
        ? 'Phone verified! Welcome to Survexa.'
        : 'Phone verified. Please verify your email to activate your account.',
    })
  } catch (err) {
    console.error('[PhoneAuth] verify-otp:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

/** POST /auth/phone/resend-otp */
router.post('/resend-otp', async (req, res) => {
  const { phone: rawPhone, purpose = 'signup' } = req.body
  const { valid, e164, error } = normalizePhone(rawPhone)
  if (!valid) return res.status(400).json({ success: false, error })

  try {
    const cooldown = checkResendCooldown(e164, purpose)
    if (!cooldown.ok) {
      return res.status(429).json({
        success: false,
        error: `Please wait ${cooldown.waitSeconds}s before resending.`,
        waitSeconds: cooldown.waitSeconds,
      })
    }

    const code = generateOTP()
    savePhoneOtp(e164, code, purpose)
    const result = await sendPhoneOtp(e164, code)

    res.json({
      success: true,
      message: 'New OTP sent.',
      devMode: result.devMode,
      otp: exposeOtpInDev(result),
      phone: e164,
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/** POST /auth/firebase/verify — client completed Firebase phone auth */
router.post('/firebase/verify', async (req, res) => {
  const { idToken, name, email, password } = req.body

  if (!idToken) {
    return res.status(400).json({ success: false, error: 'idToken is required' })
  }

  try {
    const decoded = await verifyFirebaseIdToken(idToken)
    if (!decoded.phone) {
      return res.status(400).json({ success: false, error: 'Firebase token has no phone_number claim' })
    }

    const { valid, e164, error } = normalizePhone(decoded.phone)
    if (!valid) return res.status(400).json({ success: false, error })

    let user = queryOne('SELECT * FROM users WHERE phone = ?', [e164])

    if (!user && email && password) {
      const emailNorm = email.toLowerCase().trim()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
        return res.status(400).json({ success: false, error: 'Invalid email' })
      }
      if (password.length < 8) {
        return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' })
      }
      const hashed = await bcrypt.hash(password, 12)
      const { lastInsertRowid } = run(
        'INSERT INTO users (email, password, name, phone, verified, email_verified, phone_verified) VALUES (?, ?, ?, ?, 1, 1, 1)',
        [emailNorm, hashed, (name || 'User').trim(), e164],
      )
      user = queryOne('SELECT * FROM users WHERE id = ?', [lastInsertRowid])
    } else if (user) {
      run('UPDATE users SET phone_verified = 1, verified = 1 WHERE id = ?', [user.id])
      user = queryOne('SELECT * FROM users WHERE id = ?', [user.id])
    } else {
      return res.status(404).json({
        success: false,
        error: 'No account found. Sign up with email, password, and phone first.',
      })
    }

    const token = signToken(user)
    logActivity(user.id, user.email, 'login', 'Session started via Firebase phone verification', user.id, 'auth')
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
      message: 'Firebase phone authentication successful',
    })
  } catch (err) {
    console.error('[PhoneAuth] firebase/verify:', err)
    res.status(401).json({ success: false, error: err.message })
  }
})

/** GET /auth/phone/status */
router.get('/status', (_req, res) => {
  const { getSmsProviderStatus } = require('../services/smsProvider')
  res.json({
    success: true,
    sms: getSmsProviderStatus(),
    firebase: isFirebaseConfigured(),
  })
})

module.exports = router
