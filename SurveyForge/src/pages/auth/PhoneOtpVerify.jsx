/**
 * Phone OTP Verification — signup phone verify & phone login
 */
import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useApp } from '../../context/AppContext'
import Button from '../../components/ui/Button'
import OtpInputRow, { OTP_LENGTH, OTP_TTL_SEC, RESEND_COOLDOWN } from '../../components/auth/OtpInputRow'
import survexaLogo from '../../assets/survexa_logo.png'

export default function PhoneOtpVerify() {
  const { verifyPhoneOtp, resendPhoneOtp } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  const phone = location.state?.phone || localStorage.getItem('sf_pending_phone') || ''
  const purpose = location.state?.purpose || 'signup'

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''))
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(OTP_TTL_SEC)
  const [resendCD, setResendCD] = useState(0)
  const [shake, setShake] = useState(false)
  const autoSubmitted = useRef(false)

  useEffect(() => {
    if (countdown <= 0) return
    const t = setInterval(() => setCountdown((c) => c - 1), 1000)
    return () => clearInterval(t)
  }, [countdown])

  useEffect(() => {
    if (resendCD <= 0) return
    const t = setInterval(() => setResendCD((c) => c - 1), 1000)
    return () => clearInterval(t)
  }, [resendCD])

  useEffect(() => {
    const devOtp = location.state?.devOtp
    if (devOtp) {
      toast(`[DEV] Phone OTP: ${devOtp}`, { icon: '⚙️', duration: 4000 })
      setOtp(String(devOtp).split('').slice(0, OTP_LENGTH))
    }
  }, [location.state?.devOtp])

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 600)
  }

  const handleChangeDigit = (idx, val, inputs) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[idx] = val
    setOtp(next)
    setError('')
    if (val && idx < OTP_LENGTH - 1) inputs.current[idx + 1]?.focus()
  }

  const handleKeyDown = (idx, e, inputs) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) inputs.current[idx - 1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    const next = [...otp]
    pasted.split('').forEach((ch, i) => { next[i] = ch })
    setOtp(next)
  }

  const handleVerify = async (codeOverride) => {
    const code = codeOverride ?? otp.join('')
    if (code.length < OTP_LENGTH) {
      setError('Enter the complete 6-digit code')
      return
    }
    if (!phone) {
      setError('Phone number missing. Please start again.')
      return
    }

    setLoading(true)
    setError('')
    const result = await verifyPhoneOtp(phone, code, purpose)
    setLoading(false)

    if (result.success) {
      if (result.accountActive && result.token) {
        setSuccess('Verified! Redirecting…')
        toast.success('Welcome to Survexa 🎉')
        setTimeout(() => navigate('/dashboard'), 1200)
      } else if (purpose === 'login') {
        setSuccess('Logged in! Redirecting…')
        toast.success('Welcome back!')
        setTimeout(() => navigate('/dashboard'), 1200)
      } else {
        toast.success(result.message || 'Phone verified')
        navigate('/dashboard', { replace: true })
      }
    } else {
      triggerShake()
      setError(result.error)
      autoSubmitted.current = false
    }
  }

  useEffect(() => {
    const code = otp.join('')
    if (code.length === OTP_LENGTH && !autoSubmitted.current && !loading) {
      autoSubmitted.current = true
      handleVerify(code)
    }
    if (code.length < OTP_LENGTH) autoSubmitted.current = false
  }, [otp]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleResend = async () => {
    if (!phone || resendCD > 0) return
    setResending(true)
    const result = await resendPhoneOtp(phone, purpose)
    setResending(false)

    if (result.success) {
      toast.success(result.message || 'New OTP sent')
      setCountdown(OTP_TTL_SEC)
      setResendCD(RESEND_COOLDOWN)
      if (result.otp) {
        setOtp(String(result.otp).split('').slice(0, OTP_LENGTH))
      } else {
        setOtp(Array(OTP_LENGTH).fill(''))
      }
      autoSubmitted.current = false
    } else {
      if (result.waitSeconds) setResendCD(result.waitSeconds)
      setError(result.error)
    }
  }

  const isExpired = countdown <= 0
  const title = purpose === 'login' ? 'Verify to sign in' : 'Verify your mobile'

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--sf-bg-subtle)] p-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <img src={survexaLogo} alt="Survexa" className="w-9 h-9 object-contain" />
          <span className="font-bold text-xl text-[var(--sf-text)] font-display">Survexa</span>
        </div>

        <div className="card card-gradient-border p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--sf-primary-soft)] border-2 border-[var(--sf-primary)]/30 flex items-center justify-center text-3xl mx-auto mb-5">
            📱
          </div>
          <h2 className="text-2xl font-bold text-[var(--sf-text)]">{title}</h2>
          <p className="text-sm text-[var(--sf-text-muted)] mt-2">
            Code sent to{' '}
            <span className="font-semibold text-[var(--sf-primary)]">{phone || 'your phone'}</span>
          </p>

          <div
            className={`mt-3 text-sm font-semibold ${
              isExpired ? 'text-red-500' : countdown > 60 ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {isExpired ? 'Code expired — resend below' : `Expires in ${fmt(countdown)}`}
          </div>

          <div className="mt-2 h-1 bg-[var(--sf-border)] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${isExpired ? 'bg-red-400' : 'bg-[var(--sf-primary)]'}`}
              style={{ width: `${(countdown / OTP_TTL_SEC) * 100}%` }}
            />
          </div>

          <div className="mt-7">
            <OtpInputRow
              otp={otp}
              setOtp={setOtp}
              onChangeDigit={handleChangeDigit}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              disabled={loading || isExpired}
              error={error}
              shake={shake}
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-sm text-red-600 font-medium"
              >
                {error}
              </motion.p>
            )}
            {success && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-sm text-emerald-600 font-medium"
              >
                {success}
              </motion.p>
            )}
          </AnimatePresence>

          <Button data-testid="Button-elt-72"
            onClick={() => handleVerify()}
            fullWidth
            loading={loading}
            size="lg"
            className="mt-6"
            disabled={isExpired || loading}
          >
            Verify code
          </Button>

          <p className="mt-5 text-sm text-[var(--sf-text-muted)]">
            Didn&apos;t get it?{' '}
            <Link
              to="/phone/resend"
              state={{ phone, purpose }}
              className="text-[var(--sf-primary)] font-semibold hover:underline"
            >
              Resend options
            </Link>
            {' · '}
            <button data-testid="button-elt-73"
              type="button"
              onClick={handleResend}
              disabled={resending || resendCD > 0}
              className="text-[var(--sf-primary)] font-semibold hover:underline disabled:opacity-50"
            >
              {resending ? 'Sending…' : resendCD > 0 ? `Wait ${resendCD}s` : 'Resend now'}
            </button>
          </p>
          <p className="mt-3">
            <Link to={purpose === 'login' ? '/phone/enter' : '/signup'} className="text-sm text-[var(--sf-text-muted)] hover:underline">
              ← Back
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
