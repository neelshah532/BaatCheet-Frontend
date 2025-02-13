import React from 'react'
import { useAppStore } from '../store/store'
import { Navigate, Outlet } from 'react-router-dom'

const PrivateRoutes = () => {
  const { userInfo } = useAppStore()
  const isAutheticated = !!userInfo
  return isAutheticated ? <Outlet /> : <Navigate to="/auth" />
}

export default PrivateRoutes
