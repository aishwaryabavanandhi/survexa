/**
 * backend/routes/manualPayments.js — Manual UPI payments and settings routes
 */
const express = require('express')
const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const { query, run, queryOne, persist } = require('../database/database')
const { getPlan } = require('../lib/plans')
const { activateSubscription } = require('../lib/subscriptions')
const { sendEmailNotification, sendInAppNotification } = require('../lib/notifications')
const { requireAuth, requireAdmin } = require('../middleware/auth')

const router = express.Router()

// Helper to save base64 image
function saveBase64Image(base64Str) {
  const matches = base64Str.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/)
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid image format. Must be a valid base64 image data URI.')
  }

  const mimeType = matches[1]
  const base64Data = matches[2]
  const buffer = Buffer.from(base64Data, 'base64')

  // Max 10MB size validation
  const MAX_SIZE = 10 * 1024 * 1024
  if (buffer.length > MAX_SIZE) {
    throw new Error('Screenshot file size exceeds 10 MB limit.')
  }

  // File type validation
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png']
  if (!allowedMimeTypes.includes(mimeType)) {
    throw new Error('Only JPG, JPEG, and PNG images are allowed.')
  }

  const ext = mimeType.split('/')[1]
  const filename = `${uuidv4()}.${ext}`
  const uploadDir = path.join(__dirname, '../uploads')

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  const filepath = path.join(uploadDir, filename)
  fs.writeFileSync(filepath, buffer)

  return `/uploads/${filename}`
}

/* GET /billing/active-request — Fetch pending request for logged-in user */
router.get('/billing/active-request', requireAuth, (req, res) => {
  try {
    const row = queryOne(
      `SELECT pr.*, p.name AS plan_name
       FROM payment_requests pr
       LEFT JOIN plans p ON p.id = pr.plan_id
       WHERE pr.user_id = ? AND pr.status = 'pending'
       LIMIT 1`,
      [req.user.id]
    )
    res.json({ success: true, data: row || null })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* GET /billing/payment-details — Fetch admin's UPI payment details for users */
router.get('/billing/payment-details', requireAuth, (req, res) => {
  try {
    const rows = query('SELECT * FROM admin_settings')
    const settings = {}
    for (const r of rows) {
      settings[r.key] = r.value
    }
    // Default fallbacks if empty
    const details = {
      upi_id: settings.upi_id || 'aishubavan2@okicici',
      upi_account_name: settings.upi_account_name || 'Aishwarya Bavan',
      upi_qr_code: settings.upi_qr_code || '/uploads/survexa_qr.png'
    }
    res.json({ success: true, data: details })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* POST /billing/payment-request — Submit payment request */
router.post('/billing/payment-request', requireAuth, async (req, res) => {
  const { planId, amount, paymentReference, screenshot } = req.body

  if (!planId || !amount || !paymentReference || !screenshot) {
    return res.status(400).json({ success: false, error: 'Missing required fields' })
  }

  // Prevent duplicates
  const pending = queryOne(
    `SELECT id FROM payment_requests WHERE user_id = ? AND status = 'pending' LIMIT 1`,
    [req.user.id]
  )
  if (pending) {
    return res.status(400).json({
      success: false,
      error: 'You already have a pending payment request. Please wait for the admin to review it.'
    })
  }

  try {
    const plan = getPlan(planId)
    if (!plan || plan.id === 'free') {
      return res.status(400).json({ success: false, error: 'Invalid subscription plan' })
    }

    const screenshot_url = saveBase64Image(screenshot)

    const { lastInsertRowid } = run(
      `INSERT INTO payment_requests (user_id, plan_id, amount, screenshot_url, payment_reference, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [req.user.id, planId, Number(amount), screenshot_url, paymentReference]
    )

    // Log Activity
    try {
      const { logActivity } = require('../lib/activityLogger')
      logActivity(req.user.id, req.user.name || req.user.email, 'Submitted payment request', plan.name, lastInsertRowid)
    } catch (_) {
      // Activity logger not registered yet
    }

    // User in-app notification
    sendInAppNotification(
      req.user.id,
      'Payment Submitted',
      `Your payment request for the ${plan.name} plan (₹${amount}) has been submitted for review.`
    )

    // Send email to user (optional but nice)
    sendEmailNotification(
      req.user.email,
      'Payment Request Submitted',
      `Hi ${req.user.name || 'User'},\n\nWe have received your payment request of ₹${amount} for upgrading to the ${plan.name} plan. Our admin will review the screenshot proof and approve your plan shortly.\n\nTransaction Ref: ${paymentReference}\n\nBest,\nSurvexa Team`
    )

    res.json({ success: true, message: 'Payment request submitted successfully!' })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
})

/* ── Admin Restricted Endpoints ─────────────────────────────── */

/* GET /admin/payments — List payment requests (Admin only) */
router.get('/admin/payments', requireAuth, requireAdmin, (req, res) => {
  const { status } = req.query
  try {
    let sql = `
      SELECT pr.*, u.name, u.email, p.name AS plan_name
      FROM payment_requests pr
      LEFT JOIN users u ON u.id = pr.user_id
      LEFT JOIN plans p ON p.id = pr.plan_id
    `
    const params = []
    if (status) {
      sql += ` WHERE pr.status = ?`
      params.push(status)
    }
    sql += ` ORDER BY pr.id DESC`

    const rows = query(sql, params)
    res.json({ success: true, data: rows })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* POST /admin/payments/:id/approve — Approve manual payment (Admin only) */
router.post('/admin/payments/:id/approve', requireAuth, requireAdmin, (req, res) => {
  const id = Number(req.params.id)
  try {
    const request = queryOne(
      `SELECT pr.*, u.email, u.name
       FROM payment_requests pr
       LEFT JOIN users u ON u.id = pr.user_id
       WHERE pr.id = ? AND pr.status = 'pending'`,
      [id]
    )

    if (!request) {
      return res.status(404).json({ success: false, error: 'Pending payment request not found' })
    }

    const plan = getPlan(request.plan_id)

    // Approve the request
    run(`UPDATE payment_requests SET status = 'approved' WHERE id = ?`, [id])

    // Activate subscription
    const sub = activateSubscription(request.user_id, request.plan_id, {
      orderId: `manual_order_${id}_${Date.now()}`,
      paymentId: `manual_pay_${request.payment_reference}`,
    })

    // Insert payment record so billing dashboard is up-to-date
    run(
      `INSERT INTO payments (user_id, plan_id, amount_paise, currency, status, method, paid_at, amount)
       VALUES (?, ?, ?, 'INR', 'captured', 'manual_upi', datetime('now'), ?)`,
      [request.user_id, request.plan_id, Math.round(request.amount * 100), request.amount]
    )

    // Insert billing history
    if (sub) {
      run(
        `INSERT INTO billing_history (payment_id, order_id, subscription_id, user_id, amount, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          `manual_pay_${request.payment_reference}`,
          `manual_order_${id}_${Date.now()}`,
          sub.id,
          request.user_id,
          request.amount,
          'captured'
        ]
      )
    }

    // Log Activity
    try {
      const { logActivity } = require('../lib/activityLogger')
      logActivity(req.user.id, `Admin (${req.user.name || req.user.email})`, 'Approved payment request', `User ID: ${request.user_id}, Plan: ${plan.name}`, id)
    } catch (_) {}

    // Send in-app notification to user
    sendInAppNotification(
      request.user_id,
      'Subscription Activated',
      `Congratulations! Your payment of ₹${request.amount} has been approved, and your ${plan.name} subscription is now active.`
    )

    // Send email to user
    sendEmailNotification(
      request.email,
      'Payment Approved & Subscription Active!',
      `Hi ${request.name || 'User'},\n\nWe have approved your manual UPI payment (Ref: ${request.payment_reference}) for ₹${request.amount}.\n\nYour ${plan.name} subscription is now active! Enjoy unlimited features.\n\nBest regards,\nSurvexa Team`
    )

    res.json({ success: true, message: 'Payment approved and subscription activated successfully!' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* POST /admin/payments/:id/reject — Reject manual payment (Admin only) */
router.post('/admin/payments/:id/reject', requireAuth, requireAdmin, (req, res) => {
  const id = Number(req.params.id)
  const { reason } = req.body

  if (!reason) {
    return res.status(400).json({ success: false, error: 'Rejection reason is required' })
  }

  try {
    const request = queryOne(
      `SELECT pr.*, u.email, u.name
       FROM payment_requests pr
       LEFT JOIN users u ON u.id = pr.user_id
       WHERE pr.id = ? AND pr.status = 'pending'`,
      [id]
    )

    if (!request) {
      return res.status(404).json({ success: false, error: 'Pending payment request not found' })
    }

    const plan = getPlan(request.plan_id)

    // Reject the request
    run(`UPDATE payment_requests SET status = 'rejected', rejection_reason = ? WHERE id = ?`, [reason, id])

    // Log Activity
    try {
      const { logActivity } = require('../lib/activityLogger')
      logActivity(req.user.id, `Admin (${req.user.name || req.user.email})`, 'Rejected payment request', `User ID: ${request.user_id}, Plan: ${plan.name}`, id)
    } catch (_) {}

    // Send in-app notification to user
    sendInAppNotification(
      request.user_id,
      'Payment Rejected',
      `Your payment request for the ${plan.name} plan was rejected. Reason: ${reason}`
    )

    // Send email to user
    sendEmailNotification(
      request.email,
      'Payment Request Rejected',
      `Hi ${request.name || 'User'},\n\nYour UPI payment request (Ref: ${request.payment_reference}) for ₹${request.amount} has been rejected by our admin.\n\nReason for Rejection: ${reason}\n\nPlease check your payment details or contact support if you believe this is an error.\n\nBest regards,\nSurvexa Team`
    )

    res.json({ success: true, message: 'Payment request rejected successfully' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* GET /admin/settings/payments — Fetch UPI details and plans (Admin only) */
router.get('/admin/settings/payments', requireAuth, requireAdmin, (req, res) => {
  try {
    const rows = query('SELECT * FROM admin_settings')
    const settings = {}
    for (const r of rows) {
      settings[r.key] = r.value
    }

    // Default fallbacks if empty
    settings.upi_id = settings.upi_id || 'aishubavan2@okicici'
    settings.upi_account_name = settings.upi_account_name || 'Aishwarya Bavan'
    settings.upi_qr_code = settings.upi_qr_code || '/uploads/survexa_qr.png'

    const { listPlans } = require('../lib/plans')
    // Fetch all plans from database (including disabled ones)
    const plans = listPlans(false)

    res.json({ success: true, settings, plans })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* POST /admin/settings/payments — Update UPI and plans config (Admin only) */
router.post('/admin/settings/payments', requireAuth, requireAdmin, (req, res) => {
  const { upi_id, upi_account_name, qr_image_base64, plans } = req.body

  try {
    if (upi_id) {
      run(`INSERT INTO admin_settings (key, value) VALUES ('upi_id', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`, [upi_id])
    }
    if (upi_account_name) {
      run(`INSERT INTO admin_settings (key, value) VALUES ('upi_account_name', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`, [upi_account_name])
    }
    if (qr_image_base64) {
      const qr_code_url = saveBase64Image(qr_image_base64)
      run(`INSERT INTO admin_settings (key, value) VALUES ('upi_qr_code', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`, [qr_code_url])
    }

    if (plans && Array.isArray(plans)) {
      for (const p of plans) {
        run(
          `UPDATE plans SET price_inr = ?, is_active = ? WHERE id = ?`,
          [Number(p.price_inr), p.is_active ? 1 : 0, p.id]
        )
      }
    }

    res.json({ success: true, message: 'Admin payment settings updated successfully!' })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
})

module.exports = router
