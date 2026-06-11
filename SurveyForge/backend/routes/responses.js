/**
 * routes/responses.js (sql.js version)
 */

const express = require('express')
const { query, run, queryOne } = require('../database')
const { assertSurveyReadable, assertSurveyWritable } = require('../utils/surveyOwnership')
const { logActivity } = require('../lib/activityLogger')
const router  = express.Router()

/* POST /responses — any authenticated user can submit; ownership not required */
router.post('/', (req, res) => {
  const { survey_id, answers } = req.body
  if (!survey_id || !answers) {
    return res.status(400).json({ success: false, error: 'survey_id and answers are required' })
  }
  if (Number.isNaN(Number(survey_id))) {
    return res.status(400).json({ success: false, error: 'survey_id must be numeric' })
  }
  if (typeof answers !== 'object' && typeof answers !== 'string') {
    return res.status(400).json({ success: false, error: 'answers must be an object or JSON string' })
  }
  try {
    // Only need READ access — ownership not required to submit a response
    if (!assertSurveyReadable(req, res, survey_id)) return

    const { lastInsertRowid } = run(
      'INSERT INTO responses (survey_id, answers) VALUES (?, ?)',
      [survey_id, typeof answers === 'string' ? answers : JSON.stringify(answers)]
    )
    const survey = queryOne('SELECT title, user_id FROM surveys WHERE id = ?', [survey_id])
    logActivity(
      survey?.user_id || req.user?.id,
      req.user?.email || 'anonymous',
      'survey_response',
      survey ? survey.title : 'Survey',
      lastInsertRowid,
      'responses',
      { survey_id }
    )
    res.status(201).json({ success: true, data: { id: lastInsertRowid } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* GET /responses?survey_id=X */
router.get('/', (req, res) => {
  const { survey_id } = req.query
  if (!survey_id) return res.status(400).json({ success: false, error: 'survey_id required' })
  try {
    if (!assertSurveyReadable(req, res, survey_id)) return

    const rows = query('SELECT * FROM responses WHERE survey_id = ? ORDER BY submitted_at DESC', [survey_id])
    rows.forEach((r) => { r.answers = JSON.parse(r.answers || '{}') })
    res.json({ success: true, data: rows })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

function buildResponseHeatmap(surveyId) {
  const rows = query(
    `SELECT strftime('%w', submitted_at) AS dow,
            strftime('%H', submitted_at) AS hour,
            COUNT(*) AS count
     FROM responses WHERE survey_id = ?
     GROUP BY dow, hour`,
    [surveyId],
  )
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const matrix = days.map(() => Array.from({ length: 24 }, () => 0))
  let max = 0
  rows.forEach(({ dow, hour, count }) => {
    const d = Number(dow)
    const h = Number(hour)
    const c = Number(count)
    if (!Number.isNaN(d) && !Number.isNaN(h) && d >= 0 && d <= 6 && h >= 0 && h <= 23) {
      matrix[d][h] = c
      if (c > max) max = c
    }
  })
  return { days, hours: Array.from({ length: 24 }, (_, i) => `${i}:00`), matrix, max }
}

function computeCompletionRate(questions, responses) {
  if (!questions.length || !responses.length) {
    return { answered: 0, total: 0, rate: 0 }
  }
  let answeredSlots = 0
  const totalSlots = questions.length * responses.length
  responses.forEach((r) => {
    const answers = JSON.parse(r.answers || '{}')
    questions.forEach((q) => {
      const val = answers[q.id] ?? answers[String(q.id)]
      if (val !== undefined && val !== null && val !== '') answeredSlots++
    })
  })
  return {
    answered: answeredSlots,
    total: totalSlots,
    rate: totalSlots ? Math.round((answeredSlots / totalSlots) * 100) : 0,
  }
}

/* GET /responses/analytics/:survey_id/export — CSV download */
router.get('/analytics/:survey_id/export', (req, res) => {
  const sid = req.params.survey_id
  try {
    const survey = assertSurveyReadable(req, res, sid)
    if (!survey) return

    const questions = query('SELECT * FROM questions WHERE survey_id = ? ORDER BY position', [sid])
    const responses = query('SELECT * FROM responses WHERE survey_id = ? ORDER BY submitted_at DESC', [sid])

    const header = ['response_id', 'submitted_at', 'respondent_email', ...questions.map((q) => q.text)]
    const rows = responses.map((r) => {
      const answers = JSON.parse(r.answers || '{}')
      const cells = questions.map((q) => {
        const val = answers[q.id] ?? answers[String(q.id)]
        if (val === undefined || val === null) return ''
        if (typeof val === 'object') return JSON.stringify(val).replace(/"/g, '""')
        return String(val).replace(/"/g, '""')
      })
      return [
        r.id,
        r.submitted_at,
        r.respondent_email || '',
        ...cells,
      ].map((c) => `"${c}"`).join(',')
    })

    const csv = [header.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(','), ...rows].join('\n')
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="survexa-survey-${sid}-responses.csv"`)
    res.send(csv)
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* GET /responses/analytics/:survey_id/segment */
router.get('/analytics/:survey_id/segment', (req, res) => {
  const sid = req.params.survey_id
  const field = req.query.field || 'respondent_email'
  try {
    const survey = assertSurveyReadable(req, res, sid)
    if (!survey) return

    if (field !== 'respondent_email') {
      return res.status(400).json({ success: false, error: 'Only respondent_email segmentation is supported' })
    }

    const rows = query(
      `SELECT COALESCE(NULLIF(respondent_email, ''), 'anonymous') AS segment, COUNT(*) AS count
       FROM responses WHERE survey_id = ?
       GROUP BY segment ORDER BY count DESC`,
      [sid],
    )
    res.json({ success: true, data: { field, segments: rows } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* GET /responses/analytics/:survey_id */
router.get('/analytics/:survey_id', (req, res) => {
  const sid = req.params.survey_id
  try {
    const survey = assertSurveyReadable(req, res, sid)
    if (!survey) return

    const questions = query('SELECT * FROM questions WHERE survey_id = ? ORDER BY position', [sid])
    questions.forEach((q) => { q.options = JSON.parse(q.options || '[]') })

    const responses     = query('SELECT * FROM responses WHERE survey_id = ?', [sid])
    const totalResponses = responses.length
    const responseTimeline = query(
      `SELECT DATE(submitted_at) AS day, COUNT(*) AS count
       FROM responses
       WHERE survey_id = ?
       GROUP BY DATE(submitted_at)
       ORDER BY day ASC`,
      [sid]
    )

    const analytics = questions.map((q) => {
      const answers = responses
        .map((r) => JSON.parse(r.answers || '{}')[q.id])
        .filter((a) => a !== undefined && a !== null && a !== '')

      if (q.type === 'rating' || q.type === 'nps') {
        const nums = answers.map(Number).filter((n) => !isNaN(n))
        const avg  = nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2) : 0
        const dist = {}
        nums.forEach((n) => { dist[n] = (dist[n] ?? 0) + 1 })
        const promoters = nums.filter((n) => n >= 9).length
        const detractors = nums.filter((n) => n <= 6).length
        const npsScore = nums.length
          ? Math.round(((promoters - detractors) / nums.length) * 100)
          : null
        return {
          question: q,
          type: q.type === 'nps' ? 'nps' : 'rating',
          average: parseFloat(avg),
          distribution: dist,
          npsScore: q.type === 'nps' ? npsScore : undefined,
          count: nums.length,
        }
      }

      if (q.type === 'matrix') {
        const opts = typeof q.options === 'object' && !Array.isArray(q.options) ? q.options : { rows: [], columns: [] }
        const grid = {}
        ;(opts.rows || []).forEach((row) => {
          grid[row] = {}
          ;(opts.columns || []).forEach((col) => { grid[row][col] = 0 })
        })
        answers.forEach((ans) => {
          if (ans && typeof ans === 'object') {
            Object.entries(ans).forEach(([row, col]) => {
              if (grid[row] && grid[row][col] !== undefined) grid[row][col]++
            })
          }
        })
        return { question: q, type: 'matrix', grid, count: answers.length }
      }

      if (q.type === 'date' || q.type === 'file') {
        const top5 = [...new Set(answers.map((a) => String(a)))].slice(0, 8)
        return { question: q, type: q.type, samples: top5, count: answers.length }
      }

      if (q.type === 'long_text') {
        const top5 = [...new Set(answers.map((a) => String(a).slice(0, 200)))].slice(0, 5)
        return { question: q, type: 'long_text', samples: top5, count: answers.length }
      }

      if (['mcq', 'checkbox', 'dropdown'].includes(q.type)) {
        const counts = {}
        q.options.forEach((o) => { counts[o] = 0 })
        answers.flat().forEach((a) => { counts[a] = (counts[a] ?? 0) + 1 })
        const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
        return { question: q, type: 'mcq', counts, topOption: top, count: answers.length }
      }

      if (q.type === 'maxdiff') {
        const bestCounts = {}
        const worstCounts = {}
        q.options.forEach((o) => { bestCounts[o] = 0; worstCounts[o] = 0 })

        answers.forEach((ans) => {
          if (ans?.best && bestCounts[ans.best] !== undefined) {
            bestCounts[ans.best]++
          }
          if (ans?.worst && worstCounts[ans.worst] !== undefined) {
            worstCounts[ans.worst]++
          }
        })

        const utilityScores = {}
        q.options.forEach((o) => {
          const total = answers.length || 1
          utilityScores[o] = parseFloat(((bestCounts[o] - worstCounts[o]) / total).toFixed(2))
        })

        return { question: q, type: 'maxdiff', bestCounts, worstCounts, utilityScores, count: answers.length }
      }

      if (q.type === 'conjoint') {
        const counts = { 'Profile A': 0, 'Profile B': 0, 'Neither': 0 }
        answers.forEach((ans) => {
          const val = String(ans || '').trim()
          if (counts[val] !== undefined) {
            counts[val]++
          }
        })
        return { question: q, type: 'conjoint', counts, count: answers.length }
      }

      if (q.type === 'kano') {
        const categories = { A: 0, P: 0, M: 0, I: 0, R: 0, Q: 0 }
        
        // Standard Kano Evaluation Table
        // Functional columns: Like, Must-be, Neutral, Live-with, Dislike
        // Dysfunctional rows: Like, Must-be, Neutral, Live-with, Dislike
        const matrix = {
          'like': { 'like': 'Q', 'must-be': 'A', 'neutral': 'A', 'live-with': 'A', 'dislike': 'P' },
          'must-be': { 'like': 'R', 'must-be': 'I', 'neutral': 'I', 'live-with': 'I', 'dislike': 'M' },
          'neutral': { 'like': 'R', 'must-be': 'I', 'neutral': 'I', 'live-with': 'I', 'dislike': 'M' },
          'live-with': { 'like': 'R', 'must-be': 'I', 'neutral': 'I', 'live-with': 'I', 'dislike': 'M' },
          'dislike': { 'like': 'R', 'must-be': 'R', 'neutral': 'R', 'live-with': 'R', 'dislike': 'Q' }
        }

        answers.forEach((ans) => {
          const fun = String(ans?.functional || '').toLowerCase().trim()
          const dys = String(ans?.dysfunctional || '').toLowerCase().trim()
          if (matrix[fun] && matrix[fun][dys]) {
            const cat = matrix[fun][dys]
            categories[cat]++
          } else {
            categories['I']++ // fallback to Indifferent
          }
        })

        return { question: q, type: 'kano', categories, count: answers.length }
      }

      if (q.type === 'psm') {
        const tooCheap = []
        const cheap = []
        const expensive = []
        const tooExpensive = []

        answers.forEach((ans) => {
          if (ans?.tooCheap !== undefined) tooCheap.push(Number(ans.tooCheap))
          if (ans?.cheap !== undefined) cheap.push(Number(ans.cheap))
          if (ans?.expensive !== undefined) expensive.push(Number(ans.expensive))
          if (ans?.tooExpensive !== undefined) tooExpensive.push(Number(ans.tooExpensive))
        })

        return { question: q, type: 'psm', rawPrices: { tooCheap, cheap, expensive, tooExpensive }, count: answers.length }
      }

      const top5 = [...new Set(answers)].slice(0, 5)
      return { question: q, type: 'text', samples: top5, count: answers.length }
    })

    const heatmap = buildResponseHeatmap(sid)
    const completionRate = computeCompletionRate(questions, responses)

    res.json({
      success: true,
      data: {
        survey,
        totalResponses,
        analytics,
        responseTimeline,
        heatmap,
        completionRate,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* GET /responses/:id — single response (survey must be readable by user) */
router.get('/:id(\\d+)', (req, res) => {
  try {
    const row = queryOne('SELECT * FROM responses WHERE id = ?', [req.params.id])
    if (!row) {
      return res.status(404).json({ success: false, error: 'Response not found' })
    }
    if (!assertSurveyReadable(req, res, row.survey_id)) return

    row.answers = JSON.parse(row.answers || '{}')
    res.json({ success: true, data: row })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
