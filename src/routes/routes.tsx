import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import PublicRoutes from './PublicRoutes'
import PrivateRoutes from './PrivateRoutes'
import MainLoader from '../common/MainLoader'

const Auth = lazy(() => import('../module/auth/Auth'))
const Chat = lazy(() => import('../module/chat/Chat'))
const Profile = lazy(() => import('../module/Profile/Profile'))
const NotFound = lazy(() => import('../module/error/NotFound').then((m) => ({ default: m.NotFound })))

const Approutes = () => {
  return (
    <Suspense fallback={<MainLoader />}>
      <Routes>
        <Route element={<PublicRoutes />}>
          <Route path="/login" element={<Auth />} />
        </Route>
        <Route element={<PrivateRoutes />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/" element={<Chat />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

export default Approutes
