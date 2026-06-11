import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import survexaLogo from '../../assets/survexa_logo.png'

const perks = [
  { icon: '🤖', title: 'GPT questions', desc: 'Research-grade in seconds' },
  { icon: '🔗', title: 'Share anywhere', desc: 'Links & QR, no login for respondents' },
  { icon: '📊', title: 'Live analytics', desc: 'Charts that stay honest' },
]

export default function Welcome() {
  return (
    <div className="min-h-[100dvh] flex flex-col relative overflow-hidden bg-gradient-to-b from-[#fbf9ff] via-[#f5f0ff] to-[#eff4ff] dark:from-[#0a0a0f] dark:via-[#12121a] dark:to-[#0f0f13]">
      {/* Decorative Bubble Reference graphics */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[240px] h-[240px] rounded-full bg-[#b19ffb]/15 dark:bg-[#b19ffb]/8 blur-2xl top-10 -right-20"
          animate={{ y: [0, 10, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[200px] h-[200px] rounded-full bg-[#5be5e6]/10 dark:bg-[#5be5e6]/5 blur-2xl bottom-10 -left-10"
          animate={{ y: [0, -15, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
      </div>

      <div className="flex-1 flex flex-col px-6 pt-12 pb-8 max-w-md mx-auto w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex-1 flex flex-col"
        >
          {/* Brand header */}
          <div className="flex items-center gap-2.5 mb-6">
            <img src={survexaLogo} alt="Survexa Logo" className="w-10 h-10 object-contain" />
            <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white font-display">Survexa</span>
          </div>

          <div className="inline-flex self-start items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-widest mb-6">
            New
            <span className="opacity-60">·</span>
            AI Surveys
          </div>

          <h1 className="text-[2rem] leading-[1.15] font-black text-gray-900 dark:text-white tracking-tight text-balance font-display">
            Build surveys people <span className="gradient-text">actually finish</span>
          </h1>
          <p className="mt-4 text-base text-gray-500 dark:text-gray-400 leading-relaxed">
            Survexa combines intelligent question generation with a polished respondent experience and instant analytics.
          </p>

          <div className="mt-8 space-y-3">
            {perks.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="flex gap-4 p-4 rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm shadow-sm"
              >
                <span className="text-2xl shrink-0 w-12 h-12 rounded-xl bg-white dark:bg-[#16161f] shadow-sm flex items-center justify-center">
                  {p.icon}
                </span>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm font-display">{p.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="space-y-3 pt-6"
        >
          <Link
            to="/signup"
            className="btn btn-primary btn-lg w-full justify-center rounded-2xl shadow-[0_12px_40px_-8px_rgba(184,164,232,0.55)]"
          >
            Get started free
          </Link>
          <Link
            to="/login"
            className="btn btn-secondary btn-lg w-full justify-center rounded-2xl"
          >
            Log in
          </Link>
          <p className="text-center text-[11px] text-gray-400 dark:text-gray-600 pt-2">
            By continuing you agree to fair use and data practices.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
