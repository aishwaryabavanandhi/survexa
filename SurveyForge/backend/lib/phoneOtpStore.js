/**
 * Phone OTP persistence & verification
 */
const { query, run, queryOne } = require('../database')
const { generateOTP } = require('../services/smsProvider')

const OTP_TTL_MS = 5 * 60 * 1000
const MAX_ATTEMPTS = 5
const RESEND_COOLDOWN_MS = 60 * 1000

function savePhoneOtp(phone, code, purpose) {
  run('DELETE FROM phone_otp WHERE phone = ? AND purpose = ?', [phone, purpose])
  run(
    'INSERT INTO phone_otp (phone, code, expiry, purpose, attempts) VALUES (?, ?, ?, ?, 0)',
    [phone, code, Date.now() + OTP_TTL_MS, purpose],
  )
}

function getPhoneOtp(phone, purpose) {
  return queryOne(
    'SELECT * FROM phone_otp WHERE phone = ? AND purpose = ? ORDER BY id DESC LIMIT 1',
    [phone, purpose],
  )
}

function incrementAttempts(id) {
  run('UPDATE phone_otp SET attempts = attempts + 1 WHERE id = ?', [id])
}

function deletePhoneOtp(phone, purpose) {
  run('DELETE FROM phone_otp WHERE phone = ? AND purpose = ?', [phone, purpose])
}

function checkResendCooldown(phone, purpose) {
  const last = getPhoneOtp(phone, purpose)
  if (!last?.created_at) return { ok: true }
  const lastMs = new Date(last.created_at + 'Z').getTime()
  const elapsed = Date.now() - lastMs
  if (elapsed < RESEND_COOLDOWN_MS) {
    const waitSec = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000)
    return { ok: false, waitSeconds: waitSec }
  }
  return { ok: true }
}

/**
 * @returns {{ ok: true } | { ok: false, status: number, error: string, waitSeconds?: number }}
 */
function verifyPhoneOtpCode(phone, code, purpose) {
  const row = getPhoneOtp(phone, purpose)

  if (!row) {
    return { ok: false, status: 400, error: 'No OTP found. Please request a new code.' }
  }
  if (Date.now() > Number(row.expiry)) {
    deletePhoneOtp(phone, purpose)
    return { ok: false, status: 400, error: 'OTP has expired. Please request a new one.' }
  }
  if (Number(row.attempts) >= MAX_ATTEMPTS) {
    deletePhoneOtp(phone, purpose)
    return { ok: false, status: 429, error: 'Too many failed attempts. Please request a new OTP.' }
  }
  if (row.code !== String(code).trim()) {
    incrementAttempts(row.id)
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

  deletePhoneOtp(phone, purpose)
  return { ok: true }
}

module.exports = {
  OTP_TTL_MS,
  MAX_ATTEMPTS,
  RESEND_COOLDOWN_MS,
  savePhoneOtp,
  getPhoneOtp,
  deletePhoneOtp,
  checkResendCooldown,
  verifyPhoneOtpCode,
  generateOTP,
}
