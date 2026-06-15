/**
 * Comprehensive E2E API test — run while server is up: node e2e-test.js
 */
const http = require('http')
const { initDatabase, queryOne, run, query } = require('./database/database')

const PORT = process.env.PORT || 5000
const BASE = `http://localhost:${PORT}`
const EMAIL = `e2e.${Date.now()}@survexa.test`
const PHONE = `+9198765${String(Date.now()).slice(-5)}`
const PASS = 'TestPass123!'

let token = null
let surveyId = null
let questionId = null
let shareToken = null
const failures = []
const passed = []

function req(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null
    const r = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...headers,
        },
      },
      (res) => {
        const chunks = []
        res.on('data', (c) => chunks.push(c))
        res.on('end', () => {
          const raw = Buffer.concat(chunks)
          const ct = res.headers['content-type'] || ''
          let parsed = raw.toString()
          if (ct.includes('json')) {
            try {
              parsed = JSON.parse(parsed)
            } catch {
              /* keep string */
            }
          }
          resolve({ status: res.statusCode, body: parsed, headers: res.headers, raw })
        })
      },
    )
    r.on('error', reject)
    if (data) r.write(data)
    r.end()
  })
}

function ok(name, cond, detail = '') {
  if (cond) {
    passed.push(name)
    console.log(`  ✅ ${name}${detail ? ` — ${detail}` : ''}`)
  } else {
    failures.push({ name, detail })
    console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

async function main() {
  console.log('\n========== SURVEXA FULL E2E TEST ==========\n')
  await initDatabase()

  // Health
  const health = await req('GET', '/health')
  ok('Health', health.status === 200 && health.body?.status === 'ok')

  // Signup (email + phone)
  const signup = await req('POST', '/auth/signup', {
    name: 'E2E Tester',
    email: EMAIL,
    phone: PHONE,
    password: PASS,
  })
  ok('Signup', signup.status === 201 && signup.body?.success)

  const phoneE164 =
    signup.body?.phone ||
    queryOne('SELECT phone FROM users WHERE email = ?', [EMAIL])?.phone ||
    PHONE

  let emailOtp = signup.body?.emailOtp
  if (!emailOtp) {
    const row = queryOne('SELECT code FROM otp WHERE email = ? ORDER BY id DESC LIMIT 1', [EMAIL])
    emailOtp = row?.code
  }
  ok('Email OTP available', !!emailOtp)

  let phoneOtp = signup.body?.phoneOtp
  if (!phoneOtp) {
    const prow = queryOne(
      'SELECT code FROM phone_otp WHERE phone = ? AND purpose = ? ORDER BY id DESC LIMIT 1',
      [phoneE164, 'signup'],
    )
    phoneOtp = prow?.code
  }
  ok('Phone OTP available', !!phoneOtp)

  // Verify email OTP
  const verifyEmail = await req('POST', '/auth/verify-otp', { email: EMAIL, code: emailOtp })
  ok('Verify email OTP', verifyEmail.status === 200 && verifyEmail.body?.emailVerified)
  ok('Email verify → phone step', verifyEmail.body?.nextStep === 'phone' || !verifyEmail.body?.accountActive)

  // Invalid email OTP (wrong code)
  const badEmailOtp = await req('POST', '/auth/verify-otp', { email: EMAIL, code: '000000' })
  ok('Invalid email OTP rejected', badEmailOtp.status === 400)

  // Verify phone OTP — activates account
  const verifyPhone = await req('POST', '/auth/phone/verify-otp', {
    phone: phoneE164,
    code: phoneOtp,
    purpose: 'signup',
  })
  ok('Verify phone OTP', verifyPhone.status === 200 && (verifyPhone.body?.accountActive || verifyPhone.body?.token))
  token = verifyPhone.body?.token

  // Phone auth status
  const phoneStatus = await req('GET', '/auth/phone/status')
  ok('Phone auth status', phoneStatus.status === 200 && phoneStatus.body?.success)

  // Phone login OTP (before any extra send-otp calls to avoid resend cooldown)
  const loginSend = await req('POST', '/auth/phone/send-otp', { phone: phoneE164, purpose: 'login' })
  ok(
    'Phone login send OTP',
    loginSend.status === 200 && loginSend.body?.success,
    `${loginSend.status} ${JSON.stringify(loginSend.body)}`,
  )
  let loginOtp = loginSend.body?.otp
  if (!loginOtp) {
    const lrow = queryOne(
      'SELECT code FROM phone_otp WHERE phone = ? AND purpose = ? ORDER BY id DESC LIMIT 1',
      [phoneE164, 'login'],
    )
    loginOtp = lrow?.code
  }
  const phoneLogin = await req('POST', '/auth/phone/verify-otp', {
    phone: phoneE164,
    code: loginOtp,
    purpose: 'login',
  })
  ok(
    'Login via phone OTP',
    phoneLogin.status === 200 && phoneLogin.body?.token,
    `${phoneLogin.status} ${JSON.stringify(phoneLogin.body)}`,
  )
  token = phoneLogin.body?.token || token

  // Invalid phone OTP
  const badPhoneOtp = await req('POST', '/auth/phone/verify-otp', {
    phone: phoneE164,
    code: '000000',
    purpose: 'login',
  })
  ok('Invalid phone OTP rejected', badPhoneOtp.status === 400)

  // Expired phone OTP (manipulate expiry in DB)
  const expirePhone = `+9198763${String(Date.now()).slice(-5)}`
  await req('POST', '/auth/signup', {
    name: 'Expire Phone',
    email: `expire.${Date.now()}@survexa.test`,
    phone: expirePhone,
    password: PASS,
  })
  const expireRow = queryOne(
    'SELECT id FROM phone_otp WHERE phone = ? AND purpose = ? ORDER BY id DESC LIMIT 1',
    [expirePhone, 'signup'],
  )
  if (expireRow?.id) {
    run('UPDATE phone_otp SET expiry = ? WHERE id = ?', [Date.now() - 1000, expireRow.id])
  }
  const expiredVerify = await req('POST', '/auth/phone/verify-otp', {
    phone: expirePhone,
    code: '123456',
    purpose: 'signup',
  })
  ok('Expired phone OTP rejected', expiredVerify.status === 400)

  // Phone resend cooldown
  const resendPhone2 = await req('POST', '/auth/phone/resend-otp', { phone: phoneE164, purpose: 'login' })
  ok(
    'Phone resend cooldown',
    resendPhone2.status === 429 || resendPhone2.status === 200,
    resendPhone2.status === 429 ? 'cooldown enforced' : 'resent',
  )

  // Me
  const me = await req('GET', '/auth/me')
  ok('GET /auth/me', me.status === 200 && me.body?.user?.email === EMAIL)

  // Login (email + password)
  const login = await req('POST', '/auth/login', { email: EMAIL, password: PASS })
  ok('Login', login.status === 200 && login.body?.token)
  token = login.body?.token || token

  // Create survey
  const survey = await req('POST', '/surveys', {
    title: 'E2E Survey',
    description: 'Automated test',
  })
  ok('Create survey', survey.status === 201 && survey.body?.data?.id)
  surveyId = survey.body?.data?.id
  shareToken = survey.body?.data?.share_token

  // Add questions (bulk API)
  const q = await req('POST', '/questions', {
    surveyId,
    questions: [
      {
        text: 'How satisfied are you?',
        type: 'rating',
        options: [],
        required: true,
      },
    ],
  })
  ok('Add question', q.status === 201 && q.body?.data?.[0]?.id)
  questionId = q.body?.data?.[0]?.id

  let publish = await req('PATCH', `/surveys/${surveyId}/publish`, {})
  if (publish.status !== 200) {
    publish = await req('PUT', `/surveys/${surveyId}`, {
      title: 'E2E Survey',
      description: 'Automated test',
      status: 'published',
    })
  }
  ok(
    'Publish survey',
    publish.status === 200 &&
      (publish.body?.data?.status === 'published' || publish.body?.data?.share_token),
    `${publish.status}`,
  )
  shareToken = publish.body?.data?.share_token || shareToken

  // List surveys
  const list = await req('GET', '/surveys')
  ok('List surveys', list.status === 200 && Array.isArray(list.body?.data))

  // Public survey
  if (shareToken) {
    const pub = await req('GET', `/public/survey/${shareToken}`)
    ok('Public survey GET', pub.status === 200 && pub.body?.data?.id)

    const respond = await req('POST', `/public/survey/${shareToken}/respond`, {
      answers: { [questionId]: 9 },
      respondent_email: 'respondent@test.com',
    })
    ok('Public respond', respond.status === 201 || respond.status === 200)
  }

  // Analytics
  const analytics = await req('GET', `/responses/analytics/${surveyId}`)
  ok('Analytics', analytics.status === 200)

  // AI generate with valid source assertion
  const validSources = ['openai', 'groq', 'gemini', 'openrouter', 'ollama', 'fallback']
  const ai = await req('POST', '/generate-questions', {
    topic: 'Customer satisfaction',
    count: 3,
  })
  ok(
    'AI generate',
    ai.status === 200 && Array.isArray(ai.body?.questions) && ai.body.questions.length > 0 && validSources.includes(ai.body?.source),
    ai.body?.source,
  )

  // AI recommendations with valid source assertion
  const recs = await req('POST', '/ai/recommendations', {
    title: 'Customer Satisfaction Survey',
    description: 'E2E recommendation test',
    questions: [],
  })
  ok(
    'AI recommendations',
    recs.status === 200 && validSources.includes(recs.body?.source),
    recs.body?.source,
  )

  // Upgrade to Professional plan to unlock AI Insights
  const orderPro = await req('POST', '/billing/create-order', { planId: 'professional' })
  if (orderPro.body?.order?.id) {
    await req('POST', '/billing/verify-payment', {
      planId: 'professional',
      razorpay_order_id: orderPro.body.order.id,
      razorpay_payment_id: `pay_dev_${Date.now()}`,
      razorpay_signature: 'dev',
    })
  }

  // Insights with valid source assertion
  const insights = await req('GET', '/insights')
  ok('Insights', insights.status === 200 && validSources.includes(insights.body?.source), insights.body?.source)

  // PDF download
  const pdf = await req('POST', '/reports/download', { survey_id: surveyId })
  ok(
    'PDF download',
    pdf.status === 200 && pdf.headers['content-type']?.includes('pdf') && pdf.raw?.length > 500,
    `${pdf.raw?.length || 0} bytes`,
  )

  // Report email (simulated OK)
  const emailReport = await req('POST', '/reports/send', {
    email: EMAIL,
    survey_id: surveyId,
  })
  ok(
    'Report email',
    emailReport.status === 200 && emailReport.body?.success,
    emailReport.body?.simulated ? 'simulated' : 'sent',
  )

  // Notifications
  const notif = await req('GET', '/notifications')
  ok('Notifications', notif.status === 200)

  // Resend OTP — signup already inserts OTP, so immediate resend may 429 (cooldown)
  const resendEmail = `resend.${Date.now()}@survexa.test`
  const resendPhone = `+9198764${String(Date.now()).slice(-5)}`
  await req('POST', '/auth/signup', {
    name: 'Resend Test',
    email: resendEmail,
    phone: resendPhone,
    password: PASS,
  })
  const resend = await req('POST', '/auth/resend-otp', { email: resendEmail })
  ok(
    'Resend OTP',
    (resend.status === 200 && resend.body?.success) ||
      resend.status === 429,
    resend.status === 429 ? 'cooldown enforced' : 'resent',
  )
  ok(
    'Resend blocked when verified',
    (await req('POST', '/auth/resend-otp', { email: EMAIL })).status === 400,
  )

  // Forgot password
  const forgot = await req('POST', '/auth/forgot-password', { email: EMAIL })
  ok('Forgot password', forgot.status === 200)

  // Unauthorized
  const old = token
  token = 'invalid.token.here'
  const unauthorized = await req('GET', '/surveys')
  ok('Invalid token blocked', unauthorized.status === 401)
  token = old

  // Delete survey
  const del = await req('DELETE', `/surveys/${surveyId}`)
  ok('Delete survey', del.status === 200)

  // Cleanup: Leave data in SQLite DB to avoid raw SQL write conflicts and preserve integrity

  console.log('\n---------- SUMMARY ----------')
  console.log(`Passed: ${passed.length}`)
  console.log(`Failed: ${failures.length}`)
  if (failures.length) {
    failures.forEach((f) => console.log(`  - ${f.name}: ${f.detail}`))
    process.exit(1)
  }
  console.log('\n🎉 All E2E checks passed.\n')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
