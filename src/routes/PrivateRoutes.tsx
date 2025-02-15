import { useAppStore } from '../store/store'
import { Navigate, Outlet } from 'react-router-dom'

const PrivateRoutes = () => {
  const { userInfo } = useAppStore()
  const isAutheticated = !!userInfo
  return isAutheticated ? <Outlet /> : <Navigate to="/login" />
}

export default PrivateRoutes
