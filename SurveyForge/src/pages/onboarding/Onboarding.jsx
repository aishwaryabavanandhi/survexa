/**
 * Premium multi-step onboarding — mobile-first (steps 7–11 spec)
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import Button from '../../components/ui/Button'

const USER_TYPES = ['Individual', 'Team', 'Enterprise']
const INTERESTS = [
  'Customer feedback', 'Employee surveys', 'Product research',
  'Events & webinars', 'Market research', 'Academic',
]

const steps = [
  { id: 'userType', title: 'How will you use Survexa?', subtitle: 'We will tune defaults for you.' },
  { id: 'interests', title: 'What matters most?', subtitle: 'Pick all that apply.' },
  { id: 'aiPrefs', title: 'AI writing style', subtitle: 'Fine-tune how questions read.' },
  { id: 'notify', title: 'Stay in the loop', subtitle: 'You can change this anytime in Settings.' },
  { id: 'done', title: 'You are all set', subtitle: 'Start with AI or build from scratch.' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    userType: '',
    interests: [],
    tone: 50,
    length: 55,
    creativity: 45,
    notifyResponses: true,
    notifyDigest: false,
    notifyProduct: true,
  })

  const current = steps[step]

  const toggleInterest = (label) => {
    setData((d) => ({
      ...d,
      interests: d.interests.includes(label)
        ? d.interests.filter((x) => x !== label)
        : [...d.interests, label],
    }))
  }

  const canContinue = () => {
    if (current.id === 'userType') return !!data.userType
    if (current.id === 'interests') return data.interests.length > 0
    return true
  }

  const finish = () => {
    toast.success('Welcome to Survexa')
    navigate('/dashboard')
  }

  const next = () => {
    if (!canContinue()) return
    if (step < steps.length - 1) setStep((s) => s + 1)
    else finish()
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#faf9ff] via-white to-[#f4f6fb] dark:from-[#0c0c0f] dark:via-[#12121a] dark:to-[#0f0f13] px-5 pt-10 pb-8 flex flex-col">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        <div className="flex gap-1.5 mb-8">
          {steps.map((s, i) => (
            <div
              key={s.id}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-gradient-to-r from-primary-500 to-indigo-500' : 'bg-gray-200 dark:bg-white/10'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25 }}
            className="flex-1"
          >
            <p className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-2">
              Step {step + 1} of {steps.length}
            </p>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
              {current.title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{current.subtitle}</p>

            {current.id === 'userType' && (
              <div className="mt-8 grid gap-3">
                {USER_TYPES.map((t) => {
                  const active = data.userType === t
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setData((d) => ({ ...d, userType: t }))}
                      className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all
                        ${active
                          ? 'border-primary-500 bg-primary-50/80 dark:bg-primary-500/10 shadow-[0_8px_30px_-12px_rgba(139,104,255,0.35)]'
                          : 'border-gray-100 dark:border-white/[0.06] bg-white/70 dark:bg-white/[0.03] hover:border-primary-200 dark:hover:border-primary-900'
                        }`}
                    >
                      <p className="font-bold text-gray-900 dark:text-white">{t}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                        {t === 'Individual' && 'Solo creator or freelancer'}
                        {t === 'Team' && 'Collaborate with teammates'}
                        {t === 'Enterprise' && 'Security, scale & governance'}
                      </p>
                    </button>
                  )
                })}
              </div>
            )}

            {current.id === 'interests' && (
              <div className="mt-8 flex flex-wrap gap-2">
                {INTERESTS.map((label) => {
                  const on = data.interests.includes(label)
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toggleInterest(label)}
                      className={`px-4 py-2.5 rounded-full text-sm font-semibold border transition-all
                        ${on
                          ? 'border-primary-500 bg-primary-500 text-white shadow-md shadow-primary-500/25'
                          : 'border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] text-gray-700 dark:text-gray-300'
                        }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            )}

            {current.id === 'aiPrefs' && (
              <div className="mt-8 space-y-6">
                <SliderRow
                  label="Tone"
                  left="Formal"
                  right="Casual"
                  value={data.tone}
                  onChange={(v) => setData((d) => ({ ...d, tone: v }))}
                />
                <SliderRow
                  label="Length"
                  left="Concise"
                  right="Detailed"
                  value={data.length}
                  onChange={(v) => setData((d) => ({ ...d, length: v }))}
                />
                <SliderRow
                  label="Creativity"
                  left="Grounded"
                  right="Bold"
                  value={data.creativity}
                  onChange={(v) => setData((d) => ({ ...d, creativity: v }))}
                />
              </div>
            )}

            {current.id === 'notify' && (
              <div className="mt-8 space-y-3">
                <ToggleRow
                  title="New responses"
                  desc="Push-style alerts in the app"
                  checked={data.notifyResponses}
                  onChange={(v) => setData((d) => ({ ...d, notifyResponses: v }))}
                />
                <ToggleRow
                  title="Weekly digest"
                  desc="Summary of activity every Monday"
                  checked={data.notifyDigest}
                  onChange={(v) => setData((d) => ({ ...d, notifyDigest: v }))}
                />
                <ToggleRow
                  title="Product updates"
                  desc="What is new in Survexa"
                  checked={data.notifyProduct}
                  onChange={(v) => setData((d) => ({ ...d, notifyProduct: v }))}
                />
              </div>
            )}

            {current.id === 'done' && (
              <div className="mt-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-4xl shadow-xl shadow-primary-500/30 mb-6">
                  🎉
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs leading-relaxed">
                  Your workspace is ready. Generate a survey with AI or open the builder — both are one tap away.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-auto pt-8 flex items-center justify-between gap-3">
          {step > 0 ? (
            <Button variant="secondary" onClick={() => setStep((s) => s - 1)} className="rounded-xl">
              Back
            </Button>
          ) : (
            <span />
          )}
          <Button onClick={next} disabled={!canContinue()} className="rounded-xl min-w-[8rem]">
            {step === steps.length - 1 ? 'Enter app' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function SliderRow({ label, left, right, value, onChange }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
        <span>{label}</span>
        <span className="text-primary-600 dark:text-primary-400">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary-500 h-2 rounded-full"
      />
      <div className="flex justify-between text-[11px] text-gray-400 mt-1">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  )
}

function ToggleRow({ title, desc, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.03]">
      <div>
        <p className="font-semibold text-gray-900 dark:text-white text-sm">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${
          checked ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </label>
  )
}
