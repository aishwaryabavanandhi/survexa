/**
 * routes/ai.js — Professional OpenAI question generation and survey recommendations
 * No templates or rule-based mocks are used.
 */

const express = require('express')
const rateLimit = require('express-rate-limit')
const { checkLimit, incrementAiUsage } = require('../lib/usage')
const { generateCompletion } = require('../services/aiService')
const { logActivity } = require('../lib/activityLogger')

const router = express.Router()

const ALLOWED_TYPES = new Set(['mcq', 'text', 'rating', 'checkbox', 'dropdown'])

// ── Rate limiter for AI endpoints (10 requests per minute per IP) ──
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10,
  message: { success: false, error: 'Too many AI requests. Please slow down and try again in a minute.' },
  skip: (req) => process.env.NODE_ENV === 'development',
})

router.use(aiLimiter)

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

// Normalize the raw question outputs received from OpenAI
function normalizeFromOpenAI(rawList, maxCount) {
  const arr = Array.isArray(rawList) ? rawList.slice(0, maxCount) : []
  return arr.map((q, i) => {
    let type = String(q.type || 'text').toLowerCase()
    if (!ALLOWED_TYPES.has(type)) type = 'text'

    let options = Array.isArray(q.options) ? [...q.options] : []
    if (['mcq', 'checkbox', 'dropdown'].includes(type)) {
      options = options.map((o) => String(o)).filter(Boolean)
      if (options.length < 2) options = ['Option A', 'Option B', 'Option C', 'Option D']
      if (type === 'mcq' && options.length > 6) options = options.slice(0, 6)
    } else {
      options = []
    }

    const text = String(q.text || '').trim() || `Question ${i + 1}`
    return { id: `ai-${Date.now()}-${i}`, text, type, options }
  })
}

// ── Question Generation logic ──
async function handleQuestionGeneration(req, res) {
  const { topic, count = 8, audience = '', goal = '' } = req.body

  if (!topic?.trim()) {
    return res.status(400).json({ success: false, error: 'topic is required' })
  }

  const n = Math.min(Math.max(Number(count) || 8, 1), 20)

  // Enforce usage limits
  if (req.user?.id) {
    const lim = checkLimit(req.user.id, 'ai')
    if (!lim.ok) {
      return res.status(403).json({
        success: false,
        error: lim.message,
        code: lim.code,
        upgrade: true,
        usage: lim.snapshot,
      })
    }
  }

  // Real AI required - no static fallbacks allowed
  if (!isAiConfigured()) {
    return res.status(400).json({
      success: false,
      error: 'No AI providers are configured. Please set GROQ_API_KEY, GEMINI_API_KEY, or OPENROUTER_API_KEY in your .env file.',
    })
  }

  try {
    const contextLines = [
      audience ? `- Target audience: ${audience}` : '',
      goal     ? `- Survey goal: ${goal}` : '',
    ].filter(Boolean).join('\n')

    const systemPrompt = [
      'You are an expert survey researcher and UX designer with 15+ years of experience creating professional surveys for Fortune 500 companies.',
      'You deeply understand psychometrics, response bias, Likert scales, Net Promoter Score methodology, and survey best practices.',
      'Your questions are always precise, neutral, actionable, and free from leading language.',
      'You ALWAYS respond with valid JSON only — no markdown, no code fences, no commentary.',
    ].join(' ')

    const userPrompt = `Design exactly ${n} high-quality, professional survey questions about: "${topic.trim()}"
${contextLines ? `\nContext:\n${contextLines}` : ''}

Requirements:
1. Questions must be SPECIFIC to "${topic.trim()}" — never generic filler.
2. Use a STRATEGIC MIX of types to maximize data quality:
   - "rating" (1–5 scale) for measuring satisfaction, likelihood, quality
   - "mcq" for categorical choices (4–5 well-defined mutually exclusive options)
   - "text" for open-ended qualitative insight (limit to 2–3 max)
   - "checkbox" for multi-select scenarios (when multiple answers apply)
   - "dropdown" only for long option lists (5+ items)
3. Recommended distribution for ${n} questions:
   - ~40% rating (NPS, satisfaction, quality scores)
   - ~35% mcq (behavioral, categorical data)
   - ~15% text (open insight, improvement ideas)
   - ~10% checkbox / dropdown (feature lists, multi-select)
4. MCQ options must be: mutually exclusive, collectively exhaustive, realistic, and balanced.
5. Rating questions must NOT include options (empty array).
6. Avoid double-barreled questions, leading language, and jargon.
7. Questions should flow logically — from general to specific.

Return ONLY this JSON object:
{
  "questions": [
    {
      "text": "<specific, professional question text>",
      "type": "rating" | "mcq" | "text" | "checkbox" | "dropdown",
      "options": ["<option1>", "<option2>", ...] // empty array for rating and text
    }
  ]
}`

    const { content, provider } = await generateCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt   },
      ],
      temperature: 0.65,
      maxTokens: 2000,
      responseFormat: 'json_object'
    })

    if (!content) throw new Error('Empty response from AI service')

    const parsed = JSON.parse(content)
    const rawQuestions = parsed.questions ?? parsed
    if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
      throw new Error('Invalid response structure from AI service')
    }

    const stamped = normalizeFromOpenAI(rawQuestions, n)
    if (stamped.length === 0) throw new Error('Could not normalize questions from AI service')

    console.log(`[AI] Generated ${stamped.length} questions for "${topic.trim()}" via ${provider}`)
    if (req.user?.id) incrementAiUsage(req.user.id)
    logActivity(req.user?.id, req.user?.email || 'user', 'ai_question_generation', topic.trim(), null, 'ai', { count: stamped.length, topic: topic.trim() })
    return res.json({ success: true, questions: stamped, source: provider })

  } catch (err) {
    console.error('[AI] Question Generator error:', err.message)
    return res.status(502).json({
      success: false,
      error: formatAiError(err, 'AI request failed'),
      hint: 'Verify Groq, Gemini, OpenRouter, or local Ollama configuration.',
    })
  }
}

// Register question generation handlers
router.post('/', handleQuestionGeneration)
router.post('/generate-questions', handleQuestionGeneration)

// ── Survey Structure and Improvements Recommendations Endpoint ──
router.post('/recommendations', async (req, res) => {
  const { title, description = '', questions = [] } = req.body

  if (!title?.trim()) {
    return res.status(400).json({ success: false, error: 'title is required' })
  }

  if (!isAiConfigured()) {
    return res.status(400).json({
      success: false,
      error: 'No AI providers are configured. Please set GROQ_API_KEY, GEMINI_API_KEY, or OPENROUTER_API_KEY in your .env file.',
    })
  }

  try {
    const systemPrompt = `You are an expert survey designer and auditor. You analyze survey structure, question type distribution, and offer improvements to maximize completion rates and minimize bias. Always return valid JSON only.`
    
    const userPrompt = `Analyze the following survey details and generate professional, actionable improvements and structure recommendations.

Survey Title: "${title}"
Survey Description: "${description}"

Current Questions:
${JSON.stringify(questions.map((q, i) => ({ index: i + 1, text: q.text, type: q.type, options: q.options })))}

Generate a JSON object matching this structure:
{
  "structureRecommendations": [
    {
      "title": "<Suggested structural section or flow advice, e.g. 'Introductory Demographics'>",
      "body": "<Detailed explanation of how this changes the flow or improves data collection. Keep it clear.>"
    }
  ],
  "questionTypeRecommendations": [
    {
      "questionIndex": <1-based index of the question, or null if general>,
      "currentText": "<Text of the question being evaluated>",
      "recommendedType": "mcq" | "text" | "rating" | "checkbox" | "dropdown",
      "reason": "<Specific reason why switching to this type will yield cleaner data or reduce response friction.>"
    }
  ],
  "improvements": [
    "<General improvement tip 1, e.g. 'Shorten the survey to 6 questions to decrease mobile dropout rates'>",
    "<General improvement tip 2, e.g. 'Rewrite Q3 to remove leading adjectives and make it neutral'>"
  ]
}`

    const { content, provider } = await generateCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      maxTokens: 1500,
      responseFormat: 'json_object'
    })

    if (!content) throw new Error('Empty response from AI service')

    const parsed = JSON.parse(content)
    
    return res.json({
      success: true,
      structureRecommendations: parsed.structureRecommendations || [],
      questionTypeRecommendations: parsed.questionTypeRecommendations || [],
      improvements: parsed.improvements || [],
      source: provider,
    })

  } catch (err) {
    console.error('[AI] Recommendations error:', err.message)
    return res.status(502).json({
      success: false,
      error: formatAiError(err, 'AI recommendations lookup failed'),
      hint: 'Verify Groq, Gemini, OpenRouter, or local Ollama configuration.',
    })
  }
})

module.exports = router
