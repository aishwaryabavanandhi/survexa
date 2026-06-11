/**
 * backend/lib/activityLogger.js
 * Central logger for writing activity logs to the SQLite database.
 */
const { run } = require('../database')

/**
 * Log a user or admin activity to the database.
 * 
 * @param {number|null} userId - The ID of the user performing the action
 * @param {string} who - The identifier (email, name, or "guest")
 * @param {string} action - The action performed (e.g., 'login', 'survey_create')
 * @param {string} target - The name or descriptor of the target object
 * @param {number|null} targetId - The ID of the target object
 * @param {string} module - The system module ('auth', 'surveys', 'responses', 'ai', 'billing', 'admin')
 * @param {object} metadata - Optional contextual key-value pairs
 */
function logActivity(userId, who, action, target = '', targetId = null, module = '', metadata = {}) {
  try {
    // Auto-detect module if not explicitly provided
    let resolvedModule = module
    if (!resolvedModule && action) {
      const act = action.toLowerCase()
      if (act.includes('login') || act.includes('logout') || act.includes('register') || act.includes('signup') || act.includes('otp')) {
        resolvedModule = 'auth'
      } else if (act.includes('survey_create') || act.includes('survey_edit') || act.includes('survey_duplicate') || act.includes('survey_restore') || act.includes('survey_delete') || act.includes('survey_publish')) {
        resolvedModule = 'surveys'
      } else if (act.includes('response')) {
        resolvedModule = 'responses'
      } else if (act.includes('ai_')) {
        resolvedModule = 'ai'
      } else if (act.includes('payment') || act.includes('billing') || act.includes('subscription') || act.includes('upgrade')) {
        resolvedModule = 'billing'
      } else {
        resolvedModule = 'general'
      }
    }

    const metaStr = typeof metadata === 'object' ? JSON.stringify(metadata || {}) : (metadata || '{}')

    run(
      `INSERT INTO activity_log (user_id, who, action, target, target_id, module, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId || null,
        who || 'anonymous',
        action || '',
        target || '',
        targetId || null,
        resolvedModule || 'general',
        metaStr
      ]
    )
    console.log(`[ActivityLog] Logged: "${action}" in module "${resolvedModule}" by "${who}"`)
  } catch (err) {
    console.error('[ActivityLog] Failed to log activity:', err.message)
  }
}

module.exports = { logActivity }
