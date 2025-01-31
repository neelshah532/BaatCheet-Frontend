import { Navigate, Route, Routes } from 'react-router-dom'
import Auth from '../module/auth/Auth'
import Chat from '../module/chat/Chat'
import Profile from '../module/Profile/Profile'
import PublicRoutes from './PublicRoutes'
import PrivateRoutes from './PrivateRoutes'

const Approutes = () => {
  return (
    <Routes>
      {/* <Route path="*" element={<Navigate to="/auth" />} /> */}
      <Route element={<PublicRoutes />}>
        <Route path="/login" element={<Auth />} />
      </Route>
      <Route element={<PrivateRoutes />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/chat" element={<Chat />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}

export default Approutes
