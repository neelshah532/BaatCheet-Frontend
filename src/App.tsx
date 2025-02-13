import { Suspense, useEffect, useState } from 'react'
import './App.css'
import Approutes from './routes/routes'
import MainLoader from './common/MainLoader'
import { useAppStore } from './store/store'
import http from './services/http'
import { handleError } from './common/HandleError'

function App() {
  const { userInfo, setUserInfo } = useAppStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await http.get('/api/auth/userInfo', { withCredentials: true })
        // console.log(response.data)
        if (response.status === 200 && response.data.id) {
          setUserInfo(response.data)
        } else {
          setUserInfo(undefined)
        }
      } catch (error) {
        handleError(error)
        setUserInfo(undefined)
      } finally {
        setLoading(false)
      }
    }

    if (!userInfo) {
      getUserData()
    } else {
      setLoading(false)
    }
  }, [userInfo, setUserInfo])

  if (loading) return <MainLoader />

  return (
    <>
      <Suspense fallback={<MainLoader />}>
        <Approutes />
      </Suspense>
    </>
  )
}

export default App
