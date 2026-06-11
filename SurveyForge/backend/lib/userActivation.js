const { queryOne, run } = require('../database')

/** Set verified=1 when email (and phone, if present) are both verified */
function activateUserIfReady(userId) {
  const u = queryOne(
    'SELECT email_verified, phone_verified, phone FROM users WHERE id = ?',
    [userId],
  )
  if (!u) return false
  const needsPhone = Boolean(u.phone)
  const ready = u.email_verified && (!needsPhone || u.phone_verified)
  if (ready) {
    run('UPDATE users SET verified = 1 WHERE id = ?', [userId])
    return true
  }
  return false
}

module.exports = { activateUserIfReady }
