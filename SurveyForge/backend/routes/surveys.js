/**
 * routes/surveys.js — Survey CRUD with share_token, draft/publish, soft-delete, duplicate
 */

const express = require('express')
const { v4: uuidv4 } = require('uuid')
const { query, run, queryOne } = require('../database')
const { userCanReadSurvey, userOwnsSurvey } = require('../utils/surveyOwnership')
const { checkLimit, syncSurveyCount } = require('../lib/usage')
const { normalizeQuestions } = require('../utils/questionTypes')
const { logActivity } = require('../lib/activityLogger')

const router = express.Router()

function parseSurveyRow(s) {
  if (!s) return s
  s.theme = JSON.parse(s.theme || '{}')
  s.settings = JSON.parse(s.settings || '{}')
  return s
}

function assertWritable(req, res, existing) {
  const isAdmin = req.user?.role === 'admin'
  const userId = req.user?.id ?? null
  if (!existing) {
    res.status(404).json({ success: false, error: 'Survey not found' })
    return false
  }
  const assigned = existing.user_id != null && existing.user_id !== ''
  if (!isAdmin && assigned && !userOwnsSurvey(existing, userId)) {
    res.status(403).json({ success: false, error: 'Access denied' })
    return false
  }
  return true
}

/* GET /surveys — active surveys; ?trash=1 for deleted */
router.get('/', (req, res) => {
  try {
    const isAdmin = req.user?.role === 'admin'
    const userId = req.user?.id ?? null
    const trashOnly = req.query.trash === '1' || req.query.trash === 'true'
    const deletedClause = trashOnly ? 's.deleted_at IS NOT NULL' : 's.deleted_at IS NULL'

    const surveys = isAdmin
      ? query(`
          SELECT s.*,
                 COUNT(DISTINCT q.id) AS question_count,
                 COUNT(DISTINCT r.id) AS response_count,
                 u.name AS owner_name, u.email AS owner_email
          FROM surveys s
          LEFT JOIN questions q ON q.survey_id = s.id
          LEFT JOIN responses r ON r.survey_id = s.id
          LEFT JOIN users     u ON u.id = s.user_id
          WHERE ${deletedClause}
          GROUP BY s.id
          ORDER BY s.created_at DESC
        `)
      : query(
          `
          SELECT s.*,
                 COUNT(DISTINCT q.id) AS question_count,
                 COUNT(DISTINCT r.id) AS response_count
          FROM surveys s
          LEFT JOIN questions q ON q.survey_id = s.id
          LEFT JOIN responses r ON r.survey_id = s.id
          WHERE (s.user_id = ? OR s.user_id IS NULL) AND ${deletedClause}
          GROUP BY s.id
          ORDER BY s.created_at DESC
        `,
          [userId],
        )

    surveys.forEach(parseSurveyRow)
    res.json({ success: true, data: surveys })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* POST /surveys/:id/duplicate */
router.post('/:id/duplicate', (req, res) => {
  try {
    const existing = queryOne('SELECT * FROM surveys WHERE id = ? AND deleted_at IS NULL', [req.params.id])
    if (!assertWritable(req, res, existing)) return

    const userId = req.user?.id ?? null
    const shareToken = uuidv4()
    const { lastInsertRowid: newId } = run(
      `INSERT INTO surveys (user_id, title, description, share_token, theme, status, settings)
       VALUES (?, ?, ?, ?, ?, 'draft', ?)`,
      [
        userId,
        `${existing.title} (Copy)`,
        existing.description || '',
        shareToken,
        existing.theme || '{}',
        existing.settings || '{}',
      ],
    )

    const questions = query('SELECT * FROM questions WHERE survey_id = ? ORDER BY position', [req.params.id])
    questions.forEach((q, idx) => {
      run(
        'INSERT INTO questions (survey_id, text, type, options, logic, position, required) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          newId,
          q.text,
          q.type,
          q.options,
          q.logic,
          idx,
          q.required,
        ],
      )
    })

    const created = parseSurveyRow(queryOne('SELECT * FROM surveys WHERE id = ?', [newId]))
    logActivity(userId, req.user?.email || 'user', 'survey_duplicate', created.title, newId, 'surveys', { base_survey_id: req.params.id })
    res.status(201).json({ success: true, data: created })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* POST /surveys/:id/restore */
router.post('/:id/restore', (req, res) => {
  try {
    const existing = queryOne('SELECT * FROM surveys WHERE id = ?', [req.params.id])
    if (!assertWritable(req, res, existing)) return
    run('UPDATE surveys SET deleted_at = NULL WHERE id = ?', [req.params.id])
    const restored = parseSurveyRow(queryOne('SELECT * FROM surveys WHERE id = ?', [req.params.id]))
    logActivity(req.user?.id, req.user?.email || 'user', 'survey_restore', restored.title, restored.id, 'surveys')
    res.json({ success: true, data: restored })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* PATCH /surveys/:id/publish */
router.patch('/:id/publish', (req, res) => {
  try {
    const existing = queryOne('SELECT * FROM surveys WHERE id = ? AND deleted_at IS NULL', [req.params.id])
    if (!assertWritable(req, res, existing)) return
    const shareToken = existing.share_token || uuidv4()
    run(
      `UPDATE surveys SET status = 'published', share_token = ? WHERE id = ?`,
      [shareToken, req.params.id],
    )
    const updated = parseSurveyRow(queryOne('SELECT * FROM surveys WHERE id = ?', [req.params.id]))
    logActivity(req.user?.id, req.user?.email || 'user', 'survey_publish', updated.title, updated.id, 'surveys')
    res.json({ success: true, data: updated })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* GET /surveys/:id */
router.get('/:id', (req, res) => {
  try {
    const survey = queryOne('SELECT * FROM surveys WHERE id = ?', [req.params.id])
    if (!survey) return res.status(404).json({ success: false, error: 'Survey not found' })

    const isAdmin = req.user?.role === 'admin'
    if (!isAdmin && !userCanReadSurvey(req, survey)) {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }

    parseSurveyRow(survey)
    const questions = query('SELECT * FROM questions WHERE survey_id = ? ORDER BY position', [req.params.id])
    questions.forEach((q) => {
      q.options = JSON.parse(q.options || '[]')
      q.logic = JSON.parse(q.logic || '[]')
    })

    res.json({ success: true, data: { ...survey, questions } })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* POST /surveys */
router.post('/', (req, res) => {
  const {
    title,
    description = '',
    questions = [],
    theme = {},
    settings = {},
    status = 'draft',
  } = req.body
  if (!title?.trim()) return res.status(400).json({ success: false, error: 'Title is required' })
  const normalized = normalizeQuestions(questions)
  if (normalized.error) return res.status(400).json({ success: false, error: normalized.error })

  const userId = req.user?.id ?? null
  const surveyStatus = status === 'published' ? 'published' : 'draft'
  const shareToken = surveyStatus === 'published' ? uuidv4() : null

  if (userId) {
    const lim = checkLimit(userId, 'survey')
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

  try {
    const { lastInsertRowid: surveyId } = run(
      `INSERT INTO surveys (user_id, title, description, share_token, theme, status, settings)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        title.trim(),
        description.trim(),
        shareToken,
        JSON.stringify(theme),
        surveyStatus,
        JSON.stringify(settings),
      ],
    )

    normalized.questions.forEach((q, idx) => {
      run(
        'INSERT INTO questions (survey_id, text, type, options, logic, position, required) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          surveyId,
          q.text,
          q.type,
          JSON.stringify(q.options),
          JSON.stringify(q.logic),
          idx,
          q.required,
        ],
      )
    })

    const created = parseSurveyRow(queryOne('SELECT * FROM surveys WHERE id = ?', [surveyId]))
    if (userId) syncSurveyCount(userId)
    logActivity(userId, req.user?.email || 'user', 'survey_create', created.title, surveyId, 'surveys')
    res.status(201).json({ success: true, data: created })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* PUT /surveys/:id */
router.put('/:id', (req, res) => {
  const { title, description = '', theme = {}, settings, status } = req.body
  const userId = req.user?.id ?? null
  const isAdmin = req.user?.role === 'admin'
  try {
    if (!title?.trim()) {
      return res.status(400).json({ success: false, error: 'Title is required' })
    }

    const existing = queryOne('SELECT * FROM surveys WHERE id = ? AND deleted_at IS NULL', [req.params.id])
    if (!existing) return res.status(404).json({ success: false, error: 'Survey not found' })

    const assigned = existing.user_id != null && existing.user_id !== ''
    if (!isAdmin && assigned && !userOwnsSurvey(existing, userId)) {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }

    const shareToken =
      existing.share_token ||
      (status === 'published' || existing.status === 'published' ? uuidv4() : null)
    const nextStatus = status ?? existing.status ?? 'draft'
    const nextSettings =
      settings !== undefined ? JSON.stringify(settings) : existing.settings || '{}'

    run(
      `UPDATE surveys SET title = ?, description = ?, theme = ?, share_token = ?,
        status = ?, settings = ?,
        user_id = COALESCE(user_id, ?) WHERE id = ?`,
      [
        title.trim(),
        String(description ?? '').trim(),
        JSON.stringify(theme),
        shareToken,
        nextStatus,
        nextSettings,
        userId,
        req.params.id,
      ],
    )
    const updated = parseSurveyRow(queryOne('SELECT * FROM surveys WHERE id = ?', [req.params.id]))
    logActivity(userId, req.user?.email || 'user', 'survey_edit', updated.title, updated.id, 'surveys')
    res.json({ success: true, data: updated })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/* DELETE /surveys/:id — soft delete */
router.delete('/:id', (req, res) => {
  const isAdmin = req.user?.role === 'admin'
  try {
    const existing = queryOne('SELECT * FROM surveys WHERE id = ?', [req.params.id])
    if (!existing) return res.status(404).json({ success: false, error: 'Survey not found' })
    if (!isAdmin && !userOwnsSurvey(existing, req.user?.id)) {
      return res.status(403).json({ success: false, error: 'Access denied' })
    }

    if (req.query.permanent === '1' || req.query.permanent === 'true') {
      run('DELETE FROM responses WHERE survey_id = ?', [req.params.id])
      run('DELETE FROM questions WHERE survey_id = ?', [req.params.id])
      run('DELETE FROM surveys WHERE id = ?', [req.params.id])
      if (existing.user_id) syncSurveyCount(existing.user_id)
      logActivity(req.user?.id, req.user?.email || 'user', 'survey_delete_permanent', existing.title, req.params.id, 'surveys')
      return res.json({ success: true, message: 'Survey permanently deleted' })
    }

    run(
      `UPDATE surveys SET deleted_at = strftime('%Y-%m-%d %H:%M:%S','now') WHERE id = ?`,
      [req.params.id],
    )
    if (existing.user_id) syncSurveyCount(existing.user_id)
    logActivity(req.user?.id, req.user?.email || 'user', 'survey_delete_soft', existing.title, req.params.id, 'surveys')
    res.json({ success: true, message: 'Survey moved to trash' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
