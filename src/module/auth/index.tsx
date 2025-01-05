import { useEffect, useRef, useState } from 'react'
import victory from '../../assets/Victoryicon.svg'
import { LOGIN_STRINGS, LOGIN_TABS } from '../../constants/constant'
import { FormFields } from '../../types'

const Auth = () => {
  const tabRef = useRef<HTMLDivElement | null>(null)
  const [tabWidth, setTabWidth] = useState(0)
  const [activeTab, setActiveTab] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isComfirmVisible, setComfirmIsVisible] = useState(false)

  const [formFields, setFormFields] = useState<FormFields>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  })
  // const [error, setError] = useState<Partial<FormFields>>({})
  // const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle tab width calculations
  const calculateTabWidth = () => {
    if (tabRef.current) {
      const parentWidth = tabRef.current.getBoundingClientRect().width
      setTabWidth(parentWidth / LOGIN_TABS.length)
    }
  }
  // Setup resize observer
  useEffect(() => {
    const resizeObserver = new ResizeObserver(calculateTabWidth)
    if (tabRef.current) {
      resizeObserver.observe(tabRef.current)
    }
    return () => resizeObserver.disconnect()
  }, [])

  console.log(activeTab)
  return (
    <>
      <section className="container-fluid max-h-screen flex items-center justify-center p-4">
        <div className=" max-w-container mx-auto">
          <div className="w-[90vw] h-[80vh] max-w-md bg-white rounded-2xl border-2 border-white text-opacity-90  transform transition-all duration-300 p-8 shadow-2xl md:w-[90vw] lg:w-[70vw] xl:w-[60vw] ">
            <div className="text-center mb-8">
              <div className="flex justify-center items-center gap-4 mb-6">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent  bg-gradient-to-r from-blue-600 to-indigo-600">{LOGIN_STRINGS.WELCOME}</h1>
                <img src={victory} alt="victory" className="h-12 w-12  animate-bounce" />
              </div>
              <p className="text-gray-600">{LOGIN_STRINGS.DETAILS}</p>
            </div>
            {/* Custom Tab Switcher */}
            <div className="mb-8" ref={tabRef}>
              <div className="relative flex rounded-full bg-gray-100 p-1">
                {LOGIN_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative z-10 flex-1 py-3 text-sm font-medium transition-colors duration-300
                    ${activeTab === tab.id ? 'text-white' : 'text-gray-600 hover:text-gray-900'}`}
                    style={{ width: tabWidth }}
                  >
                    {tab.name}
                  </button>
                ))}
                <div
                  className="absolute inset-1 bg-blue-600 rounded-full transition-transform duration-300 ease-in-out"
                  style={{
                    width: tabWidth - 8,
                    transform: `translateX(${activeTab * tabWidth}px)`,
                  }}
                />
              </div>
            </div>

            <form className="space-y-6 flex flex-col gap-5 mt-10" action="">
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  id="email"
                  name="email"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Please enter your email"
                  className={`w-full px-3 py-3 border-2 rounded-lg outline-none transition-all duration-200 ${isFocused ? 'border-blue-500' : 'border-gray-300'}`}
                />
                <div className="relative">
                  <input
                    type={isVisible ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formFields.password}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChange={(e) => setFormFields({ ...formFields, password: e.target.value })}
                    placeholder="Please enter your Password"
                    className={`w-full px-3 py-3 border-2 rounded-lg outline-none transition-all duration-200 ${isFocused ? 'border-blue-500' : 'border-gray-300'}`}
                  />
                  <button type="button" onClick={() => setIsVisible(!isVisible)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                    {isVisible ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {activeTab === 1 && (
                  <div className="relative">
                    <input
                      type={isVisible ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formFields.confirmPassword}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      onChange={(e) => setFormFields({ ...formFields, confirmPassword: e.target.value })}
                      placeholder="Please confirm your Password"
                      className={`w-full px-3 py-3 border-2 rounded-lg outline-none transition-all duration-200 ${isFocused ? 'border-blue-500' : 'border-gray-300'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setComfirmIsVisible(!isComfirmVisible)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {isComfirmVisible ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                )}
              </div>
              <button className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 font-semibold">{LOGIN_STRINGS.SUBMIT}</button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}

export default Auth
