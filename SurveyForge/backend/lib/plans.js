/**
 * Subscription plan definitions (INR / Razorpay)
 */
const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price_inr: 0,
    price_paise: 0,
    interval: 'month',
    survey_limit: 10,
    response_limit: 100,
    ai_limit: 20,
    ai_unlimited: false,
    ai_insights: false,
    description: 'Get started with Survexa',
    features: ['10 surveys', '100 responses', '20 AI generations'],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price_inr: 79,
    price_paise: 7900,
    interval: 'month',
    survey_limit: 30,
    response_limit: 2000,
    ai_limit: null,
    ai_unlimited: true,
    ai_insights: false,
    description: 'For growing teams',
    features: ['30 surveys', '2,000 responses', 'Unlimited AI'],
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price_inr: 149,
    price_paise: 14900,
    interval: 'month',
    survey_limit: null,
    response_limit: 20000,
    ai_limit: null,
    ai_unlimited: true,
    ai_insights: true,
    description: 'For power users & agencies',
    features: ['Unlimited surveys', '20,000 responses', 'AI Insights'],
  },
}

function getPlan(planId) {
  try {
    const { getDb } = require('../database')
    const db = getDb()
    if (db) {
      const p = db.prepare('SELECT * FROM plans WHERE id = ?').getAsObject([planId])
      if (p && p.id) {
        return {
          id: p.id,
          name: p.name,
          price_inr: p.price_inr,
          price_paise: p.price_inr * 100,
          survey_limit: p.survey_limit,
          response_limit: p.response_limit,
          ai_limit: p.ai_limit,
          ai_unlimited: p.ai_unlimited === 1,
          ai_insights: p.ai_insights === 1,
          is_active: p.is_active === 1,
          features: JSON.parse(p.features_json || '[]')
        }
      }
    }
  } catch (err) {
    // database not ready/initialized
  }
  return PLANS[planId] || PLANS.free
}

function listPlans(onlyActive = false) {
  try {
    const { getDb } = require('../database')
    const db = getDb()
    if (db) {
      const stmt = db.prepare('SELECT * FROM plans')
      const rows = []
      while (stmt.step()) {
        const p = stmt.getAsObject()
        rows.push({
          id: p.id,
          name: p.name,
          price_inr: p.price_inr,
          price_paise: p.price_inr * 100,
          survey_limit: p.survey_limit,
          response_limit: p.response_limit,
          ai_limit: p.ai_limit,
          ai_unlimited: p.ai_unlimited === 1,
          ai_insights: p.ai_insights === 1,
          is_active: p.is_active === 1,
          features: JSON.parse(p.features_json || '[]')
        })
      }
      stmt.free()
      if (rows.length > 0) {
        if (onlyActive) {
          return rows.filter(r => r.is_active || r.id === 'free')
        }
        return rows
      }
    }
  } catch (err) {
    // database not ready/initialized
  }
  const defaultList = Object.values(PLANS)
  if (onlyActive) {
    return defaultList.filter(r => r.is_active !== false)
  }
  return defaultList
}

function isUnlimited(limit) {
  return limit === null || limit === undefined
}

module.exports = { PLANS, getPlan, listPlans, isUnlimited }
