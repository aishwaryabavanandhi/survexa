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

const USE_SUPABASE = true // Force Supabase Auth

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const m = localStorage.getItem('survexa_mock_user')
      return m ? JSON.parse(m) : null
    } catch { return null }
  })
  const [isAuthenticated, setIsAuth] = useState(() => !!localStorage.getItem('survexa_mock_user'))
  const [loading, setLoading] = useState(() => !localStorage.getItem('survexa_mock_user'))
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
      await supabase.auth.signOut()
    } catch (_) { /* ignore */ }
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
      const mockUser = localStorage.getItem('survexa_mock_user')
      if (mockUser && active) {
        try {
          const parsed = JSON.parse(mockUser)
          setUser(parsed)
          setIsAuth(true)
          setLoading(false)
          return
        } catch (_) {}
      }
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user && active) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            phone: session.user.phone,
            name: session.user.user_metadata?.name || '',
            role: session.user.user_metadata?.role || 'user',
          })
          setIsAuth(true)
          setToken(session.access_token)
        }
      } catch (err) {
        console.error('Supabase session error:', err)
      }
      
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email,
              phone: session.user.phone,
              name: session.user.user_metadata?.name || '',
              role: session.user.user_metadata?.role || 'user',
            })
            setIsAuth(true)
            setToken(session.access_token)
          } else if (!localStorage.getItem('survexa_mock_user')) {
            setUser(null)
            setIsAuth(false)
            clearToken()
          }
        }
      )

      if (active) setLoading(false)
      
      return () => {
        active = false
        authListener.subscription.unsubscribe()
      }
    })()
  }, [])

  /** Register: name + email + password → email OTP */
  const register = async ({ name, email, phone, password }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, phone }
        }
      })
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      localStorage.setItem('sf_pending_email', email)
      return {
        success: true,
        message: 'Account created. Check your email for the verification code or link.',
        email: email,
        nextStep: 'email',
      }
    } catch (err) {
      return { success: false, error: err.message || 'Signup failed.' }
    }
  }

  const verifyOtp = async (email, code) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'signup'
      })
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      if (data?.session) {
        applySession(data.user, data.session.access_token)
      }
      
      return {
        success: true,
        message: 'Account verified successfully!',
        accountActive: true,
      }
    } catch (err) {
      return {
        success: false,
        error: err.message || 'Email OTP verification failed.',
      }
    }
  }

  const resendOtp = async (email) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      })
      if (error) {
        return { success: false, error: error.message }
      }
      return {
        success: true,
        message: 'New OTP sent to your email.',
      }
    } catch (err) {
      return {
        success: false,
        error: err.message || 'Failed to resend OTP.',
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier,
        password
      })
      
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          return {
            success: false,
            error: 'Please verify your email before logging in.',
            needsVerification: true,
            needsEmail: true,
            email: identifier
          }
        }
        return { success: false, error: error.message }
      }
      
      applySession(data.user, data.session.access_token)
      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err.message || 'Invalid email or password.',
      }
    }
  }

  const updateProfile = async (data) => {
    try {
      const { data: res, error } = await supabase.auth.updateUser({
        data: {
          name: data.name,
          organization: data.organization,
          job_role: data.job_role
        }
      })
      if (error) {
        return { success: false, error: error.message }
      }
      if (res?.user) {
        setUser({
          id: res.user.id,
          email: res.user.email,
          phone: res.user.phone,
          name: res.user.user_metadata?.name || '',
          role: res.user.user_metadata?.role || 'user',
        })
      }
      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err.message || 'Failed to update profile.',
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
