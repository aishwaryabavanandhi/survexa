/**
 * Premium mobile bottom navigation — Survexa
 * Home · Surveys · FAB (AI) · Analytics · Settings
 */
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const nav = [
  { to: '/dashboard', label: 'Home', Icon: IconHome },
  { to: '/surveys', label: 'Surveys', Icon: IconSurveys },
  { to: '/analytics', label: 'Data', Icon: IconChart },
  { to: '/settings/profile', label: 'You', Icon: IconUser },
]

export default function MobileBottomNav() {
  const { pathname } = useLocation()

  const isFabActive =
    pathname.startsWith('/ai-generator') ||
    pathname.startsWith('/surveys/builder')

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 pb-[env(safe-area-inset-bottom,0px)] pointer-events-none"
      aria-label="Primary mobile navigation"
    >
      <div className="pointer-events-auto mx-3 mb-3">
        <div
          className="relative flex items-end justify-between gap-1 rounded-[1.35rem] border border-white/30 dark:border-white/[0.08]
            bg-white/80 dark:bg-[#12121a]/90 backdrop-blur-xl shadow-[0_-8px_40px_-12px_rgba(139,104,255,0.35),0_8px_32px_-8px_rgba(0,0,0,0.12)]
            px-2 pt-2 pb-2"
        >
          {nav.slice(0, 2).map(({ to, label, Icon }) => (
            <NavItem key={to} to={to} label={label} Icon={Icon} pathname={pathname} />
          ))}

          {/* Center FAB — AI */}
          <div className="relative flex-1 flex justify-center -mt-7 min-w-[4.5rem]">
            <NavLink to="/ai-generator" aria-label="AI Survey Generator">
              <motion.div
                whileTap={{ scale: 0.92 }}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg
                  bg-gradient-to-br from-primary-500 via-primary-500 to-indigo-600
                  text-white ring-4 ring-white/90 dark:ring-[#12121a]
                  ${isFabActive ? 'ring-primary-300/80 scale-105' : ''}`}
              >
                <IconSparkles className="w-7 h-7" />
              </motion.div>
            </NavLink>
          </div>

          {nav.slice(2).map(({ to, label, Icon }) => (
            <NavItem key={to} to={to} label={label} Icon={Icon} pathname={pathname} />
          ))}
        </div>
      </div>
    </nav>
  )
}

function NavItem({ to, label, Icon, pathname }) {
  const active =
    to === '/dashboard'
      ? pathname === '/dashboard' || pathname === '/'
      : to === '/settings/profile'
        ? pathname.startsWith('/settings')
        : pathname === to || pathname.startsWith(`${to}/`)

  return (
    <NavLink
      to={to}
      className={`flex flex-col items-center justify-end gap-0.5 min-w-[3.25rem] py-1.5 rounded-xl transition-colors
        ${active ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
    >
      <Icon active={active} />
      <span className={`text-[10px] font-semibold tracking-wide ${active ? '' : 'opacity-90'}`}>{label}</span>
    </NavLink>
  )
}

function IconHome({ active }) {
  return (
    <svg className={`w-6 h-6 ${active ? 'drop-shadow-[0_0_8px_rgba(139,104,255,0.5)]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.25 : 2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}
function IconSurveys({ active }) {
  return (
    <svg className={`w-6 h-6 ${active ? 'drop-shadow-[0_0_8px_rgba(139,104,255,0.5)]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.25 : 2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )
}
function IconChart({ active }) {
  return (
    <svg className={`w-6 h-6 ${active ? 'drop-shadow-[0_0_8px_rgba(139,104,255,0.5)]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.25 : 2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}
function IconUser({ active }) {
  return (
    <svg className={`w-6 h-6 ${active ? 'drop-shadow-[0_0_8px_rgba(139,104,255,0.5)]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.25 : 2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}
function IconSparkles({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 003.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  )
}
