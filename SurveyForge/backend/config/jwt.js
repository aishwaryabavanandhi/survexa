/**
 * Single JWT secret for sign + verify (auth routes + middleware).
 */
const JWT_SECRET =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === 'production'
    ? null
    : 'surveyforge-dev-secret-change-in-production')

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

module.exports = { JWT_SECRET }
