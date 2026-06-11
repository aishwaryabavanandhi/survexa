import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const TEMPLATES = [
  { slug: 'nps', name: 'Net Promoter Score', emoji: '📈', desc: '0–10 likelihood + follow-up', tags: ['CX', 'Popular'] },
  { slug: 'csat', name: 'CSAT pulse', emoji: '⭐', desc: 'Short satisfaction check-in', tags: ['Support'] },
  { slug: 'event', name: 'Post-event feedback', emoji: '🎤', desc: 'Sessions, venue, content rating', tags: ['Events'] },
  { slug: 'employee', name: 'Employee engagement', emoji: '🏢', desc: 'eNPS-style workplace pulse', tags: ['HR'] },
  { slug: 'product', name: 'Feature discovery', emoji: '🔍', desc: 'Jobs-to-be-done & prioritization', tags: ['Product'] },
  { slug: 'onboarding', name: 'User onboarding', emoji: '👋', desc: 'First-week experience survey', tags: ['SaaS'] },
  { slug: 'churn', name: 'Exit interview', emoji: '🚪', desc: 'Understand cancellation reasons', tags: ['Retention'] },
  { slug: 'market', name: 'Market research', emoji: '🎯', desc: 'Demographics + preference cards', tags: ['Research'] },
]

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

export default function Templates() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Template gallery</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Start from a curated layout — opens in the builder with suggested questions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {TEMPLATES.map((t) => (
          <motion.div
            key={t.slug}
            variants={item}
            className="card p-6 flex flex-col card-hover border border-gray-100 dark:border-[#2a2a3a] dark:bg-[#16161f]"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <span className="text-3xl" aria-hidden>{t.emoji}</span>
              <div className="flex flex-wrap gap-1 justify-end">
                {t.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md
                      bg-gray-100 text-gray-600 dark:bg-[#2a2a3a] dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">{t.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex-1">{t.desc}</p>
            <div className="mt-5 flex gap-2">
              <Link
                to={`/surveys/builder?template=${t.slug}`}
                className="btn btn-primary text-sm py-2 px-4 inline-flex items-center justify-center"
              >
                Use template
              </Link>
              <Link to="/create" className="btn btn-secondary text-sm py-2 px-4 inline-flex items-center justify-center">
                Back
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
