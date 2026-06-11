/**
 * middleware/auth.js — JWT (SurveyForge) + optional Supabase JWT
 */
const jwt = require('jsonwebtoken')
const { queryOne } = require('../database')
const { JWT_SECRET } = require('../config/jwt')
const { supabase } = require('../config/supabase')

function isSupabaseConfigured() {
  const url = process.env.SUPABASE_URL || ''
  return url.length > 0 && !url.includes('your-supabase')
}

function mapSqliteUser(row) {
  return {
    id: row.id,
    email: row.email,
    phone: row.phone,
    phone_number: row.phone,
    name: row.name,
    role: row.role ?? 'user',
    phone_verified: Boolean(row.phone_verified),
    email_verified: Boolean(row.email_verified),
    verified: Boolean(row.verified),
    otp_verified_at: row.otp_verified_at ?? null,
  }
}

async function loadSupabaseUser(token) {
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    phone_number: profile?.phone_number ?? user.phone,
    name: profile?.name || user.user_metadata?.name || '',
    role: profile?.role || user.user_metadata?.role || 'user',
    phone_verified: profile?.phone_verified ?? Boolean(user.phone_confirmed_at),
    otp_verified_at: profile?.otp_verified_at ?? null,
  }
}

/**
 * Middleware: require a valid JWT (local or Supabase).
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required' })
  }

  const token = authHeader.slice(7)

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const row = queryOne(
      'SELECT id, email, phone, name, role, phone_verified, email_verified, verified, otp_verified_at FROM users WHERE id = ?',
      [decoded.id],
    )
    if (row) {
      if (!row.verified && decoded.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Account not verified. Complete email and phone verification first.',
          needsVerification: true,
        })
      }
      req.user = mapSqliteUser(row)
      return next()
    }
  } catch (_) {
    /* try Supabase below */
  }

  if (isSupabaseConfigured()) {
    try {
      const supaUser = await loadSupabaseUser(token)
      if (supaUser) {
        req.user = supaUser
        return next()
      }
    } catch (err) {
      console.error('[Auth Middleware] Supabase error:', err.message)
    }
  }

  return res.status(401).json({ success: false, error: 'Session expired or invalid token — please log in again' })
}

async function optionalAuth(req, _res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return next()

  const token = authHeader.slice(7)

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const row = queryOne(
      'SELECT id, email, phone, name, role, phone_verified, email_verified, verified, otp_verified_at FROM users WHERE id = ?',
      [decoded.id],
    )
    if (row) {
      req.user = mapSqliteUser(row)
      return next()
    }
  } catch (_) { /* fall through */ }

  if (isSupabaseConfigured()) {
    try {
      const supaUser = await loadSupabaseUser(token)
      if (supaUser) req.user = supaUser
    } catch (_) { /* ignore */ }
  }

  next()
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' })
  }
  next()
}

module.exports = { requireAuth, optionalAuth, requireAdmin }
