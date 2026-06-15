/**
 * backend/diagnostic.js — End-to-End API and Database Diagnostic Verification
 * ────────────────────────────────────────────────────────────────────────────
 * This script runs automated, asynchronous integration tests against the live
 * Survexa Express server. It verifies health status, signs up a temporary test
 * user, retrieves and auto-verifies the OTP code returned in devMode, validates
 * session retrieval via JWT auth headers, and cleans up the SQLite DB.
 */

const http = require('http')
const db   = require('./database/database')

const PORT = process.env.PORT || 5000
const BASE_URL = `http://localhost:${PORT}`
const TEST_EMAIL = `diagnostic.agent.${Math.floor(1000 + Math.random() * 9000)}@survexa.test`
const TEST_PHONE = `+91999999${String(Math.floor(1000 + Math.random() * 9000))}`
const TEST_PASSWORD = 'Password123!'
const TEST_NAME = 'Diagnostic Agent'

async function ensureDb() {
  await db.initDatabase()
}

function request(method, path, headers = {}, payload = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }

    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          resolve({ status: res.statusCode, body: parsed })
        } catch (e) {
          resolve({ status: res.statusCode, body: data })
        }
      })
    })

    req.on('error', (err) => { reject(err) })

    if (payload) {
      req.write(JSON.stringify(payload))
    }
    req.end()
  })
}

async function runDiagnostics() {
  await ensureDb()
  console.log('\n======================================================')
  console.log('       🔍   SURVEXA API DIAGNOSTIC TEST RUNNER        ')
  console.log('======================================================\n')
  
  let tempToken = null
  let otpCode = null

  try {
    // 1. GET /health
    console.log(' STEP 1: Verifying server health...')
    const health = await request('GET', '/health')
    if (health.status === 200 && health.body.status === 'ok') {
      console.log(`   ✅ Health check passed! Server is active (${health.body.uptime} uptime).`)
    } else {
      throw new Error(`Health check failed with status ${health.status}: ${JSON.stringify(health.body)}`)
    }

    // 2. POST /auth/signup
    console.log(`\n STEP 2: Creating temporary test account: ${TEST_EMAIL}...`)
    const signup = await request('POST', '/auth/signup', {}, {
      name: TEST_NAME,
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      phone: TEST_PHONE
    })
    
    if (signup.status === 201 && signup.body.success) {
      console.log('   ✅ Account registration successful!')
      otpCode = signup.body.emailOtp || signup.body.otp
      if (!otpCode) {
        await new Promise((r) => setTimeout(r, 200))
        // Since sql.js is in-memory, reload db to see disk modifications from the other process
        await db.initDatabase()
        const row = db.queryOne(
          'SELECT code FROM otp WHERE email = ? ORDER BY id DESC LIMIT 1',
          [TEST_EMAIL],
        )
        otpCode = row?.code
      }
      if (otpCode) {
        console.log(
          `   ⚙️  OTP resolved (${signup.body.devMode ? 'devMode response' : 'database lookup'}): ${otpCode}`,
        )
      } else {
        throw new Error('Could not resolve OTP from response or database.')
      }
    } else {
      throw new Error(`Signup failed with status ${signup.status}: ${JSON.stringify(signup.body)}`)
    }

    // 3. POST /auth/verify-otp (email verification)
    console.log(`\n STEP 3: Verifying email using OTP: ${otpCode}...`)
    const verify = await request('POST', '/auth/verify-otp', {}, {
      email: TEST_EMAIL,
      code: otpCode
    })

    if (verify.status === 200 && verify.body.success) {
      console.log('   ✅ Email successfully verified!')
    } else {
      throw new Error(`Email Verification failed with status ${verify.status}: ${JSON.stringify(verify.body)}`)
    }

    // 3b. POST /auth/phone/verify-otp (phone verification)
    let phoneOtpCode = signup.body.phoneOtp
    if (!phoneOtpCode) {
      await db.initDatabase()
      const row = db.queryOne(
        'SELECT code FROM phone_otp WHERE phone = ? ORDER BY id DESC LIMIT 1',
        [TEST_PHONE],
      )
      phoneOtpCode = row?.code
    }
    console.log(`\n STEP 3b: Verifying phone using OTP: ${phoneOtpCode}...`)
    const verifyPhone = await request('POST', '/auth/phone/verify-otp', {}, {
      phone: TEST_PHONE,
      code: phoneOtpCode,
      purpose: 'signup'
    })

    if (verifyPhone.status === 200 && verifyPhone.body.success) {
      tempToken = verifyPhone.body.token
      console.log('   ✅ Phone successfully verified!')
      console.log('   🔐 JWT Token generated successfully.')
    } else {
      throw new Error(`Phone Verification failed with status ${verifyPhone.status}: ${JSON.stringify(verifyPhone.body)}`)
    }

    // 4. GET /auth/me (JWT Authorization header test)
    console.log('\n STEP 4: Validating user session via JWT auth headers...')
    const profile = await request('GET', '/auth/me', {
      'Authorization': `Bearer ${tempToken}`
    })

    if (profile.status === 200 && profile.body.success) {
      console.log(`   ✅ JWT authentication check passed! Welcome back, ${profile.body.user.name}.`)
      console.log(`   📂 Verified profile payload fields: ID=${profile.body.user.id}, Role=${profile.body.user.role}`)
    } else {
      throw new Error(`Profile session query failed with status ${profile.status}: ${JSON.stringify(profile.body)}`)
    }

    console.log('\n======================================================')
    console.log('     🎉   ALL E2E DIAGNOSTIC CHECKS PASSED!            ')
    console.log('======================================================')
    console.log('   ✔  Health API Alive & Healthy')
    console.log('   ✔  User Signup & Database Write Integrity')
    console.log('   ✔  DevMode OTP Code Handshake & Verification')
    console.log('   ✔  JWT Authorization & Route Protection Middleware')
    console.log('======================================================\n')

  } catch (err) {
    console.error('\n❌ DIAGNOSTIC FAILURE:', err.message)
    process.exit(1)
  } finally {
    // Clean up temporary database records
    console.log(' STEP 5: Cleaning up diagnostic database records...')
    db.run('DELETE FROM users WHERE email = ?', [TEST_EMAIL])
    db.run('DELETE FROM otp WHERE email = ?', [TEST_EMAIL])
    db.run('DELETE FROM phone_otp WHERE phone = ?', [TEST_PHONE])
    console.log('   🧹 SQLite DB clean. Temporary account purged.\n')
    process.exit(0)
  }
}

runDiagnostics()
