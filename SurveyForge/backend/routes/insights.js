/**
 * routes/insights.js — AI insights from SQLite survey stats using real OpenAI
 * Rule-based fallback and mock data has been completely removed.
 */
const express = require('express')
const { query, queryOne } = require('../database/database')
const { getUsageSnapshot } = require('../lib/usage')
const { generateCompletion } = require('../services/aiService')

const router = express.Router()

function isAiConfigured() {
  return (process.env.GROQ_API_KEY || '').trim().length > 0 ||
         (process.env.GEMINI_API_KEY || '').trim().length > 0 ||
         (process.env.OPENROUTER_API_KEY || '').trim().length > 0 ||
         (process.env.OPENAI_API_KEY || '').trim().length > 0 ||
         process.env.NODE_ENV === 'development';
}

function formatAiError(err, defaultMsg = 'AI request failed') {
  const msg = err.message || ''
  if (msg.includes('quota') || msg.includes('billing') || msg.includes('429') || err.status === 429) {
    return 'AI provider switched automatically.'
  }
  return msg || defaultMsg
}

// Aggregate user statistics helper
function buildAggregateStats(userId) {
  if (!userId) {
    return {
      totalSurveys: 0,
      totalResponses: 0,
      totalQuestions: 0,
      avgResponsesPerSurvey: 0,
      topSurvey: null,
    }
  }

  const list = query('SELECT id, title FROM surveys WHERE user_id = ?', [userId])
  const totalSurveys = list.length
  let totalResponses = 0
  let totalQuestions = 0
  let topSurvey = null

  const surveyStats = []
  for (const s of list) {
    const rRow = queryOne('SELECT COUNT(*) AS c FROM responses WHERE survey_id = ?', [s.id])
    const qRow = queryOne('SELECT COUNT(*) AS c FROM questions WHERE survey_id = ?', [s.id])
    const responses = rRow?.c ?? 0
    const questions = qRow?.c ?? 0
    totalResponses += responses
    totalQuestions += questions
    surveyStats.push({ id: s.id, title: s.title, responses })
  }

  const active = surveyStats.filter((s) => s.responses > 0)
  topSurvey = active.sort((a, b) => b.responses - a.responses)[0] ?? null

  const avgResponsesPerSurvey =
    totalSurveys > 0 ? (totalResponses / totalSurveys).toFixed(1) : 0

  return { totalSurveys, totalResponses, totalQuestions, avgResponsesPerSurvey, topSurvey }
}

// AI Insights endpoint
router.get('/', async (req, res) => {
  try {
    // 1. Enforce plan limits
    const usageSnap = getUsageSnapshot(req.user?.id)
    if (!usageSnap.plan.ai_insights) {
      return res.status(403).json({
        success: false,
        error: 'AI Insights require the Professional plan. Upgrade to unlock advanced insights.',
        code: 'AI_INSIGHTS_LOCKED',
        upgrade: true,
        usage: usageSnap,
      })
    }

    // 2. Build current statistics
    const stats = buildAggregateStats(req.user?.id)

    // 3. Verify AI is configured
    if (!isAiConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'No AI providers are configured. Please set GROQ_API_KEY, GEMINI_API_KEY, or OPENROUTER_API_KEY in your .env file.',
      })
    }

    // 4. OpenAI Execution
    try {
      const systemPrompt = `You are a business intelligence agent. You analyze aggregate user survey stats and return deep, actionable insights. You ALWAYS respond with valid JSON only — no commentary.`
      
      const userPrompt = `Based on the following user survey statistics, generate exactly 4 distinct insights/recommendations:
- Total Surveys Created: ${stats.totalSurveys}
- Total Responses Collected: ${stats.totalResponses}
- Average Responses per Survey: ${stats.avgResponsesPerSurvey}
- Top Performing Survey: ${stats.topSurvey ? `"${stats.topSurvey.title}"` : 'None'} (with ${stats.topSurvey ? stats.topSurvey.responses : 0} responses)

Generate a JSON object matching this schema:
{
  "insights": [
    {
      "id": 1,
      "type": "summary" | "trend" | "recommendation" | "tip",
      "icon": "<a single appropriate emoji, e.g. 📊, 📈, 💡, ⚡>",
      "title": "<Concise, professional headline summarizing this insight>",
      "body": "<A brief 1-2 sentence description explaining the data, trend, or specific advice based on the stats>",
      "color": "bg-blue-50 border-blue-100" | "bg-green-50 border-green-100" | "bg-purple-50 border-purple-100" | "bg-amber-50 border-amber-100",
      "label": "Overview" | "Trend" | "Recommendation" | "Best Practice",
      "labelColor": "bg-blue-100 text-blue-700" | "bg-green-100 text-green-700" | "bg-purple-100 text-purple-700" | "bg-amber-100 text-amber-700"
    }
  ]
}

Ensure:
- The insight of type 'summary' serves as the overview card.
- The insight of type 'trend' analyzes participation rate and top performing metrics.
- The insight of type 'recommendation' recommends survey structures or optimizations (like Likert scales or question counts).
- The insight of type 'tip' provides general advice on keeping surveys under 8 questions for higher completion rates.
- Tailwind color pairs must match their labels (Overview=blue, Trend=green, Recommendation=purple, Best Practice=amber).`

      const { content, provider } = await generateCompletion({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        maxTokens: 1200,
        responseFormat: 'json_object'
      })

      if (!content) throw new Error('Empty response from AI service')

      const parsed = JSON.parse(content)
      const list = parsed.insights ?? parsed

      if (!Array.isArray(list) || list.length === 0) {
        throw new Error('Invalid response structure from AI service')
      }

      return res.json({ success: true, insights: list, source: provider, stats })
    } catch (aiErr) {
      console.error('[Insights] AI service error:', aiErr.message)
      return res.status(502).json({
        success: false,
        error: formatAiError(aiErr, 'AI insights generation failed'),
        hint: 'Verify Groq, Gemini, OpenRouter, or local Ollama configuration.',
      })
    }
  } catch (err) {
    console.error('[Insights] Error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
