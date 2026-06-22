import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { resetPassword } from '../../services/api'
import Button from '../../components/ui/Button'
import Input  from '../../components/ui/Input'
import survexaLogo from '../../assets/survexa_logo.png'

export default function ResetPassword() {
  const [searchParams]   = useSearchParams()
  const navigate         = useNavigate()
  const tokenFromUrl     = searchParams.get('token')?.trim() ?? ''

  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [done,      setDone]      = useState(false)

  const getStrength = (pw) => {
    let score = 0
    if (pw.length >= 8)  score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    return score
  }
  const strength = getStrength(password)
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-green-400'][strength]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!tokenFromUrl) { setError('Missing reset token. Use the link from your email.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }

    setLoading(true)
    try {
      await resetPassword({ token: tokenFromUrl, password })
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.error ?? err.message ?? 'Could not reset password')
    } finally {
      setLoading(false)
    }
  }

  if (!tokenFromUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f0f13] p-6">
        <div className="card p-10 dark:bg-[#16161f] dark:border-[#2a2a3a] max-w-md w-full text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Invalid reset link</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">This reset link is invalid or incomplete. Please request a new one.</p>
          <Link to="/forgot-password" className="inline-block px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold transition-colors text-sm">
            Request new reset link
          </Link>
          <p className="mt-4"><Link to="/login" className="text-sm text-gray-400 hover:underline">← Back to login</Link></p>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0f0f13] p-6">
        <div className="card p-10 dark:bg-[#16161f] dark:border-[#2a2a3a] max-w-md w-full text-center">
          <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', stiffness:200, damping:15 }}
            className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-5xl mx-auto mb-6">
            ✅
          </motion.div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Password updated!</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">You can now sign in with your new password.</p>
          <button data-testid="button-elt-75" onClick={() => navigate('/login')}
            className="inline-block px-8 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold transition-colors">
            Go to login →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#0f0f13]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-500 to-violet-600 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white/10 -translate-x-32 -translate-y-32 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-violet-400/20 translate-x-32 translate-y-32 blur-3xl" />
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }} className="relative z-10 max-w-md text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center text-5xl mx-auto mb-8 shadow-2xl">🔒</div>
          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Choose a New Password</h1>
          <p className="text-primary-100 text-lg leading-relaxed">Create a strong, unique password to keep your Survexa account secure.</p>
          <div className="mt-10 space-y-3 text-left">
            {['At least 8 characters long', 'Mix of uppercase and lowercase', 'Include numbers and symbols'].map((tip, i) => (
              <motion.div key={tip} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3 bg-white/10 rounded-xl p-3.5 text-sm text-white">
                <span className="text-green-300 text-base">✓</span>{tip}
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

          <div className="card p-8 dark:bg-[#16161f] dark:border-[#2a2a3a]">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800 flex items-center justify-center text-3xl mb-6">🔒</div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">Set new password</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Your reset link expires in 15 minutes</p>

            <form data-testid="form-elt-76" onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Input data-testid="Input-elt-77" id="new-password" name="password" type="password" label="New password"
                  placeholder="At least 8 characters" value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  autoComplete="new-password"
                  icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>}
                />
                {/* Password strength bar */}
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-gray-200 dark:bg-gray-700'}`} />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${['','text-red-500','text-amber-500','text-blue-500','text-green-500'][strength]}`}>
                      {strengthLabel}
                    </p>
                  </div>
                )}
              </div>

              <Input data-testid="Input-elt-78" id="confirm-password" name="confirm" type="password" label="Confirm password"
                placeholder="Repeat password" value={confirm}
                onChange={e => { setConfirm(e.target.value); setError('') }}
                autoComplete="new-password"
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>}
              />

              {error && (
                <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 font-medium">
                  ❌ {error}
                </div>
              )}

              <Button data-testid="Button-elt-79" type="submit" fullWidth loading={loading} size="lg">Update password</Button>
            </form>

            <p className="mt-5 text-center text-sm">
              <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">← Back to login</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
