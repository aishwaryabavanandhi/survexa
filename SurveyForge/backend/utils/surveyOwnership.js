/**
 * Survey ownership helpers — SQLite (sync)
 */
const { queryOne } = require('../database')

function userOwnsSurvey(survey, userId) {
  if (!survey || userId == null) return false
  return String(survey.user_id) === String(userId)
}

function userCanReadSurvey(req, survey) {
  if (!survey || !req.user?.id) return false
  if (req.user?.role === 'admin') return true
  if (survey.user_id == null || survey.user_id === '') return true
  return userOwnsSurvey(survey, req.user.id)
}

function assertSurveyReadable(req, res, surveyId) {
  const survey = queryOne('SELECT * FROM surveys WHERE id = ?', [surveyId])
  if (!survey) {
    res.status(404).json({ success: false, error: 'Survey not found' })
    return null
  }
  if (!userCanReadSurvey(req, survey)) {
    res.status(403).json({ success: false, error: 'Access denied' })
    return null
  }
  return survey
}

function assertSurveyWritable(req, res, surveyId) {
  const survey = queryOne('SELECT * FROM surveys WHERE id = ?', [surveyId])
  if (!survey) {
    res.status(404).json({ success: false, error: 'Survey not found' })
    return null
  }
  if (req.user?.role === 'admin') return survey
  if (!userOwnsSurvey(survey, req.user?.id)) {
    res.status(403).json({ success: false, error: 'Access denied' })
    return null
  }
  return survey
}

module.exports = {
  userOwnsSurvey,
  userCanReadSurvey,
  assertSurveyReadable,
  assertSurveyWritable,
}
