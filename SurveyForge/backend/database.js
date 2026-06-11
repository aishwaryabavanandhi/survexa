/**
 * database.js — sql.js wrapper with file persistence
 * ────────────────────────────────────────────────────────────
 * sql.js is a pure-WebAssembly port of SQLite — no native build tools needed.
 * We load the DB file on startup (or create a new one) and flush to disk after
 * every write so data survives server restarts.
 */

const initSqlJs = require('sql.js')
const fs        = require('fs')
const path      = require('path')

const DB_PATH = path.join(__dirname, 'database.db')

// ── Singleton ─────────────────────────────────────────────
let _db = null

// ── Schema ────────────────────────────────────────────────
const SCHEMA = `
  -- Users table for OTP-based authentication
  CREATE TABLE IF NOT EXISTS users (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    email        TEXT    NOT NULL UNIQUE,
    password     TEXT    NOT NULL,
    name         TEXT    NOT NULL DEFAULT '',
    role         TEXT    NOT NULL DEFAULT 'user',
    organization TEXT    DEFAULT '',
    job_role     TEXT    DEFAULT '',
    verified        INTEGER NOT NULL DEFAULT 0,
    email_verified  INTEGER NOT NULL DEFAULT 0,
    phone           TEXT    UNIQUE,
    phone_verified  INTEGER NOT NULL DEFAULT 0,
    otp_verified_at TEXT    DEFAULT NULL,
    created_at      TEXT    DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now'))
  );

  -- OTP table for email verification
  CREATE TABLE IF NOT EXISTS otp (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    email      TEXT    NOT NULL,
    code       TEXT    NOT NULL,
    expiry     INTEGER NOT NULL,
    attempts   INTEGER NOT NULL DEFAULT 0,
    created_at TEXT    DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now'))
  );

  -- Phone OTP (SMS) — signup & login
  CREATE TABLE IF NOT EXISTS phone_otp (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    phone      TEXT    NOT NULL,
    code       TEXT    NOT NULL,
    expiry     INTEGER NOT NULL,
    purpose    TEXT    NOT NULL DEFAULT 'signup',
    attempts   INTEGER NOT NULL DEFAULT 0,
    created_at TEXT    DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now'))
  );

  -- Password reset tokens (hashed); expiry is unix ms
  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    email       TEXT    NOT NULL,
    token_hash  TEXT    NOT NULL UNIQUE,
    expiry      INTEGER NOT NULL,
    created_at  TEXT    DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now'))
  );

  -- Surveys table with share_token and user_id
  CREATE TABLE IF NOT EXISTS surveys (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER DEFAULT NULL,
    title       TEXT    NOT NULL,
    description TEXT    DEFAULT '',
    share_token TEXT    UNIQUE,
    theme       TEXT    DEFAULT '{}',
    status      TEXT    NOT NULL DEFAULT 'published',
    deleted_at  TEXT    DEFAULT NULL,
    settings    TEXT    DEFAULT '{}',
    created_at  TEXT    DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now'))
  );

  -- Questions table
  CREATE TABLE IF NOT EXISTS questions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    survey_id  INTEGER NOT NULL,
    text       TEXT    NOT NULL,
    type       TEXT    NOT NULL,
    options    TEXT    DEFAULT '[]',
    logic      TEXT    DEFAULT '[]',
    position   INTEGER DEFAULT 0,
    required   INTEGER DEFAULT 0,
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
  );

  -- Responses table with respondent_email
  CREATE TABLE IF NOT EXISTS responses (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    survey_id        INTEGER NOT NULL,
    answers          TEXT    NOT NULL,
    respondent_email TEXT    DEFAULT NULL,
    submitted_at     TEXT    DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now')),
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
  );

  -- Notifications table — per-user in-app notifications
  CREATE TABLE IF NOT EXISTS notifications (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    type       TEXT    NOT NULL DEFAULT 'response',
    title      TEXT    NOT NULL,
    body       TEXT    NOT NULL,
    survey_id  INTEGER DEFAULT NULL,
    is_read    INTEGER NOT NULL DEFAULT 0,
    created_at TEXT    DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now')),
    FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
    FOREIGN KEY (survey_id) REFERENCES surveys(id)  ON DELETE CASCADE
  );

  -- Distribution Hub: campaigns per platform
  CREATE TABLE IF NOT EXISTS campaigns (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    survey_id         INTEGER NOT NULL,
    user_id           INTEGER NOT NULL,
    platform          TEXT    NOT NULL,
    name              TEXT    NOT NULL,
    share_message     TEXT    DEFAULT '',
    tracking_token    TEXT    NOT NULL UNIQUE,
    email_subject     TEXT    DEFAULT '',
    email_recipients  TEXT    DEFAULT '[]',
    created_at        TEXT    DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now')),
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS campaign_clicks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL,
    event_type  TEXT    NOT NULL,
    ip_hash     TEXT,
    user_agent  TEXT,
    referrer    TEXT,
    created_at  TEXT    DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now')),
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS campaign_responses (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL,
    response_id INTEGER,
    survey_id   INTEGER NOT NULL,
    platform    TEXT    NOT NULL,
    created_at  TEXT    DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now')),
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (response_id) REFERENCES responses(id) ON DELETE SET NULL,
    FOREIGN KEY (survey_id)   REFERENCES surveys(id) ON DELETE CASCADE
  );

  -- Billing history table
  CREATE TABLE IF NOT EXISTS billing_history (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_id      TEXT,
    order_id        TEXT,
    subscription_id INTEGER,
    user_id         INTEGER NOT NULL,
    amount          REAL NOT NULL,
    status          TEXT NOT NULL,
    created_at      TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL
  );

  -- Activity log table
  CREATE TABLE IF NOT EXISTS activity_log (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER DEFAULT NULL,
    who        TEXT NOT NULL,
    action     TEXT NOT NULL,
    target     TEXT NOT NULL,
    target_id  INTEGER DEFAULT NULL,
    module     TEXT DEFAULT '',
    metadata   TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Payment requests table for manual UPI payments
  CREATE TABLE IF NOT EXISTS payment_requests (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id           INTEGER NOT NULL,
    plan_id           TEXT NOT NULL,
    amount            REAL NOT NULL,
    screenshot_url    TEXT NOT NULL,
    payment_reference TEXT NOT NULL,
    status            TEXT NOT NULL DEFAULT 'pending',
    rejection_reason  TEXT,
    created_at        TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Admin settings table
  CREATE TABLE IF NOT EXISTS admin_settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`

/**
 * Run migration to add columns to existing tables (idempotent).
 * sql.js doesn't support ADD COLUMN IF NOT EXISTS, so we try/catch.
 */
function runMigrations(db) {
  const migrations = [
    // surveys
    "ALTER TABLE surveys ADD COLUMN user_id INTEGER DEFAULT NULL",
    "ALTER TABLE surveys ADD COLUMN share_token TEXT",
    "ALTER TABLE surveys ADD COLUMN theme TEXT DEFAULT '{}'",
    "ALTER TABLE surveys ADD COLUMN status TEXT NOT NULL DEFAULT 'published'",
    "ALTER TABLE surveys ADD COLUMN deleted_at TEXT DEFAULT NULL",
    "ALTER TABLE surveys ADD COLUMN settings TEXT DEFAULT '{}'",
    "UPDATE surveys SET status = 'published' WHERE status IS NULL OR status = ''",
    // questions
    "ALTER TABLE questions ADD COLUMN logic TEXT DEFAULT '[]'",
    // responses
    "ALTER TABLE responses ADD COLUMN respondent_email TEXT DEFAULT NULL",
    // users — RBAC role
    "ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'",
    // users — profile fields
    "ALTER TABLE users ADD COLUMN organization TEXT DEFAULT ''",
    "ALTER TABLE users ADD COLUMN job_role TEXT DEFAULT ''",
    "ALTER TABLE users ADD COLUMN phone TEXT",
    "ALTER TABLE users ADD COLUMN phone_verified INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE users ADD COLUMN otp_verified_at TEXT DEFAULT NULL",
    "ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE otp ADD COLUMN attempts INTEGER NOT NULL DEFAULT 0",
    `CREATE TABLE IF NOT EXISTS phone_otp (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      phone      TEXT    NOT NULL,
      code       TEXT    NOT NULL,
      expiry     INTEGER NOT NULL,
      purpose    TEXT    NOT NULL DEFAULT 'signup',
      attempts   INTEGER NOT NULL DEFAULT 0,
      created_at TEXT    DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now'))
    )`,
    // notifications (new table — CREATE TABLE IF NOT EXISTS handles idempotency)
    `CREATE TABLE IF NOT EXISTS notifications (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      type       TEXT    NOT NULL DEFAULT 'response',
      title      TEXT    NOT NULL,
      body       TEXT    NOT NULL,
      survey_id  INTEGER DEFAULT NULL,
      is_read    INTEGER NOT NULL DEFAULT 0,
      created_at TEXT    DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now'))
    )`,
    `CREATE TABLE IF NOT EXISTS campaigns (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      survey_id         INTEGER NOT NULL,
      user_id           INTEGER NOT NULL,
      platform          TEXT    NOT NULL,
      name              TEXT    NOT NULL,
      share_message     TEXT    DEFAULT '',
      tracking_token    TEXT    NOT NULL UNIQUE,
      email_subject     TEXT    DEFAULT '',
      email_recipients  TEXT    DEFAULT '[]',
      created_at        TEXT    DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now'))
    )`,
    `CREATE TABLE IF NOT EXISTS campaign_clicks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      event_type  TEXT    NOT NULL,
      ip_hash     TEXT,
      user_agent  TEXT,
      referrer    TEXT,
      created_at  TEXT    DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now'))
    )`,
    `CREATE TABLE IF NOT EXISTS campaign_responses (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      response_id INTEGER,
      survey_id   INTEGER NOT NULL,
      platform    TEXT    NOT NULL,
      created_at  TEXT    DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now'))
    )`,
    `CREATE TABLE IF NOT EXISTS plans (
      id              TEXT PRIMARY KEY,
      name            TEXT NOT NULL,
      price_inr       INTEGER NOT NULL DEFAULT 0,
      survey_limit    INTEGER,
      response_limit  INTEGER,
      ai_limit        INTEGER,
      ai_unlimited    INTEGER NOT NULL DEFAULT 0,
      ai_insights     INTEGER NOT NULL DEFAULT 0,
      features_json   TEXT DEFAULT '[]',
      created_at      TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now'))
    )`,
    `CREATE TABLE IF NOT EXISTS subscriptions (
      id                   INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id              INTEGER NOT NULL,
      plan_id              TEXT NOT NULL DEFAULT 'free',
      status               TEXT NOT NULL DEFAULT 'active',
      current_period_start TEXT,
      current_period_end   TEXT,
      cancel_at_period_end INTEGER NOT NULL DEFAULT 0,
      razorpay_subscription_id TEXT,
      razorpay_order_id    TEXT,
      razorpay_payment_id  TEXT,
      created_at           TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now')),
      updated_at           TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS payments (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id             INTEGER NOT NULL,
      plan_id             TEXT NOT NULL,
      amount_paise        INTEGER NOT NULL,
      currency            TEXT NOT NULL DEFAULT 'INR',
      status              TEXT NOT NULL DEFAULT 'created',
      method              TEXT DEFAULT 'razorpay',
      razorpay_order_id   TEXT,
      razorpay_payment_id TEXT,
      razorpay_signature  TEXT,
      created_at          TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now')),
      paid_at             TEXT DEFAULT NULL,
      amount              REAL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS usage_tracking (
      user_id              INTEGER PRIMARY KEY,
      surveys_created      INTEGER NOT NULL DEFAULT 0,
      responses_collected  INTEGER NOT NULL DEFAULT 0,
      ai_requests_used     INTEGER NOT NULL DEFAULT 0,
      updated_at           TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS billing_history (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      payment_id      TEXT,
      order_id        TEXT,
      subscription_id INTEGER,
      user_id         INTEGER NOT NULL,
      amount          REAL NOT NULL,
      status          TEXT NOT NULL,
      created_at      TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL
    )`,
    "ALTER TABLE payments ADD COLUMN paid_at TEXT",
    "ALTER TABLE payments ADD COLUMN amount REAL",
    `CREATE TABLE IF NOT EXISTS activity_log (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER DEFAULT NULL,
      who        TEXT NOT NULL,
      action     TEXT NOT NULL,
      target     TEXT NOT NULL,
      target_id  INTEGER DEFAULT NULL,
      module     TEXT DEFAULT '',
      metadata   TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS payment_requests (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id           INTEGER NOT NULL,
      plan_id           TEXT NOT NULL,
      amount            REAL NOT NULL,
      screenshot_url    TEXT NOT NULL,
      payment_reference TEXT NOT NULL,
      status            TEXT NOT NULL DEFAULT 'pending',
      rejection_reason  TEXT,
      created_at        TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS admin_settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )`,
    "ALTER TABLE plans ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1",
    "ALTER TABLE activity_log ADD COLUMN module TEXT DEFAULT ''",
    "ALTER TABLE activity_log ADD COLUMN metadata TEXT DEFAULT '{}'"
  ]
  for (const sql of migrations) {
    try { db.run(sql) } catch (_) { /* already exists — ignore */ }
  }
}

/**
 * Seed: promote the first registered & verified user to admin.
 * Runs only when no admin exists yet (idempotent).
 */
function seedPlans(db) {
  const { listPlans } = require('./lib/plans')
  try {
    for (const p of listPlans()) {
      db.run(
        `INSERT INTO plans (id, name, price_inr, survey_limit, response_limit, ai_limit, ai_unlimited, ai_insights, features_json, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
         ON CONFLICT(id) DO UPDATE SET
           name = excluded.name,
           survey_limit = excluded.survey_limit,
           response_limit = excluded.response_limit,
           ai_limit = excluded.ai_limit,
           ai_unlimited = excluded.ai_unlimited,
           ai_insights = excluded.ai_insights,
           features_json = excluded.features_json`,
        [
          p.id,
          p.name,
          p.price_inr,
          p.survey_limit,
          p.response_limit,
          p.ai_limit,
          p.ai_unlimited ? 1 : 0,
          p.ai_insights ? 1 : 0,
          JSON.stringify(p.features),
        ],
      )
    }
  } catch (err) {
    console.warn('[DB] seedPlans skipped:', err.message)
  }
}

function seedAdminSettings(db) {
  try {
    db.run(
      `INSERT INTO admin_settings (key, value) VALUES ('upi_id', 'aishubavan2@okicici') ON CONFLICT(key) DO NOTHING`
    )
    db.run(
      `INSERT INTO admin_settings (key, value) VALUES ('upi_account_name', 'Aishwarya Bavan') ON CONFLICT(key) DO NOTHING`
    )
    db.run(
      `INSERT INTO admin_settings (key, value) VALUES ('upi_qr_code', '/uploads/survexa_qr.png') ON CONFLICT(key) DO NOTHING`
    )
    console.log('✅ Seeded default admin settings')
  } catch (err) {
    console.warn('[DB] seedAdminSettings skipped:', err.message)
  }
}

function copyDefaultQr() {
  try {
    const fs = require('fs')
    const path = require('path')
    const src = path.join(__dirname, '../survexa_qr.png')
    const destDir = path.join(__dirname, 'uploads')
    const dest = path.join(destDir, 'survexa_qr.png')

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true })
    }

    if (fs.existsSync(src) && !fs.existsSync(dest)) {
      fs.copyFileSync(src, dest)
      console.log('✅ Copied default UPI QR code to uploads folder.')
    }
  } catch (err) {
    console.error('[Startup] Failed to copy default QR code:', err.message)
  }
}

function seedAdminUser(db) {
  try {
    // Check if any admin already exists
    const stmt = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1")
    let hasAdmin = false
    if (stmt.step()) hasAdmin = true
    stmt.free()

    if (!hasAdmin) {
      // Prefer explicit product admin account if present; otherwise first verified user.
      db.run(
        "UPDATE users SET role = 'admin' WHERE email = 'surveyforgeadmin@gmail.com' AND verified = 1"
      )
      const promotedProductAdmin = db.exec(
        "SELECT id FROM users WHERE email = 'surveyforgeadmin@gmail.com' AND role = 'admin' LIMIT 1"
      )[0]?.values?.length
      if (!promotedProductAdmin) {
        db.run("UPDATE users SET role = 'admin' WHERE id = (SELECT MIN(id) FROM users WHERE verified = 1)")
      }
      console.log('✅  Seeded initial admin user')
    }
  } catch (err) {
    console.warn('[DB] seedAdminUser skipped:', err.message)
  }
}

/**
 * Initialize and return the database instance.
 * Must be called once before using `getDb()`.
 */
async function initDatabase() {
  const SQL = await initSqlJs()

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH)
    _db = new SQL.Database(fileBuffer)
    console.log('✅  Loaded existing SQLite DB from:', DB_PATH)
  } else {
    _db = new SQL.Database()
    console.log('✅  Created new SQLite DB at:', DB_PATH)
  }

  // Apply schema (IF NOT EXISTS — idempotent)
  _db.run(SCHEMA)
  // Run migrations for existing DBs
  runMigrations(_db)
  // Seed default admin
  seedAdminUser(_db)
  seedPlans(_db)
  seedAdminSettings(_db)
  copyDefaultQr()
  migrateLegacyVerifiedFlags(_db)
  persist()

  return _db
}

/** Backfill email_verified / phone_verified for existing rows */
function migrateLegacyVerifiedFlags(db) {
  try {
    db.run('UPDATE users SET email_verified = verified WHERE email_verified = 0 AND verified = 1')
    db.run(
      `UPDATE users SET phone_verified = verified
       WHERE phone IS NOT NULL AND phone != '' AND phone_verified = 0 AND verified = 1`,
    )
  } catch (err) {
    console.warn('[DB] migrateLegacyVerifiedFlags:', err.message)
  }
}

/** Get the initialized DB instance (throws if not initialized yet). */
function getDb() {
  if (!_db) throw new Error('Database not initialized. Call initDatabase() first.')
  return _db
}

/** Write current DB state to disk. Call after every mutation. */
function persist() {
  if (!_db) return
  const data = _db.export()
  fs.writeFileSync(DB_PATH, Buffer.from(data))
}

// ── Convenience helpers (mirror better-sqlite3 API style) ─

/**
 * Run a query that returns rows.
 * @param {string} sql
 * @param {any[]}  params
 * @returns {Array<object>}
 */
function query(sql, params = []) {
  const db  = getDb()
  const stmt = db.prepare(sql)
  stmt.bind(params)
  const rows = []
  while (stmt.step()) {
    rows.push(stmt.getAsObject())
  }
  stmt.free()
  return rows
}

/**
 * Run a mutation (INSERT / UPDATE / DELETE).
 * @param {string} sql
 * @param {any[]}  params
 * @returns {{ lastInsertRowid: number, changes: number }}
 */
function run(sql, params = []) {
  const db = getDb()
  db.run(sql, params)
  const lastInsertRowid = db.exec('SELECT last_insert_rowid() AS id')[0]?.values[0][0] ?? 0
  persist()
  return { lastInsertRowid: Number(lastInsertRowid) }
}

/**
 * Run a query expecting a single row.
 * @returns {object|undefined}
 */
function queryOne(sql, params = []) {
  return query(sql, params)[0]
}

/**
 * Run multiple statements in sequence (used for transactions).
 * @param {Function} fn — receives { query, run, queryOne } helpers
 */
function transaction(fn) {
  fn({ query, run, queryOne })
  // sql.js is synchronous; auto-persisted after each run()
}

module.exports = { initDatabase, getDb, query, run, queryOne, transaction, persist }
