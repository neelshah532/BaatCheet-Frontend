import { useAppStore } from '../store/store'
import { Navigate, Outlet } from 'react-router-dom'

const PublicRoutes = () => {
  const { userInfo } = useAppStore()
  const isAutheticated = !!userInfo
  return isAutheticated ? <Navigate to="/" /> : <Outlet />
}

export default PublicRoutes
