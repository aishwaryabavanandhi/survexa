/**
 * services/api.js — Survexa API client (Express backend + JWT)
 */
import axios from 'axios'
import { getToken, clearToken } from './token'
import { supabase } from '../lib/supabase'

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
      if (!isPublic && !localStorage.getItem('survexa_mock_user')) {
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
export const getSurveys = async () => {
  const { data, error } = await supabase
    .from('surveys')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  if (error) throw error
  return { success: true, surveys: data || [], data: data || [] }
}

export const getSurveyById = async (id) => {
  const { data: survey, error } = await supabase.from('surveys').select('*').eq('id', id).single()
  if (error) throw error
  // Fetch questions separately (no 'questions' column on surveys table)
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('survey_id', id)
    .order('position', { ascending: true })
  return { success: true, survey: { ...survey, questions: questions || [] }, data: { ...survey, questions: questions || [] } }
}

export const saveSurvey = async (data) => {
  // Strip 'questions' — surveys table has no such column; save them separately below
  const { questions, ...surveyData } = data
  const { data: { user } } = await supabase.auth.getUser()
  const { data: result, error } = await supabase
    .from('surveys')
    .insert([{ ...surveyData, user_id: user?.id }])
    .select()
    .single()
  if (error) throw error

  // Save questions into the separate questions table
  if (questions?.length > 0) {
    const toInsert = questions.map((q, idx) => {
      const { id: _id, ...rest } = q
      return {
        ...rest,
        survey_id: result.id,
        position: idx,
        options: typeof rest.options === 'string' ? rest.options : JSON.stringify(rest.options ?? []),
        logic: typeof rest.logic === 'string' ? rest.logic : JSON.stringify(rest.logic ?? []),
      }
    })
    await supabase.from('questions').insert(toInsert)
  }

  return { success: true, survey: result, data: result }
}

export const updateSurvey = async (id, data) => {
  // Strip 'questions' — not a column on the surveys table
  const { questions, ...surveyData } = data
  const { data: result, error } = await supabase.from('surveys').update(surveyData).eq('id', id).select().single()
  if (error) throw error
  return { success: true, survey: result, data: result }
}

export const deleteSurvey = async (id, permanent = false) => {
  if (permanent) {
    const { error } = await supabase.from('surveys').delete().eq('id', id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('surveys').update({ deleted_at: new Date().toISOString() }).eq('id', id)
    if (error) throw error
  }
  return { success: true }
}

export const duplicateSurvey = async (id) => {
  const { data: survey, error: surveyErr } = await supabase.from('surveys').select('*').eq('id', id).single()
  if (surveyErr) throw surveyErr

  const { data: questions } = await supabase.from('questions').select('*').eq('survey_id', id)

  const { id: _oldId, created_at: _ca, share_token: _st, ...surveyData } = survey
  surveyData.title = surveyData.title + ' (Copy)'

  const { data: newSurvey, error: insertErr } = await supabase.from('surveys').insert([surveyData]).select().single()
  if (insertErr) throw insertErr

  if (questions?.length > 0) {
    const newQuestions = questions.map(q => {
      const { id: _qId, survey_id: _sid, ...qData } = q
      qData.survey_id = newSurvey.id
      return qData
    })
    await supabase.from('questions').insert(newQuestions)
  }

  return { success: true, data: newSurvey, survey: newSurvey }
}

export const publishSurvey = async (id) => {
  const { data, error } = await supabase.from('surveys').update({ status: 'published' }).eq('id', id).select().single()
  if (error) throw error
  return { success: true, survey: data }
}

export const restoreSurvey = async (id) => {
  const { error } = await supabase.from('surveys').update({ deleted_at: null }).eq('id', id)
  if (error) throw error
  return { success: true }
}

export const getTrashSurveys = async () => {
  const { data, error } = await supabase.from('surveys').select('*').not('deleted_at', 'is', null).order('deleted_at', { ascending: false })
  if (error) throw error
  return { success: true, surveys: data || [], data: data || [] }
}

export const exportAnalyticsCsv = (surveyId) =>
  api.get(`/responses/analytics/${surveyId}/export`, { responseType: 'blob' }).then((r) => r.data)

export const getAnalyticsSegments = (surveyId) =>
  api.get(`/responses/analytics/${surveyId}/segment`).then((r) => r.data)


/* ── Questions ────────────────────────────────────────────────────── */
export const getQuestions = async (surveyId) => {
  const { data, error } = await supabase.from('questions').select('*').eq('survey_id', surveyId).order('position', { ascending: true })
  if (error) throw error
  return { success: true, questions: data || [] }
}

export const saveQuestions = async ({ surveyId, survey_id, questions }) => {
  const id = surveyId ?? survey_id
  await supabase.from('questions').delete().eq('survey_id', id)
  if (questions?.length > 0) {
    const toInsert = questions.map(q => {
      const { id: _id, ...rest } = q
      return { ...rest, survey_id: id }
    })
    const { error } = await supabase.from('questions').insert(toInsert)
    if (error) throw error
  }
  return { success: true }
}

export const updateQuestion = async (id, data) => {
  const { error } = await supabase.from('questions').update(data).eq('id', id)
  if (error) throw error
  return { success: true }
}

export const deleteQuestion = async (id) => {
  const { error } = await supabase.from('questions').delete().eq('id', id)
  if (error) throw error
  return { success: true }
}

/* ── Responses & analytics ────────────────────────────────────────── */
export const saveResponse = async (data) => {
  const { data: result, error } = await supabase.from('responses').insert([data]).select().single()
  if (error) throw error
  return { success: true, response: result }
}

export const getResponseById = async (id) => {
  const { data, error } = await supabase.from('responses').select('*').eq('id', id).single()
  if (error) throw error
  return { success: true, response: data }
}

export const getResponses = async (surveyId) => {
  const { data, error } = await supabase.from('responses').select('*').eq('survey_id', surveyId).order('submitted_at', { ascending: false })
  if (error) throw error
  return { success: true, responses: data || [] }
}

export const getAnalytics = (surveyId) =>
  api.get(`/responses/analytics/${surveyId}`).then((r) => r.data)

/* ── PDF reports ──────────────────────────────────────────────────── */
export const downloadReport = (survey_id) =>
  api.post('/reports/download', { survey_id }, { responseType: 'blob' }).then((r) => r.data)

export const sendReport = (data) => api.post('/reports/send', data).then((r) => r.data)

export const getSurveyRecommendations = (data) => api.post('/ai/recommendations', data).then((r) => r.data)

/* ── Public surveys ───────────────────────────────────────────────── */
export const getPublicSurvey = async (token) => {
  const { data, error } = await supabase.from('surveys').select('*').eq('share_token', token).single()
  if (error) throw error
  return { success: true, survey: data }
}

export const submitPublicResponse = async (token, answers, respondentEmail = null, campaignTrackingToken = null) => {
  const { data: survey, error: surveyErr } = await supabase.from('surveys').select('id').eq('share_token', token).single()
  if (surveyErr) throw surveyErr
  
  const { data: result, error } = await supabase.from('responses').insert([{
    survey_id: survey.id,
    answers,
    respondent_email: respondentEmail
  }]).select().single()
  
  if (error) throw error
  return { success: true, response: result }
}

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
