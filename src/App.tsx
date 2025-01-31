import { Suspense, useEffect, useState } from 'react'
import './App.css'
import Approutes from './routes/routes'
import { useAppStore } from './store/store'
import http from './services/http'

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
        setUserInfo(undefined)
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    if (!userInfo) {
      getUserData()
    } else {
      setLoading(false)
    }
  }, [userInfo, setUserInfo, loading])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <>
      <Suspense fallback={null}>
        <Approutes />
      </Suspense>
    </>
  )
}

export default App
