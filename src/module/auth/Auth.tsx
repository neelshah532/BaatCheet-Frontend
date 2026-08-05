import { useEffect, useRef, useState } from 'react'
import victory from '../../assets/Victoryicon.svg'
import { LOGIN_STRINGS, LOGIN_TABS } from '../../constants/constant'
import http from '../../services/http'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/store'
import { handleError } from '../../common/HandleError'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'

const Auth = () => {
  const { setUserInfo } = useAppStore()
  const tabRef = useRef<HTMLDivElement | null>(null)
  const [tabWidth, setTabWidth] = useState(0)
  const [activeTab, setActiveTab] = useState(0)
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [isConfirmVisible, setConfirmIsVisible] = useState<boolean>(false)
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const calculateTabWidth = () => {
    if (tabRef.current) {
      const parentWidth = tabRef.current.getBoundingClientRect().width
      setTabWidth(parentWidth / LOGIN_TABS.length)
    }
  }

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
      const payload = { email, password }
      const response = await http.post(endpoint, payload, { withCredentials: true })
      toast.success(response.data?.message || 'Success')
      if (activeTab === 1 && response.status === 201) {
        setUserInfo(response.data?.user)
        navigate('/profile')
      }
      if (activeTab === 0 && response.data?.user?.id) {
        setUserInfo(response.data?.user)
        if (response.data?.user?.profileSetup) navigate('/')
        else navigate('/profile')
      }
    } catch (error) {
      handleError(error as Error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-screen bg-[#0B0C10] flex items-center justify-center p-4 relative overflow-hidden font-sans select-none selection:bg-indigo-500/30 selection:text-white">
      {/* Background Depth Effect */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_#1A1C24_0%,_#0B0C10_70%)] opacity-80" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] relative z-10"
      >
        {/* Brand Header */}
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-3 mb-3 px-4 py-2 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-xl">
            <img src={victory} alt="Logo" className="h-8 w-8" />
            <h1 className="text-2xl font-bold text-white tracking-wide bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text">{LOGIN_STRINGS.BAATCHEET}</h1>
          </div>
          <p className="text-white/50 text-sm font-light leading-relaxed max-w-xs">{LOGIN_STRINGS.BAATCHEET_DESCRIPTION}</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.02] backdrop-blur-2xl rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl relative">
          {/* Tab Switcher */}
          <div className="p-1.5 bg-black/40 rounded-2xl border border-white/5 mb-6" ref={tabRef}>
            <div className="relative flex">
              {LOGIN_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ width: tabWidth }}
                  className={`relative flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 z-10
                    ${activeTab === tab.id ? 'text-white font-semibold' : 'text-white/40 hover:text-white/70'}`}
                >
                  {tab.name}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabBg"
                      className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl shadow-lg -z-10"
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60 pl-1">Email Address</label>
              <div className="relative flex items-center">
                <FiMail className="absolute left-4 text-white/40 text-base" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-white/[0.04] rounded-xl border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60 pl-1">Password</label>
              <div className="relative flex items-center">
                <FiLock className="absolute left-4 text-white/40 text-base" />
                <input
                  type={isVisible ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-white/[0.04] rounded-xl border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                />
                <button type="button" onClick={() => setIsVisible(!isVisible)} className="absolute right-4 text-white/40 hover:text-white transition-colors">
                  {isVisible ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field (Signup) */}
            <AnimatePresence>
              {activeTab === 1 && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-1.5 overflow-hidden">
                  <label className="text-xs font-medium text-white/60 pl-1">Confirm Password</label>
                  <div className="relative flex items-center">
                    <FiLock className="absolute left-4 text-white/40 text-base" />
                    <input
                      type={isConfirmVisible ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-11 py-3 bg-white/[0.04] rounded-xl border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                    />
                    <button type="button" onClick={() => setConfirmIsVisible(!isConfirmVisible)} className="absolute right-4 text-white/40 hover:text-white transition-colors">
                      {isConfirmVisible ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3.5 px-6 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold text-sm shadow-xl hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>{activeTab === 0 ? 'Sign In' : 'Create Account'}</span>
              )}
            </motion.button>
          </form>

          {/* Footer toggle */}
          <div className="mt-6 text-center text-xs text-white/50">
            {activeTab === 0 ? (
              <>
                {LOGIN_STRINGS.NEW_TO_CHATAPP}{' '}
                <button onClick={() => setActiveTab(1)} className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors ml-1">
                  {LOGIN_STRINGS.CREATE_ACCOUNT}
                </button>
              </>
            ) : (
              <>
                {LOGIN_STRINGS.ALLREADY_HAVE_ACCOUNT}{' '}
                <button onClick={() => setActiveTab(0)} className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors ml-1">
                  {LOGIN_STRINGS.SIGNIN}
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Auth
