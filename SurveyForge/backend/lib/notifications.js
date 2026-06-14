const { run } = require('../database')
const nodemailer = require('nodemailer')

function createTransporter() {
  const user = process.env.EMAIL_USER || ''
  const pass = process.env.EMAIL_PASS || ''

  if (!user || !pass || user.includes('your-email@') || user.includes('your-email')) {
    return null
  }

  return nodemailer.createTransport({
    host:   'smtp.gmail.com',
    port:   587,
    secure: false,
    auth:   { user, pass },
    tls:    { rejectUnauthorized: false },
    connectionTimeout: 30000,
    greetingTimeout:   30000,
    socketTimeout:     45000,
  })
}

async function sendEmailNotification(email, subject, text) {
  const transporter = createTransporter()

  const devLog = () => {
    console.log('\n  ┌──────────────────────────────────────────┐')
    console.log('  │  📧  EMAIL NOTIFICATION (Dev Log fallback)│')
    console.log('  ├──────────────────────────────────────────┤')
    console.log(`  │  To:      ${email.slice(0, 28).padEnd(28)}  │`)
    console.log(`  │  Subject: ${subject.slice(0, 28).padEnd(28)}  │`)
    console.log(`  │  Content: ${text.slice(0, 28).padEnd(28)}  │`)
    console.log('  └──────────────────────────────────────────┘\n')
  }

  if (!transporter) {
    devLog()
    return { devMode: true }
  }

  try {
    await transporter.sendMail({
      from: `"Survexa Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      text,
    })
    console.log(`[Email] Sent notification email to ${email}`)
    return { success: true }
  } catch (err) {
    console.error('[Email] SMTP send failed:', err.message)
    devLog()
    return { success: false, error: err.message }
  }
}

function sendInAppNotification(userId, title, body, type = 'billing') {
  try {
    run(
      `INSERT INTO notifications (user_id, type, title, body, is_read)
       VALUES (?, ?, ?, ?, 0)`,
      [userId, type, title, body]
    )
    console.log(`[Notification] Created in-app notification for user ${userId}`)
  } catch (err) {
    console.error('[Notification] Failed to create in-app notification:', err)
  }
}

module.exports = { sendEmailNotification, sendInAppNotification }
