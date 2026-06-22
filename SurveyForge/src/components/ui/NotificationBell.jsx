/**
 * components/ui/NotificationBell.jsx
 *
 * Live notification bell in the TopBar using Supabase Realtime.
 * - Receives instant push notifications for new responses/reports
 * - Displays active toasts when new notifications arrive
 * - Under-the-hood real-time syncing of badge and list state
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../../services/api'
import { useApp } from '../../context/AppContext'
import { supabase } from '../../lib/supabase'

const TYPE_ICON = {
  response: '💬',
  report:   '📊',
  system:   '🔔',
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60)   return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function NotificationBell() {
  const { isAuthenticated, user } = useApp()
  const navigate = useNavigate()

  const [open,         setOpen]         = useState(false)
  const [unread,       setUnread]       = useState(0)
  const [notifications, setNotifications] = useState([])
  const [loading,      setLoading]      = useState(false)
  const dropdownRef = useRef(null)

  // Fetch unread count from Supabase (via api wrapper)
  const fetchUnread = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      const res = await getUnreadCount()
      setUnread(res?.count ?? 0)
    } catch { /* silently ignore */ }
  }, [isAuthenticated])

  // Load full notification list
  const fetchAll = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    try {
      const res = await getNotifications()
      setNotifications(res?.data ?? [])
    } catch {
      toast.error('Could not load notifications')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  // ── Supabase Realtime Subscription ────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return

    fetchUnread()
    fetchAll()

    const channel = supabase
      .channel(`user_notifications_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Re-fetch badge count and full list instantly on any changes
          fetchUnread()
          fetchAll()

          // Trigger push alert toast on new incoming unread notifications
          if (payload.eventType === 'INSERT' && !payload.new.is_read) {
            toast.success(`🔔 New Alert: ${payload.new.title}`, {
              duration: 4000,
              position: 'bottom-right',
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isAuthenticated, user?.id, fetchUnread, fetchAll])

  // Load detailed list when dropdown state is toggled open
  useEffect(() => {
    if (open) fetchAll()
  }, [open, fetchAll])

  // Close dropdown on outside clicks
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // ── Actions ───────────────────────────────────────────────────
  const handleMarkRead = async (n) => {
    if (!n.is_read) {
      try {
        await markNotificationRead(n.id)
        setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x))
        setUnread(prev => Math.max(0, prev - 1))
      } catch { /* ignore */ }
    }
    if (n.survey_id) {
      setOpen(false)
      navigate(`/surveys/builder/${n.survey_id}`)
    }
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    try {
      await deleteNotification(id)
      const removed = notifications.find(n => n.id === id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      if (removed && !removed.is_read) setUnread(prev => Math.max(0, prev - 1))
    } catch {
      toast.error('Could not delete notification')
    }
  }

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnread(0)
      toast.success('All notifications marked as read')
    } catch {
      toast.error('Could not mark all as read')
    }
  }

  if (!isAuthenticated) return null

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button data-testid="button-elt-12"
        id="notification-bell"
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-xl text-gray-500 dark:text-gray-400
          hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {/* Badge */}
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1
                bg-red-500 text-white text-[10px] font-bold rounded-full
                flex items-center justify-center ring-2 ring-white dark:ring-[#13131a]"
            >
              {unread > 99 ? '99+' : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="dropdown"
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.95, y: -8  }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="absolute right-0 top-12 w-[360px] z-50
              bg-white dark:bg-[#1a1a2e] border border-gray-100 dark:border-[#2a2a3a]
              rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4
              border-b border-gray-100 dark:border-[#2a2a3a]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 dark:text-white text-sm">Notifications</span>
                {unread > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full
                    bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400">
                    {unread} new
                  </span>
                )}
              </div>
              {unread > 0 && (
                <button data-testid="button-elt-13"
                  onClick={handleMarkAll}
                  className="text-xs font-semibold text-primary-500 hover:text-primary-600
                    dark:hover:text-primary-400 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification Scroll List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-50 dark:divide-[#1e1e2e]">
              {loading && (
                <div className="py-10 text-center text-sm text-gray-400 dark:text-gray-600">
                  Loading…
                </div>
              )}

              {!loading && notifications.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-3xl mb-2">🔔</p>
                  <p className="text-sm text-gray-400 dark:text-gray-600 font-medium">
                    No notifications yet
                  </p>
                  <p className="text-xs text-gray-300 dark:text-gray-700 mt-1">
                    You'll be notified when someone responds to your surveys
                  </p>
                </div>
              )}

              {!loading && notifications.map((n) => (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => handleMarkRead(n)}
                  className={`group flex items-start gap-3 px-4 py-3.5 cursor-pointer
                    transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03]
                    ${!n.is_read ? 'bg-primary-50/60 dark:bg-primary-500/5' : ''}`}
                >
                  {/* Icon badge */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center
                    text-base shrink-0 mt-0.5
                    ${!n.is_read
                      ? 'bg-primary-100 dark:bg-primary-500/20'
                      : 'bg-gray-100 dark:bg-white/10'}`}>
                    {TYPE_ICON[n.type] ?? '🔔'}
                  </div>

                  {/* Body details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm leading-snug truncate
                        ${!n.is_read
                          ? 'font-semibold text-gray-900 dark:text-white'
                          : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                        {n.title}
                      </p>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                      {n.body}
                    </p>
                    <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1">
                      {timeAgo(n.created_at)}
                    </p>
                  </div>

                  {/* Delete individual action */}
                  <button data-testid="button-elt-14"
                    onClick={(e) => handleDelete(e, n.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg shrink-0
                      text-gray-300 hover:text-red-500 hover:bg-red-50
                      dark:text-gray-600 dark:hover:text-red-400 dark:hover:bg-red-500/10
                      transition-all"
                    title="Delete notification"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Menu Footer links */}
            {notifications.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-100 dark:border-[#2a2a3a]
                flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-gray-400 dark:text-gray-600">
                  {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-3">
                  <button data-testid="button-elt-15"
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      navigate('/notifications')
                    }}
                    className="text-xs font-semibold text-primary-500 hover:text-primary-600
                      dark:hover:text-primary-400 transition-colors"
                  >
                    Open inbox
                  </button>
                  <button data-testid="button-elt-16"
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      navigate('/responses')
                    }}
                    className="text-xs font-semibold text-primary-500 hover:text-primary-600
                      dark:hover:text-primary-400 transition-colors"
                  >
                    Responses →
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
