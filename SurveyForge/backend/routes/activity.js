/**
 * backend/routes/activity.js
 * Exposes routes to fetch user activity logs.
 */
const express = require('express')
const { query } = require('../database')
const router = express.Router()

/* GET /activity - get activity logs for the current logged-in user */
router.get('/', (req, res) => {
  try {
    const logs = query(
      `SELECT * FROM activity_log 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 100`,
      [req.user.id]
    )
    res.json({ success: true, data: logs })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
