import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

/** Unknown path → welcome for guests, dashboard for signed-in users */
export default function CatchAllNavigate() {
  const { isAuthenticated } = useApp()
  return <Navigate to={isAuthenticated ? '/dashboard' : '/welcome'} replace />
}
