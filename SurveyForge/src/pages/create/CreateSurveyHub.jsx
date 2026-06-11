import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSubscription } from '../../hooks/useSubscription'
import UpgradeModal from '../../components/billing/UpgradeModal'
import { useState } from 'react'

const cards = [
  {
    to: '/surveys/builder',
    title: 'Blank survey',
    desc: 'Start from scratch with full control over every question.',
    emoji: '📝',
    gradient: 'from-slate-400 to-slate-600',
  },
  {
    to: '/templates',
    title: 'From template',
    desc: 'NPS, CSAT, events, and more — pre-built blocks you can edit.',
    emoji: '📚',
    gradient: 'from-violet-400 to-primary-600',
  },
  {
    to: '/ai-generator',
    title: 'AI-assisted',
    desc: 'Describe your goal and let GPT draft a first pass instantly.',
    emoji: '✨',
    gradient: 'from-amber-400 to-orange-500',
  },
]

export default function CreateSurveyHub() {
  const { data, isAtLimit } = useSubscription()
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const surveyLimitReached = isAtLimit('surveys')

  const handleCardClick = (e) => {
    if (surveyLimitReached) {
      e.preventDefault()
      setUpgradeOpen(true)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Create survey</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Pick how you want to begin — you can change everything later.</p>
        {data && (
          <p className="text-xs text-gray-400 mt-2">
            Plan: {data.plan.name}
            {data.limits.surveys != null && (
              <> · {data.usage.surveys_created} / {data.limits.surveys} surveys used</>
            )}
          </p>
        )}
      </div>

      {surveyLimitReached && (
        <div className="card p-5 border-amber-200 bg-amber-50/80 dark:bg-amber-500/10 dark:border-amber-500/30">
          <p className="font-semibold text-amber-900 dark:text-amber-200">Survey limit reached</p>
          <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
            You have used all surveys on your {data?.plan?.name ?? 'Free'} plan. Upgrade to create more.
          </p>
          <Link to="/upgrade" className="inline-block mt-3 text-sm font-bold text-primary-600 hover:underline">
            View upgrade options →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cards.map((c, i) => (
          <motion.div
            key={c.to}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
          >
            <Link
              to={c.to}
              onClick={handleCardClick}
              className={`block h-full card p-6 card-hover border border-gray-100 dark:border-[#2a2a3a] dark:bg-[#16161f] flex flex-col ${
                surveyLimitReached ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-2xl shadow-lg mb-4`}
              >
                {c.emoji}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">{c.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex-1">{c.desc}</p>
              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 mt-4">Continue →</span>
            </Link>
          </motion.div>
        ))}
      </div>

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        title="Survey limit reached"
        message={`You have reached the ${data?.limits?.surveys ?? 10}-survey limit on your ${data?.plan?.name ?? 'Free'} plan.`}
        code="SURVEY_LIMIT"
      />
    </div>
  )
}
