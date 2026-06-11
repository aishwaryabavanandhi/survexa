/**
 * Usage tracking & plan limit enforcement
 */
const { query, run, queryOne } = require('../database')
const { getPlan, isUnlimited } = require('./plans')

function getActiveSubscription(userId) {
  const sub = queryOne(
    `SELECT * FROM subscriptions
     WHERE user_id = ? AND status = 'active'
     ORDER BY id DESC LIMIT 1`,
    [userId],
  )
  if (sub) return { ...sub, plan: getPlan(sub.plan_id) }
  return {
    plan_id: 'free',
    status: 'active',
    plan: getPlan('free'),
    current_period_end: null,
  }
}

function ensureUsageRow(userId) {
  let row = queryOne('SELECT * FROM usage_tracking WHERE user_id = ?', [userId])
  if (!row) {
    run(
      `INSERT INTO usage_tracking (user_id, surveys_created, responses_collected, ai_requests_used)
       VALUES (?, 0, 0, 0)`,
      [userId],
    )
    row = queryOne('SELECT * FROM usage_tracking WHERE user_id = ?', [userId])
  }
  return row
}

function countUserSurveys(userId) {
  const row = queryOne(
    `SELECT COUNT(*) AS c FROM surveys WHERE user_id = ? AND (deleted_at IS NULL OR deleted_at = '')`,
    [userId],
  )
  return Number(row?.c ?? 0)
}

function countUserResponses(userId) {
  const row = queryOne(
    `SELECT COUNT(*) AS c FROM responses r
     INNER JOIN surveys s ON s.id = r.survey_id
     WHERE s.user_id = ? AND (s.deleted_at IS NULL OR s.deleted_at = '')`,
    [userId],
  )
  return Number(row?.c ?? 0)
}

function getUsageSnapshot(userId) {
  ensureUsageRow(userId)
  const sub = getActiveSubscription(userId)
  const plan = sub.plan
  const surveys = countUserSurveys(userId)
  const responses = countUserResponses(userId)
  const usage = queryOne('SELECT * FROM usage_tracking WHERE user_id = ?', [userId])
  const aiUsed = Number(usage?.ai_requests_used ?? 0)

  return {
    plan: {
      id: plan.id,
      name: plan.name,
      price_inr: plan.price_inr,
      features: plan.features,
      ai_insights: plan.ai_insights,
    },
    subscription: {
      status: sub.status,
      plan_id: sub.plan_id || sub.plan_slug || 'free',
      current_period_start: sub.current_period_start,
      current_period_end: sub.current_period_end,
      cancel_at_period_end: Boolean(sub.cancel_at_period_end),
    },
    usage: {
      surveys_created: surveys,
      responses_collected: responses,
      ai_requests_used: aiUsed,
    },
    limits: {
      surveys: plan.survey_limit,
      responses: plan.response_limit,
      ai: plan.ai_unlimited ? null : plan.ai_limit,
    },
    remaining: {
      surveys: isUnlimited(plan.survey_limit) ? null : Math.max(0, plan.survey_limit - surveys),
      responses: isUnlimited(plan.response_limit) ? null : Math.max(0, plan.response_limit - responses),
      ai: plan.ai_unlimited ? null : Math.max(0, (plan.ai_limit ?? 0) - aiUsed),
    },
  }
}

function checkLimit(userId, metric) {
  const snap = getUsageSnapshot(userId)
  const plan = snap.plan.id === 'free' ? getPlan('free') : getActiveSubscription(userId).plan

  if (metric === 'survey') {
    if (isUnlimited(plan.survey_limit)) return { ok: true, snapshot: snap }
    if (snap.usage.surveys_created >= plan.survey_limit) {
      return {
        ok: false,
        code: 'SURVEY_LIMIT',
        message: `Survey limit reached (${plan.survey_limit}). Upgrade your plan to create more surveys.`,
        snapshot: snap,
      }
    }
    return { ok: true, snapshot: snap }
  }

  if (metric === 'response') {
    if (isUnlimited(plan.response_limit)) return { ok: true, snapshot: snap }
    if (snap.usage.responses_collected >= plan.response_limit) {
      return {
        ok: false,
        code: 'RESPONSE_LIMIT',
        message: `Response limit reached (${plan.response_limit}). Upgrade to collect more responses.`,
        snapshot: snap,
      }
    }
    return { ok: true, snapshot: snap }
  }

  if (metric === 'ai') {
    if (plan.ai_unlimited) return { ok: true, snapshot: snap }
    if (snap.usage.ai_requests_used >= (plan.ai_limit ?? 0)) {
      return {
        ok: false,
        code: 'AI_LIMIT',
        message: `AI generation limit reached (${plan.ai_limit}). Upgrade for unlimited AI.`,
        snapshot: snap,
      }
    }
    return { ok: true, snapshot: snap }
  }

  return { ok: true, snapshot: snap }
}

function incrementAiUsage(userId) {
  ensureUsageRow(userId)
  run(
    'UPDATE usage_tracking SET ai_requests_used = ai_requests_used + 1, updated_at = datetime(\'now\') WHERE user_id = ?',
    [userId],
  )
}

function syncSurveyCount(userId) {
  ensureUsageRow(userId)
  const c = countUserSurveys(userId)
  run(
    'UPDATE usage_tracking SET surveys_created = ?, updated_at = datetime(\'now\') WHERE user_id = ?',
    [c, userId],
  )
}

function syncResponseCount(userId) {
  ensureUsageRow(userId)
  const c = countUserResponses(userId)
  run(
    'UPDATE usage_tracking SET responses_collected = ?, updated_at = datetime(\'now\') WHERE user_id = ?',
    [c, userId],
  )
}

module.exports = {
  getActiveSubscription,
  getUsageSnapshot,
  checkLimit,
  incrementAiUsage,
  syncSurveyCount,
  syncResponseCount,
  countUserSurveys,
  countUserResponses,
  ensureUsageRow,
}
