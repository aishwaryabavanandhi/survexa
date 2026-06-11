/**
 * Survexa — product screen map (spec ↔ implementation).
 * 50 logical surfaces: routes, settings tabs, major sections, and shell components.
 * Use for QA checklists; not imported by runtime UI unless needed.
 */

/** @typedef {'page' | 'public' | 'auth' | 'settings-tab' | 'section' | 'component'} ScreenKind */

/**
 * @type {Array<{
 *   id: string
 *   label: string
 *   path: string
 *   kind: ScreenKind
 *   note?: string
 * }>}
 */
export const SURVEYFORGE_SCREENS = [
  { id: 'auth-01', label: 'Splash', path: '/splash', kind: 'auth' },
  { id: 'auth-02', label: 'Welcome / marketing', path: '/welcome', kind: 'auth' },
  { id: 'auth-03', label: 'Sign in', path: '/login', kind: 'auth' },
  { id: 'auth-04', label: 'Sign up', path: '/signup', kind: 'auth' },
  { id: 'auth-05', label: 'Forgot password', path: '/forgot-password', kind: 'auth' },
  { id: 'auth-06', label: 'Reset password', path: '/reset-password', kind: 'auth' },
  { id: 'auth-07', label: 'OTP verification', path: '/otp', kind: 'auth' },
  { id: 'onb-01', label: 'Guided onboarding', path: '/onboarding', kind: 'auth', note: 'Post-auth preferences' },
  { id: 'pub-01', label: 'Take survey (respondent)', path: '/survey/:token', kind: 'public' },

  { id: 'app-01', label: 'Dashboard home', path: '/dashboard', kind: 'page' },
  { id: 'app-02', label: 'Create survey hub', path: '/create', kind: 'page', note: 'Blank · template · AI' },
  { id: 'app-03', label: 'Template gallery', path: '/templates', kind: 'page' },
  { id: 'app-04', label: 'My surveys', path: '/surveys', kind: 'page' },
  { id: 'app-05', label: 'Survey builder (new)', path: '/surveys/builder', kind: 'page' },
  { id: 'app-06', label: 'Survey builder (edit)', path: '/surveys/builder/:id', kind: 'page' },
  { id: 'app-07', label: 'Share & publish', path: '/surveys/:surveyId/share', kind: 'page', note: 'Link, QR, embed' },
  { id: 'app-08', label: 'Trash / archive', path: '/trash', kind: 'page', note: 'Placeholder until API' },
  { id: 'app-09', label: 'AI question generator', path: '/ai-generator', kind: 'page' },

  { id: 'data-01', label: 'Responses inbox', path: '/responses', kind: 'page' },
  { id: 'data-02', label: 'Response detail', path: '/responses/:id', kind: 'page' },
  { id: 'data-03', label: 'Analytics', path: '/analytics', kind: 'page' },
  { id: 'data-04', label: 'AI insights', path: '/insights', kind: 'page' },
  { id: 'data-05', label: 'Reports & export', path: '/reports', kind: 'page' },
  { id: 'data-06', label: 'Compare surveys', path: '/compare', kind: 'page', note: 'Stub for A/B views' },
  { id: 'data-07', label: 'Live results', path: '/live', kind: 'page', note: 'Stub for presentation mode' },

  { id: 'sys-01', label: 'Notification center', path: '/notifications', kind: 'page' },
  { id: 'sys-02', label: 'Notification bell', path: '(topbar)', kind: 'component', note: 'Dropdown' },
  { id: 'sys-03', label: 'Activity log', path: '/activity', kind: 'page', note: 'Workspace audit trail stub' },
  { id: 'sys-04', label: "What's new", path: '/discover', kind: 'page', note: 'Release highlights' },
  { id: 'sys-05', label: 'Help center', path: '/help', kind: 'page' },

  { id: 'set-01', label: 'Settings — profile', path: '/settings/profile', kind: 'settings-tab' },
  { id: 'set-02', label: 'Settings — team', path: '/settings/team', kind: 'settings-tab' },
  { id: 'set-03', label: 'Settings — billing', path: '/settings/billing', kind: 'settings-tab' },
  { id: 'set-04', label: 'Settings — integrations', path: '/settings/integrations', kind: 'settings-tab' },
  { id: 'set-05', label: 'Settings — security', path: '/settings/security', kind: 'settings-tab' },
  { id: 'set-06', label: 'Settings — branding', path: '/settings/branding', kind: 'settings-tab' },

  { id: 'adm-01', label: 'Admin console', path: '/admin', kind: 'page', note: 'Admin role only' },

  { id: 'bld-01', label: 'Question list & reorder', path: '/surveys/builder/:id', kind: 'section', note: 'Builder tab/section' },
  { id: 'bld-02', label: 'Question editor', path: '/surveys/builder/:id', kind: 'section' },
  { id: 'bld-03', label: 'Logic & branching', path: '/surveys/builder/:id', kind: 'section', note: 'Future: conditional logic UI' },
  { id: 'bld-04', label: 'Theme / appearance', path: '/settings/branding', kind: 'section', note: 'Org-wide look' },
  { id: 'bld-05', label: 'Preview before publish', path: '/surveys/builder/:id', kind: 'section' },

  { id: 'ana-01', label: 'Funnel / completion', path: '/analytics', kind: 'section' },
  { id: 'ana-02', label: 'Question breakdown', path: '/analytics', kind: 'section' },

  { id: 'rep-01', label: 'PDF report', path: '/reports', kind: 'section' },
  { id: 'rep-02', label: 'Email scheduled report', path: '/reports', kind: 'section' },

  { id: 'mob-01', label: 'Mobile bottom navigation', path: '(layout)', kind: 'component' },

  { id: 'misc-01', label: 'Search surveys (top bar)', path: '/surveys?q=', kind: 'section' },
  { id: 'misc-02', label: 'Catch-all / deep link guard', path: '*', kind: 'auth', note: 'CatchAllNavigate' },
  { id: 'misc-03', label: 'Team invite modal', path: '/settings/team', kind: 'section', note: 'Invite member dialog' },
]

export function screenCount() {
  return SURVEYFORGE_SCREENS.length
}
