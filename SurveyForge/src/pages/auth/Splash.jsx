import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import survexaLogo from '../../assets/survexa_logo.png'

export default function Splash() {
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => navigate('/welcome', { replace: true }), 2400)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden
      bg-gradient-to-b from-[#fbf9ff] via-[#f5f0ff] to-[#eff4ff] dark:from-[#0a0a0f] dark:via-[#12121a] dark:to-[#0f0f13] px-6">
      {/* Decorative Floating Balloons from reference image */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft Lilac Bubble */}
        <motion.div
          className="absolute w-[280px] h-[280px] rounded-full bg-[#b19ffb]/20 dark:bg-[#b19ffb]/10 blur-2xl top-10 -right-10"
          animate={{ y: [0, 15, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Soft Turquoise/Cyan Bubble */}
        <motion.div
          className="absolute w-[240px] h-[240px] rounded-full bg-[#5be5e6]/15 dark:bg-[#5be5e6]/8 blur-2xl top-1/3 -left-12"
          animate={{ y: [0, -20, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        {/* Soft Rose/Pink Bubble */}
        <motion.div
          className="absolute w-[320px] h-[320px] rounded-full bg-[#ffb0ee]/15 dark:bg-[#ffb0ee]/8 blur-3xl bottom-10 right-10"
          animate={{ y: [0, 25, 0], scale: [1, 1.03, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        {/* Soft Peach/Orange Bubble */}
        <motion.div
          className="absolute w-[220px] h-[220px] rounded-full bg-[#fed29d]/15 dark:bg-[#fed29d]/8 blur-2xl bottom-1/4 left-1/3"
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
      </div>

      <motion.button
        type="button"
        onClick={() => navigate('/welcome', { replace: true })}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 flex flex-col items-center gap-6 text-center"
      >
        <div className="relative">
          <motion.div
            className="w-28 h-28 rounded-[2.25rem] bg-white dark:bg-gray-800 p-4.5 flex items-center justify-center
              shadow-[0_20px_50px_-10px_rgba(139,104,255,0.45)] ring-2 ring-white/60 dark:ring-white/10"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img src={survexaLogo} alt="Survexa Logo" className="w-full h-full object-contain" />
          </motion.div>
          <span className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-white dark:bg-[#1a1a24] shadow-lg flex items-center justify-center text-lg select-none" aria-hidden>
            ✨
          </span>
        </div>
        <div>
          <h1 className="text-4.5xl font-black tracking-tight text-gray-900 dark:text-white font-display">
            Survexa
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium max-w-[260px] mx-auto leading-relaxed">
            AI-powered surveys. Enterprise insights. One beautiful app.
          </p>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-600 font-medium">Tap anywhere to continue</p>
      </motion.button>

      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-primary-400"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1.1, 0.85] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>
    </div>
  )
}
