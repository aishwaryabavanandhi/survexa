/**
 * Shared question type definitions for Survexa API validation.
 */
const ALLOWED_TYPES = new Set([
  'mcq',
  'text',
  'long_text',
  'rating',
  'nps',
  'checkbox',
  'dropdown',
  'matrix',
  'file',
  'date',
  'maxdiff',
  'conjoint',
  'kano',
  'psm',
])

const OPTION_TYPES = new Set([
  'mcq',
  'checkbox',
  'dropdown',
  'maxdiff',
  'conjoint',
  'kano',
  'psm',
  'matrix',
])

function normalizeQuestionOptions(type, q) {
  if (type === 'matrix') {
    const raw = q?.options
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      const rows = Array.isArray(raw.rows) ? raw.rows.map((r) => String(r || '').trim()).filter(Boolean) : []
      const columns = Array.isArray(raw.columns)
        ? raw.columns.map((c) => String(c || '').trim()).filter(Boolean)
        : []
      if (rows.length < 1 || columns.length < 2) {
        return { error: 'Matrix questions need at least 1 row and 2 columns' }
      }
      return { options: { rows, columns } }
    }
    return { error: 'Matrix questions need rows and columns in options' }
  }

  if (type === 'file') {
    const maxMb = Number(q?.options?.maxSizeMB ?? 5)
    return { options: { maxSizeMB: Math.min(25, Math.max(1, maxMb || 5)) } }
  }

  if (['nps', 'rating', 'text', 'long_text', 'date'].includes(type)) {
    return { options: [] }
  }

  if (['maxdiff', 'conjoint', 'kano', 'psm'].includes(type)) {
    return { options: Array.isArray(q?.options) ? q.options : [] }
  }

  const options = Array.isArray(q?.options)
    ? [...new Set(q.options.map((o) => String(o || '').trim()).filter(Boolean))]
    : []
  if (options.length < 2) {
    return { error: `Question must have at least 2 options` }
  }
  return { options }
}

function normalizeQuestions(questions = []) {
  if (!Array.isArray(questions)) return { error: 'questions must be an array' }
  const normalized = []
  for (const q of questions) {
    const text = String(q?.text || '').trim()
    const type = String(q?.type || 'text').toLowerCase()
    if (!text) return { error: 'Each question must include text' }
    if (!ALLOWED_TYPES.has(type)) return { error: `Unsupported question type: ${type}` }
    const required = q?.required ? 1 : 0
    const logic = Array.isArray(q?.logic) ? q.logic : []
    let options = []
    if (OPTION_TYPES.has(type)) {
      const optResult = normalizeQuestionOptions(type, q)
      if (optResult.error) return { error: `Question "${text}": ${optResult.error}` }
      options = optResult.options
    }
    normalized.push({ text, type, options, required, logic })
  }
  return { questions: normalized }
}

module.exports = { ALLOWED_TYPES, OPTION_TYPES, normalizeQuestions, normalizeQuestionOptions }
