/**
 * pages/auth/OTP.jsx — Real OTP verification with auto-submit, shake, resend cooldown
 */
import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useApp } from '../../context/AppContext'
import Button from '../../components/ui/Button'

const OTP_LENGTH   = 6
const OTP_TTL_SEC  = 300  // 5 min
const RESEND_COOLDOWN = 60 // 60 sec

export default function OTP() {
  const { verifyOtp, resendOtp } = useApp()
  const navigate  = useNavigate()
  const location  = useLocation()

  const email = location.state?.email || localStorage.getItem('sf_pending_email') || ''
  const name  = location.state?.name  || ''

  const [otp,       setOtp]      = useState(Array(OTP_LENGTH).fill(''))
  const [error,     setError]    = useState('')
  const [success,   setSuccess]  = useState('')
  const [loading,   setLoading]  = useState(false)
  const [resending, setResending]= useState(false)
  const [countdown, setCountdown]= useState(OTP_TTL_SEC)
  const [resendCD,  setResendCD] = useState(0)   // resend cooldown
  const [shake,     setShake]    = useState(false)
  const inputs = useRef([])
  const autoSubmitted = useRef(false)

  // OTP expiry countdown
  useEffect(() => {
    if (countdown <= 0) return
    const t = setInterval(() => setCountdown(c => c - 1), 1000)
    return () => clearInterval(t)
  }, [countdown])

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCD <= 0) return
    const t = setInterval(() => setResendCD(c => c - 1), 1000)
    return () => clearInterval(t)
  }, [resendCD])

  // Auto-fill dev OTP if present
  useEffect(() => {
    const devOtp = location.state?.devOtp
    if (devOtp) {
      toast(`[DEV] Auto-filling OTP code: ${devOtp}`, { icon: '⚙️', duration: 4000 })
      const digits = String(devOtp).split('').slice(0, OTP_LENGTH)
      setOtp(digits)
    }
  }, [location.state?.devOtp])

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`

  // Auto-submit when all digits filled
  useEffect(() => {
    const code = otp.join('')
    if (code.length === OTP_LENGTH && !autoSubmitted.current && !loading) {
      autoSubmitted.current = true
      handleVerify(code)
    }
    if (code.length < OTP_LENGTH) autoSubmitted.current = false
  }, [otp]) // eslint-disable-line

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 600)
  }

  const handleChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[idx] = val
    setOtp(next)
    setError('')
    if (val && idx < OTP_LENGTH - 1) inputs.current[idx + 1]?.focus()
  }

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    const next = [...otp]
    pasted.split('').forEach((ch, i) => { next[i] = ch })
    setOtp(next)
    inputs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus()
  }

  const handleVerify = async (codeOverride) => {
    const code = codeOverride ?? otp.join('')
    if (code.length < OTP_LENGTH) { setError('Enter the complete 6-digit code'); return }
    if (!email) { setError('Email not found. Please sign up again.'); return }

    setLoading(true)
    setError('')
    const result = await verifyOtp(email, code)
    setLoading(false)

    if (result.success) {
      if (result.nextStep === 'phone' && (location.state?.phone || localStorage.getItem('sf_pending_phone'))) {
        const phone = location.state?.phone || localStorage.getItem('sf_pending_phone')
        toast.success('Email verified! Now verify your phone.')
        setTimeout(() => navigate('/verify-phone', {
          state: { phone, phoneOtp: location.state?.phoneOtp },
        }), 800)
        return
      }
      if (result.accountActive) {
        setSuccess('Account verified! Redirecting…')
        toast.success('Welcome to Survexa 🎉')
        setTimeout(() => navigate('/dashboard'), 1200)
      } else {
        setSuccess(result.message || 'Email verified')
        toast.success(result.message)
      }
    } else {
      triggerShake()
      setError(result.error)
      autoSubmitted.current = false
    }
  }

  const handleResend = async () => {
    if (!email || resendCD > 0) return
    setResending(true)
    setError('')
    const result = await resendOtp(email)
    setResending(false)

    if (result.success) {
      toast.success(result.message || 'New OTP sent!')
      setCountdown(OTP_TTL_SEC)
      setResendCD(RESEND_COOLDOWN)
      if (result.otp) {
        toast(`[DEV] Auto-filling new OTP: ${result.otp}`, { icon: '⚙️', duration: 4000 })
        const digits = String(result.otp).split('').slice(0, OTP_LENGTH)
        setOtp(digits)
      } else {
        setOtp(Array(OTP_LENGTH).fill(''))
      }
      autoSubmitted.current = false
      inputs.current[0]?.focus()
    } else {
      // Backend may return waitSeconds for cooldown
      const wait = result.waitSeconds
      if (wait) setResendCD(wait)
      setError(result.error)
    }
  }

  const isExpired = countdown <= 0
  const filled    = otp.join('').length

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f0f13] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-xl bg-primary-500 flex items-center justify-center">
            <span className="text-white font-bold">S</span>
          </div>
          <span className="font-extrabold text-xl text-gray-800 dark:text-white">
            Survexa
          </span>
        </div>

        <div className="bg-white dark:bg-[#16161f] rounded-2xl shadow-lg border border-gray-100 dark:border-[#2a2a3a] p-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-primary-50 dark:bg-primary-900/30 border-2 border-primary-100 dark:border-primary-800 flex items-center justify-center text-4xl mx-auto mb-5">
            🔐
          </div>

          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Verify your account</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            Enter the 6-digit code sent to{' '}
            <span className="font-semibold text-primary-600 dark:text-primary-400">{email || 'your email'}</span>
          </p>

          {/* Timer */}
          <div className={`mt-3 text-sm font-semibold ${
            isExpired ? 'text-red-500' : countdown > 60 ? 'text-green-500' : 'text-amber-500'
          }`}>
            {isExpired ? '⏰ Code expired — please resend' : `Code expires in ${fmt(countdown)}`}
          </div>

          {/* Progress bar */}
          <div className="mt-2 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full transition-colors ${
                isExpired ? 'bg-red-400' : countdown > 60 ? 'bg-green-400' : 'bg-amber-400'
              }`}
              style={{ width: `${(countdown / OTP_TTL_SEC) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* OTP inputs */}
          <motion.div
            className="flex gap-3 justify-center mt-7"
            onPaste={handlePaste}
            animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {otp.map((digit, idx) => (
              <input data-testid="input-elt-69"
                key={idx}
                ref={el => (inputs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                disabled={loading || isExpired}
                className={`
                  w-12 h-14 text-center text-xl font-bold border-2 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all
                  dark:bg-[#1e1e2a] dark:text-white
                  ${error ? 'border-red-400 bg-red-50 dark:bg-red-900/20' :
                    digit ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20' :
                    'border-gray-200 dark:border-gray-600 bg-white dark:bg-[#1e1e2a]'}
                `}
              />
            ))}
          </motion.div>

          {/* Digit progress dots */}
          <div className="flex gap-1.5 justify-center mt-3">
            {Array(OTP_LENGTH).fill(0).map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${
                i < filled ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-600'
              }`} />
            ))}
          </div>

          {/* Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-4 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 font-medium"
              >
                ❌ {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-4 px-4 py-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-600 dark:text-green-400 font-medium"
              >
                ✅ {success}
              </motion.div>
            )}
          </AnimatePresence>

          <Button data-testid="Button-elt-70"
            onClick={() => handleVerify()}
            fullWidth
            loading={loading}
            size="lg"
            className="mt-6"
            disabled={isExpired || loading}
          >
            {loading ? 'Verifying…' : 'Verify Code'}
          </Button>

          <div className="mt-5 flex flex-col gap-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Didn't receive a code?{' '}
              <button data-testid="button-elt-71"
                onClick={handleResend}
                disabled={resending || resendCD > 0}
                className="text-primary-600 dark:text-primary-400 font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? 'Sending…' : resendCD > 0 ? `Resend in ${resendCD}s` : 'Resend OTP'}
              </button>
            </p>
            <p className="text-sm">
              <Link to="/login" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">← Back to login</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
