/**
 * routes/campaigns.js — Survey Distribution Hub API
 */

const express = require('express')
const { v4: uuidv4 } = require('uuid')
const nodemailer = require('nodemailer')
const { query, run, queryOne } = require('../database')
const { assertSurveyReadable, assertSurveyWritable } = require('../utils/surveyOwnership')
const {
  PLATFORMS,
  buildTrackingUrl,
  buildSurveyUrl,
  recordClick,
  platformShareTemplates,
} = require('../utils/campaignTracking')

const router = express.Router()

function parseCampaign(row) {
  if (!row) return row
  row.email_recipients = JSON.parse(row.email_recipients || '[]')
  return row
}

function getOrCreateCampaign(surveyId, userId, platform, name) {
  const existing = queryOne(
    'SELECT * FROM campaigns WHERE survey_id = ? AND user_id = ? AND platform = ?',
    [surveyId, userId, platform],
  )
  if (existing) return parseCampaign(existing)

  const trackingToken = uuidv4().replace(/-/g, '').slice(0, 16)
  const { lastInsertRowid } = run(
    `INSERT INTO campaigns (survey_id, user_id, platform, name, tracking_token, share_message)
     VALUES (?, ?, ?, ?, ?, '')`,
    [surveyId, userId, platform, name || `${platform} campaign`, trackingToken],
  )
  return parseCampaign(queryOne('SELECT * FROM campaigns WHERE id = ?', [lastInsertRowid]))
}

function campaignStats(campaignId) {
  const views = queryOne(
    `SELECT COUNT(*) AS n FROM campaign_clicks WHERE campaign_id = ? AND event_type = 'view'`,
    [campaignId],
  )?.n ?? 0
  const clicks = queryOne(
    `SELECT COUNT(*) AS n FROM campaign_clicks WHERE campaign_id = ? AND event_type = 'click'`,
    [campaignId],
  )?.n ?? 0
  const starts = queryOne(
    `SELECT COUNT(*) AS n FROM campaign_clicks WHERE campaign_id = ? AND event_type = 'start'`,
    [campaignId],
  )?.n ?? 0
  const opens = queryOne(
    `SELECT COUNT(*) AS n FROM campaign_clicks WHERE campaign_id = ? AND event_type = 'open'`,
    [campaignId],
  )?.n ?? 0
  const completions = queryOne(
    `SELECT COUNT(*) AS n FROM campaign_responses WHERE campaign_id = ?`,
    [campaignId],
  )?.n ?? 0
  const completionRate = starts > 0 ? Math.round((completions / starts) * 100) : 0
  return { views, clicks, starts, opens, completions, completionRate }
}

/* GET /campaigns/dashboard?survey_id= */
router.get('/dashboard', (req, res) => {
  const { survey_id } = req.query
  if (!survey_id) {
    return res.status(400).json({ success: false, error: 'survey_id is required' })
  }
  try {
    if (!assertSurveyReadable(req, res, survey_id)) return

    const campaigns = query(
      'SELECT * FROM campaigns WHERE survey_id = ? AND user_id = ? ORDER BY platform',
      [survey_id, req.user.id],
    ).map(parseCampaign)

    const byPlatform = campaigns.map((c) => ({
      ...c,
      tracking_url: buildTrackingUrl(c.tracking_token),
      stats: campaignStats(c.id),
    }))

    const totals = byPlatform.reduce(
      (acc, c) => {
        const s = c.stats
        acc.views += s.views
        acc.clicks += s.clicks
        acc.starts += s.starts
        acc.opens += s.opens
        acc.completions += s.completions
        return acc
      },
      { views: 0, clicks: 0, starts: 0, opens: 0, completions: 0 },
    )
    totals.completionRate = totals.starts > 0
      ? Math.round((totals.completions / totals.starts) * 100)
      : 0

    const best = [...byPlatform].sort(
      (a, b) => b.stats.completions - a.stats.completions || b.stats.clicks - a.stats.clicks,
    )[0]

    res.json({
      success: true,
      data: {
        campaigns: byPlatform,
        totals,
        bestChannel: best
          ? { platform: best.platform, completions: best.stats.completions, clicks: best.stats.clicks }
          : null,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* GET /campaigns?survey_id= */
router.get('/', (req, res) => {
  const { survey_id } = req.query
  if (!survey_id) {
    return res.status(400).json({ success: false, error: 'survey_id is required' })
  }
  try {
    if (!assertSurveyReadable(req, res, survey_id)) return
    const rows = query(
      'SELECT * FROM campaigns WHERE survey_id = ? AND user_id = ?',
      [survey_id, req.user.id],
    ).map(parseCampaign)
    res.json({ success: true, data: rows })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* POST /campaigns — create or refresh platform campaign */
router.post('/', (req, res) => {
  const { survey_id, platform, name, share_message } = req.body
  if (!survey_id || !platform) {
    return res.status(400).json({ success: false, error: 'survey_id and platform are required' })
  }
  if (!PLATFORMS.has(platform)) {
    return res.status(400).json({ success: false, error: `Invalid platform: ${platform}` })
  }
  try {
    if (!assertSurveyWritable(req, res, survey_id)) return
    const survey = queryOne('SELECT * FROM surveys WHERE id = ?', [survey_id])
    if (!survey?.share_token) {
      return res.status(400).json({ success: false, error: 'Publish survey before creating campaigns' })
    }

    let campaign = getOrCreateCampaign(survey_id, req.user.id, platform, name)
    if (share_message !== undefined) {
      run('UPDATE campaigns SET share_message = ? WHERE id = ?', [String(share_message), campaign.id])
      campaign = parseCampaign(queryOne('SELECT * FROM campaigns WHERE id = ?', [campaign.id]))
    }

    const trackingUrl = buildTrackingUrl(campaign.tracking_token)
    const templates = platformShareTemplates(survey, trackingUrl, campaign.share_message)
    const storySvg = buildStorySvg(survey?.title || 'Survey', trackingUrl)

    res.status(201).json({
      success: true,
      data: {
        campaign,
        tracking_url: trackingUrl,
        survey_url: buildSurveyUrl(survey.share_token, campaign.tracking_token),
        share_content: templates,
        story_svg: storySvg,
        reels: {
          caption: templates.instagram.caption,
          hashtags: ['#survey', '#feedback', '#customerinsights', '#survexa'],
          link: trackingUrl,
        },
        qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(trackingUrl)}`,
        qr_print_url: `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&margin=20&data=${encodeURIComponent(trackingUrl)}`,
        stats: campaignStats(campaign.id),
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* GET /campaigns/:id/share-content */
router.get('/:id/share-content', (req, res) => {
  try {
    const campaign = parseCampaign(queryOne('SELECT * FROM campaigns WHERE id = ?', [req.params.id]))
    if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' })
    if (campaign.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }
    const survey = queryOne('SELECT * FROM surveys WHERE id = ?', [campaign.survey_id])
    const trackingUrl = buildTrackingUrl(campaign.tracking_token)
    const templates = platformShareTemplates(survey, trackingUrl, campaign.share_message)
    const storySvg = buildStorySvg(survey?.title || 'Survey', trackingUrl)

    res.json({
      success: true,
      data: {
        campaign,
        tracking_url: trackingUrl,
        share_content: templates,
        story_svg: storySvg,
        reels: {
          caption: templates.instagram.caption,
          hashtags: ['#survey', '#feedback', '#customerinsights', '#survexa'],
          link: trackingUrl,
        },
        qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(trackingUrl)}`,
        qr_print_url: `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&margin=20&data=${encodeURIComponent(trackingUrl)}`,
        stats: campaignStats(campaign.id),
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* POST /campaigns/:id/email — send invitation batch */
router.post('/:id/email', async (req, res) => {
  const { recipients, subject, body } = req.body
  if (!Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ success: false, error: 'recipients array is required' })
  }
  try {
    const campaign = parseCampaign(queryOne('SELECT * FROM campaigns WHERE id = ?', [req.params.id]))
    if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' })
    if (campaign.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }
    if (campaign.platform !== 'email') {
      return res.status(400).json({ success: false, error: 'Campaign is not an email channel' })
    }

    const survey = queryOne('SELECT title FROM surveys WHERE id = ?', [campaign.survey_id])
    const trackingUrl = buildTrackingUrl(campaign.tracking_token)
    const apiBase = process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`
    const openPixel = `${apiBase}/public/campaign/${campaign.tracking_token}/open.gif`

    const emailSubject = subject || `You're invited: ${survey?.title || 'Survey'}`
    const emailBody = body || `Please share your feedback:\n\n${trackingUrl}`

    const noEmail = !process.env.EMAIL_USER || process.env.EMAIL_USER.includes('your-email')
    let sent = 0
    let simulated = noEmail
    let smtpWarning = null
    const valid = recipients.filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e).trim()))

    if (!noEmail) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
          connectionTimeout: 1500,
          greetingTimeout:   1500,
          socketTimeout:     2000,
        })
        for (const to of valid) {
          await transporter.sendMail({
            from: `"Survexa" <${process.env.EMAIL_USER}>`,
            to: String(to).trim(),
            subject: emailSubject,
            html: `
              <div style="font-family:sans-serif;max-width:560px;margin:auto">
                <p>${emailBody.replace(/\n/g, '<br>')}</p>
                <p><a href="${trackingUrl}" style="background:#8B68FF;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">Take survey</a></p>
                <img src="${openPixel}" width="1" height="1" alt="" style="display:none" />
              </div>`,
          })
          sent++
        }
      } catch (err) {
        console.warn(`[Campaign Email] SMTP failed (${err.message}). Falling back to simulation.`)
        simulated = true
        smtpWarning = err.message
        sent = valid.length
      }
    } else {
      console.log(`[Campaign Email] Dev mode — would send to:`, valid.join(', '))
      sent = valid.length
    }

    run(
      'UPDATE campaigns SET email_recipients = ?, email_subject = ? WHERE id = ?',
      [JSON.stringify(valid), emailSubject, campaign.id],
    )

    recordClick(campaign.id, 'click', req)

    res.json({
      success: true,
      data: { sent, total: valid.length, simulated, warning: smtpWarning },
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* GET /campaigns/:id/analytics */
router.get('/:id/analytics', (req, res) => {
  try {
    const campaign = parseCampaign(queryOne('SELECT * FROM campaigns WHERE id = ?', [req.params.id]))
    if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found' })
    if (campaign.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }

    const timeline = query(
      `SELECT DATE(created_at) AS day, event_type, COUNT(*) AS count
       FROM campaign_clicks WHERE campaign_id = ?
       GROUP BY DATE(created_at), event_type ORDER BY day ASC`,
      [campaign.id],
    )

    res.json({
      success: true,
      data: {
        campaign,
        stats: campaignStats(campaign.id),
        timeline,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

function buildStorySvg(title, url) {
  const safeTitle = String(title).replace(/[<>&"]/g, '')
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(url)}`
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#B8A4E8"/>
      <stop offset="100%" style="stop-color:#7ED4CB"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1920" fill="url(#bg)"/>
  <text x="540" y="320" text-anchor="middle" fill="#fff" font-size="56" font-family="Arial,sans-serif" font-weight="bold">${safeTitle}</text>
  <text x="540" y="400" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-size="32" font-family="Arial,sans-serif">Scan to share your feedback</text>
  <image href="${qr}" x="400" y="720" width="280" height="280"/>
  <text x="540" y="1100" text-anchor="middle" fill="#fff" font-size="28" font-family="Arial,sans-serif">Powered by Survexa</text>
</svg>`
}

module.exports = router
