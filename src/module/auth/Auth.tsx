import { useEffect, useRef, useState } from 'react'
import victory from '../../assets/Victoryicon.svg'
import { LOGIN_STRINGS, LOGIN_TABS } from '../../constants/constant'
import http from '../../services/http'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

import '../../styles/Login.css'
import { useAppStore } from '../../store/store'
import { handleError } from '../../common/HandleError'

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
  const [focusedInput, setFocusedInput] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

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
        setUserInfo(response.data?.user)
        console.log(response.data.user)
        navigate('/profile')
        // console.log('its a signup ')
      }
      if (activeTab === 0 && response.data?.user?.id) {
        setUserInfo(response.data?.user)
        console.log(response.data.user)
        if (response.data?.user?.profileSetup) navigate('/chat')
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
    <div className="max-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-[#080810]">
          <div className="absolute w-full h-full bg-[radial-gradient(ellipse_at_top,_#141420_0%,_#080810_100%)]" />
        </div>
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`absolute w-[600px] h-[600px] rounded-full 
                ${i === 0 ? 'top-[-300px] left-[-200px] bg-blue-500/10' : i === 1 ? 'top-[-200px] right-[-250px] bg-purple-500/10' : 'bottom-[-300px] left-[20%] bg-indigo-500/10'} 
                blur-[120px] animate-blob animation-delay-${i * 2000}`}
            />
          ))}
        </div>
      </div>

      <div className="w-full max-w-[440px] relative z-10">
        {/* Enhanced logo section with better visibility */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-4 mb-5 p-3 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.05]">
            <img src={victory} alt="Logo" className="h-12 w-12 animate-pulse-glow" />
            <h1 className="text-4xl font-bold text-white tracking-tight">{LOGIN_STRINGS.BAATCHEET}</h1>
          </div>
          <p className="text-gray-300 text-wrap text-base tracking-wide font-medium">{LOGIN_STRINGS.BAATCHEET_DESCRIPTION}</p>
        </div>

        <div className="relative group">
          <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500/50 to-indigo-500/50 rounded-2xl blur-md opacity-40 group-hover:opacity-60 transition duration-500" />
          <div className="relative bg-[#0C0C14]/95 backdrop-blur-xl rounded-2xl border border-white/[0.05]">
            {/* Login tabs component is here */}
            <div className="p-2 mx-5 mt-5 bg-[#15151F]/80 rounded-xl backdrop-blur-sm" ref={tabRef}>
              <div className="relative flex">
                {LOGIN_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{ width: tabWidth }}
                    className={`relative flex-1 py-3 text-[15px] font-semibold rounded-lg transition-all duration-300
                      ${activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-400'}`}
                  >
                    {tab.name}
                    {activeTab === tab.id && (
                      <div
                        style={{
                          width: tabWidth - 8,
                          transform: `translateX(${activeTab * tabWidth}px)`,
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-blue-400/80 to-indigo-500/80 -z-10 rounded-lg 
                        shadow-lg shadow-indigo-500/20 transition-all duration-300 animate-tab-slide"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* form starting from here */}
            <form onSubmit={handleSubmit} className="p-7 space-y-5">
              <div className="space-y-4">
                {[
                  {
                    type: 'email',
                    value: email,
                    onChange: setEmail,
                    placeholder: 'Enter your email',
                    icon: '📧',
                  },
                  {
                    type: isVisible ? 'text' : 'password',
                    value: password,
                    onChange: setPassword,
                    placeholder: 'Enter your password',
                    icon: '🔒',
                    toggleVisibility: () => setIsVisible(!isVisible),
                  },
                  ...(activeTab === 1
                    ? [
                        {
                          type: isConfirmVisible ? 'text' : 'password',
                          value: confirmPassword,
                          onChange: setConfirmPassword,
                          placeholder: 'Confirm your password',
                          icon: '🔒',
                          toggleVisibility: () => setConfirmIsVisible(!isConfirmVisible),
                        },
                      ]
                    : []),
                ].map((field, index) => (
                  <div key={index} className="relative group/input">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-lg blur opacity-0 group-hover/input:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-lg text-white/70">{field.icon}</span>
                      <input
                        type={field.type}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        placeholder={field.placeholder}
                        onFocus={() => setFocusedInput(index.toString())}
                        onBlur={() => setFocusedInput(null)}
                        className={`w-full pl-12 pr-${field.toggleVisibility ? '12' : '4'} py-4 
                          bg-[#15151F]/50 rounded-lg border border-white/[0.05]
                          text-[15px] text-white placeholder-gray-400 font-medium
                          focus:outline-none focus:border-indigo-500/30 focus:ring-1 focus:ring-indigo-500/50
                          transition-all duration-300 ${focusedInput === index.toString() ? 'scale-[1.02]' : ''}`}
                      />
                      {field.toggleVisibility && (
                        <button type="button" onClick={field.toggleVisibility} className="absolute right-4 text-lg text-white/70 hover:text-white transition-colors duration-200">
                          {field.type === 'text' ? '👁️' : '👁️‍🗨️'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced submit button */}
              <button type="submit" disabled={isLoading} className="w-full relative group/button overflow-hidden rounded-lg mt-6">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-90 
                  group-hover/button:opacity-100 transition-opacity duration-300"
                />
                <div className="relative px-6 py-4 flex items-center justify-center gap-3">
                  {isLoading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  <span className="text-[15px] text-white font-semibold tracking-wide">{activeTab === 0 ? 'Sign In' : 'Create Account'}</span>
                </div>
              </button>
            </form>

            {/* after the form direct access to creat new user */}
            <div className="px-7 pb-7 text-center">
              <p className="text-[15px] text-gray-300">
                {activeTab === 0 ? (
                  <>
                    {LOGIN_STRINGS.NEW_TO_CHATAPP}{' '}
                    <button
                      onClick={() => setActiveTab(1)}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors duration-200 
                        hover:underline decoration-2 underline-offset-2"
                    >
                      {LOGIN_STRINGS.CREATE_ACCOUNT}
                    </button>
                  </>
                ) : (
                  <>
                    {LOGIN_STRINGS.ALLREADY_HAVE_ACCOUNT}{' '}
                    <button
                      onClick={() => setActiveTab(0)}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors duration-200 
                        hover:underline decoration-2 underline-offset-2"
                    >
                      {LOGIN_STRINGS.SIGNIN}
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auth
