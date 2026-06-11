import { useState, useEffect } from 'react'
import { getActivityLogs } from '../../services/api'
import toast from 'react-hot-toast'
import Spinner from '../../components/ui/Spinner'

export default function ActivityLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getActivityLogs()
      .then((res) => {
        if (res.success) {
          setLogs(res.data || [])
        } else {
          toast.error('Failed to load activity logs')
        }
      })
      .catch((err) => {
        toast.error(err.message || 'Failed to connect to server')
      })
      .finally(() => setLoading(false))
  }, [])

  const getModuleBadgeColor = (mod) => {
    switch (String(mod).toLowerCase()) {
      case 'auth':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
      case 'surveys':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
      case 'responses':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800'
      case 'ai':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800'
      case 'billing':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800'
      case 'admin':
        return 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
    }
  }

  const getActionLabel = (act) => {
    return String(act)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }

  const getActionIcon = (act) => {
    const a = String(act).toLowerCase()
    if (a.includes('login')) return '🔑'
    if (a.includes('logout')) return '🚪'
    if (a.includes('signup') || a.includes('register')) return '👤'
    if (a.includes('create')) return '＋'
    if (a.includes('edit')) return '✏️'
    if (a.includes('publish')) return '📣'
    if (a.includes('duplicate')) return '👯'
    if (a.includes('restore')) return '♻️'
    if (a.includes('delete')) return '🗑️'
    if (a.includes('response')) return '💬'
    if (a.includes('ai_')) return '🤖'
    if (a.includes('pdf') || a.includes('report')) return '📊'
    if (a.includes('upgrade') || a.includes('approve')) return '⭐'
    return '⚡'
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return ''
    try {
      const d = new Date(timeStr.replace(' ', 'T'))
      if (isNaN(d.getTime())) return timeStr
      return d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (_) {
      return timeStr
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Activity Log</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Recent actions and events tracked in your workspace.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      ) : logs.length === 0 ? (
        <div className="card p-12 text-center text-gray-500 dark:text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-semibold text-sm">No activity recorded yet</p>
          <p className="text-xs text-gray-400 mt-1">Actions you perform in the app will show up here.</p>
        </div>
      ) : (
        <div className="card overflow-hidden divide-y divide-gray-100 dark:divide-[#2a2a3a]">
          {logs.map((log) => {
            let metaObj = {}
            try {
              if (log.metadata) {
                metaObj = typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata
              }
            } catch (_) {}

            return (
              <div key={log.id} className="p-4 flex items-start sm:items-center justify-between gap-4 text-sm hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm text-base">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {getActionLabel(log.action)}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getModuleBadgeColor(log.module)}`}>
                        {log.module || 'General'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                      <span>Target: <strong className="text-gray-700 dark:text-gray-300">{log.target || '—'}</strong></span>
                      {log.target_id && <span className="text-[10px] font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded text-gray-400">ID: {log.target_id}</span>}
                    </p>
                    {Object.keys(metaObj).length > 0 && (
                      <div className="mt-2 text-[10px] font-mono bg-gray-50 dark:bg-gray-950 p-2 rounded-lg text-gray-500 max-w-md overflow-x-auto border border-gray-100 dark:border-gray-900">
                        {Object.entries(metaObj).map(([k, v]) => (
                          <div key={k} className="flex gap-2">
                            <span className="text-primary-600 dark:text-primary-400">{k}:</span>
                            <span className="truncate">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-medium text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {formatTime(log.created_at)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
