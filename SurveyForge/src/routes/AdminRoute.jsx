/**
 * routes/AdminRoute.jsx — Admin-only route guard
 * Redirects non-admin users to /dashboard with a toast notification.
 * Must be used inside a ProtectedRoute (requires authentication).
 */
import { Navigate, Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useApp } from '../context/AppContext'
import { FullPageSpinner } from '../components/ui/Spinner'

export default function AdminRoute() {
  const { isAdmin, loading, isAuthenticated } = useApp()

  useEffect(() => {
    // Show a toast only when fully loaded and the user is authenticated but not admin
    if (!loading && isAuthenticated && !isAdmin) {
      toast.error('Admin access required', { id: 'admin-access-denied' })
    }
  }, [loading, isAuthenticated, isAdmin])

  if (loading) return <FullPageSpinner />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />

  return <Outlet />
}
