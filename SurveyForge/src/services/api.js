/**
 * services/api.js — Survexa API client (Express backend + JWT)
 */
import axios from 'axios'
import { getToken, clearToken } from './token'

/**
 * Returns the API base URL.
 * - If a custom override is stored in localStorage, use that.
 * - If VITE_API_URL is set (production build pointing to Render), use that.
 * - Otherwise use '' (empty = relative URL) so Vite's dev proxy handles routing to localhost:5000.
 */
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem('survexa_backend_url')
    if (override) return override
  }
  return import.meta.env.VITE_API_URL ?? ''
}

const api = axios.create({
  baseURL: getBaseURL(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
})

export function setDynamicBaseURL(newUrl) {
  if (newUrl) {
    localStorage.setItem('survexa_backend_url', newUrl)
    api.defaults.baseURL = newUrl
  } else {
    localStorage.removeItem('survexa_backend_url')
    api.defaults.baseURL = import.meta.env.VITE_API_URL ?? ''
  }
}

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const path = window.location.pathname
      const publicAuth = ['/login', '/signup', '/otp', '/phone', '/welcome', '/forgot-password', '/reset-password']
      const isPublic = publicAuth.some((p) => path.startsWith(p))
      if (!isPublic) {
        clearToken()
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  },
)

/** Normalize user profile fields from API */
export function mapProfileUser(raw) {
  if (!raw) return null
  return {
    ...raw,
    phone_number: raw.phone_number ?? raw.phone ?? null,
    phone_verified: Boolean(raw.phone_verified),
    otp_verified_at: raw.otp_verified_at ?? null,
  }
}

/* ── AI (Express) ─────────────────────────────────────────────────── */
export const generateQuestions = (topic, count = 8, audience = '', goal = '') =>
  api.post('/generate-questions', { topic, count, audience, goal }).then((r) => r.data)

export const getAIInsights = () => api.get('/insights').then((r) => r.data)

/* ── Surveys ──────────────────────────────────────────────────────── */
export const getSurveys = () => api.get('/surveys').then((r) => r.data)

export const getSurveyById = (id) => api.get(`/surveys/${id}`).then((r) => r.data)

export const saveSurvey = (data) => api.post('/surveys', data).then((r) => r.data)

export const updateSurvey = (id, data) => api.put(`/surveys/${id}`, data).then((r) => r.data)

export const deleteSurvey = (id, permanent = false) =>
  api.delete(`/surveys/${id}`, { params: permanent ? { permanent: '1' } : {} }).then((r) => r.data)

export const duplicateSurvey = (id) => api.post(`/surveys/${id}/duplicate`).then((r) => r.data)

export const publishSurvey = (id) => api.patch(`/surveys/${id}/publish`).then((r) => r.data)

export const restoreSurvey = (id) => api.post(`/surveys/${id}/restore`).then((r) => r.data)

export const getTrashSurveys = () => api.get('/surveys', { params: { trash: '1' } }).then((r) => r.data)

export const exportAnalyticsCsv = (surveyId) =>
  api.get(`/responses/analytics/${surveyId}/export`, { responseType: 'blob' }).then((r) => r.data)

export const getAnalyticsSegments = (surveyId) =>
  api.get(`/responses/analytics/${surveyId}/segment`).then((r) => r.data)


/* ── Questions ────────────────────────────────────────────────────── */
export const getQuestions = (surveyId) =>
  api.get('/questions', { params: { survey_id: surveyId } }).then((r) => r.data)

export const saveQuestions = ({ surveyId, survey_id, questions }) =>
  api
    .post('/questions', { surveyId: surveyId ?? survey_id, questions })
    .then((r) => r.data)

export const updateQuestion = (id, data) =>
  api.put(`/questions/${id}`, data).then((r) => r.data)

export const deleteQuestion = (id) => api.delete(`/questions/${id}`).then((r) => r.data)

/* ── Responses & analytics ────────────────────────────────────────── */
export const saveResponse = (data) => api.post('/responses', data).then((r) => r.data)

export const getResponseById = (id) => api.get(`/responses/${id}`).then((r) => r.data)

export const getResponses = (surveyId) =>
  api.get('/responses', { params: { survey_id: surveyId } }).then((r) => r.data)

export const getAnalytics = (surveyId) =>
  api.get(`/responses/analytics/${surveyId}`).then((r) => r.data)

/* ── PDF reports ──────────────────────────────────────────────────── */
export const downloadReport = (survey_id) =>
  api.post('/reports/download', { survey_id }, { responseType: 'blob' }).then((r) => r.data)

export const sendReport = (data) => api.post('/reports/send', data).then((r) => r.data)

export const getSurveyRecommendations = (data) => api.post('/ai/recommendations', data).then((r) => r.data)

/* ── Public surveys ───────────────────────────────────────────────── */
export const getPublicSurvey = (token) =>
  api.get(`/public/survey/${token}`).then((r) => r.data)

export const submitPublicResponse = (token, answers, respondentEmail = null, campaignTrackingToken = null) =>
  api
    .post(`/public/survey/${token}/respond`, {
      answers,
      respondent_email: respondentEmail,
      campaign_tracking_token: campaignTrackingToken,
    })
    .then((r) => r.data)

export const resolveCampaignLink = (trackingToken) =>
  api.get(`/public/campaign/${trackingToken}`).then((r) => r.data)

export const trackCampaignEvent = (tracking_token, event = 'start') =>
  api.post('/public/campaign/event', { tracking_token, event }).then((r) => r.data)

/* ── Distribution Hub / campaigns ─────────────────────────────────── */
export const getCampaignDashboard = (surveyId) =>
  api.get('/campaigns/dashboard', { params: { survey_id: surveyId } }).then((r) => r.data)

export const createCampaign = (payload) =>
  api.post('/campaigns', payload).then((r) => r.data)

export const getCampaignShareContent = (campaignId) =>
  api.get(`/campaigns/${campaignId}/share-content`).then((r) => r.data)

export const sendCampaignEmails = (campaignId, payload) =>
  api.post(`/campaigns/${campaignId}/email`, payload).then((r) => r.data)

export const getCampaignAnalytics = (campaignId) =>
  api.get(`/campaigns/${campaignId}/analytics`).then((r) => r.data)

/* ── Notifications ────────────────────────────────────────────────── */
export const getNotifications = () => api.get('/notifications').then((r) => r.data)

export const getUnreadCount = () => api.get('/notifications/unread-count').then((r) => r.data)

export const markNotificationRead = (id) =>
  api.put(`/notifications/${id}/read`).then((r) => r.data)

export const markAllNotificationsRead = () =>
  api.put('/notifications/read-all').then((r) => r.data)

export const deleteNotification = (id) => api.delete(`/notifications/${id}`).then((r) => r.data)

/* ── Admin ────────────────────────────────────────────────────────── */
export const getAdminUsers = () => api.get('/admin/users').then((r) => r.data)

export const deleteAdminUser = (id) => api.delete(`/admin/users/${id}`).then((r) => r.data)

export const patchAdminUserRole = (id, role) =>
  api.patch(`/admin/users/${id}/role`, { role }).then((r) => r.data)

export const getAdminSurveys = () => api.get('/admin/surveys').then((r) => r.data)

export const deleteAdminSurvey = (id) => api.delete(`/admin/surveys/${id}`).then((r) => r.data)

export const getAdminAnalytics = () => api.get('/admin/analytics').then((r) => r.data)

/* ── Phone auth status ────────────────────────────────────────────── */
export const phoneAuthStatus = () => api.get('/auth/phone/status').then((r) => r.data)

/* ── Billing & subscriptions ─────────────────────────────────────── */
export const getBillingPlans = () => api.get('/billing/plans').then((r) => r.data)

export const getBillingUsage = () => api.get('/billing/usage').then((r) => r.data)

export const getBillingPayments = () => api.get('/billing/payments').then((r) => r.data)

export const createBillingOrder = (planId) =>
  api.post('/billing/create-order', { planId }).then((r) => r.data)

export const verifyBillingPayment = (body) =>
  api.post('/billing/verify-payment', body).then((r) => r.data)

export const cancelBillingSubscription = (immediate = false) =>
  api.post('/billing/cancel', { immediate }).then((r) => r.data)

export const renewBillingSubscription = () =>
  api.post('/billing/renew').then((r) => r.data)

export const getAdminBilling = () => api.get('/admin/billing').then((r) => r.data)

/* Legacy aliases used by some screens */
export const signup = (data) => api.post('/auth/signup', data).then((r) => r.data)
export const loginUser = (data) => api.post('/auth/login', data).then((r) => r.data)
export const getMe = () => api.get('/auth/me').then((r) => r.data)
export const verifyOtp = (data) =>
  api.post('/auth/verify-otp', { email: data.email, code: data.code }).then((r) => r.data)
export const resendOtp = (data) => api.post('/auth/resend-otp', data).then((r) => r.data)
export const forgotPassword = (data) => api.post('/auth/forgot-password', data).then((r) => r.data)
export const resetPassword = (data) => api.post('/auth/reset-password', data).then((r) => r.data)
export const phoneSendOtp = (data) =>
  api.post('/auth/phone/send-otp', { phone: data.phone, purpose: data.purpose || 'login' }).then((r) => r.data)
export const phoneVerifyOtp = (data) =>
  api
    .post('/auth/phone/verify-otp', {
      phone: data.phone,
      code: data.code,
      purpose: data.purpose || 'signup',
    })
    .then((r) => r.data)
export const phoneResendOtp = (data) =>
  api
    .post('/auth/phone/resend-otp', { phone: data.phone, purpose: data.purpose || 'signup' })
    .then((r) => r.data)
export const firebaseVerifyPhone = () => Promise.resolve({ success: true })
export const updateProfile = (data) => api.put('/auth/profile', data).then((r) => r.data)

/* ── Manual UPI Payments & Settings ───────────────────────── */
export const getActivePaymentRequest = () => api.get('/billing/active-request').then((r) => r.data)
export const getBillingPaymentDetails = () => api.get('/billing/payment-details').then((r) => r.data)
export const submitPaymentRequest = (data) => api.post('/billing/payment-request', data).then((r) => r.data)
export const getAdminPaymentRequests = (status) => api.get('/admin/payments', { params: status ? { status } : {} }).then((r) => r.data)
export const approvePaymentRequest = (id) => api.post(`/admin/payments/${id}/approve`).then((r) => r.data)
export const rejectPaymentRequest = (id, reason) => api.post(`/admin/payments/${id}/reject`, { reason }).then((r) => r.data)
export const getAdminPaymentSettings = () => api.get('/admin/settings/payments').then((r) => r.data)
export const saveAdminPaymentSettings = (data) => api.post('/admin/settings/payments', data).then((r) => r.data)

/* ── Activity Logs ────────────────────────────────────────── */
export const getActivityLogs = () => api.get('/activity').then((r) => r.data)
export const getAdminActivityLogs = () => api.get('/admin/activity').then((r) => r.data)

export default api
