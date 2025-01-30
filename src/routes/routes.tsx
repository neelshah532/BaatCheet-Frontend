import { Route, Routes } from 'react-router-dom'
import Auth from '../module/auth/Auth'
import Chat from '../module/chat/Chat'

const Approutes = () => {
  return (
    <Routes>
      {/* <Route path="*" element={<Navigate to="/auth" />} /> */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/chat" element={<Chat />} />
    </Routes>
  )
}

export default Approutes
