/**
 * pages/auth/Login.jsx — Email or Phone login
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useApp } from '../../context/AppContext'
import Button from '../../components/ui/Button'
import Input  from '../../components/ui/Input'
import survexaLogo from '../../assets/survexa_logo.png'

const features = [
  '🤖 AI-generated questions in seconds',
  '🔗 One-click survey sharing',
  '📊 Real-time analytics dashboard',
  '📑 Automated PDF email reports',
]

export default function Login() {
  const { login }    = useApp()
  const navigate     = useNavigate()
  const [mode, setMode] = useState('email')
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [logoClicks, setLogoClicks] = useState(0)

  const handleLogoClick = () => {
    const nextClicks = logoClicks + 1
    if (nextClicks >= 5) {
      setLogoClicks(0)
      const currentUrl = localStorage.getItem('survexa_backend_url') || 'https://survexa-backend.onrender.com'
      const newUrl = prompt('Enter Developer API Server URL:', currentUrl)
      if (newUrl !== null) {
        import('../../services/api').then(({ setDynamicBaseURL }) => {
          setDynamicBaseURL(newUrl)
          toast.success(`Server URL updated to: ${newUrl}`)
        })
      }
    } else {
      setLogoClicks(nextClicks)
    }
  }

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErrors(e2 => ({ ...e2, [e.target.name]: undefined }))
    setAuthError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (mode === 'phone') {
      navigate('/phone/enter')
      return
    }

    const errs = {}
    if (!form.identifier?.trim()) errs.identifier = 'Email is required'
    if (!form.password) errs.password = 'Password is required'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    const id = toast.loading('Signing in…')
    const result = await login(form.identifier.trim(), form.password)
    setLoading(false)

    if (result.success) {
      toast.success('Welcome back!', { id })
      navigate('/dashboard')
    } else if (result.needsVerification) {
      if (result.needsPhone && result.phone) {
        toast('Verify your mobile number', { id, icon: '📱' })
        localStorage.setItem('sf_pending_phone', result.phone)
        navigate('/verify-phone', { state: { phone: result.phone } })
      } else {
        toast('Check your inbox for the OTP code', { id, icon: '📧' })
        localStorage.setItem('sf_pending_email', result.email || form.identifier)
        navigate('/otp', { state: { email: result.email || form.identifier } })
      }
    } else {
      toast.error(result.error, { id })
      setAuthError(result.error)
    }
  }

  return (
    <div className="min-h-screen flex bg-[var(--sf-bg)] dark:bg-[#0b1020]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-pastel-lavender via-pastel-periwinkle to-pastel-cyan flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white/10 -translate-x-32 -translate-y-32 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-violet-400/20 translate-x-32 translate-y-32 blur-3xl" />
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }} className="relative z-10 max-w-md text-center">
          <div 
            onClick={handleLogoClick}
            className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center p-3 mx-auto mb-8 shadow-2xl cursor-pointer active:scale-95 transition-transform"
          >
            <img src={survexaLogo} alt="Survexa Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-bold text-[#0f172a] mb-3 tracking-tight font-display">Survexa</h1>
          <p className="text-[#334155] text-lg leading-relaxed mb-10 font-medium">Build powerful AI-driven surveys, gather deep insights, and make data-driven decisions.</p>
          <div className="space-y-3">
            {features.map((f, i) => (
              <motion.div key={f} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 bg-white/70 backdrop-blur rounded-xl p-3.5 text-sm text-[#0f172a] text-left shadow-sm border border-white/50">{f}</motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[var(--sf-bg-subtle)] dark:bg-[#111827]">
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45 }} className="w-full max-w-md">
          <div 
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 mb-8 lg:hidden cursor-pointer active:scale-95 transition-transform"
          >
            <img src={survexaLogo} alt="Survexa Logo" className="w-9 h-9 object-contain" />
            <span className="font-extrabold text-xl text-gray-800 dark:text-white font-display">Survexa</span>
          </div>

          <div className="card card-gradient-border p-8">
            <h2 className="text-2xl font-bold text-[var(--sf-text)] mb-1 font-display">Welcome back</h2>
            <p className="text-sm text-[var(--sf-text-muted)] mb-5 font-medium">Sign in to your Survexa account</p>

            {/* Mode toggle */}
            <div className="flex bg-[var(--sf-bg-subtle)] rounded-xl p-1 mb-5 border border-[var(--sf-border)]">
              {['email', 'phone'].map(m => (
                <button key={m} onClick={() => { setMode(m); setForm({ identifier: '', password: form.password }); setErrors({}); setAuthError('') }}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                    mode === m ? 'bg-white text-[var(--sf-text)] shadow-sm' : 'text-[var(--sf-text-muted)]'
                  }`}>
                  {m === 'email' ? '📧 Email' : '📱 Phone'}
                </button>
              ))}
            </div>

            {authError && (
              <div className="mb-5 px-4 py-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 font-medium flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                {authError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {mode === 'email' ? (
                  <motion.div key="email" initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-10 }}>
                    <Input id="identifier" name="identifier" type="email" label="Email address"
                      placeholder="jane@company.com" value={form.identifier} onChange={handleChange}
                      error={errors.identifier} autoComplete="email"
                      icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
                    />
                  </motion.div>
                ) : (
                  <motion.div key="phone" initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-10 }}
                    className="rounded-xl border border-[var(--sf-border)] bg-[var(--sf-primary-soft)]/40 p-4 text-sm text-[var(--sf-text-muted)]">
                    <p className="font-medium text-[var(--sf-text)] mb-1">Phone sign-in</p>
                    <p>We&apos;ll send a one-time code to your mobile — no password needed.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {mode === 'email' && (
                <div>
                  <Input id="password" name="password" type="password" label="Password"
                    placeholder="••••••••" value={form.password} onChange={handleChange}
                    error={errors.password} autoComplete="current-password"
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>}
                  />
                  <div className="flex justify-end mt-1.5">
                    <Link to="/forgot-password" className="text-xs text-[var(--sf-primary)] hover:underline font-semibold">
                      Forgot password?
                    </Link>
                  </div>
                </div>
              )}

              <Button type="submit" fullWidth loading={loading} size="lg">
                {mode === 'phone' ? 'Continue with OTP' : 'Sign in'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">Sign up</Link>
            </p>
            <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
              <Link to="/welcome" className="hover:text-primary-600 dark:hover:text-primary-400 hover:underline font-medium">
                Back to intro
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
