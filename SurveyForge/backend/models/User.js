const { queryOne, run } = require('../database/database')

class User {
  static findByEmail(email) {
    return queryOne('SELECT * FROM users WHERE email = ?', [email])
  }

  static findByPhone(phone) {
    return queryOne('SELECT * FROM users WHERE phone = ?', [phone])
  }

  static findById(id) {
    return queryOne('SELECT * FROM users WHERE id = ?', [id])
  }

  static create(userData) {
    const { email, phone, password, name, verified = 0, emailVerified = 0, phoneVerified = 0 } = userData
    const { lastInsertRowid } = run(
      'INSERT INTO users (email, phone, password, name, verified, email_verified, phone_verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [email, phone, password, name, verified, emailVerified, phoneVerified]
    )
    return lastInsertRowid
  }

  static update(id, userData) {
    const { email, phone, password, name, verified, emailVerified, phoneVerified, role, organization, job_role } = userData
    const updates = []
    const params = []

    if (email !== undefined) { updates.push('email = ?'); params.push(email) }
    if (phone !== undefined) { updates.push('phone = ?'); params.push(phone) }
    if (password !== undefined) { updates.push('password = ?'); params.push(password) }
    if (name !== undefined) { updates.push('name = ?'); params.push(name) }
    if (verified !== undefined) { updates.push('verified = ?'); params.push(verified) }
    if (emailVerified !== undefined) { updates.push('email_verified = ?'); params.push(emailVerified) }
    if (phoneVerified !== undefined) { updates.push('phone_verified = ?'); params.push(phoneVerified) }
    if (role !== undefined) { updates.push('role = ?'); params.push(role) }
    if (organization !== undefined) { updates.push('organization = ?'); params.push(organization) }
    if (job_role !== undefined) { updates.push('job_role = ?'); params.push(job_role) }

    if (updates.length > 0) {
      params.push(id)
      run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params)
    }
  }

  static markEmailVerified(id) {
    run('UPDATE users SET email_verified = 1 WHERE id = ?', [id])
  }
}

module.exports = User
