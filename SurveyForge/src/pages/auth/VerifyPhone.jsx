/**
 * Phone Verification Screen — signup step after email OTP
 */
import { useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import survexaLogo from '../../assets/survexa_logo.png'

export default function VerifyPhone() {
  const navigate = useNavigate()
  const location = useLocation()
  const phone = location.state?.phone || localStorage.getItem('sf_pending_phone') || ''
  const devOtp = location.state?.phoneOtp

  useEffect(() => {
    if (phone) localStorage.setItem('sf_pending_phone', phone)
  }, [phone])

  const goVerify = () => {
    navigate('/phone/otp', {
      state: { phone, purpose: 'signup', devOtp },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--sf-bg-subtle)] p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-2 mb-8 justify-center">
          <img src={survexaLogo} alt="Survexa" className="w-9 h-9 object-contain" />
          <span className="font-bold text-xl text-[var(--sf-text)] font-display">Survexa</span>
        </div>

        <div className="card card-gradient-border p-8 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pastel-mint to-pastel-cyan flex items-center justify-center text-4xl mx-auto mb-5 shadow-sm">
            ✅
          </div>
          <h2 className="text-2xl font-bold text-[var(--sf-text)]">Verify your phone</h2>
          <p className="text-sm text-[var(--sf-text-muted)] mt-3 leading-relaxed">
            Email verified! One more step: confirm your mobile number
            {phone ? (
              <>
                {' '}
                <span className="font-semibold text-[var(--sf-primary)]">{phone}</span>
              </>
            ) : (
              ''
            )}
            {' '}
            with the 6-digit code we sent (check server console in dev mode).
          </p>

          <button
            type="button"
            onClick={goVerify}
            className="mt-8 w-full sf-btn sf-btn-primary py-3.5 rounded-xl font-semibold text-base"
          >
            Enter verification code
          </button>

          <p className="mt-5 text-sm text-[var(--sf-text-muted)]">
            <Link to="/phone/resend" state={{ phone, purpose: 'signup' }} className="text-[var(--sf-primary)] font-semibold hover:underline">
              Resend phone OTP
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
