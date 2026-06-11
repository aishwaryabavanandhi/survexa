/**
 * pages/auth/Signup.jsx — Full signup: name, email, phone, password + dual OTP
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

const features = [
  '🤖 AI-powered question generation',
  '🔗 Shareable survey links',
  '📊 Real-time analytics & charts',
  '📑 Automated PDF reports',
]

export default function Signup() {
  const { register } = useApp()
  const navigate = useNavigate()
  const [dialCode, setDialCode] = useState('+91')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setErrors((e2) => ({ ...e2, [e.target.name]: undefined }))
    setApiError('')
  }

  const validate = () => {
    const errs = {}
    if (!form.name?.trim()) errs.name = 'Full name is required'
    if (!form.email?.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email'
    const fullPhone = formatPhoneWithDial(dialCode, form.phone)
    if (!form.phone?.trim()) errs.phone = 'Mobile number is required'
    else if (!/^\+[\d]{10,15}$/.test(fullPhone.replace(/\s/g, ''))) errs.phone = 'Enter a valid mobile number'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 8) errs.password = 'Min. 8 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    setLoading(true)
    const id = toast.loading('Creating your account…')

    const fullPhone = formatPhoneWithDial(dialCode, form.phone)
    const result = await register({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: fullPhone,
      password: form.password,
    })
    setLoading(false)

    if (result.success) {
      const devHint = result.devMode
        ? ' Check the server console for OTP codes.'
        : ''
      toast.success(`Account created! Verify email first.${devHint}`, { id })
      navigate('/otp', {
        state: {
          email: result.email,
          phone: result.phone,
          name: form.name,
          devOtp: result.emailOtp,
          phoneOtp: result.phoneOtp,
        },
      })
    } else {
      toast.error(result.error, { id })
      setApiError(result.error)
    }
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#0f0f13]">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-500 to-violet-600 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 translate-x-20 -translate-y-20 blur-3xl" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-md text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center p-3 mx-auto mb-8">
            <img src={survexaLogo} alt="Survexa" className="w-full h-full object-contain filter invert brightness-200" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-3 font-display">Join Survexa</h1>
          <p className="text-primary-100 text-lg mb-10">Secure signup with email and mobile verification.</p>
          <div className="space-y-3">
            {features.map((f, i) => (
              <motion.div
                key={f}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3 bg-white/10 rounded-xl p-3.5 text-sm text-white text-left"
              >
                {f}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-[var(--sf-bg-subtle)]">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="card card-gradient-border p-8">
            <h2 className="text-2xl font-bold text-[var(--sf-text)] mb-1">Create account</h2>
            <p className="text-sm text-[var(--sf-text-muted)] mb-5">
              Full name, email, mobile, and password — then verify both OTPs.
            </p>

            {apiError && (
              <div className="mb-5 px-4 py-3 rounded-xl text-sm bg-red-50 text-red-600 border border-red-100">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                id="name"
                name="name"
                label="Full name"
                placeholder="Jane Doe"
                value={form.name}
                onChange={handleChange}
                error={errors.name}
                autoComplete="name"
              />
              <Input
                id="email"
                name="email"
                type="email"
                label="Email address"
                placeholder="jane@company.com"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                autoComplete="email"
              />
              <div>
                <label className="block text-sm font-semibold text-[var(--sf-text-secondary)] mb-1.5">
                  Mobile number <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
                  <CountryCodeSelector value={dialCode} onChange={setDialCode} className="shrink-0 w-[140px]" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="98765 43210"
                    value={form.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    className="flex-1 rounded-xl border border-[var(--sf-border)] bg-white dark:bg-[#1a1f2e] px-4 py-2.5 text-sm text-[var(--sf-text)] focus:outline-none focus:ring-2 focus:ring-[var(--sf-primary)]/40"
                  />
                </div>
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                <p className="mt-1 text-xs text-[var(--sf-text-muted)]">Select country code, then enter your number</p>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                autoComplete="new-password"
              />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirm password"
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                autoComplete="new-password"
              />

              <Button type="submit" fullWidth loading={loading} size="lg">
                {loading ? 'Creating account…' : 'Sign up & verify'}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-[var(--sf-text-muted)]">
              Already have an account?{' '}
              <Link to="/login" className="text-[var(--sf-primary)] font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
