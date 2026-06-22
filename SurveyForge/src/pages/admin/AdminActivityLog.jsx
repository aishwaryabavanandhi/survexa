import { useState, useEffect } from 'react'
import { getAdminActivityLogs } from '../../services/api'
import toast from 'react-hot-toast'
import Spinner from '../../components/ui/Spinner'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminActivityLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedModule, setSelectedModule] = useState('All')
  const [expandedLogId, setExpandedLogId] = useState(null)

  useEffect(() => {
    getAdminActivityLogs()
      .then((res) => {
        if (res.success) {
          setLogs(res.data || [])
        } else {
          toast.error('Failed to load system activity logs')
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
        minute: '2-digit',
        second: '2-digit',
      })
    } catch (_) {
      return timeStr
    }
  }

  const toggleExpandLog = (id) => {
    if (expandedLogId === id) {
      setExpandedLogId(null)
    } else {
      setExpandedLogId(id)
    }
  }

  // Filtering
  const filteredLogs = logs.filter((log) => {
    const whoMatch = String(log.who || '').toLowerCase().includes(searchTerm.toLowerCase())
    const actionMatch = String(log.action || '').toLowerCase().includes(searchTerm.toLowerCase())
    const targetMatch = String(log.target || '').toLowerCase().includes(searchTerm.toLowerCase())
    const searchMatch = whoMatch || actionMatch || targetMatch

    const moduleMatch = selectedModule === 'All' || String(log.module).toLowerCase() === selectedModule.toLowerCase()

    return searchMatch && moduleMatch
  })

  const modules = ['All', 'Auth', 'Surveys', 'Responses', 'AI', 'Billing', 'Admin']

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <span>🛡️</span> System Audit Logs
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Global system-wide operations, user actions, and security event tracking.
          </p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            🔍
          </span>
          <input data-testid="input-elt-17"
            type="text"
            placeholder="Search email, action, target..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-full pl-9 py-2 rounded-xl text-sm"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {modules.map((m) => (
            <button data-testid="button-elt-18"
              key={m}
              onClick={() => setSelectedModule(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedModule === m
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner size="lg" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="card p-12 text-center text-gray-500 dark:text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-semibold text-sm">No activity records match filters</p>
          <p className="text-xs text-gray-400 mt-1">Try resetting the search or module selections.</p>
        </div>
      ) : (
        <div className="card overflow-hidden border border-gray-100 dark:border-[#2a2a3a]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-[#2a2a3a] text-gray-500 dark:text-gray-400 font-semibold">
                  <th className="p-4">Action</th>
                  <th className="p-4">Who</th>
                  <th className="p-4">Module</th>
                  <th className="p-4">Target</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#2a2a3a]">
                {filteredLogs.map((log) => {
                  let metaObj = {}
                  try {
                    if (log.metadata) {
                      metaObj = typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata
                    }
                  } catch (_) {}

                  const isExpanded = expandedLogId === log.id

                  return (
                    <span key={log.id} className="table-row-group">
                      <tr
                        onClick={() => toggleExpandLog(log.id)}
                        className={`hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors cursor-pointer ${
                          isExpanded ? 'bg-gray-50/70 dark:bg-white/[0.02]' : ''
                        }`}
                      >
                        <td className="p-4 font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <span className="text-lg shrink-0">{getActionIcon(log.action)}</span>
                          <span>{getActionLabel(log.action)}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-gray-700 dark:text-gray-300 font-medium">{log.who || 'System'}</span>
                            {log.user_id && (
                              <span className="text-[10px] text-gray-400 font-mono">UID: {log.user_id}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getModuleBadgeColor(
                              log.module
                            )}`}
                          >
                            {log.module || 'General'}
                          </span>
                        </td>
                        <td className="p-4 max-w-[200px] truncate">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">{log.target || '—'}</span>
                          {log.target_id && (
                            <span className="text-[10px] font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 ml-1.5 rounded text-gray-400">
                              ID: {log.target_id}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-gray-400 dark:text-gray-500 text-xs whitespace-nowrap">
                          {formatTime(log.created_at)}
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-xs text-gray-400">
                            {isExpanded ? '▲' : '▼'}
                          </span>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="bg-gray-50/30 dark:bg-black/20 p-4 border-b border-gray-100 dark:border-[#2a2a3a]">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                  Log Details & Metadata
                                </span>
                                <span className="text-[10px] font-mono text-gray-400">
                                  ID: {log.id}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div className="card p-3 space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Action Type:</span>
                                    <span className="font-mono font-medium text-gray-800 dark:text-gray-200">{log.action}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Triggered By:</span>
                                    <span className="font-mono font-medium text-gray-800 dark:text-gray-200">{log.who}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Module:</span>
                                    <span className="font-mono font-medium text-gray-800 dark:text-gray-200">{log.module || '—'}</span>
                                  </div>
                                </div>

                                <div className="card p-3 space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Target Object:</span>
                                    <span className="font-mono font-medium text-gray-800 dark:text-gray-200">{log.target || '—'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Target ID:</span>
                                    <span className="font-mono font-medium text-gray-800 dark:text-gray-200">{log.target_id || '—'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Created At:</span>
                                    <span className="font-mono font-medium text-gray-800 dark:text-gray-200">{log.created_at}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="card p-4 bg-gray-950 border border-gray-900 rounded-xl">
                                <p className="text-[10px] text-gray-400 font-bold mb-1.5 uppercase font-mono tracking-wider">
                                  JSON Metadata Payload
                                </p>
                                <pre className="text-xs text-green-400 font-mono overflow-x-auto p-1 max-h-48 whitespace-pre-wrap select-all">
                                  {JSON.stringify(metaObj, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </span>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
