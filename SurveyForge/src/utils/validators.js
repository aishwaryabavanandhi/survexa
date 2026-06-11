/**
 * validators.js — form validation helpers
 */

export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const isStrongPassword = (pw) =>
  pw.length >= 8

export const isRequired = (value) =>
  value !== null && value !== undefined && String(value).trim().length > 0

export const maxLength = (value, max) =>
  String(value).length <= max

/** Validate a full survey before saving */
export function validateSurvey({ title, questions }) {
  const errors = {}
  if (!isRequired(title))          errors.title = 'Survey title is required'
  if (!questions || questions.length === 0)
    errors.questions = 'Add at least one question'
  if (Array.isArray(questions)) {
    const invalidQuestion = questions.find((q) => {
      if (!isRequired(q?.text)) return true
      const type = q?.type || 'text'
      if (!['mcq', 'text', 'rating', 'checkbox', 'dropdown', 'maxdiff', 'conjoint', 'kano', 'psm'].includes(type)) return true
      if (['mcq', 'checkbox', 'dropdown'].includes(type)) {
        const opts = Array.isArray(q?.options) ? q.options.map((o) => String(o).trim()).filter(Boolean) : []
        return opts.length < 2
      }
      return false
    })
    if (invalidQuestion) {
      errors.questions = 'Each question needs text, and valid options for choice-based types'
    }
  }
  return { isValid: Object.keys(errors).length === 0, errors }
}

/** Validate login form */
export function validateLogin({ email, password }) {
  const errors = {}
  if (!isValidEmail(email))        errors.email    = 'Enter a valid email address'
  if (!isRequired(password))       errors.password = 'Password is required'
  return { isValid: Object.keys(errors).length === 0, errors }
}

/** Validate signup form */
export function validateSignup({ name, email, password, confirmPassword }) {
  const errors = {}
  if (!isRequired(name))           errors.name     = 'Name is required'
  if (!isValidEmail(email))        errors.email    = 'Enter a valid email address'
  if (!isStrongPassword(password)) errors.password = 'Password must be at least 8 characters'
  if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match'
  return { isValid: Object.keys(errors).length === 0, errors }
}
