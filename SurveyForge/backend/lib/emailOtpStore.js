const { query, run, queryOne } = require('../database')

const OTP_TTL_MS = 5 * 60 * 1000
const MAX_ATTEMPTS = 5
const RESEND_COOLDOWN_MS = 60 * 1000

function saveEmailOtp(email, code) {
  run('DELETE FROM otp WHERE email = ?', [email])
  run('INSERT INTO otp (email, code, expiry, attempts) VALUES (?, ?, ?, 0)', [
    email,
    code,
    Date.now() + OTP_TTL_MS,
  ])
}

function checkEmailResendCooldown(email) {
  const last = queryOne(
    'SELECT created_at FROM otp WHERE email = ? ORDER BY id DESC LIMIT 1',
    [email],
  )
  if (!last?.created_at) return { ok: true }
  const lastMs = new Date(last.created_at + 'Z').getTime()
  const elapsed = Date.now() - lastMs
  if (elapsed < RESEND_COOLDOWN_MS) {
    return { ok: false, waitSeconds: Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000) }
  }
  return { ok: true }
}

function verifyEmailOtpCode(email, code) {
  const row = queryOne(
    'SELECT * FROM otp WHERE email = ? ORDER BY id DESC LIMIT 1',
    [email],
  )

  if (!row) {
    return { ok: false, status: 400, error: 'No OTP found. Please request a new one.' }
  }
  if (Date.now() > Number(row.expiry)) {
    run('DELETE FROM otp WHERE email = ?', [email])
    return { ok: false, status: 400, error: 'OTP has expired. Please request a new one.' }
  }
  if (Number(row.attempts) >= MAX_ATTEMPTS) {
    run('DELETE FROM otp WHERE email = ?', [email])
    return { ok: false, status: 429, error: 'Too many failed attempts. Please request a new OTP.' }
  }
  if (row.code !== String(code).trim()) {
    run('UPDATE otp SET attempts = attempts + 1 WHERE id = ?', [row.id])
    const remaining = MAX_ATTEMPTS - Number(row.attempts) - 1
    return {
      ok: false,
      status: 400,
      error:
        remaining > 0
          ? `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
          : 'Incorrect OTP. Please request a new code.',
    }
  }

  run('DELETE FROM otp WHERE email = ?', [email])
  return { ok: true }
}

module.exports = {
  OTP_TTL_MS,
  MAX_ATTEMPTS,
  RESEND_COOLDOWN_MS,
  saveEmailOtp,
  checkEmailResendCooldown,
  verifyEmailOtpCode,
}
