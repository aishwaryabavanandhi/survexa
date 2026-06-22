/**
 * components/Sidebar.jsx — Production sidebar with dark mode, animations
 */
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp }   from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import survexaLogo from '../assets/survexa_logo.png'

const navGroups = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard',       label: 'Dashboard',     icon: HomeIcon     },
      { to: '/surveys',         label: 'My Surveys',    icon: SurveyIcon   },
      { to: '/surveys/builder', label: 'Builder',       icon: BuilderIcon  },
      { to: '/distribution',    label: 'Distribution',  icon: ShareIcon    },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { to: '/ai-generator', label: 'AI Generator',  icon: AIIcon      },
      { to: '/insights',     label: 'AI Insights',   icon: InsightIcon },
    ],
  },
  {
    label: 'Data',
    items: [
      { to: '/responses',  label: 'Responses',  icon: ResponseIcon  },
      { to: '/analytics',  label: 'Analytics',  icon: AnalyticsIcon },
      { to: '/reports',    label: 'Reports',    icon: ReportIcon    },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { to: '/create',          label: 'Create',      icon: PlusCircleIcon },
      { to: '/templates',       label: 'Templates',   icon: TemplateStackIcon },
      { to: '/notifications',   label: 'Inbox',       icon: BellOutlineIcon },
      { to: '/help',            label: 'Help',        icon: HelpCircleIcon },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/billing', label: 'Billing', icon: BillingIcon },
      { to: '/settings/profile', label: 'Settings', icon: SettingsIcon, activePrefix: '/settings' },
      { to: '/activity', label: 'Activity Log', icon: ClockIcon },
    ],
  },
]

const adminNavGroup = {
  label: 'Admin',
  items: [
    { to: '/admin', label: 'Admin Dashboard', icon: ShieldIcon },
    { to: '/admin/payments', label: 'Payment Requests', icon: BillingIcon },
    { to: '/admin/settings/payments', label: 'Payment Settings', icon: SettingsIcon },
    { to: '/admin/billing', label: 'Billing Dashboard', icon: AnalyticsIcon },
    { to: '/admin/activity', label: 'Audit Logs', icon: ClockIcon },
  ],
}

export default function Sidebar({ open, onClose }) {
  const { pathname } = useLocation()
  const { user, logout, isAdmin } = useApp()
  const { isDark, toggle } = useTheme()

  const groups = isAdmin ? [...navGroups, adminNavGroup] : navGroups

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-20 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <motion.aside
        initial={false}
        animate={{ width: open ? 256 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 35 }}
        className="sidebar flex flex-col shrink-0 overflow-hidden z-30 relative"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full min-w-[256px]">
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-4.5 border-b border-[var(--sf-border)]">
            <div className="w-10 h-10 rounded-xl bg-[var(--sf-gradient-brand)] flex items-center justify-center shadow-[var(--shadow-glow)] p-1.5">
              <img src={survexaLogo} alt="Survexa Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-bold text-xl text-[var(--sf-text)] tracking-tight font-display">
                Survexa
              </span>
              <p className="text-[10px] font-semibold text-[var(--sf-text-muted)] uppercase tracking-widest">
                AI Surveys
              </p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
            {groups.map((group) => (
              <div key={group.label}>
                <p className="px-3 pb-2 text-[10px] font-bold text-[var(--sf-text-muted)] uppercase tracking-widest">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map(({ to, label, icon: Icon, activePrefix }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={to === '/surveys' || to === '/admin'}
                      className={({ isActive }) => {
                        const prefixOn = activePrefix && pathname.startsWith(activePrefix)
                        const on = isActive || prefixOn
                        return `nav-item ${on ? 'nav-item-active' : 'nav-item-inactive'}`
                      }}
                    >
                      {({ isActive }) => {
                        const prefixOn = activePrefix && pathname.startsWith(activePrefix)
                        const on = isActive || prefixOn
                        return (
                          <>
                            <span className={`nav-icon w-5 h-5 shrink-0 ${on ? '' : 'text-[var(--sf-text-muted)]'}`}>
                              <Icon />
                            </span>
                            <span>{label}</span>
                          </>
                        )
                      }}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Bottom actions */}
          <div className="px-4 pb-3 space-y-2">
            <NavLink
              to="/create"
              className="btn btn-primary w-full justify-center py-2.5 text-sm"
            >
              <span className="text-base leading-none">＋</span> New Survey
            </NavLink>
          </div>

          {/* User card */}
          <div className="flex items-center gap-3 px-4 py-4 border-t border-[var(--sf-border)]">
            <div className="w-9 h-9 rounded-full bg-[var(--sf-gradient-active)]
              flex items-center justify-center shadow-md shrink-0 select-none">
              <span className="text-[#0f172a] text-sm font-bold">
                {user?.name?.charAt(0).toUpperCase() ?? 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-[var(--sf-text)] truncate">{user?.name}</p>
                {isAdmin && (
                  <span className="shrink-0 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 uppercase tracking-wide">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--sf-text-muted)] truncate">{user?.email}</p>
            </div>
            <div className="flex gap-1">
              {/* Dark mode toggle */}
              <button data-testid="button-elt-1"
                onClick={toggle}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500
                  hover:text-gray-600 dark:hover:text-gray-300
                  hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                aria-label="Toggle dark mode"
              >
                {isDark ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
              </button>
              {/* Logout */}
              <button data-testid="button-elt-2"
                onClick={logout}
                title="Sign out"
                className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500
                  hover:text-red-500 dark:hover:text-red-400
                  hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                aria-label="Sign out"
              >
                <LogoutIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  )
}

/* ── SVG Icon Components ───────────────────────────────── */
function PlusCircleIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )
}
function TemplateStackIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  )
}
function BellOutlineIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )
}
function HelpCircleIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
function HomeIcon()     { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> }
function SurveyIcon()   { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg> }
function BuilderIcon()  { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg> }
function ShareIcon()    { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg> }
function AIIcon()       { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"/></svg> }
function InsightIcon()  { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg> }
function ResponseIcon() { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg> }
function AnalyticsIcon(){ return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> }
function ReportIcon()   { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> }
function BillingIcon()  { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg> }
function SettingsIcon() { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx={12} cy={12} r={3} strokeWidth={2}/></svg> }
function ShieldIcon()   { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg> }
function LogoutIcon({ className = 'w-4 h-4' }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg> }
function MoonIcon({ className = 'w-4 h-4' })   { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg> }
function SunIcon({ className = 'w-4 h-4' })    { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg> }
function ClockIcon() { return <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> }
