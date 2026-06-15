/**
 * routes/public.js
 * Publicly accessible endpoints — NO authentication required.
 *
 * GET  /public/survey/:token      → returns survey + questions by share_token
 * POST /public/survey/:token/respond → submit a response, auto-email survey owner
 */

const express    = require('express')
const nodemailer = require('nodemailer')
const { queryOne, query, run } = require('../database/database')
const { generatePDFReport }    = require('../utils/pdfReport')
const { checkLimit, syncResponseCount } = require('../lib/usage')
const {
  getCampaignByToken,
  recordClick,
  recordResponse,
  buildSurveyUrl,
} = require('../utils/campaignTracking')
const { logActivity } = require('../lib/activityLogger')
const router = express.Router()

const PIXEL_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64',
)

/* ── GET /public/survey/:token ──────────────────────────────────────
   Returns the survey title, description, and all questions.
   Looked up by share_token (not id) — safe for public sharing.
*/
/* ── Campaign tracking (Distribution Hub) ─────────────────────── */
router.get('/campaign/:trackingToken', (req, res) => {
  try {
    const campaign = getCampaignByToken(req.params.trackingToken)
    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' })
    }
    recordClick(campaign.id, 'view', req)
    recordClick(campaign.id, 'click', req)
    if (campaign.survey_status && campaign.survey_status !== 'published') {
      return res.status(403).json({ success: false, error: 'Survey is not published' })
    }
    res.json({
      success: true,
      data: {
        share_token: campaign.share_token,
        survey_url: buildSurveyUrl(campaign.share_token, campaign.tracking_token),
        platform: campaign.platform,
        survey_title: campaign.survey_title,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.get('/campaign/:trackingToken/open.gif', (req, res) => {
  try {
    const campaign = getCampaignByToken(req.params.trackingToken)
    if (campaign) recordClick(campaign.id, 'open', req)
    res.setHeader('Content-Type', 'image/gif')
    res.setHeader('Cache-Control', 'no-store')
    res.send(PIXEL_GIF)
  } catch {
    res.setHeader('Content-Type', 'image/gif')
    res.send(PIXEL_GIF)
  }
})

router.post('/campaign/event', (req, res) => {
  const { tracking_token, event = 'start' } = req.body
  if (!tracking_token) {
    return res.status(400).json({ success: false, error: 'tracking_token required' })
  }
  const allowed = new Set(['view', 'click', 'start', 'open'])
  if (!allowed.has(event)) {
    return res.status(400).json({ success: false, error: 'Invalid event' })
  }
  try {
    const campaign = getCampaignByToken(tracking_token)
    if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' })
    recordClick(campaign.id, event, req)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

router.get('/survey/:token', (req, res) => {
  try {
    const survey = queryOne(
      `SELECT id, title, description, theme, status, settings, created_at
       FROM surveys WHERE share_token = ? AND deleted_at IS NULL`,
      [req.params.token]
    )

    if (!survey) {
      return res.status(404).json({
        success: false,
        error:   'Survey not found or link is no longer valid.',
      })
    }

    if (survey.status && survey.status !== 'published') {
      return res.status(403).json({
        success: false,
        error:   'This survey is not published yet. The owner must publish it before sharing.',
      })
    }

    survey.theme = JSON.parse(survey.theme || '{}')
    const settings = JSON.parse(survey.settings || '{}')

    let questions = query(
      'SELECT id, text, type, options, logic, position, required FROM questions WHERE survey_id = ? ORDER BY position',
      [survey.id]
    )
    questions.forEach((q) => { 
      q.options = JSON.parse(q.options || '[]') 
      q.logic = JSON.parse(q.logic || '[]')
    })

    if (settings.randomize_questions) {
      questions = shuffleArray(questions)
    }

    res.json({
      success: true,
      data:    { ...survey, settings, questions },
    })
  } catch (err) {
    console.error('[Public] GET survey error:', err)
    res.status(500).json({ success: false, error: 'Something went wrong.' })
  }
})

/* ── POST /public/survey/:token/respond ────────────────────────────
   Accepts survey answers, stores them, then auto-emails PDF to survey owner.
   Body: { answers: { [questionId]: value }, respondent_email?: string }
*/
router.post('/survey/:token/respond', async (req, res) => {
  const { token } = req.params
  const { answers, respondent_email = null, campaign_tracking_token = null } = req.body

  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ success: false, error: 'answers object is required' })
  }
  if (respondent_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(respondent_email).trim())) {
    return res.status(400).json({ success: false, error: 'Invalid respondent_email format' })
  }

  try {
    // Verify survey exists via token
    const survey = queryOne(
      'SELECT * FROM surveys WHERE share_token = ? AND deleted_at IS NULL',
      [token]
    )
    if (!survey) {
      return res.status(404).json({ success: false, error: 'Survey not found.' })
    }
    if (survey.status && survey.status !== 'published') {
      return res.status(403).json({ success: false, error: 'Survey is not published.' })
    }

    const questions = query(
      'SELECT id, required, type, options FROM questions WHERE survey_id = ? ORDER BY position',
      [survey.id]
    )

    const missingRequired = []
    for (const q of questions) {
      const key = String(q.id)
      const val = answers[key]
      const isRequired = Number(q.required) === 1
      if (!isRequired) continue

      if (val === undefined || val === null || val === '') {
        missingRequired.push(q.id)
        continue
      }
      if (q.type === 'checkbox' && (!Array.isArray(val) || val.length === 0)) {
        missingRequired.push(q.id)
      }
    }
    if (missingRequired.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Required questions missing: ${missingRequired.join(', ')}`,
      })
    }

    if (survey.user_id) {
      const lim = checkLimit(survey.user_id, 'response')
      if (!lim.ok) {
        return res.status(403).json({
          success: false,
          error: 'This survey cannot accept more responses. The owner has reached their plan limit.',
          code: lim.code,
        })
      }
    }

    // Save response
    const { lastInsertRowid } = run(
      'INSERT INTO responses (survey_id, answers, respondent_email) VALUES (?, ?, ?)',
      [survey.id, JSON.stringify(answers), respondent_email ? String(respondent_email).trim().toLowerCase() : null]
    )

    console.log(`[Public] Response #${lastInsertRowid} saved for survey #${survey.id}`)
    logActivity(
      survey.user_id,
      respondent_email ? String(respondent_email).trim().toLowerCase() : 'anonymous',
      'survey_response',
      survey.title,
      lastInsertRowid,
      'responses',
      { survey_id: survey.id }
    )
    if (survey.user_id) syncResponseCount(survey.user_id)

    if (campaign_tracking_token) {
      try {
        const campaign = getCampaignByToken(campaign_tracking_token)
        if (campaign && Number(campaign.survey_id) === Number(survey.id)) {
          recordResponse(campaign.id, survey.id, lastInsertRowid, campaign.platform)
        }
      } catch (ce) {
        console.warn('[Public] Campaign attribution failed:', ce.message)
      }
    }

    // Create in-app notification for survey owner
    if (survey.user_id) {
      try {
        const totalNow = queryOne(
          'SELECT COUNT(*) AS cnt FROM responses WHERE survey_id = ?',
          [survey.id]
        )?.cnt ?? 1
        const responder = respondent_email ? ` from ${respondent_email}` : ''
        run(
          `INSERT INTO notifications (user_id, type, title, body, survey_id)
           VALUES (?, 'response', ?, ?, ?)`,
          [
            survey.user_id,
            `New response on "${survey.title}"`,
            `You received a new response${responder}. Total responses: ${totalNow}.`,
            survey.id,
          ]
        )
        const { persist } = require('../database/database')
        if (typeof persist === 'function') persist()
      } catch (ne) {
        console.warn('[Public] Notification insert failed:', ne.message)
      }
    }

    // Respond to user immediately
    res.status(201).json({
      success: true,
      data:    { id: lastInsertRowid },
      message: 'Thank you! Your response has been recorded.',
    })

    // Auto-email PDF report to survey owner (fire-and-forget)
    autoEmailReport(survey).catch((err) =>
      console.error('[Public] Auto-email failed:', err.message)
    )

  } catch (err) {
    console.error('[Public] POST respond error:', err)
    res.status(500).json({ success: false, error: 'Could not save response.' })
  }
})

/* ── Auto-email PDF report helper ─────────────────────────────────── */
async function autoEmailReport(survey) {
  // Look up survey owner's email
  let ownerEmail = null

  if (survey.user_id) {
    const owner = queryOne('SELECT email FROM users WHERE id = ?', [survey.user_id])
    ownerEmail = owner?.email ?? null
  }

  // No email configured or owner not found
  const noEmail = !process.env.EMAIL_USER || process.env.EMAIL_USER.includes('your-email')
  if (noEmail) {
    console.log(`[Public] Dev mode — would auto-email report for survey #${survey.id}`)
    return
  }
  if (!ownerEmail) {
    console.log(`[Public] No owner email found for survey #${survey.id} — skipping auto-email`)
    return
  }

  // Build analytics
  const questions    = query('SELECT * FROM questions WHERE survey_id = ? ORDER BY position', [survey.id])
  questions.forEach((q) => { q.options = JSON.parse(q.options || '[]') })

  const responses      = query('SELECT * FROM responses WHERE survey_id = ?', [survey.id])
  const totalResponses = responses.length

  const analytics = questions.map((q) => {
    const answers = responses
      .map((r) => JSON.parse(r.answers || '{}')[q.id])
      .filter((a) => a !== undefined && a !== null && a !== '')

    if (q.type === 'rating') {
      const nums = answers.map(Number).filter((n) => !isNaN(n))
      const avg  = nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2) : 0
      const dist = {}
      nums.forEach((n) => { dist[n] = (dist[n] ?? 0) + 1 })
      return { question: q, type: 'rating', average: parseFloat(avg), distribution: dist, count: nums.length }
    }
    if (['mcq', 'checkbox', 'dropdown'].includes(q.type)) {
      const counts = {}
      q.options.forEach((o) => { counts[o] = 0 })
      answers.flat().forEach((a) => { counts[a] = (counts[a] ?? 0) + 1 })
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
      return { question: q, type: 'mcq', counts, topOption: top, count: answers.length }
    }
    const top5 = [...new Set(answers)].slice(0, 5)
    return { question: q, type: 'text', samples: top5, count: answers.length }
  })

  // Generate PDF
  const pdf = await generatePDFReport(survey, totalResponses, analytics)

  // Send email
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 30000,
      greetingTimeout:   30000,
      socketTimeout:     45000,
    })

    await transporter.sendMail({
      from:    `"Survexa" <${process.env.EMAIL_USER}>`,
      to:      ownerEmail,
      subject: `📊 New Response — ${survey.title}`,
      html: `
        <div style="font-family:sans-serif;max-width:580px;margin:auto">
          <div style="background:linear-gradient(135deg,#B8A4E8,#9474C8);padding:28px 32px;border-radius:12px 12px 0 0">
            <h1 style="color:#fff;margin:0;font-size:22px">Survexa</h1>
            <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px">New Response Notification</p>
          </div>
          <div style="background:#f9fafb;padding:28px 32px;border:1px solid #e5e7eb;border-radius:0 0 12px 12px">
            <h2 style="color:#1f2937;font-size:18px;margin-top:0">Someone responded to "${survey.title}"</h2>
            <p style="color:#6b7280">
              You have <strong>${totalResponses} total response${totalResponses !== 1 ? 's' : ''}</strong>.
              The full PDF report is attached.
            </p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
            <p style="color:#9ca3af;font-size:12px;margin:0">
              Generated by Survexa · ${new Date().toLocaleDateString()}
            </p>
          </div>
        </div>`,
      attachments: [{
        filename:    `Survexa-${survey.title.replace(/[^a-z0-9]/gi, '_')}-Report.pdf`,
        content:     pdf,
        contentType: 'application/pdf',
      }],
    })

    console.log(`[Public] Auto-emailed report for survey "${survey.title}" to ${ownerEmail}`)
  } catch (err) {
    console.error(`[Public] Auto-email report failed for survey #${survey.id}: ${err.message}`)
  }
}

module.exports = router
