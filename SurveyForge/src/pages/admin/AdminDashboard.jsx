/**
 * pages/admin/AdminDashboard.jsx — Admin Dashboard
 * Tabbed view: Overview stats, Users management, Surveys management
 */
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  getAdminUsers, deleteAdminUser, patchAdminUserRole,
  getAdminSurveys, deleteAdminSurvey, getAdminAnalytics,
  getAdminBilling, getAdminActivityLogs,
} from '../../services/api'
import { useApp } from '../../context/AppContext'

const TABS = ['Overview', 'Users', 'Surveys']

/* ── Helpers ─────────────────────────────────────────────── */
function fmt(n) { return Number(n ?? 0).toLocaleString() }
function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

/* ── Stat Card ───────────────────────────────────────────── */
function StatCard({ label, value, icon, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#16161f] rounded-2xl p-5 border border-gray-100 dark:border-[#1e1e2e] shadow-sm flex items-center gap-4"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{fmt(value)}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
      </div>
    </motion.div>
  )
}

/* ── Role Badge ──────────────────────────────────────────── */
function RoleBadge({ role }) {
  return role === 'admin'
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">🛡 Admin</span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400">👤 User</span>
}

/* ── Confirm Dialog ──────────────────────────────────────── */
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-[#1a1a27] rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-gray-200 dark:border-[#2a2a3e]"
      >
        <p className="text-gray-800 dark:text-gray-200 text-sm font-medium mb-5">{message}</p>
        <div className="flex gap-3 justify-end">
          <button data-testid="button-elt-25"
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
          >Cancel</button>
          <button data-testid="button-elt-26"
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all"
          >Delete</button>
        </div>
      </motion.div>
    </div>
  )
}

/* ── Overview Tab ────────────────────────────────────────── */
function OverviewTab({ analytics, billing, activities }) {
  if (!analytics) return <div className="text-gray-400 text-sm">Loading…</div>
  const { totals, recentUsers, topSurveys } = analytics

  return (
    <div className="space-y-6 pb-24">
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users"     value={totals?.total_users}     icon="👥" color="bg-blue-500" />
        <StatCard label="Surveys"         value={totals?.total_surveys}   icon="📋" color="bg-violet-500" />
        <StatCard label="Total Responses" value={totals?.total_responses} icon="💬" color="bg-emerald-500" />
        <StatCard label="Admin Accounts"  value={totals?.total_admins}    icon="🛡" color="bg-amber-500" />
      </div>

      {billing && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Revenue (INR)"   value={billing.revenue_inr}   icon="💰" color="bg-emerald-600" />
          <StatCard label="Paid Users"      value={billing.paid_users}    icon="⭐" color="bg-pink-500" />
          <StatCard label="Active Users"    value={billing.active_users}  icon="✓" color="bg-cyan-500" />
          <StatCard label="Payments"        value={billing.payment_count} icon="🧾" color="bg-indigo-500" />
        </div>
      )}

      {/* Recent users */}
      <div className="bg-white dark:bg-[#16161f] rounded-2xl border border-gray-100 dark:border-[#1e1e2e] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-[#1e1e2e]">
          <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Recent Users</h3>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-[#1e1e2e]">
          {(recentUsers ?? []).slice(0, 5).map(u => (
            <div key={u.id} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {u.name?.charAt(0)?.toUpperCase() ?? 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
              </div>
              <RoleBadge role={u.role} />
            </div>
          ))}
        </div>
      </div>

      {/* Top surveys */}
      {(topSurveys ?? []).length > 0 && (
        <div className="bg-white dark:bg-[#16161f] rounded-2xl border border-gray-100 dark:border-[#1e1e2e] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-[#1e1e2e]">
            <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Top Surveys by Responses</h3>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-[#1e1e2e]">
            {topSurveys.map((s, i) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-300 dark:text-gray-600 w-5">#{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{s.title}</p>
                    <p className="text-xs text-gray-400">{s.owner_name ?? 'Unknown'}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-violet-600 dark:text-violet-400">{fmt(s.response_count)} resp.</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Audit Trail */}
      <div className="bg-white dark:bg-[#16161f] rounded-2xl border border-gray-100 dark:border-[#1e1e2e] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-[#1e1e2e] flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 dark:text-white text-sm">Recent System Activities</h3>
          <Link
            to="/admin/activity"
            className="text-xs text-violet-600 dark:text-violet-400 font-semibold hover:underline"
          >
            View all logs →
          </Link>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-[#1e1e2e]">
          {(!activities || activities.length === 0) ? (
            <div className="px-5 py-6 text-center text-xs text-gray-400">
              No recent activity recorded
            </div>
          ) : (
            activities.slice(0, 5).map(log => {
              const formatTime = (timeStr) => {
                if (!timeStr) return ''
                try {
                  const d = new Date(timeStr.replace(' ', 'T'))
                  if (isNaN(d.getTime())) return timeStr
                  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                } catch (_) { return timeStr }
              }
              const getModuleBadgeColor = (mod) => {
                switch (String(mod).toLowerCase()) {
                  case 'auth': return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                  case 'surveys': return 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
                  case 'responses': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                  case 'ai': return 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300'
                  case 'billing': return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
                  case 'admin': return 'bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300'
                  default: return 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                }
              }
              return (
                <div key={log.id} className="flex items-center justify-between px-5 py-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm shrink-0">
                      {log.action.includes('login') ? '🔑' : log.action.includes('delete') ? '🗑️' : log.action.includes('change') ? '✏️' : '⚡'}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {log.action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">
                        By: <span className="text-gray-600 dark:text-gray-300 font-medium">{log.who}</span> | Target: {log.target || '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getModuleBadgeColor(log.module)}`}>
                      {log.module || 'general'}
                    </span>
                    <span className="text-gray-400 dark:text-gray-500 font-medium font-mono text-[10px]">
                      {formatTime(log.created_at)}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Users Tab ───────────────────────────────────────────── */
function UsersTab({ users, currentUserId, onDelete, onRoleChange }) {
  return (
    <div className="bg-white dark:bg-[#16161f] rounded-2xl border border-gray-100 dark:border-[#1e1e2e] shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-[#1e1e2e] flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 dark:text-white text-sm">All Users ({users.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-white/5 text-left">
              <th className="px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">User</th>
              <th className="px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Role</th>
              <th className="px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Joined</th>
              <th className="px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-[#1e1e2e]">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {u.name?.charAt(0)?.toUpperCase() ?? 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3"><RoleBadge role={u.role} /></td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    u.verified
                      ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
                  }`}>
                    {u.verified ? '✓ Verified' : '⏳ Pending'}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs">{fmtDate(u.created_at)}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    {u.id !== currentUserId && (
                      <>
                        <button data-testid="button-elt-27"
                          onClick={() => onRoleChange(u.id, u.role === 'admin' ? 'user' : 'admin')}
                          title={u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-violet-50 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-500/30 transition-all"
                        >
                          {u.role === 'admin' ? '↓ Demote' : '↑ Promote'}
                        </button>
                        <button data-testid="button-elt-28"
                          onClick={() => onDelete(u.id, u.email)}
                          title="Delete user"
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/30 transition-all"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {u.id === currentUserId && (
                      <span className="text-xs text-gray-400 italic">You</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Surveys Tab ─────────────────────────────────────────── */
function SurveysTab({ surveys, onDelete }) {
  return (
    <div className="bg-white dark:bg-[#16161f] rounded-2xl border border-gray-100 dark:border-[#1e1e2e] shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-[#1e1e2e]">
        <h3 className="font-semibold text-gray-800 dark:text-white text-sm">All Surveys ({surveys.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-white/5 text-left">
              <th className="px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Survey</th>
              <th className="px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Owner</th>
              <th className="px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Questions</th>
              <th className="px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Responses</th>
              <th className="px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Created</th>
              <th className="px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-[#1e1e2e]">
            {surveys.map(s => (
              <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-5 py-3">
                  <p className="font-medium text-gray-800 dark:text-gray-200 max-w-xs truncate">{s.title}</p>
                </td>
                <td className="px-5 py-3">
                  <p className="text-gray-700 dark:text-gray-300">{s.owner_name ?? '—'}</p>
                  <p className="text-xs text-gray-400">{s.owner_email ?? '—'}</p>
                </td>
                <td className="px-5 py-3 text-gray-600 dark:text-gray-400">{fmt(s.question_count)}</td>
                <td className="px-5 py-3">
                  <span className="font-semibold text-violet-600 dark:text-violet-400">{fmt(s.response_count)}</span>
                </td>
                <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs">{fmtDate(s.created_at)}</td>
                <td className="px-5 py-3">
                  <button data-testid="button-elt-29"
                    onClick={() => onDelete(s.id, s.title)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/30 transition-all"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {surveys.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400 text-sm">No surveys found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Main Component ──────────────────────────────────────── */
export default function AdminDashboard() {
  const { user } = useApp()
  const [activeTab, setActiveTab] = useState('Overview')
  const [analytics, setAnalytics] = useState(null)
  const [billing,   setBilling]   = useState(null)
  const [users,     setUsers]     = useState([])
  const [surveys,   setSurveys]   = useState([])
  const [activities, setActivities] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [confirm,   setConfirm]   = useState(null) // { type, id, label }

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [analyticsRes, usersRes, surveysRes, billingRes, logsRes] = await Promise.all([
        getAdminAnalytics(),
        getAdminUsers(),
        getAdminSurveys(),
        getAdminBilling().catch(() => ({ success: false })),
        getAdminActivityLogs().catch(() => ({ success: false, data: [] })),
      ])
      if (analyticsRes.success) setAnalytics(analyticsRes.data)
      if (usersRes.success)     setUsers(usersRes.data ?? usersRes.users)
      if (surveysRes.success)   setSurveys(surveysRes.data ?? surveysRes.surveys)
      if (billingRes.success)   setBilling(billingRes.data)
      if (logsRes.success)      setActivities(logsRes.data || [])
    } catch (err) {
      toast.error('Failed to load admin data')
      console.error('[AdminDashboard]', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  /* ── Handlers ── */
  const handleDeleteUser = (id, email) => {
    setConfirm({ type: 'user', id, label: `Delete user "${email}"? This will also remove all their surveys and data.` })
  }

  const handleDeleteSurvey = (id, title) => {
    setConfirm({ type: 'survey', id, label: `Delete survey "${title}"? All responses will be permanently removed.` })
  }

  const handleConfirm = async () => {
    const { type, id } = confirm
    setConfirm(null)
    try {
      if (type === 'user') {
        await deleteAdminUser(id)
        toast.success('User deleted')
        setUsers(prev => prev.filter(u => u.id !== id))
      } else {
        await deleteAdminSurvey(id)
        toast.success('Survey deleted')
        setSurveys(prev => prev.filter(s => s.id !== id))
      }
      // Refresh analytics
      const res = await getAdminAnalytics()
      if (res.success) setAnalytics(res.data)
    } catch (err) {
      toast.error(err?.response?.data?.error ?? 'Action failed')
    }
  }

  const handleRoleChange = async (id, newRole) => {
    try {
      const res = await patchAdminUserRole(id, newRole)
      if (res.success) {
        toast.success(res.message)
        setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u))
        // Refresh analytics (admin count changes)
        const ar = await getAdminAnalytics()
        if (ar.success) setAnalytics(ar.data)
      }
    } catch (err) {
      toast.error(err?.response?.data?.error ?? 'Failed to update role')
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white text-2xl shadow-lg shadow-violet-500/30">
          🛡
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage users, surveys, and system analytics
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/10 rounded-xl p-1 w-fit">
        {TABS.map(tab => (
          <button data-testid="button-elt-30"
            key={tab}
            id={`admin-tab-${tab.toLowerCase()}`}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab
                ? 'bg-white dark:bg-[#1a1a27] text-violet-600 dark:text-violet-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'Overview' && <OverviewTab analytics={analytics} billing={billing} activities={activities} />}
            {activeTab === 'Users'    && (
              <UsersTab
                users={users}
                currentUserId={user?.id}
                onDelete={handleDeleteUser}
                onRoleChange={handleRoleChange}
              />
            )}
            {activeTab === 'Surveys'  && (
              <SurveysTab surveys={surveys} onDelete={handleDeleteSurvey} />
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Confirm dialog */}
      {confirm && (
        <ConfirmDialog
          message={confirm.label}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
