/**
 * E2E integration tests for Razorpay webhooks and payment systems.
 * Communicates entirely via HTTP requests to avoid sqlite in-memory sync issues.
 * Usage: node test-payment-system.js (server must be running on port 5000)
 */
const http = require('http')

const PORT = process.env.PORT || 5000

function request(method, path, body = null, token = null, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null
    const options = {
      hostname: 'localhost',
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...extraHeaders
      }
    }
    const req = http.request(options, (res) => {
      const chunks = []
      res.on('data', (c) => chunks.push(c))
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString()
        let parsed = raw
        if (res.headers['content-type']?.includes('json')) {
          try {
            parsed = JSON.parse(raw)
          } catch (_) {}
        }
        resolve({ status: res.statusCode, body: parsed })
      })
    })
    req.on('error', reject)
    if (data) req.write(data)
    req.end()
  })
}

async function runTests() {
  console.log('=== STARTING CHECKOUT AND WEBHOOK INTEGRATION TESTS ===')
  
  const testEmail = `webhook.test.${Date.now()}@survexa.test`
  const testPhone = `+9198765${String(Date.now()).slice(-5)}`
  const password = 'TestPass123!'
  
  console.log(`\nStep 1: Signing up test user (${testEmail})...`)
  const signupRes = await request('POST', '/auth/signup', {
    name: 'Webhook User',
    email: testEmail,
    phone: testPhone,
    password
  })
  
  if (signupRes.status !== 201 || !signupRes.body.success) {
    console.error('Signup response:', signupRes.body)
    throw new Error(`Signup failed with status ${signupRes.status}`)
  }
  
  const emailOtp = signupRes.body.emailOtp
  const phoneOtp = signupRes.body.phoneOtp
  console.log(`Signup success. OTPs: email=${emailOtp}, phone=${phoneOtp}`)
  
  console.log('\nStep 2: Verifying Email OTP...')
  const emailVerifyRes = await request('POST', '/auth/verify-otp', {
    email: testEmail,
    code: emailOtp
  })
  if (emailVerifyRes.status !== 200 || !emailVerifyRes.body.success) {
    throw new Error('Email verification failed')
  }
  
  console.log('\nStep 3: Verifying Phone OTP...')
  const phoneVerifyRes = await request('POST', '/auth/phone/verify-otp', {
    phone: testPhone,
    code: phoneOtp,
    purpose: 'signup'
  })
  if (phoneVerifyRes.status !== 200 || !phoneVerifyRes.body.success) {
    throw new Error('Phone verification failed')
  }
  
  const token = phoneVerifyRes.body.token
  const userId = phoneVerifyRes.body.user.id
  console.log(`Account fully verified! Token retrieved. User ID: ${userId}`)
  
  // Verify initial free plan
  console.log('\nStep 4: Checking initial usage limits (Free plan)...')
  const initialUsage = await request('GET', '/billing/usage', null, token)
  if (initialUsage.status !== 200 || initialUsage.body.data.plan.id !== 'free') {
    throw new Error(`Expected free plan, got: ${JSON.stringify(initialUsage.body)}`)
  }
  console.log('Confirmed: user is on Free plan.')

  // Scenario 1: payment.captured webhook
  console.log('\n--- Scenario 1: Test payment.captured webhook ---')
  console.log('Creating Starter order...')
  const orderRes = await request('POST', '/billing/create-order', { planId: 'starter' }, token)
  if (orderRes.status !== 200 || !orderRes.body.success) {
    throw new Error('Create order failed')
  }
  
  const orderId = orderRes.body.order.id
  console.log(`Created order: ${orderId}`)
  
  console.log('Sending payment.captured webhook...')
  const webhookCapturePayload = {
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: `pay_captured_${Date.now()}`,
          order_id: orderId,
          amount: 9900
        }
      }
    }
  }
  
  const webhookCaptureRes = await request(
    'POST',
    '/api/billing/webhook',
    webhookCapturePayload,
    null,
    { 'x-razorpay-signature': 'dev' }
  )
  console.log('Webhook Response status:', webhookCaptureRes.status, webhookCaptureRes.body)
  if (webhookCaptureRes.status !== 200) {
    throw new Error(`payment.captured webhook returned HTTP ${webhookCaptureRes.status}`)
  }

  // Check upgraded status
  const starterUsage = await request('GET', '/billing/usage', null, token)
  console.log('Subscription after payment.captured:', starterUsage.body.data.plan.id)
  if (starterUsage.body.data.plan.id !== 'starter') {
    throw new Error('User subscription was not upgraded to starter')
  }
  
  // Check payments log
  const paymentsRes = await request('GET', '/billing/payments', null, token)
  const matchingPayment = paymentsRes.body.data.find(p => p.razorpay_order_id === orderId)
  console.log('Logged payment status:', matchingPayment ? matchingPayment.status : 'not found')
  if (!matchingPayment || matchingPayment.status !== 'captured') {
    throw new Error('Logged payment status is not captured')
  }
  console.log('✅ Scenario 1 (payment.captured) passed successfully!')


  // Scenario 2: payment.failed webhook
  console.log('\n--- Scenario 2: Test payment.failed webhook ---')
  console.log('Creating another Starter order...')
  const orderRes2 = await request('POST', '/billing/create-order', { planId: 'starter' }, token)
  const failedOrderId = orderRes2.body.order.id
  console.log(`Created order: ${failedOrderId}`)
  
  console.log('Sending payment.failed webhook...')
  const webhookFailedPayload = {
    event: 'payment.failed',
    payload: {
      payment: {
        entity: {
          id: `pay_failed_${Date.now()}`,
          order_id: failedOrderId,
          amount: 9900
        }
      }
    }
  }
  
  const webhookFailedRes = await request(
    'POST',
    '/api/billing/webhook',
    webhookFailedPayload,
    null,
    { 'x-razorpay-signature': 'dev' }
  )
  console.log('Webhook Response status:', webhookFailedRes.status, webhookFailedRes.body)
  if (webhookFailedRes.status !== 200) {
    throw new Error(`payment.failed webhook returned HTTP ${webhookFailedRes.status}`)
  }

  // Check payments log
  const paymentsRes2 = await request('GET', '/billing/payments', null, token)
  const matchingPayment2 = paymentsRes2.body.data.find(p => p.razorpay_order_id === failedOrderId)
  console.log('Logged payment status:', matchingPayment2 ? matchingPayment2.status : 'not found')
  if (!matchingPayment2 || matchingPayment2.status !== 'failed') {
    throw new Error('Logged payment status is not failed')
  }
  console.log('✅ Scenario 2 (payment.failed) passed successfully!')


  // Scenario 3: subscription.activated webhook
  console.log('\n--- Scenario 3: Test subscription.activated webhook ---')
  const rzpSubId = `sub_rz_${Date.now()}`
  
  console.log('Sending subscription.activated webhook for Professional plan...')
  const webhookSubResPayload = {
    event: 'subscription.activated',
    payload: {
      subscription: {
        entity: {
          id: rzpSubId,
          notes: {
            user_id: String(userId),
            plan_id: 'professional'
          },
          razorpay_order_id: `order_sub_${Date.now()}`,
          razorpay_payment_id: `pay_sub_${Date.now()}`
        }
      }
    }
  }

  const webhookSubRes = await request(
    'POST',
    '/api/billing/webhook',
    webhookSubResPayload,
    null,
    { 'x-razorpay-signature': 'dev' }
  )
  console.log('Webhook Response status:', webhookSubRes.status, webhookSubRes.body)
  if (webhookSubRes.status !== 200) {
    throw new Error(`subscription.activated webhook returned HTTP ${webhookSubRes.status}`)
  }

  // Check upgraded status
  const proUsage = await request('GET', '/billing/usage', null, token)
  console.log('Subscription after subscription.activated:', proUsage.body.data.plan.id)
  if (proUsage.body.data.plan.id !== 'professional') {
    throw new Error('User subscription was not upgraded to professional')
  }
  console.log('✅ Scenario 3 (subscription.activated) passed successfully!')


  // Scenario 4: subscription.cancelled webhook
  console.log('\n--- Scenario 4: Test subscription.cancelled webhook ---')
  console.log('Sending subscription.cancelled webhook...')
  const webhookCancelPayload = {
    event: 'subscription.cancelled',
    payload: {
      subscription: {
        entity: {
          id: rzpSubId,
          notes: {
            user_id: String(userId)
          }
        }
      }
    }
  }

  const webhookCancelRes = await request(
    'POST',
    '/api/billing/webhook',
    webhookCancelPayload,
    null,
    { 'x-razorpay-signature': 'dev' }
  )
  console.log('Webhook Response status:', webhookCancelRes.status, webhookCancelRes.body)
  if (webhookCancelRes.status !== 200) {
    throw new Error(`subscription.cancelled webhook returned HTTP ${webhookCancelRes.status}`)
  }

  // Check downgraded status
  const finalUsage = await request('GET', '/billing/usage', null, token)
  console.log('Subscription after subscription.cancelled:', finalUsage.body.data.plan.id)
  if (finalUsage.body.data.plan.id !== 'free') {
    throw new Error('User subscription was not downgraded to free')
  }
  console.log('✅ Scenario 4 (subscription.cancelled) passed successfully!')

  console.log('\n⭐⭐ ALL RAZORPAY WEBHOOK CHECKOUT SCENARIOS PASSED SUCCESSFULLY! ⭐⭐')
  process.exit(0)
}

runTests().catch((err) => {
  console.error('Integration test run failed:', err)
  process.exit(1)
})
