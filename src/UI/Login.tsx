import { useEffect, useRef, useState } from 'react'
// import victory from '../../assets/Victoryicon.svg'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import '../styles/Login.css'
import { LOGIN_STRINGS, LOGIN_TABS } from '../constants/constant'
import http from '../services/http'
import { handleError } from '../common/HandleError'

const Login = () => {
  const navigate = useNavigate()

  //   useState here
  const tabRef = useRef<HTMLDivElement | null>(null)
  const [tabWidth, setTabWidth] = useState(0)
  const [activeTab, setActiveTab] = useState(0)
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [isConfirmVisible, setConfirmIsVisible] = useState<boolean>(false)
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  // Calculate tab width dynamically
  const calculateTabWidth = () => {
    if (tabRef.current) {
      const parentWidth = tabRef.current.getBoundingClientRect().width
      setTabWidth(parentWidth / LOGIN_TABS.length)
    }
  }

  // Resize observer for tabs
  useEffect(() => {
    calculateTabWidth()
    window.addEventListener('resize', calculateTabWidth)
    return () => window.removeEventListener('resize', calculateTabWidth)
  }, [])

  const handleValidation = () => {
    if (!email.length) {
      toast.error('Please enter your email')
      return false
    }
    if (!password.length) {
      toast.error('Please enter your password')
      return false
    }
    if (activeTab === 1) {
      if (!confirmPassword.length) {
        toast.error('Please enter your confirm password')
        return false
      }
      if (password !== confirmPassword) {
        toast.error('Password and confirm password do not match')
        return false
      }
    }
    return true
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!handleValidation() || isLoading) return

    setIsLoading(true)
    try {
      const endpoint = activeTab === 0 ? '/api/auth/login' : '/api/auth/signup'
      const payload = { email, password, ...(activeTab === 1 && { confirmPassword }) }
      const response = await http.post(endpoint, payload, { withCredentials: true })
      toast.success(response.data?.message || 'Success')
      if (activeTab === 1 && response.status === 201) {
        navigate('/profile')
        // console.log('its a signup ')
      }
      if (activeTab === 0 && response.data?.user?.id) {
        if (response.data?.user?.profileSetup) navigate('/')
        else navigate('/profile')
      }
      // navigate('/chat')
      // console.log(response.data)
    } catch (error) {
      handleError(error as Error)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="max-h-screen flex items-center justify-center p-4 relative">
      {/* Professional gradient background */}
      <div className="fixed inset-0 bg-gradient-to-b from-primary-dark/40 to-background-secondary" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            {/* <img src={victory} alt="Logo" className="h-12 w-12" /> */}
            <h1 className="text-3xl font-bold text-primary-dark">{LOGIN_STRINGS.BAATCHEET}</h1>
          </div>
          <p className="text-neutral-700">{LOGIN_STRINGS.BAATCHEET_DESCRIPTION}</p>
        </div>

        {/* Main card */}
        <div className="bg-background-primary rounded-2xl shadow-lg shadow-neutral-200/50">
          {/* Tabs */}
          <div className="p-2 mx-4 mt-4" ref={tabRef}>
            <div className="relative flex bg-neutral-100 rounded-xl p-1">
              {LOGIN_TABS.map((tab) => (
                <button
                  key={tab.id}
                  style={{ width: tabWidth }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                    ${activeTab === tab.id ? 'text-white bg-primary-main shadow-sm' : 'text-neutral-700 hover:text-primary-dark'}`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="space-y-4">
              {/* Email input */}
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 
                    placeholder-neutral-500 text-neutral-800
                    focus:outline-none focus:border-primary-main focus:ring-1 focus:ring-primary-main
                    transition-all duration-200"
                />
              </div>

              {/* Password input */}
              <div className="relative">
                <input
                  type={isVisible ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 
                    placeholder-neutral-500 text-neutral-800
                    focus:outline-none focus:border-primary-main focus:ring-1 focus:ring-primary-main
                    transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setIsVisible(!isVisible)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 
                    hover:text-neutral-700 transition-colors"
                >
                  {isVisible ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>

              {/* Confirm Password */}
              {activeTab === 1 && (
                <div className="relative">
                  <input
                    type={isConfirmVisible ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 
                      placeholder-neutral-500 text-neutral-800
                      focus:outline-none focus:border-primary-main focus:ring-1 focus:ring-primary-main
                      transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setConfirmIsVisible(!isConfirmVisible)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 
                      hover:text-neutral-700 transition-colors"
                  >
                    {isConfirmVisible ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-main hover:bg-primary-dark 
                text-white font-medium py-3 rounded-lg
                transition-colors duration-200 relative
                disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : activeTab === 0 ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-6 pb-6 text-center">
            <p className="text-neutral-600">
              {activeTab === 0 ? (
                <>
                  New to ChatApp?{' '}
                  <button onClick={() => setActiveTab(1)} className="text-primary-main hover:text-primary-dark font-medium">
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button onClick={() => setActiveTab(0)} className="text-primary-main hover:text-primary-dark font-medium">
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
