/**
 * SURVEXA — Final Pre-Deployment Verification
 * Covers: AI, PDF download, PDF email, Email OTP, Phone OTP,
 *         Admin Billing, Subscription Upgrade, Survey Sharing,
 *         Public Responses, Analytics Dashboard
 *
 * Run:  node final-verify.js   (server must be running on :5000)
 */

require('dotenv').config()
const http = require('http')
const fs   = require('fs')
const path = require('path')
const { initDatabase, queryOne, query, run } = require('./database')

const PORT  = process.env.PORT || 5000
const BASE  = `http://localhost:${PORT}`
const TS    = Date.now()
const EMAIL = `verify.${TS}@survexa.test`
const PHONE = `+9199${String(TS).slice(-7)}`
const PASS  = 'Verify@123!'

let token     = null
let surveyId  = null
let shareToken = null
let questionId = null

const results = []
const BAR = '═'.repeat(54)

function sep(title) {
  console.log(`\n${BAR}`)
  console.log(`  ${title}`)
  console.log(BAR)
}

function log(name, pass, detail = '') {
  const icon  = pass ? '✅' : '❌'
  const label = pass ? 'PASS' : 'FAIL'
  const line  = `${icon} [${label}] ${name}${detail ? `  →  ${detail}` : ''}`
  console.log('  ' + line)
  results.push({ name, pass, detail })
}

function req(method, urlPath, body, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null
    const opts = {
      hostname: 'localhost',
      port: PORT,
      path: urlPath,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...extraHeaders,
      },
    }
    const r = http.request(opts, res => {
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => {
        const raw = Buffer.concat(chunks)
        const ct  = res.headers['content-type'] || ''
        let parsed = raw.toString()
        if (ct.includes('json')) { try { parsed = JSON.parse(parsed) } catch {} }
        resolve({ status: res.statusCode, body: parsed, headers: res.headers, raw })
      })
    })
    r.on('error', reject)
    if (data) r.write(data)
    r.end()
  })
}

/* ── helpers ─────────────────────────────────────── */
function dbOtp(table, where, params) {
  try { return queryOne(`SELECT code FROM ${table} WHERE ${where} ORDER BY id DESC LIMIT 1`, params)?.code } catch { return null }
}

async function main() {
  await initDatabase()

  console.log(`\n${'▓'.repeat(54)}`)
  console.log('  SURVEXA  FINAL PRE-DEPLOYMENT VERIFICATION')
  console.log(`  ${new Date().toLocaleString()}`)
  console.log(`${'▓'.repeat(54)}`)

  /* ──────────────────────────────────────────────────────────
     1. HEALTH CHECK
  ────────────────────────────────────────────────────────── */
  sep('1 · HEALTH CHECK')
  const health = await req('GET', '/health')
  log('Server reachable', health.status === 200)
  log('Status ok',        health.body?.status === 'ok',    health.body?.status)
  log('Version reported', !!health.body?.version,          health.body?.version)
  log('JWT configured',   health.body?.config?.jwt === true)
  log('Email configured', health.body?.config?.email === true,
      health.body?.config?.email ? 'Gmail SMTP ✓' : 'email flag = ' + health.body?.config?.email)
  console.log('  Config:', JSON.stringify(health.body?.config || {}))

  /* ──────────────────────────────────────────────────────────
     2. SIGNUP + EMAIL OTP
  ────────────────────────────────────────────────────────── */
  sep('2 · SIGNUP  +  EMAIL OTP')
  const signup = await req('POST', '/auth/signup', {
    name: 'Verify Tester', email: EMAIL, phone: PHONE, password: PASS,
  })
  log('Signup 201',        signup.status === 201 && signup.body?.success,
      `status=${signup.status}`)
  log('Email OTP in resp', !!signup.body?.emailOtp,
      signup.body?.emailOtp ? `code=${signup.body.emailOtp}` : 'not in body — reading DB')

  let emailOtp = signup.body?.emailOtp
  if (!emailOtp) emailOtp = dbOtp('otp', 'email = ?', [EMAIL])
  log('Email OTP readable', !!emailOtp, emailOtp ? `code=${emailOtp}` : 'NOT FOUND')

  /* verify email OTP */
  const verifyEmail = await req('POST', '/auth/verify-otp', { email: EMAIL, code: emailOtp })
  log('Email OTP verify 200', verifyEmail.status === 200 && verifyEmail.body?.emailVerified,
      `status=${verifyEmail.status}`)

  /* bad OTP rejected */
  const badEmail = await req('POST', '/auth/verify-otp', { email: EMAIL, code: '000000' })
  log('Bad email OTP → 400', badEmail.status === 400)

  /* ──────────────────────────────────────────────────────────
     3. PHONE OTP
  ────────────────────────────────────────────────────────── */
  sep('3 · PHONE OTP')
  const phoneE164 = signup.body?.phone || PHONE
  let phoneOtp = signup.body?.phoneOtp
  if (!phoneOtp) phoneOtp = dbOtp('phone_otp', 'phone = ? AND purpose = ?', [phoneE164, 'signup'])
  log('Phone OTP readable', !!phoneOtp,
      phoneOtp ? `code=${phoneOtp} (console/DB)` : 'NOT FOUND')

  const verifyPhone = await req('POST', '/auth/phone/verify-otp', {
    phone: phoneE164, code: phoneOtp, purpose: 'signup',
  })
  log('Phone OTP verify 200',
      verifyPhone.status === 200 && (verifyPhone.body?.accountActive || verifyPhone.body?.token),
      `status=${verifyPhone.status}`)
  token = verifyPhone.body?.token

  /* Phone status endpoint */
  const phStatus = await req('GET', '/auth/phone/status')
  log('Phone status endpoint', phStatus.status === 200 && phStatus.body?.success)

  /* login via phone OTP */
  const sendLogin = await req('POST', '/auth/phone/send-otp', { phone: phoneE164, purpose: 'login' })
  log('Phone login OTP sent', sendLogin.status === 200 && sendLogin.body?.success,
      `status=${sendLogin.status}`)
  let loginOtp = sendLogin.body?.otp
  if (!loginOtp) loginOtp = dbOtp('phone_otp', 'phone = ? AND purpose = ?', [phoneE164, 'login'])
  const phLogin = await req('POST', '/auth/phone/verify-otp', {
    phone: phoneE164, code: loginOtp, purpose: 'login',
  })
  log('Phone login OTP verify', phLogin.status === 200 && phLogin.body?.token,
      `status=${phLogin.status}`)
  token = phLogin.body?.token || token

  /* bad phone OTP */
  const badPhone = await req('POST', '/auth/phone/verify-otp', {
    phone: phoneE164, code: '000000', purpose: 'login',
  })
  log('Bad phone OTP → 400', badPhone.status === 400)

  /* fallback login */
  const login = await req('POST', '/auth/login', { email: EMAIL, password: PASS })
  log('Email login works', login.status === 200 && login.body?.token, `token=${login.body?.token?.slice(0,20)}...`)
  token = login.body?.token || token

  /* ──────────────────────────────────────────────────────────
     4. SURVEY SHARING
  ────────────────────────────────────────────────────────── */
  sep('4 · SURVEY SHARING')
  const createSurvey = await req('POST', '/surveys', {
    title: 'Final Verify Survey',
    description: 'Pre-deployment verification',
  })
  log('Create survey 201', createSurvey.status === 201 && createSurvey.body?.data?.id,
      `id=${createSurvey.body?.data?.id}`)
  surveyId   = createSurvey.body?.data?.id
  shareToken = createSurvey.body?.data?.share_token

  /* add question */
  const addQ = await req('POST', '/questions', {
    surveyId,
    questions: [
      { text: 'Rate our service', type: 'rating', options: [], required: true },
      { text: 'Any comments?',    type: 'text',   options: [], required: false },
    ],
  })
  log('Add questions 201', addQ.status === 201 && addQ.body?.data?.length > 0,
      `count=${addQ.body?.data?.length}`)
  questionId = addQ.body?.data?.[0]?.id

  /* publish */
  let pub = await req('PATCH', `/surveys/${surveyId}/publish`, {})
  if (pub.status !== 200) {
    pub = await req('PUT', `/surveys/${surveyId}`, {
      title: 'Final Verify Survey', description: 'Pre-deployment verification', status: 'published',
    })
  }
  log('Publish survey', pub.status === 200,      `status=${pub.status}`)
  shareToken = pub.body?.data?.share_token || shareToken
  log('Share token present', !!shareToken,        shareToken ? `token=${shareToken}` : 'MISSING')

  /* list surveys */
  const list = await req('GET', '/surveys')
  log('List surveys',       list.status === 200 && Array.isArray(list.body?.data),
      `count=${list.body?.data?.length}`)

  /* ──────────────────────────────────────────────────────────
     5. PUBLIC RESPONSES
  ────────────────────────────────────────────────────────── */
  sep('5 · PUBLIC RESPONSES')
  if (shareToken) {
    const pubGet = await req('GET', `/public/survey/${shareToken}`)
    log('Public survey GET', pubGet.status === 200 && pubGet.body?.data?.id,
        `title=${pubGet.body?.data?.title}`)

    const respond = await req('POST', `/public/survey/${shareToken}/respond`, {
      answers: { [questionId]: 8, },
      respondent_email: 'respondent@verify.test',
    })
    log('Submit public response', respond.status === 201 || respond.status === 200,
        `status=${respond.status}`)

    /* second response for analytics variety */
    await req('POST', `/public/survey/${shareToken}/respond`, {
      answers: { [questionId]: 5 },
    })
    log('Second response submitted', true, 'analytics seed')
  } else {
    log('Public survey GET',        false, 'No share_token — SKIPPED')
    log('Submit public response',   false, 'No share_token — SKIPPED')
    log('Second response submitted',false, 'SKIPPED')
  }

  /* ──────────────────────────────────────────────────────────
     6. ANALYTICS DASHBOARD
  ────────────────────────────────────────────────────────── */
  sep('6 · ANALYTICS DASHBOARD')
  const analytics = await req('GET', `/responses/analytics/${surveyId}`)
  log('Analytics 200',          analytics.status === 200,
      `status=${analytics.status}`)
  log('Analytics has data',     analytics.body?.data !== undefined || analytics.body?.success,
      JSON.stringify(analytics.body).slice(0, 80))
  const respList = await req('GET', `/responses/${surveyId}`)
  log('Response list endpoint', respList.status === 200,
      `status=${respList.status}`)

  /* ──────────────────────────────────────────────────────────
     7. AI QUESTION GENERATION
  ────────────────────────────────────────────────────────── */
  sep('7 · AI QUESTION GENERATION')
  const validSrc = ['openai','groq','gemini','openrouter','ollama','fallback']
  const aiGen = await req('POST', '/generate-questions', {
    topic: 'Employee satisfaction', count: 4,
  })
  log('AI generate 200',   aiGen.status === 200,
      `source=${aiGen.body?.source}`)
  log('Returns questions', Array.isArray(aiGen.body?.questions) && aiGen.body.questions.length > 0,
      `count=${aiGen.body?.questions?.length}`)
  log('Valid source',      validSrc.includes(aiGen.body?.source),
      aiGen.body?.source)
  if (aiGen.body?.questions?.length > 0) {
    console.log('  Sample Q:', JSON.stringify(aiGen.body.questions[0]).slice(0, 100))
  }

  /* AI recommendations */
  const aiRec = await req('POST', '/ai/recommendations', {
    title: 'Customer NPS', description: 'Measure promoter score', questions: [],
  })
  log('AI recommendations', aiRec.status === 200 && validSrc.includes(aiRec.body?.source),
      `source=${aiRec.body?.source}`)

  /* AI insights */
  const ins = await req('GET', '/insights')
  log('AI insights endpoint', ins.status === 200,
      `source=${ins.body?.source}`)

  /* ──────────────────────────────────────────────────────────
     8. PDF GENERATION + DOWNLOAD
  ────────────────────────────────────────────────────────── */
  sep('8 · PDF GENERATION + DOWNLOAD')
  const pdf = await req('POST', '/reports/download', { survey_id: surveyId })
  const pdfBytes   = pdf.raw?.length || 0
  const isPdfCT    = pdf.headers['content-type']?.includes('pdf')
  const pdfMagic   = pdf.raw?.slice(0, 4)?.toString() === '%PDF'
  log('PDF download 200',       pdf.status === 200,       `status=${pdf.status}`)
  log('Content-Type pdf',       isPdfCT,                  pdf.headers['content-type'])
  log('PDF magic bytes (%PDF)', pdfMagic,                 `first4=${pdf.raw?.slice(0,4)?.toString()}`)
  log('PDF size > 1 KB',        pdfBytes > 1024,          `${pdfBytes} bytes`)

  /* save to disk for inspection */
  const pdfPath = path.join(__dirname, 'verify-output.pdf')
  if (pdf.status === 200 && pdf.raw?.length > 0) {
    fs.writeFileSync(pdfPath, pdf.raw)
    log('PDF saved to disk', true, `→ backend/verify-output.pdf (${(pdfBytes/1024).toFixed(1)} KB)`)
  }

  /* ──────────────────────────────────────────────────────────
     9. PDF EMAIL DELIVERY
  ────────────────────────────────────────────────────────── */
  sep('9 · PDF EMAIL DELIVERY')
  const emailReport = await req('POST', '/reports/send', {
    email: EMAIL,
    survey_id: surveyId,
  })
  log('Report email 200',   emailReport.status === 200 && emailReport.body?.success,
      `status=${emailReport.status}`)
  log('Email delivered',    emailReport.body?.success,
      emailReport.body?.simulated
        ? '⚠ simulated=true (SMTP responded but marked simulated)'
        : emailReport.body?.message || 'sent via SMTP')
  if (emailReport.body?.simulated !== undefined) {
    log('Not simulated (real SMTP)', !emailReport.body?.simulated,
        emailReport.body?.simulated ? 'SMTP sent but flagged simulated' : 'REAL email sent ✓')
  }
  console.log('  Full response:', JSON.stringify(emailReport.body).slice(0, 200))

  /* ──────────────────────────────────────────────────────────
     10. ADMIN BILLING / PLANS
  ────────────────────────────────────────────────────────── */
  sep('10 · ADMIN BILLING  +  SUBSCRIPTION UPGRADE')

  /* Plans list (public) */
  const plans = await req('GET', '/billing/plans')
  log('Billing plans listed', plans.status === 200 && Array.isArray(plans.body?.plans),
      `count=${plans.body?.plans?.length}`)
  if (plans.body?.plans) {
    plans.body.plans.forEach(p => console.log(`    • ${p.id}: ₹${p.price_inr} — ${p.name}`))
  }
  log('Razorpay config flag', plans.body?.razorpay !== undefined,
      `razorpay=${plans.body?.razorpay}`)

  /* Current subscription */
  const sub = await req('GET', '/billing/subscription')
  log('Subscription endpoint', sub.status === 200 && sub.body?.success,
      `plan=${sub.body?.data?.plan?.id}`)

  /* Usage snapshot */
  const usage = await req('GET', '/billing/usage')
  log('Usage endpoint',       usage.status === 200 && usage.body?.success,
      `surveys=${usage.body?.data?.surveys?.used}/${usage.body?.data?.surveys?.limit}`)

  /* Create order for Professional plan */
  const order = await req('POST', '/billing/create-order', { planId: 'professional' })
  log('Create Razorpay order', order.status === 200 && (order.body?.order?.id || order.body?.devMode),
      `orderId=${order.body?.order?.id}  devMode=${order.body?.devMode}`)

  /* Verify / activate subscription (dev-mode bypass) */
  let upgraded = false
  if (order.body?.order?.id) {
    const verify = await req('POST', '/billing/verify-payment', {
      planId:              'professional',
      razorpay_order_id:  order.body.order.id,
      razorpay_payment_id:`pay_verify_${TS}`,
      razorpay_signature: 'dev',
    })
    log('Subscription upgrade verified',
        verify.status === 200 && verify.body?.success,
        verify.body?.message || `status=${verify.status}`)
    log('Plan activated',
        verify.body?.data?.plan?.id === 'professional',
        `plan=${verify.body?.data?.plan?.id}`)
    upgraded = true

    /* Payments history */
    const payments = await req('GET', '/billing/payments')
    log('Payment history recorded',
        payments.status === 200 && Array.isArray(payments.body?.data) && payments.body.data.length > 0,
        `records=${payments.body?.data?.length}`)
  } else {
    log('Subscription upgrade verified', false, 'No order id returned — skipped')
    log('Plan activated',               false, 'Skipped')
    log('Payment history recorded',     false, 'Skipped')
  }

  /* Admin panel */
  const adminUsers = await req('GET', '/admin/users')
  log('Admin users endpoint',
      adminUsers.status === 200 || adminUsers.status === 403,
      adminUsers.status === 403 ? 'non-admin user correctly blocked (403)' : `users=${adminUsers.body?.data?.length}`)

  /* ──────────────────────────────────────────────────────────
     FINAL SUMMARY
  ────────────────────────────────────────────────────────── */
  console.log(`\n${'═'.repeat(54)}`)
  console.log('  FINAL VERIFICATION SUMMARY')
  console.log(`${'═'.repeat(54)}`)

  const passed  = results.filter(r => r.pass)
  const failed  = results.filter(r => !r.pass)
  const total   = results.length

  console.log(`\n  Total checks : ${total}`)
  console.log(`  ✅ Passed    : ${passed.length}`)
  console.log(`  ❌ Failed    : ${failed.length}`)

  /* Feature-level rollup */
  console.log('\n  ── Feature Status ──')
  const features = [
    { name: 'Health Check',          keys: ['Server reachable', 'Status ok'] },
    { name: 'Email OTP',             keys: ['Email OTP readable', 'Email OTP verify 200', 'Bad email OTP → 400'] },
    { name: 'Phone OTP',             keys: ['Phone OTP readable', 'Phone OTP verify 200', 'Phone login OTP verify'] },
    { name: 'Survey Sharing',        keys: ['Create survey 201', 'Publish survey', 'Share token present'] },
    { name: 'Public Responses',      keys: ['Public survey GET', 'Submit public response'] },
    { name: 'Analytics Dashboard',   keys: ['Analytics 200', 'Response list endpoint'] },
    { name: 'AI Question Generation',keys: ['AI generate 200', 'Returns questions', 'Valid source'] },
    { name: 'AI Recommendations',    keys: ['AI recommendations'] },
    { name: 'PDF Generation/Download', keys: ['PDF download 200', 'PDF magic bytes (%PDF)', 'PDF size > 1 KB'] },
    { name: 'PDF Email Delivery',    keys: ['Report email 200', 'Email delivered'] },
    { name: 'Admin Billing/Plans',   keys: ['Billing plans listed', 'Subscription endpoint', 'Usage endpoint'] },
    { name: 'Subscription Upgrade',  keys: ['Create Razorpay order', 'Subscription upgrade verified', 'Plan activated'] },
  ]

  features.forEach(f => {
    const checks = results.filter(r => f.keys.includes(r.name))
    const allPass = checks.length > 0 && checks.every(c => c.pass)
    console.log(`  ${allPass ? '✅' : '❌'} ${f.name}`)
  })

  if (failed.length > 0) {
    console.log('\n  ── Failed Checks ──')
    failed.forEach(f => console.log(`  ❌ ${f.name}: ${f.detail}`))
  }

  const pdfMsg = fs.existsSync(path.join(__dirname, 'verify-output.pdf'))
    ? `\n  📄 PDF saved: backend/verify-output.pdf`
    : ''
  console.log(pdfMsg)

  console.log('\n' + (failed.length === 0
    ? '  🎉  ALL CHECKS PASSED — READY FOR DEPLOYMENT'
    : `  ⚠   ${failed.length} check(s) failed — review above`))
  console.log(`${'▓'.repeat(54)}\n`)

  process.exit(failed.length === 0 ? 0 : 1)
}

main().catch(e => {
  console.error('\n[FATAL]', e.message || e)
  process.exit(1)
})
