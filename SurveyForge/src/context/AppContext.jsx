/**
 * context/AppContext.jsx — Authentication via Express backend (JWT + phone/email OTP)
 * Falls back to Supabase Auth only when VITE_SUPABASE_URL is fully configured.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api, { mapProfileUser } from '../services/api'
import { getToken, setToken, clearToken } from '../services/token'
import { supabase } from '../lib/supabase'

const AppContext = createContext(null)

function isSupabaseConfigured() {
  const url = import.meta.env.VITE_SUPABASE_URL || ''
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  return (
    url.length > 0 &&
    key.length > 0 &&
    !url.includes('your-supabase') &&
    !key.includes('your-supabase')
  )
}

const USE_SUPABASE = isSupabaseConfigured() && import.meta.env.VITE_USE_SUPABASE_AUTH === 'true'

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuth] = useState(false)
  const [loading, setLoading] = useState(true)
  const [globalError, setGlobalError] = useState(null)

  const isAdmin = user?.role === 'admin'

  const applySession = useCallback((profile, token) => {
    if (token) setToken(token)
    if (profile) {
      setUser(mapProfileUser(profile))
      setIsAuth(true)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch (_) { /* ignore */ }
    if (USE_SUPABASE) {
      try {
        await supabase.auth.signOut()
      } catch (_) { /* ignore */ }
    }
    clearToken()
    setUser(null)
    setIsAuth(false)
  }, [])

  const refreshSession = useCallback(async () => {
    const token = getToken()
    if (!token) {
      setUser(null)
      setIsAuth(false)
      return false
    }

    try {
      const { data } = await api.get('/auth/me')
      if (data?.success && data.user) {
        applySession(data.user, data.token)
        return true
      }
    } catch (_) {
      clearToken()
      setUser(null)
      setIsAuth(false)
    }
    return false
  }, [applySession])

  useEffect(() => {
    let active = true
    ;(async () => {
      if (USE_SUPABASE) {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user && active) {
            setUser(mapProfileUser({
              id: session.user.id,
              email: session.user.email,
              phone: session.user.phone,
              name: session.user.user_metadata?.name || '',
              role: session.user.user_metadata?.role || 'user',
            }))
            setIsAuth(true)
          }
        } catch (err) {
          console.error('Supabase session error:', err)
        }
      } else {
        await refreshSession()
      }
      if (active) setLoading(false)
    })()
    return () => { active = false }
  }, [refreshSession])

  /** Register: name + email + phone + password → email & phone OTP */
  const register = async ({ name, email, phone, password }) => {
    try {
      const { data } = await api.post('/auth/signup', { name, email, phone, password })
      if (!data?.success) {
        return { success: false, error: data?.error || 'Signup failed.' }
      }
      localStorage.setItem('sf_pending_email', data.email)
      if (data.phone) localStorage.setItem('sf_pending_phone', data.phone)
      return {
        success: true,
        message: data.message,
        email: data.email,
        phone: data.phone,
        devMode: data.devMode,
        emailOtp: data.emailOtp,
        phoneOtp: data.phoneOtp,
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Signup failed.'
      return { success: false, error: msg }
    }
  }

  const verifyOtp = async (email, code) => {
    try {
      const { data } = await api.post('/auth/verify-otp', { email, code })
      if (!data?.success) {
        return { success: false, error: data?.error || 'Verification failed.' }
      }
      if (data.token) applySession(data.user, data.token)
      return {
        success: true,
        message: data.message,
        nextStep: data.nextStep,
        accountActive: data.accountActive,
        phone: data.phone,
        waitSeconds: data.waitSeconds,
        otp: data.otp,
      }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Email OTP verification failed.',
        waitSeconds: err.response?.data?.waitSeconds,
      }
    }
  }

  const resendOtp = async (email) => {
    try {
      const { data } = await api.post('/auth/resend-otp', { email })
      if (!data?.success) {
        return { success: false, error: data?.error || 'Failed to resend OTP.' }
      }
      return {
        success: true,
        message: data.message,
        otp: data.otp,
        waitSeconds: data.waitSeconds,
      }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Failed to resend OTP.',
        waitSeconds: err.response?.data?.waitSeconds,
      }
    }
  }

  const sendPhoneLoginOtp = async (phone) => {
    if (USE_SUPABASE) {
      try {
        const { error } = await supabase.auth.signInWithOtp({ phone })
        if (error) throw error
        return { success: true, message: 'SMS OTP sent successfully.', phone }
      } catch (err) {
        return { success: false, error: err.message }
      }
    }
    try {
      const { data } = await api.post('/auth/phone/send-otp', { phone, purpose: 'login' })
      if (!data?.success) {
        return {
          success: false,
          error: data?.error || 'Failed to send SMS OTP.',
          waitSeconds: data?.waitSeconds,
        }
      }
      return {
        success: true,
        message: data.message,
        phone: data.phone,
        otp: data.otp,
        devMode: data.devMode,
      }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Failed to send SMS OTP.',
        waitSeconds: err.response?.data?.waitSeconds,
      }
    }
  }

  const verifyPhoneOtp = async (phone, code, purpose = 'signup') => {
    if (USE_SUPABASE) {
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          phone,
          token: code,
          type: 'sms',
        })
        if (error) throw error
        if (data?.session) setToken(data.session.access_token)
        return { success: true, message: 'Phone verified successfully!', accountActive: true }
      } catch (err) {
        return { success: false, error: err.message || 'Phone verification failed.' }
      }
    }
    try {
      const { data } = await api.post('/auth/phone/verify-otp', { phone, code, purpose })
      if (!data?.success) {
        return {
          success: false,
          error: data?.error || 'Phone verification failed.',
          waitSeconds: data?.waitSeconds,
        }
      }
      if (data.token) applySession(data.user, data.token)
      return {
        success: true,
        message: data.message,
        accountActive: data.accountActive,
        token: data.token,
        phoneVerified: data.phoneVerified,
      }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Phone verification failed.',
        waitSeconds: err.response?.data?.waitSeconds,
      }
    }
  }

  const resendPhoneOtp = async (phone, purpose = 'signup') => {
    if (USE_SUPABASE) {
      try {
        const { error } = await supabase.auth.signInWithOtp({ phone })
        if (error) throw error
        return { success: true, message: 'OTP resent successfully.' }
      } catch (err) {
        return { success: false, error: err.message }
      }
    }
    try {
      const { data } = await api.post('/auth/phone/resend-otp', { phone, purpose })
      if (!data?.success) {
        return {
          success: false,
          error: data?.error || 'Failed to resend SMS.',
          waitSeconds: data?.waitSeconds,
        }
      }
      return {
        success: true,
        message: data.message,
        otp: data.otp,
        waitSeconds: data.waitSeconds,
      }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Failed to resend SMS.',
        waitSeconds: err.response?.data?.waitSeconds,
      }
    }
  }

  const login = async (identifier, password) => {
    try {
      const { data } = await api.post('/auth/login', { email: identifier, password })
      if (!data?.success) {
        return { success: false, error: data?.error || 'Login failed.' }
      }
      applySession(data.user, data.token)
      return { success: true }
    } catch (err) {
      const body = err.response?.data
      if (err.response?.status === 403 && body?.needsVerification) {
        return {
          success: false,
          error: body.error,
          needsVerification: true,
          needsEmail: body.needsEmail,
          needsPhone: body.needsPhone,
          email: body.email,
          phone: body.phone,
        }
      }
      return {
        success: false,
        error: body?.error || err.message || 'Invalid email or password.',
      }
    }
  }

  const updateProfile = async (data) => {
    try {
      const { data: res } = await api.put('/auth/profile', data)
      if (!res?.success) {
        return { success: false, error: res?.error || 'Failed to update profile.' }
      }
      if (res.user) setUser(mapProfileUser(res.user))
      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Failed to update profile.',
      }
    }
  }

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        loading,
        globalError,
        setGlobalError,
        login,
        logout,
        register,
        verifyOtp,
        resendOtp,
        sendPhoneLoginOtp,
        verifyPhoneOtp,
        resendPhoneOtp,
        updateProfile,
        refreshSession,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
