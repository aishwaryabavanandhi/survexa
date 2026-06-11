import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../../services/api'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getNotifications()
      setItems(res?.data ?? [])
    } catch {
      toast.error('Could not load notifications')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const onOpen = async (n) => {
    try {
      if (!n.is_read) {
        await markNotificationRead(n.id)
        setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: 1 } : x)))
      }
      if (n.survey_id) navigate(`/surveys/builder/${n.survey_id}`)
    } catch {
      toast.error('Could not update notification')
    }
  }

  const onDelete = async (id) => {
    try {
      await deleteNotification(id)
      setItems((prev) => prev.filter((x) => x.id !== id))
    } catch {
      toast.error('Could not remove notification')
    }
  }

  const onMarkAll = async () => {
    try {
      await markAllNotificationsRead()
      setItems((prev) => prev.map((x) => ({ ...x, is_read: 1 })))
      toast.success('All marked read')
    } catch {
      toast.error('Could not mark all read')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-gray-400">Loading inbox…</p>
      </div>
    )
  }

  const hasUnread = items.some((x) => !x.is_read)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Notifications</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Workspace alerts and survey activity</p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard">
            <Button variant="secondary" size="sm">Dashboard</Button>
          </Link>
          {hasUnread && (
            <Button size="sm" variant="secondary" onClick={onMarkAll}>
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card p-12 text-center text-gray-500 dark:text-gray-400">
          <p className="text-4xl mb-3">🔔</p>
          <p className="font-medium text-gray-700 dark:text-gray-200">You are all caught up</p>
          <p className="text-sm mt-1">New responses and system events will show up here.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li
              key={n.id}
              className={`card p-4 flex gap-4 items-start border transition-colors
                ${!n.is_read
                  ? 'border-primary-200 dark:border-primary-900/40 bg-primary-50/40 dark:bg-primary-900/10'
                  : 'border-gray-100 dark:border-[#2a2a3a] opacity-90'}`}
            >
              <span className="text-2xl shrink-0">{n.type === 'report' ? '📊' : n.type === 'system' ? '⚙️' : '💬'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{n.title ?? 'Notification'}</p>
                {n.body && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{n.body}</p>}
                <p className="text-[10px] text-gray-400 mt-2">{timeAgo(n.created_at)}</p>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button type="button" onClick={() => onOpen(n)} className="text-xs font-semibold text-primary-600 hover:underline">
                  Open
                </button>
                <button type="button" onClick={() => onDelete(n.id)} className="text-xs text-red-400 hover:text-red-600 font-medium">
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
