import { Suspense, useEffect, useState } from 'react'
import './App.css'
import Approutes from './routes/routes'
import MainLoader from './common/MainLoader'
import { useAppStore } from './store/store'
import http from './services/http'
import { useNavigate } from 'react-router-dom'
import CallsModule from './module/calls/CallsModule'

function App() {
  const { userInfo, setUserInfo } = useAppStore()
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await http.get('/api/auth/userInfo', { withCredentials: true })
        if (response.status === 200 && response.data?.id) {
          setUserInfo(response.data)
        } else {
          setUserInfo(undefined)
          navigate('/login')
        }
      } catch {
        setUserInfo(undefined)
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    const hasCachedUser = !!userInfo || !!localStorage.getItem('userInfo')

    if (hasCachedUser) {
      getUserData()
    } else {
      setLoading(false)
      if (!userInfo) {
        navigate('/login')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return <MainLoader />

  return (
    <>
      <Suspense fallback={<MainLoader />}>
        <Approutes />
        <CallsModule />
      </Suspense>
    </>
  )
}

export default App
