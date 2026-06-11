/**
 * routes/notifications.js
 *
 * GET    /notifications              → list user's notifications (newest first)
 * GET    /notifications/unread-count → { count: N }
 * PUT    /notifications/read-all     → mark all as read  [MUST come before /:id/read]
 * PUT    /notifications/:id/read     → mark one as read
 * DELETE /notifications/:id          → delete one notification
 *
 * Route ordering note: specific literal paths (/read-all, /unread-count) are
 * declared BEFORE parameterised paths (/:id) to prevent Express from treating
 * the literal string as an :id value.
 */

const express = require('express')
const { query, run, queryOne, persist } = require('../database')

const router = express.Router()

// GET /notifications — all notifications for the logged-in user
router.get('/', (req, res) => {
  try {
    const rows = query(
      `SELECT n.*, s.title AS survey_title
       FROM notifications n
       LEFT JOIN surveys s ON s.id = n.survey_id
       WHERE n.user_id = ?
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [req.user.id]
    )
    res.json({ success: true, data: rows })
  } catch (err) {
    console.error('[Notifications] GET error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// GET /notifications/unread-count
router.get('/unread-count', (req, res) => {
  try {
    const row = queryOne(
      'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0',
      [req.user.id]
    )
    res.json({ success: true, count: row?.count ?? 0 })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT /notifications/read-all — mark all as read
// ⚠️  MUST be declared BEFORE /:id/read — otherwise Express matches 'read-all' as the :id
router.put('/read-all', (req, res) => {
  try {
    run('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id])
    persist()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// PUT /notifications/:id/read — mark one as read
router.put('/:id/read', (req, res) => {
  try {
    run(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    )
    persist()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// DELETE /notifications/:id
router.delete('/:id', (req, res) => {
  try {
    run(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    )
    persist()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
