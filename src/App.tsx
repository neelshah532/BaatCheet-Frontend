import { Suspense } from 'react'
import './App.css'
import Approutes from './routes/routes'

function App() {
  return (
    <>
      <Suspense fallback={null}>
        <Approutes />
      </Suspense>
    </>
  )
}

export default App
