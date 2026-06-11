import { Navigate, Outlet } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { FullPageSpinner } from '../components/ui/Spinner'

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useApp()

  if (loading) return <FullPageSpinner />
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return <Outlet />
}
