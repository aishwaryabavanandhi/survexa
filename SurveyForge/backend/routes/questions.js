/**
 * routes/questions.js (sql.js version)
 */

const express = require('express')
const { query, run, queryOne } = require('../database/database')
const { assertSurveyReadable, assertSurveyWritable } = require('../utils/surveyOwnership')
const { normalizeQuestions } = require('../utils/questionTypes')
const { logActivity } = require('../lib/activityLogger')
const router  = express.Router()

/* GET /questions?survey_id=X */
router.get('/', (req, res) => {
  const { survey_id } = req.query
  if (!survey_id) return res.status(400).json({ success: false, error: 'survey_id is required' })

  try {
    if (!assertSurveyReadable(req, res, survey_id)) return

    const questions = query('SELECT * FROM questions WHERE survey_id = ? ORDER BY position', [survey_id])
    questions.forEach((q) => { 
      q.options = JSON.parse(q.options || '[]')
      q.logic = JSON.parse(q.logic || '[]')
    })
    res.json({ success: true, data: questions })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* POST /questions — bulk replace */
router.post('/', (req, res) => {
  const { surveyId, questions = [] } = req.body
  if (!surveyId) return res.status(400).json({ success: false, error: 'surveyId is required' })
  if (!Array.isArray(questions)) return res.status(400).json({ success: false, error: 'questions must be an array' })

  try {
    if (!assertSurveyWritable(req, res, surveyId)) return
    const bulk = normalizeQuestions(questions)
    if (bulk.error) return res.status(400).json({ success: false, error: bulk.error })
    const normalized = bulk.questions

    run('DELETE FROM questions WHERE survey_id = ?', [surveyId])
    normalized.forEach((q, idx) => {
      run(
        'INSERT INTO questions (survey_id, text, type, options, logic, position, required) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [surveyId, q.text, q.type, JSON.stringify(q.options), JSON.stringify(q.logic), idx, q.required]
      )
    })

    const saved = query('SELECT * FROM questions WHERE survey_id = ? ORDER BY position', [surveyId])
    saved.forEach((q) => { 
      q.options = JSON.parse(q.options || '[]')
      q.logic = JSON.parse(q.logic || '[]')
    })
    const survey = queryOne('SELECT title FROM surveys WHERE id = ?', [surveyId])
    logActivity(req.user?.id, req.user?.email || 'user', 'survey_edit', survey ? survey.title : 'Survey', surveyId, 'surveys', { action: 'bulk_questions_update' })
    res.status(201).json({ success: true, data: saved })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* PUT /questions/:id */
router.put('/:id', (req, res) => {
  const { text, type, options, required, logic } = req.body
  try {
    const existing = queryOne('SELECT survey_id FROM questions WHERE id = ?', [req.params.id])
    if (!existing) return res.status(404).json({ success: false, error: 'Question not found' })
    if (!assertSurveyWritable(req, res, existing.survey_id)) return
    const bulk = normalizeQuestions([{ text, type, options, required, logic }])
    if (bulk.error) return res.status(400).json({ success: false, error: bulk.error })
    const normalized = bulk.questions[0]

    run('UPDATE questions SET text = ?, type = ?, options = ?, logic = ?, required = ? WHERE id = ?',
      [normalized.text, normalized.type, JSON.stringify(normalized.options), JSON.stringify(normalized.logic), normalized.required, req.params.id])
    const q = queryOne('SELECT * FROM questions WHERE id = ?', [req.params.id])
    q.options = JSON.parse(q.options || '[]')
    q.logic = JSON.parse(q.logic || '[]')
    const survey = queryOne('SELECT title FROM surveys WHERE id = ?', [existing.survey_id])
    logActivity(req.user?.id, req.user?.email || 'user', 'survey_edit', survey ? survey.title : 'Survey', existing.survey_id, 'surveys', { action: 'question_update', question_id: req.params.id })
    res.json({ success: true, data: q })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* DELETE /questions/:id */
router.delete('/:id', (req, res) => {
  try {
    const existing = queryOne('SELECT survey_id FROM questions WHERE id = ?', [req.params.id])
    if (!existing) return res.status(404).json({ success: false, error: 'Question not found' })
    if (!assertSurveyWritable(req, res, existing.survey_id)) return

    run('DELETE FROM questions WHERE id = ?', [req.params.id])
    const survey = queryOne('SELECT title FROM surveys WHERE id = ?', [existing.survey_id])
    logActivity(req.user?.id, req.user?.email || 'user', 'survey_edit', survey ? survey.title : 'Survey', existing.survey_id, 'surveys', { action: 'question_delete', question_id: req.params.id })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
