import { useEffect, useRef, useState } from 'react'
import { LOGIN_STRINGS, LOGIN_TABS } from '../../constants/constant'
import http from '../../services/http'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/store'
import { handleError } from '../../common/HandleError'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'

const Auth = () => {
  const { userInfo, setUserInfo } = useAppStore()
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

  // Prevent logged-in users from accessing the Auth/Login page
  useEffect(() => {
    if (userInfo) {
      if (userInfo.profileSetup) {
        navigate('/', { replace: true })
      } else {
        navigate('/profile', { replace: true })
      }
    }
  }, [userInfo, navigate])

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

      if (activeTab === 1 && response.status === 201) {
        toast.success(response.data?.message || 'Account created successfully! Please set up your profile.')
        setUserInfo(response.data?.user)
        navigate('/profile', { replace: true })
      } else if (activeTab === 0 && response.data?.user?.id) {
        toast.success(response.data?.message || 'Logged in successfully!')
        setUserInfo(response.data?.user)
        if (response.data?.user?.profileSetup) navigate('/', { replace: true })
        else navigate('/profile', { replace: true })
      }
    } catch (error) {
      handleError(error as Error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-screen bg-[#08080C] flex items-center justify-center p-4 relative overflow-hidden font-sans select-none selection:bg-indigo-500/30 selection:text-white">
      {/* Background Depth Effect */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.04) 0%, transparent 65%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[400px] relative z-10"
      >
        {/* Brand Header */}
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-3 mb-3.5 px-4 py-2 rounded-2xl bg-white/[0.02] border border-white/10 shadow-lg">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-400">
              <path
                d="M16 26C21.5228 26 26 21.5228 26 16C26 10.4772 21.5228 6 16 6C10.4772 6 6 10.4772 6 16C6 18.3263 6.79328 20.4674 8.12519 22.1704L7 25L9.82958 23.8752C11.5326 25.2071 13.6737 26 16 26Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M12 13H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M12 17H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <h1 className="text-lg font-medium text-white tracking-widest uppercase font-sans">{LOGIN_STRINGS.BAATCHEET}</h1>
          </div>
          <p className="text-white/40 text-xs font-light tracking-wide leading-relaxed max-w-xs">{LOGIN_STRINGS.BAATCHEET_DESCRIPTION}</p>
        </div>

        {/* Card */}
        <div className="bg-[#0D0E12]/80 backdrop-blur-2xl rounded-3xl border border-white/[0.06] p-6 sm:p-8 shadow-2xl relative">
          {/* Tab Switcher */}
          <div className="p-1 bg-black/40 rounded-2xl border border-white/[0.05] mb-6" ref={tabRef}>
            <div className="relative flex">
              {LOGIN_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ width: tabWidth }}
                  className={`relative flex-1 py-2 text-xs font-medium rounded-xl transition-all duration-200 z-10
                    ${activeTab === tab.id ? 'text-white font-semibold' : 'text-white/40 hover:text-white/70'}`}
                >
                  {tab.name}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabBg"
                      className="absolute inset-0 bg-white/[0.05] border border-white/10 rounded-xl shadow-md -z-10"
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
              <label className="text-[10px] font-medium tracking-wider text-white/50 pl-1 uppercase">Email Address</label>
              <div className="relative flex items-center">
                <FiMail className="absolute left-4 text-white/30 text-base" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-white/[0.02] rounded-xl border border-white/[0.08] text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/40 focus:bg-white/[0.04] transition-all focus:shadow-[0_0_12px_rgba(99,102,241,0.05)]"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium tracking-wider text-white/50 pl-1 uppercase">Password</label>
              <div className="relative flex items-center">
                <FiLock className="absolute left-4 text-white/30 text-base" />
                <input
                  type={isVisible ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-white/[0.02] rounded-xl border border-white/[0.08] text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/40 focus:bg-white/[0.04] transition-all focus:shadow-[0_0_12px_rgba(99,102,241,0.05)] font-sans"
                />
                <button type="button" onClick={() => setIsVisible(!isVisible)} className="absolute right-4 text-white/30 hover:text-white transition-colors">
                  {isVisible ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field (Signup) */}
            <AnimatePresence>
              {activeTab === 1 && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-1.5 overflow-hidden">
                  <label className="text-[10px] font-medium tracking-wider text-white/50 pl-1 uppercase">Confirm Password</label>
                  <div className="relative flex items-center">
                    <FiLock className="absolute left-4 text-white/30 text-base" />
                    <input
                      type={isConfirmVisible ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-11 py-3 bg-white/[0.02] rounded-xl border border-white/[0.08] text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/40 focus:bg-white/[0.04] transition-all focus:shadow-[0_0_12px_rgba(99,102,241,0.05)] font-sans"
                    />
                    <button type="button" onClick={() => setConfirmIsVisible(!isConfirmVisible)} className="absolute right-4 text-white/30 hover:text-white transition-colors">
                      {isConfirmVisible ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3 px-6 rounded-xl bg-white hover:bg-white/95 text-[#08080C] font-semibold text-xs shadow-[0_4px_20px_rgba(255,255,255,0.05)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-[#08080C]/20 border-t-[#08080C] rounded-full animate-spin" />
              ) : (
                <span>{activeTab === 0 ? 'Sign In' : 'Create Account'}</span>
              )}
            </motion.button>
          </form>

          {/* Footer toggle */}
          <div className="mt-6 text-center text-xs text-white/40">
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
