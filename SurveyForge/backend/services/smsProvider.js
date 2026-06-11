/**
 * SMS OTP delivery — Firebase (client-led), Twilio, MSG91, or console (dev)
 */
const { normalizePhone } = require('../utils/phone')

const PROVIDER = (process.env.SMS_PROVIDER || 'console').toLowerCase()

function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function buildOtpMessage(code) {
  return `Your Survexa verification code is ${code}. Valid for 5 minutes. Do not share this code.`
}

function logConsoleOtp(phone, code) {
  console.log('\n  ┌──────────────────────────────────────────┐')
  console.log('  │  📱  SMS OTP (console / dev mode)         │')
  console.log('  ├──────────────────────────────────────────┤')
  console.log(`  │  To:   ${phone.slice(0, 28).padEnd(28)}  │`)
  console.log(`  │  OTP:  ${code.padEnd(28)}  │`)
  console.log('  │  Expires: 5 minutes                      │')
  console.log('  └──────────────────────────────────────────┘\n')
}

async function sendViaTwilio(phone, message) {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_PHONE_NUMBER

  if (!sid || !token || !from || sid.includes('your-')) {
    return { sent: false, reason: 'twilio_not_configured' }
  }

  const twilio = require('twilio')
  const client = twilio(sid, token)
  await client.messages.create({ to: phone, from, body: message })
  return { sent: true, provider: 'twilio' }
}

async function sendViaMsg91(phone, code) {
  const key = process.env.MSG91_AUTH_KEY
  const templateId = process.env.MSG91_TEMPLATE_ID
  if (!key || key.includes('your-')) {
    return { sent: false, reason: 'msg91_not_configured' }
  }

  const mobile = phone.replace(/^\+/, '')
  const url = new URL('https://control.msg91.com/api/v5/otp')
  url.searchParams.set('template_id', templateId || '')
  url.searchParams.set('mobile', mobile)
  url.searchParams.set('otp', code)
  url.searchParams.set('authkey', key)

  const res = await fetch(url.toString(), { method: 'POST' })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`MSG91 error: ${text.slice(0, 120)}`)
  }
  return { sent: true, provider: 'msg91' }
}

/**
 * Send OTP SMS to phone (E.164)
 * @returns {{ devMode: boolean, otp?: string, provider: string }}
 */
async function sendPhoneOtp(rawPhone, code = generateOTP()) {
  const { valid, e164, error } = normalizePhone(rawPhone)
  if (!valid) throw new Error(error)

  const message = buildOtpMessage(code)
  const provider = PROVIDER

  if (provider === 'firebase') {
    // Firebase Phone Auth sends SMS from the client SDK (reCAPTCHA + signInWithPhoneNumber)
    logConsoleOtp(e164, code)
    return {
      devMode: true,
      otp: process.env.NODE_ENV !== 'production' ? code : undefined,
      provider: 'firebase',
      message: 'Use Firebase client SDK to receive SMS, or set SMS_PROVIDER=twilio for server SMS.',
      phone: e164,
    }
  }

  if (provider === 'twilio') {
    try {
      const result = await sendViaTwilio(e164, message)
      if (result.sent) {
        console.log(`  ✅  Twilio SMS sent to ${e164}`)
        return { devMode: false, provider: 'twilio', phone: e164 }
      }
    } catch (err) {
      console.error(`  ⚠️  Twilio failed (${err.message}) — console fallback`)
    }
    logConsoleOtp(e164, code)
    const isDev = process.env.NODE_ENV !== 'production'
    return { devMode: true, otp: isDev ? code : undefined, provider: 'twilio-fallback', phone: e164 }
  }

  if (provider === 'msg91') {
    try {
      const result = await sendViaMsg91(e164, code)
      if (result.sent) {
        console.log(`  ✅  MSG91 OTP sent to ${e164}`)
        return { devMode: false, provider: 'msg91', phone: e164 }
      }
    } catch (err) {
      console.error(`  ⚠️  MSG91 failed (${err.message}) — console fallback`)
    }
    logConsoleOtp(e164, code)
    const isDev = process.env.NODE_ENV !== 'production'
    return { devMode: true, otp: isDev ? code : undefined, provider: 'msg91-fallback', phone: e164 }
  }

  // console (default dev)
  logConsoleOtp(e164, code)
  const isDev = process.env.NODE_ENV !== 'production'
  return { devMode: true, otp: isDev ? code : undefined, provider: 'console', phone: e164 }
}

function getSmsProviderStatus() {
  return {
    provider: PROVIDER,
    twilio: Boolean(process.env.TWILIO_ACCOUNT_SID && !process.env.TWILIO_ACCOUNT_SID.includes('your-')),
    msg91: Boolean(process.env.MSG91_AUTH_KEY && !process.env.MSG91_AUTH_KEY.includes('your-')),
    firebase: Boolean(process.env.FIREBASE_PROJECT_ID),
  }
}

module.exports = {
  sendPhoneOtp,
  generateOTP,
  getSmsProviderStatus,
  buildOtpMessage,
}
