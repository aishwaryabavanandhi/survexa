/**
 * pages/dashboard/Dashboard.jsx — Real-time dashboard using Supabase Realtime
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import api, { getSurveys, getActivityLogs } from '../../services/api'
import { useApp } from '../../context/AppContext'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { SkeletonDashboard } from '../../components/ui/Skeleton'
import { supabase } from '../../lib/supabase'

const SUPABASE_LIVE =
  import.meta.env.VITE_SUPABASE_URL &&
  !import.meta.env.VITE_SUPABASE_URL.includes('your-supabase')

/* ── Animation variants ──────────────────────────── */
const container = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.35, ease: [0.4,0,0.2,1] } },
}

/* ── Stat Card ───────────────────────────────────── */
function StatCard({ icon, label, value, trend, gradient }) {
  return (
    <motion.div variants={item}
      className="card p-5 flex flex-col gap-3 card-hover cursor-default select-none"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[var(--sf-text-muted)]">{label}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg
          bg-gradient-to-br ${gradient} shadow-lg`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-[var(--sf-text)] tracking-tight font-display">{value}</p>
        {trend && (
          <p className="text-xs font-medium text-green-500 dark:text-green-400 mt-1">
            ↑ {trend}
          </p>
        )}
      </div>
    </motion.div>
  )
}

/* ── Quick Action Card ───────────────────────────── */
function QuickAction({ to, icon, label, desc, gradient }) {
  return (
    <motion.div variants={item}>
      <Link to={to}
        className="card card-hover p-5 flex items-center gap-4 block"
      >
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient}
          flex items-center justify-center text-2xl shrink-0 shadow-md`}>
          {icon}
        </div>
        <div>
          <p className="font-semibold text-[var(--sf-text)] text-sm">{label}</p>
          <p className="text-xs text-[var(--sf-text-muted)] mt-0.5">{desc}</p>
        </div>
        <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 ml-auto shrink-0"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
        </svg>
      </Link>
    </motion.div>
  )
}

/* ── Quick Actions ───────────────────────────────── */
export default function Dashboard() {
  const { user } = useApp()
  const [surveys, setSurveys]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [sysStatus, setSysStatus] = useState(null) // from /health
  const [activities, setActivities] = useState([])
  const [activitiesLoading, setActivitiesLoading] = useState(true)

  // Fetch surveys and set up Realtime subscription to live updates
  useEffect(() => {
    if (!user?.id) return

    const fetchSurveys = () => {
      getSurveys()
        .then((res) => setSurveys(res.data ?? []))
        .catch(() => {
          setSurveys([])
          toast.error('Could not load dashboard data')
        })
        .finally(() => setLoading(false))
    }

    fetchSurveys()

    let pollId
    let channel

    if (SUPABASE_LIVE) {
      channel = supabase
        .channel('dashboard_responses_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'responses' },
          () => fetchSurveys(),
        )
        .subscribe()
    } else {
      pollId = setInterval(fetchSurveys, 15_000)
    }

    return () => {
      if (channel) supabase.removeChannel(channel)
      if (pollId) clearInterval(pollId)
    }
  }, [user?.id])

  // Fetch real config status from the backend health endpoint
  useEffect(() => {
    api.get('/health')
      .then((res) => setSysStatus(res.data?.config ?? null))
      .catch(() => setSysStatus(null))
  }, [])

  // Fetch recent activities
  useEffect(() => {
    if (!user?.id) return
    getActivityLogs()
      .then((res) => {
        if (res.success) {
          setActivities(res.data?.slice(0, 5) || [])
        }
      })
      .catch((err) => console.error('[Dashboard] error loading activities:', err))
      .finally(() => setActivitiesLoading(false))
  }, [user?.id])

  if (loading) return <SkeletonDashboard />

  /* Computed stats */
  const totalSurveys   = surveys.length
  const totalResponses = surveys.reduce((s, x) => s + (x.response_count ?? 0), 0)
  const totalQuestions = surveys.reduce((s, x) => s + (x.question_count ?? 0), 0)
  const activeSurveys  = surveys.filter((s) => (s.question_count ?? 0) > 0).length

  const recentSurveys = [...surveys]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)

  const getTimeAgo = (d) => {
    if (!d) return '—'
    const s = Math.floor((Date.now() - new Date(d)) / 1000)
    if (s < 3600)   return `${Math.floor(s / 60)}m ago`
    if (s < 86400)  return `${Math.floor(s / 3600)}h ago`
    return `${Math.floor(s / 86400)}d ago`
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? '🌤 Good morning' : hour < 17 ? '☀️ Good afternoon' : '🌙 Good evening'

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">

      {/* Header */}
      <motion.div variants={item} className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--sf-text)] tracking-tight font-display">
            {greeting}, {user?.name?.split(' ')[0] || 'User'}
          </h2>
          <p className="text-sm text-[var(--sf-text-secondary)] mt-1 font-medium">
            {totalSurveys > 0
              ? `You have ${totalSurveys} survey${totalSurveys !== 1 ? 's' : ''} with ${totalResponses} total responses.`
              : 'Welcome! Create your first survey to get started.'}
          </p>
        </div>
        <Link to="/create">
          <Button icon="＋">New Survey</Button>
        </Link>
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={container} initial="hidden" animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard icon="📋" label="Total Surveys"   value={totalSurveys}   gradient="from-pastel-lavender to-pastel-periwinkle" />
        <StatCard icon="💬" label="Total Responses" value={totalResponses} gradient="from-pastel-mint to-pastel-cyan"  trend={totalResponses > 0 ? `${totalResponses} collected` : null} />
        <StatCard icon="❓" label="Total Questions" value={totalQuestions} gradient="from-pastel-peach to-pastel-pink" />
        <StatCard icon="✅" label="Active Surveys"  value={activeSurveys}  gradient="from-pastel-cyan to-pastel-lavender"     />
      </motion.div>

      {/* Content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent surveys table */}
        <motion.div variants={item} className="xl:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-[var(--sf-text)] font-display">Recent Surveys</h3>
            <Link to="/surveys" className="text-xs text-primary-500 font-semibold hover:text-primary-600 transition-colors">
              View all →
            </Link>
          </div>

          {recentSurveys.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No surveys yet</p>
              <Link to="/surveys/builder" className="mt-4 inline-block">
                <Button size="sm">Create your first survey</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-100 dark:border-[#2a2a3a]">
                    {['Survey Name', 'Responses', 'Status', 'Created', ''].map((h) => (
                      <th key={h} className="pb-3 px-2 text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-[#1e1e2e]">
                  {recentSurveys.map((s) => (
                    <tr key={s.id} className="group hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">
                      <td className="py-3.5 px-2 font-semibold text-gray-800 dark:text-gray-200 max-w-[200px] truncate">
                        {s.title}
                      </td>
                      <td className="py-3.5 px-2">
                        <span className="font-bold text-gray-700 dark:text-gray-300">{s.response_count ?? 0}</span>
                      </td>
                      <td className="py-3.5 px-2">
                        <Badge status={(s.question_count ?? 0) > 0 ? 'Active' : 'Draft'} />
                      </td>
                      <td className="py-3.5 px-2 text-gray-400 dark:text-gray-600 text-xs whitespace-nowrap">
                        {getTimeAgo(s.created_at)}
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <Link to={`/surveys/builder/${s.id}`}
                          className="text-xs font-semibold text-primary-500 hover:text-primary-600
                            opacity-0 group-hover:opacity-100 transition-opacity">
                          Edit →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* System status panel */}
        <motion.div variants={item} className="card p-6 space-y-4">
          <h3 className="font-bold text-gray-800 dark:text-gray-100">System Status</h3>

          <div className="space-y-3">
            {[
              { label: 'Backend API',        ok: true,                       detail: 'Connected'   },
              { label: 'Supabase Database',  ok: true,                       detail: 'Ready'       },
              { label: 'OpenAI GPT-4',       ok: sysStatus?.openai ?? false,  detail: sysStatus?.openai ? 'Configured' : 'Configure .env' },
              { label: 'Email (SMTP)',       ok: sysStatus?.email  ?? false,  detail: sysStatus?.email  ? 'Configured' : 'Configure .env' },
            ].map(({ label, ok, detail }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-[#1e1e2e] last:border-0">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${ok ? 'bg-green-400' : 'bg-amber-400'} ${ok ? 'animate-pulse' : ''}`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                </div>
                <span className={`text-xs font-medium ${ok ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {ok ? '✓ ' : '⚠ '}{detail}
                </span>
              </div>
            ))}
          </div>

          {/* Quick stats mini */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-gray-400 dark:text-gray-600 uppercase tracking-wider mb-3">
              Quick Numbers
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Surveys',   value: totalSurveys   },
                { label: 'Responses', value: totalResponses  },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 dark:bg-[#1e1e2e] rounded-xl p-3 text-center">
                  <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{value}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activities Section */}
      <motion.div variants={item} className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-[var(--sf-text)] font-display flex items-center gap-2">
              <span>🕒</span> Recent Activity
            </h3>
            <p className="text-xs text-[var(--sf-text-muted)] mt-0.5">
              Your recent operations and workspace events
            </p>
          </div>
          <Link to="/activity" className="text-xs text-primary-500 font-semibold hover:text-primary-600 transition-colors">
            View all →
          </Link>
        </div>

        {activitiesLoading ? (
          <div className="py-6 text-center text-xs text-gray-400">Loading activity...</div>
        ) : activities.length === 0 ? (
          <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
            <p className="text-2xl mb-1">⚡</p>
            <p className="font-semibold text-xs">No activity logged yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-[#2a2a3a]">
            {activities.map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between gap-4 text-xs hover:bg-gray-50/30 dark:hover:bg-white/[0.01] transition-colors rounded-lg px-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-base shrink-0 select-none">
                    {act.action.includes('login') ? '🔑' : act.action.includes('logout') ? '🚪' : act.action.includes('create') ? '＋' : act.action.includes('edit') ? '✏️' : act.action.includes('response') ? '💬' : '⚡'}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {act.action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">
                      Target: <span className="text-gray-600 dark:text-gray-400 font-medium">{act.target || '—'}</span>
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 dark:text-gray-600 shrink-0 font-medium whitespace-nowrap">
                  {getTimeAgo(act.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick actions */}
      <motion.div variants={container} initial="hidden" animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        <QuickAction to="/create"          icon="✨" label="Create hub"     desc="Blank, template, or AI-assisted start" gradient="from-fuchsia-400 to-primary-600" />
        <QuickAction to="/ai-generator"    icon="🤖" label="AI Generator"   desc="Generate questions with GPT-4"       gradient="from-violet-400 to-primary-600" />
        <QuickAction to="/surveys/builder" icon="🔧" label="Survey Builder" desc="Build & configure your survey"         gradient="from-blue-400 to-cyan-500"      />
        <QuickAction to="/templates"      icon="📚" label="Templates"      desc="NPS, CSAT, events, and more"            gradient="from-emerald-400 to-teal-600"   />
        <QuickAction to="/distribution"    icon="📣" label="Distribution Hub" desc="WhatsApp, email, QR & campaign analytics" gradient="from-primary-400 to-indigo-600" />
        <QuickAction to="/analytics"       icon="📊" label="Analytics"      desc="Real-time data & visualizations"       gradient="from-amber-400 to-orange-500"   />
        <QuickAction to="/discover"       icon="🚀" label="What's new" desc="Shipped features and roadmap"         gradient="from-rose-400 to-pink-600"       />
      </motion.div>
    </motion.div>
  )
}
