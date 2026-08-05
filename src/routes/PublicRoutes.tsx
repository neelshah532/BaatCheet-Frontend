import { useAppStore } from '../store/store'
import { Navigate, Outlet } from 'react-router-dom'

const PublicRoutes = () => {
  const { userInfo } = useAppStore()
  const isAuthenticated = !!userInfo
  if (isAuthenticated) {
    return userInfo?.profileSetup ? <Navigate to="/" replace /> : <Navigate to="/profile" replace />
  }
  return <Outlet />
}

export default PublicRoutes
