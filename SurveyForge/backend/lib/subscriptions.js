/**
 * Subscription lifecycle helpers
 */
const { query, run, queryOne } = require('../database')
const { getPlan } = require('./plans')
const { ensureUsageRow } = require('./usage')

const PERIOD_MS = 30 * 24 * 60 * 60 * 1000

function activateSubscription(userId, planId, paymentMeta = {}) {
  const plan = getPlan(planId)
  if (plan.id === 'free') throw new Error('Cannot activate free via payment')

  const now = Date.now()
  const periodEnd = now + PERIOD_MS

  run(
    `UPDATE subscriptions SET status = 'cancelled', updated_at = datetime('now')
     WHERE user_id = ? AND status = 'active'`,
    [userId],
  )

  const { lastInsertRowid } = run(
    `INSERT INTO subscriptions (
      user_id, plan_id, status, current_period_start, current_period_end,
      cancel_at_period_end, razorpay_order_id, razorpay_payment_id, updated_at
    ) VALUES (?, ?, 'active', ?, ?, 0, ?, ?, datetime('now'))`,
    [
      userId,
      plan.id,
      new Date(now).toISOString(),
      new Date(periodEnd).toISOString(),
      paymentMeta.orderId || null,
      paymentMeta.paymentId || null,
    ],
  )

  ensureUsageRow(userId)
  return queryOne('SELECT * FROM subscriptions WHERE id = ?', [lastInsertRowid])
}

function cancelSubscription(userId, immediate = false) {
  const sub = queryOne(
    `SELECT * FROM subscriptions WHERE user_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1`,
    [userId],
  )
  if (!sub) return null

  if (immediate) {
    run(
      `UPDATE subscriptions SET status = 'cancelled', cancel_at_period_end = 0, updated_at = datetime('now') WHERE id = ?`,
      [sub.id],
    )
    run(
      `INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
       VALUES (?, 'free', 'active', datetime('now'), NULL)`,
      [userId],
    )
  } else {
    run(
      `UPDATE subscriptions SET cancel_at_period_end = 1, updated_at = datetime('now') WHERE id = ?`,
      [sub.id],
    )
  }
  return queryOne('SELECT * FROM subscriptions WHERE id = ?', [sub.id])
}

function downgradeToFree(userId) {
  run(
    `UPDATE subscriptions SET status = 'cancelled', updated_at = datetime('now')
     WHERE user_id = ? AND status = 'active'`,
    [userId],
  )
  const existing = queryOne(
    `SELECT id FROM subscriptions WHERE user_id = ? AND plan_id = 'free' AND status = 'active'`,
    [userId],
  )
  if (!existing) {
    run(
      `INSERT INTO subscriptions (user_id, plan_id, status, current_period_start)
       VALUES (?, 'free', 'active', datetime('now'))`,
      [userId],
    )
  }
}

function ensureFreeSubscription(userId) {
  const active = queryOne(
    `SELECT id FROM subscriptions WHERE user_id = ? AND status = 'active' LIMIT 1`,
    [userId],
  )
  if (!active) {
    run(
      `INSERT INTO subscriptions (user_id, plan_id, status, current_period_start)
       VALUES (?, 'free', 'active', datetime('now'))`,
      [userId],
    )
  }
}

module.exports = {
  activateSubscription,
  cancelSubscription,
  downgradeToFree,
  ensureFreeSubscription,
  PERIOD_MS,
}
