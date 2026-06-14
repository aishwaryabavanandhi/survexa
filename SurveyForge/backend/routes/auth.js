/**
 * routes/auth.js — OTP-based Authentication with graceful email fallback
 */

const crypto     = require('crypto')
const express    = require('express')
const bcrypt     = require('bcryptjs')
const jwt        = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const { query, run, queryOne } = require('../database')
const { normalizePhone } = require('../utils/phone')
const { sendPhoneOtp } = require('../services/smsProvider')
const { savePhoneOtp, generateOTP: generatePhoneOTP } = require('../lib/phoneOtpStore')
const {
  saveEmailOtp,
  checkEmailResendCooldown,
  verifyEmailOtpCode,
} = require('../lib/emailOtpStore')
const { activateUserIfReady } = require('../lib/userActivation')
const { ensureFreeSubscription } = require('../lib/subscriptions')
const { ensureUsageRow } = require('../lib/usage')
const { logActivity } = require('../lib/activityLogger')
const { requireAuth } = require('../middleware/auth')

const router     = express.Router()
const { JWT_SECRET } = require('../config/jwt')
const RESET_TTL_MS     = 15 * 60 * 1000  // 15 minutes

// ── Helpers ───────────────────────────────────────────────

function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function generatePasswordResetToken() {
  return crypto.randomBytes(32).toString('hex')
}

function hashPasswordResetToken(raw) {
  return crypto.createHash('sha256').update(raw, 'utf8').digest('hex')
}

function resetLinkBase() {
  return (process.env.FRONTEND_URL ?? 'http://localhost:5173').replace(/\/$/, '')
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role ?? 'user' },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

/**
 * Create Gmail SMTP transporter.
 * Returns null if credentials are missing/placeholder.
 */
function createTransporter() {
  const user = process.env.EMAIL_USER || ''
  const pass = process.env.EMAIL_PASS || ''

  // Only skip if truly unconfigured (placeholder values)
  if (!user || !pass || user.includes('your-email@')) {
    return null
  }

  return nodemailer.createTransport({
    host:   'smtp.gmail.com',
    port:   587,
    secure: false,
    auth:   { user, pass },
    tls:    { rejectUnauthorized: false },
    connectionTimeout: 30000,
    greetingTimeout:   30000,
    socketTimeout:     45000,
  })
}

/**
 * Try to send via SMTP. If SMTP fails for any reason (wrong password, network, etc.)
 * fall back silently to console logging so the app never breaks.
 */
async function sendOTPEmail(email, otp, name = '') {
  const transporter = createTransporter()

  const devLog = () => {
    console.log('\n  ┌──────────────────────────────────────────┐')
    console.log('  │  📧  OTP (Email not delivered via SMTP)   │')
    console.log('  ├──────────────────────────────────────────┤')
    console.log(`  │  To:      ${email.slice(0, 28).padEnd(28)}  │`)
    console.log(`  │  OTP:     ${otp.padEnd(28)}  │`)
    console.log('  │  Expires: 5 minutes                      │')
    console.log('  └──────────────────────────────────────────┘\n')
  }

  if (!transporter) {
    devLog()
    return { devMode: true, otp }
  }

  try {
    await transporter.verify()
    await transporter.sendMail({
      from:    `"Survexa" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: '🔐 Your Survexa Verification Code',
      html: buildOTPEmailHTML(otp, name),
    })
    console.log(`  ✅  OTP email sent to: ${email}`)
    return { devMode: false }
  } catch (err) {
    console.error(`  ⚠️  SMTP failed (${err.message}) — OTP logged to console instead`)
    devLog()
    return { devMode: true, otp, smtpError: err.message }
  }
}

async function sendPasswordResetEmail(email, rawToken, name = '') {
  const transporter = createTransporter()
  const link = `${resetLinkBase()}/reset-password?token=${encodeURIComponent(rawToken)}`

  const devLog = () => {
    console.log('\n  ┌──────────────────────────────────────────────────────┐')
    console.log('  │  📧  Password Reset (Email not delivered via SMTP)    │')
    console.log('  ├──────────────────────────────────────────────────────┤')
    console.log(`  │  To:   ${email.slice(0, 46).padEnd(46)}  │`)
    console.log(`  │  Link: ${link.slice(0, 46).padEnd(46)}  │`)
    console.log('  │  Expires: 15 minutes                                  │')
    console.log('  └──────────────────────────────────────────────────────┘\n')
  }

  if (!transporter) {
    devLog()
    return { devMode: true }
  }

  try {
    await transporter.verify()
    await transporter.sendMail({
      from:    `"Survexa" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: '🔑 Reset your Survexa password',
      html:    buildResetEmailHTML(link, name),
    })
    console.log(`  ✅  Password reset email sent to: ${email}`)
    return { devMode: false }
  } catch (err) {
    console.error(`  ⚠️  SMTP failed (${err.message}) — reset link logged to console instead`)
    devLog()
    return { devMode: true, smtpError: err.message }
  }
}

// ── Email HTML Templates ───────────────────────────────────

function buildOTPEmailHTML(otp, name) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Inter,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.12)">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#B8A4E8 0%,#9474C8 100%);padding:40px 32px;text-align:center">
          <div style="display:inline-block;width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:16px;line-height:56px;font-size:28px;margin-bottom:16px">📋</div>
          <h1 style="margin:0;color:#fff;font-size:28px;font-weight:800;letter-spacing:-0.5px">Survexa</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px">Email Verification</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="background:#ffffff;padding:40px 32px">
          <p style="margin:0 0 8px;color:#374151;font-size:16px">Hi <strong>${name || 'there'}</strong> 👋</p>
          <p style="margin:0 0 32px;color:#6b7280;font-size:15px;line-height:1.6">
            Use the code below to verify your Survexa account.<br>
            This code expires in <strong>5 minutes</strong>.
          </p>
          <!-- OTP Box -->
          <div style="background:linear-gradient(135deg,#f5f0fa,#ede5f6);border:2px solid #B8A4E8;border-radius:16px;padding:32px;text-align:center;margin-bottom:32px">
            <p style="margin:0 0 12px;color:#7c3aed;font-size:11px;text-transform:uppercase;letter-spacing:3px;font-weight:700">Verification Code</p>
            <p style="margin:0;color:#4f46e5;font-size:52px;font-weight:900;letter-spacing:16px;font-family:'Courier New',monospace">${otp}</p>
            <p style="margin:12px 0 0;color:#9ca3af;font-size:12px">⏱ Expires in 5 minutes</p>
          </div>
          <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.6">
            If you didn't create a Survexa account, you can safely ignore this email.
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb">
          <p style="margin:0;color:#9ca3af;font-size:11px">Sent by Survexa · Do not reply to this email</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

function buildResetEmailHTML(link, name) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Inter,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.12)">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#B8A4E8 0%,#9474C8 100%);padding:40px 32px;text-align:center">
          <div style="display:inline-block;width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:16px;line-height:56px;font-size:28px;margin-bottom:16px">🔑</div>
          <h1 style="margin:0;color:#fff;font-size:28px;font-weight:800;letter-spacing:-0.5px">Survexa</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px">Password Reset</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="background:#ffffff;padding:40px 32px">
          <p style="margin:0 0 8px;color:#374151;font-size:16px">Hi <strong>${name || 'there'}</strong>,</p>
          <p style="margin:0 0 32px;color:#6b7280;font-size:15px;line-height:1.6">
            We received a request to reset your Survexa password.<br>
            Click the button below — this link expires in <strong>15 minutes</strong>.
          </p>
          <div style="text-align:center;margin-bottom:32px">
            <a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#B8A4E8,#9474C8);color:#fff;font-weight:700;padding:16px 36px;border-radius:12px;text-decoration:none;font-size:15px;letter-spacing:0.3px">
              Reset Password →
            </a>
          </div>
          <p style="margin:0 0 16px;color:#9ca3af;font-size:12px;word-break:break-all">
            If the button doesn't work, paste this URL into your browser:<br>
            <span style="color:#B8A4E8">${link}</span>
          </p>
          <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.6">
            If you didn't request this, you can safely ignore this email.
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb">
          <p style="margin:0;color:#9ca3af;font-size:11px">Sent by Survexa · Do not reply to this email</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

const FORGOT_ACK = 'If an account exists with this email, you will receive reset instructions shortly.'

// ── POST /auth/signup ──────────────────────────────────────
router.post('/signup', async (req, res) => {
  const { name, email, phone, password } = req.body

  if (!name?.trim()) {
    return res.status(400).json({ success: false, error: 'name is required' })
  }
  const emailNorm = String(email || '').toLowerCase().trim()
  if (!emailNorm || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
    return res.status(400).json({ success: false, error: 'Invalid email address' })
  }
  const { valid, e164, error: phoneError } = normalizePhone(phone)
  if (!valid) {
    return res.status(400).json({ success: false, error: phoneError })
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' })
  }

  try {
    const byEmail = queryOne('SELECT id, verified, email_verified FROM users WHERE email = ?', [emailNorm])
    const byPhone = queryOne('SELECT id, verified, phone_verified FROM users WHERE phone = ?', [e164])

    if (byEmail?.verified || byPhone?.verified) {
      return res.status(409).json({ success: false, error: 'Account already exists. Please log in.' })
    }
    if (byEmail && byPhone && byEmail.id !== byPhone.id) {
      return res.status(409).json({ success: false, error: 'Email and phone belong to different accounts.' })
    }

    const hashed = await bcrypt.hash(password, 12)
    let userId

    const existing = byEmail || byPhone
    if (existing) {
      userId = existing.id
      run(
        'UPDATE users SET name = ?, email = ?, phone = ?, password = ?, verified = 0, email_verified = 0, phone_verified = 0 WHERE id = ?',
        [name.trim(), emailNorm, e164, hashed, userId],
      )
    } else {
      const { lastInsertRowid } = run(
        'INSERT INTO users (email, phone, password, name, verified, email_verified, phone_verified) VALUES (?, ?, ?, ?, 0, 0, 0)',
        [emailNorm, e164, hashed, name.trim()],
      )
      userId = lastInsertRowid
      ensureFreeSubscription(userId)
      ensureUsageRow(userId)
    }

    logActivity(userId, emailNorm, 'registration_requested', 'email/phone signup', userId, 'auth')

    const emailCode = generateOTP()
    saveEmailOtp(emailNorm, emailCode)
    const emailResult = await sendOTPEmail(emailNorm, emailCode, name.trim())

    const phoneCode = generatePhoneOTP()
    savePhoneOtp(e164, phoneCode, 'signup')
    const phoneResult = await sendPhoneOtp(e164, phoneCode)

    const isDev = process.env.NODE_ENV !== 'production'
    const exposeEmailOtp = emailResult.devMode || isDev
    const exposePhoneOtp = phoneResult.devMode || isDev

    console.log(`[Auth] Signup: ${emailNorm} / ${e164}`)
    res.status(201).json({
      success: true,
      message: 'Account created. Verify your email and mobile number with the OTP codes sent.',
      email: emailNorm,
      phone: e164,
      devMode: emailResult.devMode || phoneResult.devMode,
      emailOtp: exposeEmailOtp ? emailCode : undefined,
      phoneOtp: exposePhoneOtp ? phoneCode : undefined,
      nextStep: 'email',
    })
  } catch (err) {
    console.error('[Auth] Signup error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── POST /auth/verify-otp — email OTP ──────────────────────
router.post('/verify-otp', async (req, res) => {
  const { email, code } = req.body

  if (!email || !code) {
    return res.status(400).json({ success: false, error: 'email and code are required' })
  }

  const emailNorm = email.toLowerCase().trim()

  try {
    const check = verifyEmailOtpCode(emailNorm, code)
    if (!check.ok) {
      return res.status(check.status).json({
        success: false,
        error: check.error,
        waitSeconds: check.waitSeconds,
      })
    }

    const user = queryOne('SELECT * FROM users WHERE email = ?', [emailNorm])
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }

    run('UPDATE users SET email_verified = 1 WHERE id = ?', [user.id])
    activateUserIfReady(user.id)

    const updated = queryOne('SELECT * FROM users WHERE id = ?', [user.id])
    let token = null
    if (updated.verified) {
      token = signToken(updated)
      logActivity(user.id, emailNorm, 'user_registration', 'Account activated via email OTP', user.id, 'auth')
    } else {
      logActivity(user.id, emailNorm, 'verify_email', 'Email verified via OTP', user.id, 'auth')
    }

    console.log(`[Auth] Email OTP verified: ${emailNorm}`)
    res.json({
      success: true,
      emailVerified: true,
      phoneVerified: Boolean(updated.phone_verified),
      accountActive: Boolean(updated.verified),
      token,
      user: updated.verified
        ? { id: updated.id, email: updated.email, phone: updated.phone, name: updated.name, role: updated.role }
        : undefined,
      phone: updated.phone,
      message: updated.verified
        ? 'Account verified! Welcome to Survexa 🎉'
        : 'Email verified. Please verify your mobile number next.',
      nextStep: updated.verified ? null : 'phone',
    })
  } catch (err) {
    console.error('[Auth] Verify OTP error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── POST /auth/resend-otp ──────────────────────────────────
router.post('/resend-otp', async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ success: false, error: 'email is required' })
  }

  try {
    const user = queryOne(
      'SELECT id, name, verified, email_verified FROM users WHERE email = ?',
      [email.toLowerCase()],
    )

    if (!user) {
      return res.status(404).json({ success: false, error: 'No account found with this email.' })
    }
    if (user.email_verified && user.verified) {
      return res.status(400).json({ success: false, error: 'Account already verified. Please log in.' })
    }

    const cooldown = checkEmailResendCooldown(email.toLowerCase())
    if (!cooldown.ok) {
      return res.status(429).json({
        success: false,
        error: `Please wait ${cooldown.waitSeconds} second${cooldown.waitSeconds !== 1 ? 's' : ''} before requesting a new OTP.`,
        waitSeconds: cooldown.waitSeconds,
      })
    }

    const code = generateOTP()
    saveEmailOtp(email.toLowerCase(), code)

    const result = await sendOTPEmail(email, code, user.name)

    const isDev = process.env.NODE_ENV !== 'production'
    const exposeOtp = result.devMode || isDev
    console.log(`[Auth] OTP resent to: ${email} — ${result.devMode ? 'logged to console' : 'emailed'}`)
    res.json({
      success: true,
      message: result.devMode
        ? 'New OTP generated (check server console — email not configured).'
        : 'New OTP sent to your email.',
      devMode: result.devMode,
      otp: exposeOtp ? code : undefined,
    })
  } catch (err) {
    console.error('[Auth] Resend OTP error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── POST /auth/login ───────────────────────────────────────
router.post('/login', async (req, res) => {
  // Accept both 'email' and 'identifier' fields for compatibility
  const rawIdentifier = req.body.email || req.body.identifier || ''
  const { password }  = req.body

  if (!rawIdentifier || !password) {
    return res.status(400).json({ success: false, error: 'email and password are required' })
  }

  const identifier = rawIdentifier.toLowerCase().trim()

  try {
    const user = queryOne('SELECT * FROM users WHERE email = ?', [identifier])

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' })
    }
    if (!user.verified) {
      const needsEmail = !user.email_verified
      const needsPhone = user.phone && !user.phone_verified
      return res.status(403).json({
        success: false,
        error: needsEmail
          ? 'Please verify your email with the OTP we sent.'
          : needsPhone
            ? 'Please verify your mobile number to activate your account.'
            : 'Account not verified.',
        needsVerification: true,
        needsEmail,
        needsPhone,
        email: user.email,
        phone: user.phone,
      })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' })
    }

    const token = signToken(user)
    logActivity(user.id, user.email, 'login', 'Session started via credentials', user.id, 'auth')
    console.log(`[Auth] Login: ${identifier}`)
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
    })
  } catch (err) {
    console.error('[Auth] Login error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── POST /auth/forgot-password ─────────────────────────────
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body

  if (!email?.trim()) {
    return res.status(400).json({ success: false, error: 'email is required' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email address' })
  }

  const normalized = email.toLowerCase().trim()
  let rawToken = null

  try {
    const user = queryOne('SELECT id, name, verified FROM users WHERE email = ?', [normalized])

    if (user?.verified) {
      run('DELETE FROM password_reset_tokens WHERE email = ?', [normalized])

      rawToken  = generatePasswordResetToken()
      const tokenHash = hashPasswordResetToken(rawToken)
      const expiry    = Date.now() + RESET_TTL_MS

      run('INSERT INTO password_reset_tokens (email, token_hash, expiry) VALUES (?, ?, ?)',
        [normalized, tokenHash, expiry])

      await sendPasswordResetEmail(normalized, rawToken, user.name ?? '')
      console.log(`[Auth] Password reset requested for: ${normalized}`)
    }

    res.json({
      success: true,
      message: FORGOT_ACK,
      token: process.env.NODE_ENV !== 'production' ? rawToken : undefined
    })
  } catch (err) {
    console.error('[Auth] Forgot password error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── POST /auth/reset-password ──────────────────────────────
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ success: false, error: 'token is required' })
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' })
  }

  const tokenHash = hashPasswordResetToken(token.trim())

  try {
    const row = queryOne('SELECT * FROM password_reset_tokens WHERE token_hash = ?', [tokenHash])

    if (!row) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset link. Please request a new one.' })
    }
    if (Date.now() > Number(row.expiry)) {
      run('DELETE FROM password_reset_tokens WHERE token_hash = ?', [tokenHash])
      return res.status(400).json({ success: false, error: 'This reset link has expired. Please request a new one.' })
    }

    const user = queryOne('SELECT id FROM users WHERE email = ? AND verified = 1', [row.email])
    if (!user) {
      run('DELETE FROM password_reset_tokens WHERE email = ?', [row.email])
      return res.status(400).json({ success: false, error: 'Invalid or expired reset link.' })
    }

    const hashed = await bcrypt.hash(password, 12)
    run('UPDATE users SET password = ? WHERE email = ?', [hashed, row.email])
    run('DELETE FROM password_reset_tokens WHERE email = ?', [row.email])

    console.log(`[Auth] Password reset completed for: ${row.email}`)
    res.json({ success: true, message: 'Password updated. You can now log in with your new password.' })
  } catch (err) {
    console.error('[Auth] Reset password error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── GET /auth/me ───────────────────────────────────────────
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Not authenticated' })
  }
  try {
    const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET)
    const user    = queryOne(
      'SELECT id, email, phone, name, role, organization, job_role, verified, email_verified, phone_verified, otp_verified_at FROM users WHERE id = ?',
      [decoded.id]
    )
    if (!user) return res.status(404).json({ success: false, error: 'User not found' })

    const freshToken = jwt.sign(
      { id: user.id, email: user.email, phone: user.phone, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({
      success: true,
      user: {
        ...user,
        phone_number: user.phone,
        phone_verified: Boolean(user.phone_verified),
        email_verified: Boolean(user.email_verified),
        verified: Boolean(user.verified),
      },
      token: freshToken,
    })
  } catch {
    res.status(401).json({ success: false, error: 'Invalid token' })
  }
})

// ── PUT /auth/profile ──────────────────────────────────────
router.put('/profile', (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Not authenticated' })
  }

  let decoded
  try {
    decoded = jwt.verify(authHeader.slice(7), JWT_SECRET)
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid token' })
  }

  const { name, organization = '', job_role = '' } = req.body

  if (!name?.trim()) {
    return res.status(400).json({ success: false, error: 'Name is required' })
  }
  if (name.trim().length > 100) {
    return res.status(400).json({ success: false, error: 'Name must be 100 characters or less' })
  }

  try {
    run(
      'UPDATE users SET name = ?, organization = ?, job_role = ? WHERE id = ?',
      [name.trim(), organization.trim(), job_role.trim(), decoded.id]
    )

    const user = queryOne(
      'SELECT id, email, name, role, organization, job_role, verified FROM users WHERE id = ?',
      [decoded.id]
    )
    if (!user) return res.status(404).json({ success: false, error: 'User not found' })

    const freshToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    console.log(`[Auth] Profile updated for: ${user.email}`)
    res.json({ success: true, user, token: freshToken })
  } catch (err) {
    console.error('[Auth] Profile update error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── GET /auth/test-email ───────────────────────────────────
router.get('/test-email', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ success: false, error: 'Not found' })
  }

  const user = process.env.EMAIL_USER || ''
  const pass = process.env.EMAIL_PASS || ''

  if (!user || !pass || user.includes('your-email')) {
    return res.json({
      success: false,
      mode:    'unconfigured',
      message: 'EMAIL_USER and EMAIL_PASS not set in backend/.env',
      hint:    'Get a Gmail App Password at https://myaccount.google.com/apppasswords',
    })
  }

  const transporter = createTransporter()

  try {
    await transporter.verify()
    res.json({
      success: true,
      mode:    'live',
      message: `✅ SMTP connected! Emails will be sent from ${user}`,
    })
  } catch (err) {
    res.json({
      success: false,
      mode:    'dev-fallback',
      message: '⚠️ SMTP connection failed — OTPs will be printed in the server console instead.',
      error:   err.message,
      hint:    'If using Gmail, make sure EMAIL_PASS is a 16-character Gmail App Password (not your regular password). Get one at https://myaccount.google.com/apppasswords',
    })
  }
})

// ── POST /auth/test-helper/reset-limits ──────────────────────────
router.post('/test-helper/reset-limits', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ success: false, error: 'Not found' })
  }

  const { email } = req.body
  if (!email) return res.status(400).json({ success: false, error: 'email is required' })

  try {
    const user = queryOne('SELECT id FROM users WHERE email = ?', [email])
    if (!user) return res.status(404).json({ success: false, error: 'User not found' })

    run('UPDATE usage_tracking SET ai_requests_used = 0, surveys_created = 0, responses_collected = 0 WHERE user_id = ?', [user.id])
    res.json({ success: true, message: 'Limits reset successfully' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── POST /auth/logout ──────────────────────────────────────
router.post('/logout', requireAuth, (req, res) => {
  try {
    logActivity(req.user.id, req.user.email, 'logout', 'Session ended', req.user.id, 'auth')
    res.json({ success: true, message: 'Logged out successfully' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── GET /auth/test-helper/latest-otps ──────────────────────────
router.get('/test-helper/latest-otps', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ success: false, error: 'Not found' })
  }
  const { email, phone } = req.query
  try {
    let emailOtp = null
    let phoneOtp = null
    if (email) {
      emailOtp = queryOne('SELECT code FROM otp WHERE email = ? ORDER BY id DESC LIMIT 1', [email])?.code
    }
    if (phone) {
      phoneOtp = queryOne('SELECT code FROM phone_otp WHERE phone = ? ORDER BY id DESC LIMIT 1', [phone])?.code
    }
    res.json({ success: true, emailOtp, phoneOtp })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── POST /auth/test-helper/promote-admin ──────────────────────────
router.post('/test-helper/promote-admin', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ success: false, error: 'Not found' })
  }
  const { email } = req.body
  if (!email) return res.status(400).json({ success: false, error: 'email is required' })
  try {
    run("UPDATE users SET role = 'admin' WHERE email = ?", [email])
    console.log(`[Test Helper] Promoted ${email} to admin successfully`)
    res.json({ success: true, message: `Promoted ${email} to admin` })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
