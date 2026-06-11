import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useApp }  from '../../context/AppContext'
import Button from '../../components/ui/Button'
import Input  from '../../components/ui/Input'
import Modal  from '../../components/ui/Modal'
import survexaLogo from '../../assets/survexa_logo.png'

const TABS = ['Profile', 'Team', 'Billing', 'Integrations', 'Security', 'Branding']

const TAB_SLUGS = TABS.map((t) => t.toLowerCase())

function tabFromSlug(slug) {
  if (!slug) return 'Profile'
  const i = TAB_SLUGS.indexOf(String(slug).toLowerCase())
  return i >= 0 ? TABS[i] : null
}

const JOB_ROLES = [
  'Product Manager',
  'Researcher',
  'Marketing',
  'Sales',
  'Customer Success',
  'Engineering',
  'Design',
  'Operations',
  'Other',
]

const TEAM_MEMBERS = [
  { id: 1, name: 'Admin User',  email: 'admin@survexa.io', role: 'Admin',  avatar: 'A' },
  { id: 2, name: 'Jane Smith',  email: 'jane@survexa.io',  role: 'Editor', avatar: 'J' },
  { id: 3, name: 'Bob Johnson', email: 'bob@survexa.io',   role: 'Viewer', avatar: 'B' },
]

const INTEGRATIONS = [
  { name: 'Slack',         icon: '💬', desc: 'Get notified in Slack on new responses.',  connected: true  },
  { name: 'Google Sheets', icon: '📊', desc: 'Auto-sync responses to a spreadsheet.',    connected: false },
  { name: 'Zapier',        icon: '⚡', desc: 'Connect to 5,000+ apps via Zapier.',       connected: false },
  { name: 'Mailchimp',     icon: '✉️', desc: 'Sync respondents to your email lists.',    connected: true  },
]

export default function Settings() {
  const { tab: tabParam }               = useParams()
  const navigate                      = useNavigate()
  const { user, logout, updateProfile } = useApp()

  const tab = useMemo(() => {
    const t = tabFromSlug(tabParam)
    return t ?? 'Profile'
  }, [tabParam])

  useEffect(() => {
    if (String(tabParam).toLowerCase() === 'billing') {
      navigate('/billing', { replace: true })
    } else if (tabParam && !tabFromSlug(tabParam)) {
      navigate('/settings/profile', { replace: true })
    }
  }, [tabParam, navigate])
  const [inviteOpen, setInviteOpen]   = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')

  // Controlled profile form state
  const [profileName, setProfileName] = useState('')
  const [profileOrg,  setProfileOrg]  = useState('')
  const [profileRole, setProfileRole] = useState('Product Manager')
  const [saving,      setSaving]      = useState(false)
  const [saveStatus,  setSaveStatus]  = useState(null) // 'success' | 'error' | null
  const [saveError,   setSaveError]   = useState('')

  // Sync form from user context whenever it loads / changes
  useEffect(() => {
    if (user) {
      setProfileName(user.name         ?? '')
      setProfileOrg(user.organization  ?? '')
      setProfileRole(user.job_role     || 'Product Manager')
    }
  }, [user])

  const handleSave = async () => {
    if (!profileName.trim()) {
      setSaveStatus('error')
      setSaveError('Full name is required.')
      return
    }
    setSaving(true)
    setSaveStatus(null)
    const result = await updateProfile({
      name:         profileName.trim(),
      organization: profileOrg.trim(),
      job_role:     profileRole,
    })
    setSaving(false)
    if (result.success) {
      setSaveStatus('success')
      setTimeout(() => setSaveStatus(null), 3000)
    } else {
      setSaveStatus('error')
      setSaveError(result.error ?? 'Could not save profile.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your account and workspace</p>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 bg-gray-100 dark:bg-[#1e1e2e] rounded-xl p-1 w-fit max-w-full">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              if (t === 'Billing') {
                navigate('/billing')
              } else {
                navigate(`/settings/${t.toLowerCase()}`)
              }
            }}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all
              ${tab === t
                ? 'bg-white dark:bg-[#252535] text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Profile tab ── */}
      {tab === 'Profile' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-[#16161f] rounded-2xl border border-gray-100 dark:border-[#2a2a3a] shadow-sm p-6 space-y-5">
            {/* Avatar + current info */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600
                              flex items-center justify-center text-white text-3xl font-bold shadow-md shrink-0">
                {(profileName || user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-800 dark:text-gray-100 text-lg">{user?.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                <Button variant="secondary" size="sm" className="mt-2">Change Photo</Button>
              </div>
            </div>

            {/* Form fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-[#2a2a3a]">
              {/* Full Name */}
              <div>
                <label htmlFor="profile-name"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="profile-name"
                  value={profileName}
                  onChange={(e) => { setProfileName(e.target.value); setSaveStatus(null) }}
                  className="input"
                  placeholder="Your full name"
                />
              </div>

              {/* Email — read-only */}
              <div>
                <label htmlFor="profile-email"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Email{' '}
                  <span className="text-xs font-normal text-gray-400">(cannot be changed)</span>
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={user?.email ?? ''}
                  readOnly
                  className="input opacity-60 cursor-not-allowed bg-gray-50 dark:bg-[#252535]"
                />
              </div>

              {/* Organization */}
              <div>
                <label htmlFor="profile-org"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Organization
                </label>
                <input
                  id="profile-org"
                  value={profileOrg}
                  onChange={(e) => { setProfileOrg(e.target.value); setSaveStatus(null) }}
                  className="input"
                  placeholder="Your company name"
                />
              </div>

              {/* Job Role */}
              <div>
                <label htmlFor="profile-role"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Job Role
                </label>
                <select
                  id="profile-role"
                  value={profileRole}
                  onChange={(e) => { setProfileRole(e.target.value); setSaveStatus(null) }}
                  className="w-full border border-gray-200 dark:border-[#2d2d3d] rounded-xl px-4 py-2.5 text-sm
                             bg-white dark:bg-[#1e1e2e] text-gray-800 dark:text-gray-200
                             focus:outline-none focus:ring-2 focus:ring-primary-400"
                >
                  {JOB_ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>

            {/* Save button + status */}
            <div className="flex items-center justify-end gap-3 pt-1">
              {saveStatus === 'success' && (
                <p className="text-sm text-green-600 font-medium">✅ Profile saved</p>
              )}
              {saveStatus === 'error' && (
                <p className="text-sm text-red-500 font-medium">{saveError}</p>
              )}
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white dark:bg-[#16161f] rounded-2xl border border-gray-100 dark:border-[#2a2a3a] shadow-sm p-6">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4 text-sm">Notification Preferences</h3>
            <div className="space-y-3">
              {[
                'Email me on new response',
                'Weekly analytics digest',
                'Survey completion alerts',
                'AI insight reports',
              ].map((item) => (
                <label key={item} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                  <div className="relative">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer-checked:bg-primary-500 transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow
                                    peer-checked:translate-x-5 transition-transform" />
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Danger zone */}
          <div className="bg-white dark:bg-[#16161f] rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm p-6">
            <h3 className="font-bold text-red-500 text-sm mb-1">Danger Zone</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">These actions are irreversible.</p>
            <div className="flex gap-3 flex-wrap">
              <Button variant="danger" size="sm">Delete Account</Button>
              <Button variant="secondary" size="sm" onClick={logout}>Logout</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Team tab ── */}
      {tab === 'Team' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-[#16161f] rounded-2xl border border-gray-100 dark:border-[#2a2a3a] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#2a2a3a]">
              <h3 className="font-bold text-gray-800 dark:text-gray-200">Team Members ({TEAM_MEMBERS.length})</h3>
              <Button size="sm" onClick={() => setInviteOpen(true)}>＋ Invite Member</Button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-[#1e1e2e] border-b border-gray-100 dark:border-[#2a2a3a]">
                <tr className="text-left text-gray-500 dark:text-gray-400">
                  <th className="px-6 py-3 font-medium">Member</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-[#2a2a3a]">
                {TEAM_MEMBERS.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-[#1e1e2e]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600
                                        flex items-center justify-center text-white text-sm font-bold">
                          {m.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">{m.name}</p>
                          <p className="text-xs text-gray-400">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select defaultValue={m.role}
                        className="text-xs border border-gray-200 dark:border-[#2d2d3d] rounded-lg px-2 py-1.5
                                   bg-white dark:bg-[#1e1e2e] text-gray-700 dark:text-gray-300
                                   focus:outline-none focus:ring-2 focus:ring-primary-400">
                        <option>Admin</option><option>Editor</option><option>Viewer</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-600">Remove</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite Team Member">
            <div className="space-y-4">
              <Input id="invite-email" label="Email address" type="email" placeholder="colleague@company.com"
                value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Role</label>
                <select className="w-full border border-gray-200 dark:border-[#2d2d3d] rounded-xl px-4 py-2.5 text-sm
                                   bg-white dark:bg-[#1e1e2e] text-gray-800 dark:text-gray-200
                                   focus:outline-none focus:ring-2 focus:ring-primary-400">
                  <option>Editor</option><option>Viewer</option><option>Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setInviteOpen(false)}>Cancel</Button>
                <Button onClick={() => setInviteOpen(false)}>Send Invite</Button>
              </div>
            </div>
          </Modal>
        </div>
      )}

      {/* ── Billing tab ── */}
      {tab === 'Billing' && (
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-6 text-white">
            <p className="text-sm text-primary-200 font-medium mb-1">Current Plan</p>
            <h3 className="text-2xl font-extrabold">Pro Plan</h3>
            <p className="text-primary-200 text-sm mt-1">$29 / month · Renews June 1, 2026</p>
            <Button variant="secondary" size="sm" className="mt-4">Manage Subscription</Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { plan: 'Starter',    price: 'Free',    features: ['5 surveys', '100 responses/mo', 'Basic analytics'] },
              { plan: 'Pro',        price: '$29/mo',  features: ['Unlimited surveys', '10,000 responses/mo', 'AI insights', 'Custom branding'], active: true },
              { plan: 'Enterprise', price: 'Custom',  features: ['Unlimited everything', 'SSO', 'Dedicated support', 'SLA'] },
            ].map((p) => (
              <div key={p.plan}
                className={`rounded-2xl border p-5 ${p.active
                  ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-[#2a2a3a] bg-white dark:bg-[#16161f]'}`}>
                <p className="font-extrabold text-gray-900 dark:text-white text-lg">{p.plan}</p>
                <p className={`text-2xl font-extrabold mt-1 ${p.active ? 'text-primary-600' : 'text-gray-800 dark:text-gray-200'}`}>
                  {p.price}
                </p>
                <ul className="mt-3 space-y-1.5">
                  {p.features.map((f) => (
                    <li key={f} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                      <span className="text-green-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
                {!p.active && <Button size="sm" fullWidth className="mt-4" variant={p.plan === 'Enterprise' ? 'secondary' : 'primary'}>
                  {p.plan === 'Enterprise' ? 'Contact Sales' : 'Upgrade'}
                </Button>}
                {p.active && <p className="text-xs text-primary-600 font-semibold mt-4">✓ Current plan</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Integrations tab ── */}
      {tab === 'Integrations' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {INTEGRATIONS.map((intg) => (
            <div key={intg.name}
              className="bg-white dark:bg-[#16161f] rounded-2xl border border-gray-100 dark:border-[#2a2a3a] shadow-sm p-5 flex items-start gap-4">
              <span className="text-3xl">{intg.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-gray-800 dark:text-gray-200">{intg.name}</p>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                    ${intg.connected
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-[#2a2a3a] dark:text-gray-400'}`}>
                    {intg.connected ? 'Connected' : 'Not connected'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{intg.desc}</p>
                <Button size="sm" variant={intg.connected ? 'secondary' : 'primary'} className="mt-3">
                  {intg.connected ? 'Disconnect' : 'Connect'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Security tab ── */}
      {tab === 'Security' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-[#16161f] rounded-2xl border border-gray-100 dark:border-[#2a2a3a] shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">Password</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Use a strong password and rotate it periodically.
            </p>
            <Link to="/forgot-password" className="inline-flex">
              <Button variant="secondary" size="sm">Reset password via email</Button>
            </Link>
          </div>

          <div className="bg-white dark:bg-[#16161f] rounded-2xl border border-gray-100 dark:border-[#2a2a3a] shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">Two-factor authentication</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Authenticator apps and passkeys will connect here.</p>
            <Button variant="secondary" size="sm" disabled>Enable 2FA (coming soon)</Button>
          </div>

          <div className="bg-white dark:bg-[#16161f] rounded-2xl border border-gray-100 dark:border-[#2a2a3a] shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">API keys</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Programmatic access for exports and webhooks. Keys are scoped to this workspace.
            </p>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-gray-50 dark:bg-[#1e1e2e] px-3 py-2 rounded-lg border border-gray-100 dark:border-[#2a2a3a] flex-1 truncate">
                sf_live_••••••••••••••••
              </code>
              <Button size="sm" variant="secondary" disabled>Rotate</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Branding tab ── */}
      {tab === 'Branding' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-[#16161f] rounded-2xl border border-gray-100 dark:border-[#2a2a3a] shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">Logo</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Shown on shared survey headers and emails.</p>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#2a2a3a] border border-gray-100 dark:border-gray-700 flex items-center justify-center p-2 shadow-sm">
                <img src={survexaLogo} alt="Survexa Logo" className="w-full h-full object-contain" />
              </div>
              <Button variant="secondary" size="sm" disabled>Upload logo</Button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#16161f] rounded-2xl border border-gray-100 dark:border-[#2a2a3a] shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">Accent color</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Primary buttons and progress on hosted forms.</p>
            <div className="flex flex-wrap items-center gap-3">
              <input type="color" defaultValue="#B8A4E8" className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer" aria-label="Accent" />
              <span className="text-sm font-mono text-gray-600 dark:text-gray-300">#B8A4E8</span>
              <Button size="sm" disabled>Save</Button>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-gray-200 dark:border-[#2a2a3a] p-5 text-sm text-gray-500 dark:text-gray-400">
            Preview: shared links will pick up these tokens when the embed pipeline is connected to the backend theme API.
          </div>
        </div>
      )}
    </div>
  )
}
