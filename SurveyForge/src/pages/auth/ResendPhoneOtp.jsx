/**
 * Resend Phone OTP — dedicated screen with cooldown & send
 */
import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useApp } from '../../context/AppContext'
import Button from '../../components/ui/Button'
import { RESEND_COOLDOWN } from '../../components/auth/OtpInputRow'
import survexaLogo from '../../assets/survexa_logo.png'

export default function ResendPhoneOtp() {
  const { resendPhoneOtp } = useApp()
  const location = useLocation()
  const navigate = useNavigate()

  const phone = location.state?.phone || localStorage.getItem('sf_pending_phone') || ''
  const purpose = location.state?.purpose || 'signup'

  const [resendCD, setResendCD] = useState(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (resendCD <= 0) return
    const t = setInterval(() => setResendCD((c) => c - 1), 1000)
    return () => clearInterval(t)
  }, [resendCD])

  const handleResend = async () => {
    if (!phone) {
      toast.error('Phone number missing')
      navigate(purpose === 'login' ? '/phone/enter' : '/verify-phone')
      return
    }
    if (resendCD > 0) return

    setLoading(true)
    const result = await resendPhoneOtp(phone, purpose)
    setLoading(false)

    if (result.success) {
      setMessage(result.message || 'A new code was sent.')
      toast.success('OTP resent')
      setResendCD(RESEND_COOLDOWN)
      navigate('/phone/otp', {
        state: { phone, purpose, devOtp: result.otp },
      })
    } else {
      if (result.waitSeconds) setResendCD(result.waitSeconds)
      toast.error(result.error)
      setMessage(result.error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--sf-bg-subtle)] p-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <img src={survexaLogo} alt="Survexa" className="w-9 h-9 object-contain" />
          <span className="font-bold text-xl text-[var(--sf-text)] font-display">Survexa</span>
        </div>

        <div className="card card-gradient-border p-8 text-center">
          <div className="text-4xl mb-4">🔄</div>
          <h2 className="text-2xl font-bold text-[var(--sf-text)]">Resend OTP</h2>
          <p className="text-sm text-[var(--sf-text-muted)] mt-2 mb-6">
            We&apos;ll send a new 6-digit code to{' '}
            <span className="font-semibold text-[var(--sf-primary)]">{phone || 'your number'}</span>.
            Codes expire after 5 minutes.
          </p>

          {message && (
            <p className="mb-4 text-sm text-[var(--sf-text-muted)]">{message}</p>
          )}

          <Button
            fullWidth
            size="lg"
            loading={loading}
            disabled={resendCD > 0}
            onClick={handleResend}
          >
            {resendCD > 0 ? `Resend in ${resendCD}s` : 'Send new code'}
          </Button>

          <p className="mt-6 text-sm">
            <Link
              to="/phone/otp"
              state={{ phone, purpose }}
              className="text-[var(--sf-primary)] font-semibold hover:underline"
            >
              ← Back to verification
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
