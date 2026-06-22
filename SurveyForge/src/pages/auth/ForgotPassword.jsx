import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { forgotPassword } from '../../services/api'
import Button from '../../components/ui/Button'
import Input  from '../../components/ui/Input'
import survexaLogo from '../../assets/survexa_logo.png'

function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) }

export default function ForgotPassword() {
  const [email, setEmail]     = useState('')
  const [error, setError]     = useState('')
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValidEmail(email)) { setError('Enter a valid email address'); return }
    setLoading(true)
    setError('')
    try {
      await forgotPassword({ email: email.trim() })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#0f0f13]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-500 to-violet-600 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white/10 -translate-x-32 -translate-y-32 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-violet-400/20 translate-x-32 translate-y-32 blur-3xl" />
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }} className="relative z-10 max-w-md text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center text-5xl mx-auto mb-8 shadow-2xl">🔑</div>
          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Forgot Password?</h1>
          <p className="text-primary-100 text-lg leading-relaxed">
            No worries! Enter your email and we'll send you a secure link to reset your password in minutes.
          </p>
          <div className="mt-10 space-y-3 text-left">
            {['Enter your registered email address', 'Click the reset link in your email', 'Choose a new secure password'].map((s, i) => (
              <motion.div key={s} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3 bg-white/10 rounded-xl p-3.5 text-sm text-white">
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs shrink-0">{i+1}</span>
                {s}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-[#13131a]">
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.45 }} className="w-full max-w-md">
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <img src={survexaLogo} alt="Survexa Logo" className="w-9 h-9 object-contain" />
            <span className="font-extrabold text-xl text-gray-800 dark:text-white font-display">Survexa</span>
          </div>

          {sent ? (
            <div className="card p-10 dark:bg-[#16161f] dark:border-[#2a2a3a] text-center">
              <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', stiffness:200, damping:15 }}
                className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-5xl mx-auto mb-6">
                ✉️
              </motion.div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Check your email</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-2">
                If an account exists for <strong className="text-gray-700 dark:text-gray-300">{email}</strong>,
                you'll receive a password reset link shortly.
              </p>
              <p className="text-amber-600 dark:text-amber-400 text-xs font-medium mb-8">
                ⏱ The link expires in 15 minutes
              </p>
              <Link to="/login" className="inline-block px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold transition-colors">
                ← Back to login
              </Link>
              <p className="mt-4 text-xs text-gray-400 dark:text-gray-600">
                Didn't get it?{' '}
                <button data-testid="button-elt-60" onClick={() => setSent(false)} className="text-primary-500 hover:underline font-medium">Try again</button>
              </p>
            </div>
          ) : (
            <div className="card p-8 dark:bg-[#16161f] dark:border-[#2a2a3a]">
              <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800 flex items-center justify-center text-3xl mb-6">🔑</div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">Reset your password</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Enter your email and we'll send you a reset link</p>

              <form data-testid="form-elt-61" onSubmit={handleSubmit} className="space-y-5">
                <Input data-testid="Input-elt-62" id="reset-email" name="email" type="email" label="Email address"
                  placeholder="you@company.com" value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  error={error}
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
                />
                <Button data-testid="Button-elt-63" type="submit" fullWidth loading={loading} size="lg">Send reset link</Button>
              </form>

              <p className="mt-5 text-center text-sm">
                <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">← Back to login</Link>
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
