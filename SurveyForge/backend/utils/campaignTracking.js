/**
 * Campaign tracking helpers
 */
const crypto = require('crypto')
const { queryOne, run } = require('../database')

const PLATFORMS = new Set([
  'whatsapp',
  'instagram',
  'linkedin',
  'facebook',
  'twitter',
  'email',
  'qr',
  'direct',
])

function hashIp(ip) {
  if (!ip) return null
  return crypto.createHash('sha256').update(String(ip)).digest('hex').slice(0, 16)
}

function getFrontendBase() {
  return (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')
}

function buildTrackingUrl(trackingToken) {
  return `${getFrontendBase()}/c/${trackingToken}`
}

function buildSurveyUrl(shareToken, trackingToken) {
  const base = `${getFrontendBase()}/survey/${shareToken}`
  return trackingToken ? `${base}?c=${encodeURIComponent(trackingToken)}` : base
}

function recordClick(campaignId, eventType, req = {}) {
  const ip = req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || ''
  run(
    `INSERT INTO campaign_clicks (campaign_id, event_type, ip_hash, user_agent, referrer)
     VALUES (?, ?, ?, ?, ?)`,
    [
      campaignId,
      eventType,
      hashIp(ip),
      String(req.headers?.['user-agent'] || '').slice(0, 512),
      String(req.headers?.referer || req.headers?.referrer || '').slice(0, 512),
    ],
  )
}

function recordResponse(campaignId, surveyId, responseId, platform) {
  run(
    `INSERT INTO campaign_responses (campaign_id, response_id, survey_id, platform)
     VALUES (?, ?, ?, ?)`,
    [campaignId, responseId, surveyId, platform],
  )
}

function getCampaignByToken(trackingToken) {
  return queryOne(
    `SELECT c.*, s.title AS survey_title, s.share_token, s.status AS survey_status
     FROM campaigns c
     JOIN surveys s ON s.id = c.survey_id
     WHERE c.tracking_token = ? AND s.deleted_at IS NULL`,
    [trackingToken],
  )
}

function platformShareTemplates(survey, trackingUrl, customMessage) {
  const title = survey.title || 'Survey'
  const msg = customMessage || `I'd love your feedback on "${title}". It only takes a few minutes:`
  return {
    whatsapp: `${msg}\n\n${trackingUrl}`,
    instagram: {
      caption: `${msg} ✨\n\nLink in bio / scan QR\n${trackingUrl}\n\n#survey #feedback #survexa`,
      storyText: `${title} — tap to respond`,
    },
    linkedin: `📊 ${msg}\n\nYour perspective would help us improve. Participate here:\n${trackingUrl}\n\n#CustomerExperience #Feedback #Research`,
    facebook: `${msg}\n\n👉 ${trackingUrl}`,
    twitter: `${msg} ${trackingUrl} #survey #feedback`,
    email: {
      subject: `You're invited: ${title}`,
      body: `Hello,\n\n${msg}\n\n${trackingUrl}\n\nThank you,\nSurvexa`,
    },
  }
}

module.exports = {
  PLATFORMS,
  hashIp,
  getFrontendBase,
  buildTrackingUrl,
  buildSurveyUrl,
  recordClick,
  recordResponse,
  getCampaignByToken,
  platformShareTemplates,
}
