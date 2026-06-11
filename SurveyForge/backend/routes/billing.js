/**
 * Billing, subscriptions, Razorpay
 */
const express = require('express')
const { query, run, queryOne } = require('../database')
const { listPlans, getPlan } = require('../lib/plans')
const { getUsageSnapshot, checkLimit } = require('../lib/usage')
const {
  activateSubscription,
  cancelSubscription,
  downgradeToFree,
  ensureFreeSubscription,
} = require('../lib/subscriptions')
const { logActivity } = require('../lib/activityLogger')
const {
  isRazorpayConfigured,
  createOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
} = require('../services/razorpay')

const router = express.Router()

/* GET /billing/plans — public list */
router.get('/plans', (_req, res) => {
  res.json({
    success: true,
    plans: listPlans(true),
    razorpay: isRazorpayConfigured(),
    keyId: process.env.RAZORPAY_KEY_ID?.includes('your-')
      ? null
      : process.env.RAZORPAY_KEY_ID || null,
  })
})

/* GET /billing/usage */
router.get('/usage', (req, res) => {
  try {
    ensureFreeSubscription(req.user.id)
    res.json({ success: true, data: getUsageSnapshot(req.user.id) })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* GET /billing/subscription */
router.get('/subscription', (req, res) => {
  try {
    ensureFreeSubscription(req.user.id)
    res.json({ success: true, data: getUsageSnapshot(req.user.id) })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* GET /billing/payments */
router.get('/payments', (req, res) => {
  try {
    const rows = query(
      `SELECT id, plan_id, amount_paise, currency, status, method,
              razorpay_order_id, razorpay_payment_id, created_at
       FROM payments WHERE user_id = ? ORDER BY id DESC LIMIT 50`,
      [req.user.id],
    )
    res.json({ success: true, data: rows })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* POST /billing/create-order */
router.post('/create-order', async (req, res) => {
  const { planId } = req.body
  const plan = getPlan(planId)

  if (!plan || plan.id === 'free') {
    return res.status(400).json({ success: false, error: 'Invalid plan' })
  }

  try {
    const receipt = `u${req.user.id}-${plan.id}-${Date.now()}`
    const order = await createOrder({
      amountPaise: plan.price_paise,
      receipt,
      notes: { user_id: String(req.user.id), plan_id: plan.id },
    })

    run(
      `INSERT INTO payments (user_id, plan_id, amount_paise, currency, status, razorpay_order_id)
       VALUES (?, ?, ?, 'INR', 'created', ?)`,
      [req.user.id, plan.id, plan.price_paise, order.id],
    )

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency || 'INR',
      },
      plan: { id: plan.id, name: plan.name, price_inr: plan.price_inr },
      keyId: process.env.RAZORPAY_KEY_ID,
      devMode: order.devMode,
    })
  } catch (err) {
    console.error('[Billing] create-order:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

/* POST /billing/verify-payment */
router.post('/verify-payment', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, error: 'Missing payment verification fields' })
  }

  const plan = getPlan(planId)
  if (plan.id === 'free') {
    return res.status(400).json({ success: false, error: 'Invalid plan' })
  }

  const paymentRow = queryOne(
    'SELECT * FROM payments WHERE razorpay_order_id = ? AND user_id = ?',
    [razorpay_order_id, req.user.id],
  )

  if (!paymentRow) {
    return res.status(404).json({ success: false, error: 'Order not found' })
  }

  if (paymentRow.status === 'captured') {
    return res.json({ success: true, message: 'Already activated', data: getUsageSnapshot(req.user.id) })
  }

  const valid =
    verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    }) ||
    (!isRazorpayConfigured() && process.env.NODE_ENV !== 'production')

  if (!valid) {
    run(
      `UPDATE payments SET status = 'failed', razorpay_payment_id = ? WHERE id = ?`,
      [razorpay_payment_id, paymentRow.id],
    )
    return res.status(400).json({ success: false, error: 'Payment verification failed' })
  }

  try {
    run(
      `UPDATE payments SET status = 'captured', razorpay_payment_id = ?, razorpay_signature = ?, method = 'razorpay',
                           paid_at = datetime('now'), amount = ?
       WHERE id = ?`,
      [razorpay_payment_id, razorpay_signature, paymentRow.amount_paise / 100, paymentRow.id],
    )

    const sub = activateSubscription(req.user.id, plan.id, {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    })

    run(
      `INSERT INTO billing_history (payment_id, order_id, subscription_id, user_id, amount, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        razorpay_payment_id,
        razorpay_order_id,
        sub ? sub.id : null,
        req.user.id,
        paymentRow.amount_paise / 100,
        'captured'
      ]
    )

    logActivity(
      req.user.id,
      req.user.email,
      'subscription_upgrade',
      plan.name,
      sub ? sub.id : null,
      'billing',
      { plan_id: plan.id, amount: paymentRow.amount_paise / 100 }
    )

    res.json({
      success: true,
      message: `${plan.name} plan activated successfully!`,
      data: getUsageSnapshot(req.user.id),
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* POST /billing/cancel */
router.post('/cancel', (req, res) => {
  const { immediate } = req.body
  try {
    cancelSubscription(req.user.id, Boolean(immediate))
    if (immediate) ensureFreeSubscription(req.user.id)
    res.json({
      success: true,
      message: immediate
        ? 'Subscription cancelled. You are on the Free plan.'
        : 'Subscription will cancel at the end of the billing period.',
      data: getUsageSnapshot(req.user.id),
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* POST /billing/renew — create a new Razorpay order for the current paid plan */
router.post('/renew', async (req, res) => {
  try {
    ensureFreeSubscription(req.user.id)
    const snap = getUsageSnapshot(req.user.id)
    const planId = snap.plan?.id

    if (!planId || planId === 'free') {
      return res.status(400).json({ success: false, error: 'No paid plan to renew. Choose a plan first.' })
    }

    const plan = getPlan(planId)
    const receipt = `renew-u${req.user.id}-${plan.id}-${Date.now()}`
    const order = await createOrder({
      amountPaise: plan.price_paise,
      receipt,
      notes: { user_id: String(req.user.id), plan_id: plan.id, renew: 'true' },
    })

    run(
      `INSERT INTO payments (user_id, plan_id, amount_paise, currency, status, razorpay_order_id)
       VALUES (?, ?, ?, 'INR', 'created', ?)`,
      [req.user.id, plan.id, plan.price_paise, order.id],
    )

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency || 'INR',
      },
      plan: { id: plan.id, name: plan.name, price_inr: plan.price_inr },
      keyId: process.env.RAZORPAY_KEY_ID,
      devMode: order.devMode,
    })
  } catch (err) {
    console.error('[Billing] renew:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

/* POST /billing/change-plan — upgrade/downgrade via new payment for paid tiers */
router.post('/change-plan', async (req, res) => {
  const { planId } = req.body
  const plan = getPlan(planId)
  if (plan.id === 'free') {
    cancelSubscription(req.user.id, true)
    ensureFreeSubscription(req.user.id)
    return res.json({ success: true, message: 'Downgraded to Free', data: getUsageSnapshot(req.user.id) })
  }
  return res.status(400).json({
    success: false,
    error: 'Use create-order and verify-payment to change to a paid plan',
    redirect: '/upgrade',
  })
})

module.exports = router

/** Webhook handler (mounted with raw body in server.js) */
function billingWebhookHandler(req, res) {
  const signature = req.headers['x-razorpay-signature']
  const rawBody = req.body

  if (!Buffer.isBuffer(rawBody)) {
    return res.status(400).json({ success: false, error: 'Invalid webhook body' })
  }

  const isDevBypass = signature === 'dev' && process.env.NODE_ENV !== 'production'
  if (!isDevBypass && !verifyWebhookSignature(rawBody, signature)) {
    console.warn('[Billing] Webhook signature mismatch')
    return res.status(400).json({ success: false, error: 'Invalid signature' })
  }

  let event
  try {
    event = JSON.parse(rawBody.toString('utf8'))
  } catch {
    return res.status(400).json({ success: false, error: 'Invalid JSON' })
  }

  try {
    const type = event.event
    const payment = event.payload?.payment?.entity
    const subEntity = event.payload?.subscription?.entity

    if (type === 'payment.captured' && payment) {
      const orderId = payment.order_id
      const row = queryOne('SELECT * FROM payments WHERE razorpay_order_id = ?', [orderId])
      if (row && row.status !== 'captured') {
        run(
          `UPDATE payments SET status = 'captured', razorpay_payment_id = ?, paid_at = datetime('now'), amount = ?
           WHERE id = ?`,
          [payment.id, row.amount_paise / 100, row.id],
        )
        const sub = activateSubscription(row.user_id, row.plan_id, {
          orderId,
          paymentId: payment.id,
        })
        run(
          `INSERT INTO billing_history (payment_id, order_id, subscription_id, user_id, amount, status)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            payment.id,
            orderId,
            sub ? sub.id : null,
            row.user_id,
            payment.amount / 100,
            'captured'
          ]
        )
      }
    } else if (type === 'payment.failed' && payment) {
      const orderId = payment.order_id
      const row = queryOne('SELECT * FROM payments WHERE razorpay_order_id = ?', [orderId])
      if (row && row.status !== 'captured') {
        run(
          `UPDATE payments SET status = 'failed', razorpay_payment_id = ? WHERE id = ?`,
          [payment.id, row.id],
        )
        run(
          `INSERT INTO billing_history (payment_id, order_id, subscription_id, user_id, amount, status)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            payment.id,
            orderId,
            null,
            row.user_id,
            payment.amount / 100,
            'failed'
          ]
        )
      }
    } else if (subEntity) {
      const subId = subEntity.id
      const userId = subEntity.notes?.user_id || subEntity.notes?.userId
      const planId = subEntity.notes?.plan_id || subEntity.notes?.planId || 'free'
      
      let existingSub = queryOne('SELECT * FROM subscriptions WHERE razorpay_subscription_id = ?', [subId])
      if (!existingSub && userId) {
        existingSub = queryOne('SELECT * FROM subscriptions WHERE user_id = ? AND plan_id = ? AND status = "active"', [userId, planId])
      }

      if (type === 'subscription.activated') {
        if (existingSub) {
          run(
            `UPDATE subscriptions SET status = 'active', razorpay_subscription_id = ?, updated_at = datetime('now') WHERE id = ?`,
            [subId, existingSub.id]
          )
        } else if (userId) {
          existingSub = activateSubscription(userId, planId, {
            orderId: subEntity.razorpay_order_id || null,
            paymentId: subEntity.razorpay_payment_id || null,
          })
          run(
            `UPDATE subscriptions SET razorpay_subscription_id = ? WHERE id = ?`,
            [subId, existingSub.id]
          )
        }

        if (userId) {
          run(
            `INSERT INTO billing_history (payment_id, order_id, subscription_id, user_id, amount, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              subEntity.razorpay_payment_id || null,
              subEntity.razorpay_order_id || null,
              existingSub ? existingSub.id : null,
              userId,
              0,
              'subscription_activated'
            ]
          )
        }
      } else if (type === 'subscription.cancelled') {
        if (existingSub) {
          run(
            `UPDATE subscriptions SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?`,
            [existingSub.id]
          )
          downgradeToFree(existingSub.user_id)
          run(
            `INSERT INTO billing_history (payment_id, order_id, subscription_id, user_id, amount, status)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [null, null, existingSub.id, existingSub.user_id, 0, 'subscription_cancelled']
          )
        }
      }
    }

    res.json({ success: true })
  } catch (err) {
    console.error('[Billing] webhook:', err)
    res.status(500).json({ success: false, error: err.message })
  }
}

module.exports.billingWebhookHandler = billingWebhookHandler
module.exports.checkLimit = checkLimit
