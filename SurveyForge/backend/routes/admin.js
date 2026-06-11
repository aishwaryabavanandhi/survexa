/**
 * routes/admin.js — Admin-only routes
 * ─────────────────────────────────────────────────────────────
 * All routes here are mounted under /admin in server.js and are
 * protected by requireAuth + requireAdmin middleware.
 *
 * GET  /admin/users              — list all users
 * PATCH /admin/users/:id/role    — change a user's role
 * DELETE /admin/users/:id        — delete a user (no self-delete)
 * GET  /admin/surveys            — list all surveys (all users)
 * DELETE /admin/surveys/:id      — delete any survey
 * GET  /admin/analytics          — system-wide stats
 */

const express = require('express')
const { query, run, queryOne } = require('../database')
const { logActivity } = require('../lib/activityLogger')
const router = express.Router()

/* ── GET /admin/users ─────────────────────────────────────── */
router.get('/users', (req, res) => {
  try {
    const users = query(
      `SELECT id, email, name, role, verified, created_at FROM users ORDER BY id ASC`
    )
    res.json({ success: true, data: users })
  } catch (err) {
    console.error('[Admin] GET /users error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

/* ── PATCH /admin/users/:id/role ──────────────────────────── */
router.patch('/users/:id/role', (req, res) => {
  const { role } = req.body
  const targetId = Number(req.params.id)

  if (!['admin', 'user'].includes(role)) {
    return res.status(400).json({ success: false, error: "role must be 'admin' or 'user'" })
  }

  // Prevent demoting yourself
  if (targetId === req.user.id && role !== 'admin') {
    return res.status(400).json({ success: false, error: 'You cannot demote yourself' })
  }

  try {
    const target = queryOne('SELECT id FROM users WHERE id = ?', [targetId])
    if (!target) return res.status(404).json({ success: false, error: 'User not found' })

    run('UPDATE users SET role = ? WHERE id = ?', [role, targetId])
    const updated = queryOne('SELECT id, email, name, role, verified, created_at FROM users WHERE id = ?', [targetId])
    logActivity(req.user.id, req.user.email, 'change_role', updated.email, targetId, 'admin', { new_role: role, target_id: targetId })
    res.json({ success: true, data: updated, message: `User role updated to '${role}'` })
  } catch (err) {
    console.error('[Admin] PATCH /users/:id/role error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

/* ── DELETE /admin/users/:id ──────────────────────────────── */
router.delete('/users/:id', (req, res) => {
  const targetId = Number(req.params.id)

  // Prevent self-delete
  if (targetId === req.user.id) {
    return res.status(400).json({ success: false, error: 'You cannot delete your own account via admin panel' })
  }

  try {
    const target = queryOne('SELECT id, email FROM users WHERE id = ?', [targetId])
    if (!target) return res.status(404).json({ success: false, error: 'User not found' })

    // Clean up user's surveys, questions, responses
    const userSurveys = query('SELECT id FROM surveys WHERE user_id = ?', [targetId])
    for (const survey of userSurveys) {
      run('DELETE FROM responses WHERE survey_id = ?', [survey.id])
      run('DELETE FROM questions WHERE survey_id = ?', [survey.id])
    }
    run('DELETE FROM surveys WHERE user_id = ?', [targetId])
    run('DELETE FROM otp WHERE email = ?', [target.email])
    run('DELETE FROM password_reset_tokens WHERE email = ?', [target.email])
    run('DELETE FROM users WHERE id = ?', [targetId])

    console.log(`[Admin] User ${target.email} deleted by admin ${req.user.email}`)
    logActivity(req.user.id, req.user.email, 'delete_user', target.email, targetId, 'admin', { target_id: targetId, target_email: target.email })
    res.json({ success: true, message: `User '${target.email}' deleted` })
  } catch (err) {
    console.error('[Admin] DELETE /users/:id error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

/* ── GET /admin/surveys ───────────────────────────────────── */
router.get('/surveys', (req, res) => {
  try {
    const surveys = query(`
      SELECT
        s.id, s.title, s.description, s.share_token, s.created_at,
        s.user_id,
        u.email AS owner_email,
        u.name  AS owner_name,
        COUNT(DISTINCT q.id) AS question_count,
        COUNT(DISTINCT r.id) AS response_count
      FROM surveys s
      LEFT JOIN users     u ON u.id = s.user_id
      LEFT JOIN questions q ON q.survey_id = s.id
      LEFT JOIN responses r ON r.survey_id = s.id
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `)
    res.json({ success: true, data: surveys })
  } catch (err) {
    console.error('[Admin] GET /surveys error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

/* ── DELETE /admin/surveys/:id ────────────────────────────── */
router.delete('/surveys/:id', (req, res) => {
  try {
    const survey = queryOne('SELECT id, title FROM surveys WHERE id = ?', [req.params.id])
    if (!survey) return res.status(404).json({ success: false, error: 'Survey not found' })

    run('DELETE FROM responses WHERE survey_id = ?', [req.params.id])
    run('DELETE FROM questions WHERE survey_id = ?', [req.params.id])
    run('DELETE FROM surveys WHERE id = ?',          [req.params.id])

    console.log(`[Admin] Survey "${survey.title}" deleted by admin ${req.user.email}`)
    logActivity(req.user.id, req.user.email, 'delete_survey', survey.title, Number(req.params.id), 'admin', { target_id: Number(req.params.id), title: survey.title })
    res.json({ success: true, message: `Survey '${survey.title}' deleted` })
  } catch (err) {
    console.error('[Admin] DELETE /surveys/:id error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

/* ── GET /admin/analytics ─────────────────────────────────── */
router.get('/analytics', (req, res) => {
  try {
    const totals = queryOne(`
      SELECT
        (SELECT COUNT(*) FROM users)    AS total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'admin') AS total_admins,
        (SELECT COUNT(*) FROM surveys)  AS total_surveys,
        (SELECT COUNT(*) FROM responses) AS total_responses,
        (SELECT COUNT(*) FROM questions) AS total_questions
    `)

    // Recent signups (last 7 days)
    const recentUsers = query(`
      SELECT id, name, email, role, created_at
      FROM users
      ORDER BY id DESC
      LIMIT 10
    `)

    // Top surveys by responses
    const topSurveys = query(`
      SELECT s.id, s.title, COUNT(r.id) AS response_count,
             u.name AS owner_name, u.email AS owner_email
      FROM surveys s
      LEFT JOIN responses r ON r.survey_id = s.id
      LEFT JOIN users     u ON u.id = s.user_id
      GROUP BY s.id
      ORDER BY response_count DESC
      LIMIT 5
    `)

    // Responses per day (last 7 days)
    const dailyResponses = query(`
      SELECT DATE(submitted_at) AS day, COUNT(*) AS count
      FROM responses
      WHERE submitted_at >= DATE('now', '-7 days')
      GROUP BY day
      ORDER BY day ASC
    `)

    res.json({
      success: true,
      data: {
        totals,
        recentUsers,
        topSurveys,
        dailyResponses,
      }
    })
  } catch (err) {
    console.error('[Admin] GET /analytics error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

/* ── GET /admin/billing — revenue & subscription stats ───── */
router.get('/billing', (req, res) => {
  try {
    // 1. Total Revenue
    const revenue = queryOne(`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'captured' THEN amount_paise ELSE 0 END), 0) AS total_paise,
        COUNT(CASE WHEN status = 'captured' THEN 1 END) AS payment_count
      FROM payments
    `)

    // 2. Daily Revenue (last 24 hours)
    const dailyRevenue = queryOne(`
      SELECT COALESCE(SUM(amount_paise), 0) AS daily_paise
      FROM payments
      WHERE status = 'captured' AND COALESCE(paid_at, created_at) >= datetime('now', '-1 day')
    `)

    // 3. Monthly Revenue (last 30 days)
    const monthlyRevenue = queryOne(`
      SELECT COALESCE(SUM(amount_paise), 0) AS monthly_paise
      FROM payments
      WHERE status = 'captured' AND COALESCE(paid_at, created_at) >= datetime('now', '-30 days')
    `)

    // 4. Active Subscribers
    const subs = query(`
      SELECT plan_id, status, COUNT(*) AS count
      FROM subscriptions
      WHERE status = 'active'
      GROUP BY plan_id, status
    `)

    const paidUsers = queryOne(`
      SELECT COUNT(DISTINCT user_id) AS c FROM subscriptions
      WHERE status = 'active' AND plan_id != 'free'
    `)

    // 5. Free vs Paid Users
    const activeUsers = queryOne('SELECT COUNT(*) AS c FROM users WHERE verified = 1')
    const freeUsersCount = (activeUsers?.c ?? 0) - (paidUsers?.c ?? 0)

    // 6. Success Rate & Failed Payments Count
    const successRateStats = queryOne(`
      SELECT 
        COUNT(*) AS total_count,
        COUNT(CASE WHEN status = 'captured' THEN 1 END) AS success_count,
        COUNT(CASE WHEN status NOT IN ('captured', 'created') THEN 1 END) AS failed_count
      FROM payments
    `)

    // 7. Recent Transactions (last 50 payments)
    const recentPayments = query(`
      SELECT 
        p.*, 
        u.email, 
        u.name,
        p.razorpay_order_id AS provider_order_id,
        p.razorpay_payment_id AS provider_payment_id,
        p.id AS receipt_id
      FROM payments p
      LEFT JOIN users u ON u.id = p.user_id
      ORDER BY p.id DESC LIMIT 50
    `)

    // 8. Revenue Analytics (Daily revenue for last 30 days)
    const chartDailyRevenue = query(`
      SELECT DATE(COALESCE(paid_at, created_at)) AS day, COALESCE(SUM(amount_paise), 0) AS amount_paise
      FROM payments
      WHERE status = 'captured' AND COALESCE(paid_at, created_at) >= datetime('now', '-30 days')
      GROUP BY day
      ORDER BY day ASC
    `)

    // 9. Revenue Analytics (Monthly revenue for last 12 months)
    const chartMonthlyRevenue = query(`
      SELECT strftime('%Y-%m', COALESCE(paid_at, created_at)) AS month, COALESCE(SUM(amount_paise), 0) AS amount_paise
      FROM payments
      WHERE status = 'captured' AND COALESCE(paid_at, created_at) >= datetime('now', '-12 months')
      GROUP BY month
      ORDER BY month ASC
    `)

    // 10. Subscription Growth (last 6 months)
    const subscriptionGrowth = query(`
      SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS count
      FROM subscriptions
      WHERE plan_id != 'free' AND status = 'active' AND created_at >= datetime('now', '-6 months')
      GROUP BY month
      ORDER BY month ASC
    `)

    // Format results to INR
    const total_revenue_inr = Math.round((revenue?.total_paise ?? 0) / 100)
    const daily_revenue_inr = Math.round((dailyRevenue?.daily_paise ?? 0) / 100)
    const monthly_revenue_inr = Math.round((monthlyRevenue?.monthly_paise ?? 0) / 100)

    const total_payments = successRateStats?.total_count ?? 0
    const success_payments = successRateStats?.success_count ?? 0
    const failed_payments = successRateStats?.failed_count ?? 0
    const success_rate = total_payments > 0 ? Math.round((success_payments / total_payments) * 100) : 100

    res.json({
      success: true,
      data: {
        total_revenue_inr,
        daily_revenue_inr,
        monthly_revenue_inr,
        payment_count: revenue?.payment_count ?? 0,
        active_users: activeUsers?.c ?? 0,
        paid_users: paidUsers?.c ?? 0,
        free_users: freeUsersCount >= 0 ? freeUsersCount : 0,
        subscriptions_by_plan: subs,
        recent_payments: recentPayments,
        success_rate,
        failed_payments,
        chart_daily_revenue: chartDailyRevenue.map(d => ({
          day: d.day,
          amount_inr: Math.round(d.amount_paise / 100)
        })),
        chart_monthly_revenue: chartMonthlyRevenue.map(m => ({
          month: m.month,
          amount_inr: Math.round(m.amount_paise / 100)
        })),
        subscription_growth: subscriptionGrowth,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* ── GET /admin/activity ─────────────────────────────────── */
router.get('/activity', (req, res) => {
  try {
    const logs = query(
      `SELECT * FROM activity_log 
       ORDER BY created_at DESC 
       LIMIT 250`
    )
    res.json({ success: true, data: logs })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
