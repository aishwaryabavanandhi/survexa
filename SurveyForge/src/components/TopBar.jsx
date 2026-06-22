/**
 * components/TopBar.jsx — Dark-mode aware, animated topbar
 */
import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import NotificationBell from './ui/NotificationBell'

const pageTitles = {
  '/dashboard':           { title: 'Dashboard',     subtitle: 'Overview of your survey activity' },
  '/create':              { title: 'Create survey',  subtitle: 'Blank, template, or AI-assisted start' },
  '/templates':           { title: 'Templates',      subtitle: 'Curated layouts for common research goals' },
  '/surveys':             { title: 'My Surveys',     subtitle: 'Manage and share your surveys'     },
  '/surveys/builder':     { title: 'Survey Builder', subtitle: 'Create and configure your survey'  },
  '/ai-generator':        { title: 'AI Generator',   subtitle: 'Generate questions using GPT-4'    },
  '/responses':           { title: 'Responses',      subtitle: 'View all survey submissions'        },
  '/analytics':           { title: 'Analytics',      subtitle: 'Data insights and visualizations'  },
  '/reports':             { title: 'Reports',        subtitle: 'Generate and email PDF reports'     },
  '/insights':            { title: 'AI Insights',    subtitle: 'AI-powered survey intelligence'     },
  '/notifications':       { title: 'Notifications',  subtitle: 'Workspace inbox' },
  '/help':                { title: 'Help center',    subtitle: 'Guides and support' },
  '/discover':            { title: "What's new",     subtitle: 'Release notes and roadmap' },
  '/activity':            { title: 'Activity',       subtitle: 'Workspace audit trail' },
  '/trash':               { title: 'Trash',         subtitle: 'Deleted surveys' },
  '/compare':             { title: 'Compare',        subtitle: 'Survey A/B analytics (preview)' },
  '/live':                { title: 'Live results',  subtitle: 'Presentation mode (preview)' },
  '/distribution':        { title: 'Distribution Hub', subtitle: 'Social, email, QR campaigns & analytics' },
  '/settings':            { title: 'Settings',       subtitle: 'Account and preference settings'    },
  '/admin':               { title: 'Admin',          subtitle: 'Users, surveys & system analytics' },
}

const SETTINGS_SUB = {
  profile:       'Your identity and notification toggles',
  team:          'Members, roles, and invites',
  billing:       'Plan, invoices, and upgrades',
  integrations: 'Slack, Sheets, Zapier, and more',
  security:      'Password, 2FA, and API keys',
  branding:      'Logo and colors on hosted forms',
}

function resolvePageMeta(pathname) {
  if (pathname.startsWith('/surveys/builder/')) {
    return { title: 'Edit survey', subtitle: 'Questions, preview & publish' }
  }
  if (pathname.startsWith('/responses/')) {
    return { title: 'Response detail', subtitle: 'Individual submission' }
  }
  if (pathname.startsWith('/settings/')) {
    const slug = pathname.split('/')[2]?.toLowerCase() ?? 'profile'
    return { title: 'Settings', subtitle: SETTINGS_SUB[slug] ?? 'Account and workspace' }
  }
  if (/^\/surveys\/[^/]+\/share$/.test(pathname)) {
    return { title: 'Share & publish', subtitle: 'Public link, QR, and embed' }
  }
  return pageTitles[pathname] ?? { title: 'Survexa', subtitle: '' }
}

export default function TopBar({ onMenuClick }) {
  const { pathname } = useLocation()
  const navigate     = useNavigate()
  const { isDark, toggle } = useTheme()
  const [search, setSearch] = useState('')

  const page = resolvePageMeta(pathname)

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/surveys?q=${encodeURIComponent(search.trim())}`)
  }

  return (
    <header className="topbar flex items-center justify-between px-5 py-3.5 z-10">
      <div className="flex items-center gap-4">
        {/* Hamburger */}
        <button data-testid="button-elt-3"
          onClick={onMenuClick}
          className="p-2 rounded-xl text-gray-500 dark:text-gray-400
            hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Page title */}
        <div>
          <motion.h1
            key={pathname}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="text-base font-bold text-[var(--sf-text)] leading-none font-display"
          >
            {page.title}
          </motion.h1>
          {page.subtitle && (
            <p className="text-xs text-[var(--sf-text-muted)] mt-0.5 hidden sm:block font-medium">
              {page.subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <form data-testid="form-elt-4" onSubmit={handleSearch} className="relative hidden md:block">
          <input data-testid="input-elt-5"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search surveys…"
            className="input pl-9 pr-4 py-1.5 w-44 focus:w-60 transition-all duration-300"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </form>

        {/* Dark mode toggle (desktop) */}
        <button data-testid="button-elt-6"
          onClick={toggle}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 rounded-xl text-gray-500 dark:text-gray-400
            hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
        >
          {isDark ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* Live notification bell */}
        <NotificationBell />
      </div>
    </header>
  )
}
