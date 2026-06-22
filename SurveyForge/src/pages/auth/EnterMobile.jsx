/**
 * Enter Mobile Number — phone OTP login step 1
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useApp } from '../../context/AppContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import survexaLogo from '../../assets/survexa_logo.png'
import CountryCodeSelector, { formatPhoneWithDial } from '../../components/auth/CountryCodeSelector'

export default function EnterMobile() {
  const { sendPhoneLoginOtp } = useApp()
  const navigate = useNavigate()
  const [dialCode, setDialCode] = useState('+91')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!phone.trim()) {
      setError('Mobile number is required')
      return
    }
    setLoading(true)
    setError('')
    const e164 = formatPhoneWithDial(dialCode, phone)
    const result = await sendPhoneLoginOtp(e164)
    setLoading(false)

    if (result.success) {
      toast.success(result.message || 'OTP sent to your phone')
      localStorage.setItem('sf_pending_phone', result.phone || phone.trim())
      navigate('/phone/otp', {
        state: {
          phone: result.phone || phone.trim(),
          purpose: 'login',
          devOtp: result.otp,
        },
      })
    } else {
      setError(result.error)
      toast.error(result.error)
    }
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

        <div className="card card-gradient-border p-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pastel-lavender to-pastel-periwinkle flex items-center justify-center text-3xl mx-auto mb-5">
            📱
          </div>
          <h2 className="text-2xl font-bold text-[var(--sf-text)] text-center mb-1">Sign in with phone</h2>
          <p className="text-sm text-[var(--sf-text-muted)] text-center mb-6">
            Enter your mobile number. We&apos;ll send a 6-digit verification code.
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm bg-red-50 text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <form data-testid="form-elt-57" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[var(--sf-text-secondary)] mb-1.5">
                Mobile number
              </label>
              <div className="flex gap-2">
                <CountryCodeSelector value={dialCode} onChange={setDialCode} className="shrink-0 w-[140px]" />
                <input data-testid="input-elt-58"
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="98765 43210"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setError('') }}
                  className="flex-1 rounded-xl border border-[var(--sf-border)] bg-white dark:bg-[#1a1f2e] px-4 py-2.5 text-sm text-[var(--sf-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sf-primary)]/40"
                />
              </div>
            </div>
            <Button data-testid="Button-elt-59" type="submit" fullWidth loading={loading} size="lg">
              Send OTP
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--sf-text-muted)]">
            Prefer email?{' '}
            <Link to="/login" className="text-[var(--sf-primary)] font-semibold hover:underline">
              Sign in with email
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
