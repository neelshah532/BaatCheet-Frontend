import React from 'react'
import { motion } from 'framer-motion'
import victory from '../../assets/Victoryicon.svg'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleRefresh = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden w-full">
          {/* Background Effects */}
          <div className="fixed inset-0">
            <div className="absolute inset-0 bg-[#080810]">
              <div className="absolute w-full h-full bg-[radial-gradient(ellipse_at_top,_#141420_0%,_#080810_100%)]" />
            </div>

            {/* Animated background blobs */}
            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0.5 }}
                  animate={{
                    opacity: [0.4, 0.6, 0.4],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: i * 0.5,
                  }}
                  className={`absolute w-[600px] h-[600px] rounded-full 
                    ${
                      i === 0
                        ? 'top-[-300px] left-[-200px] bg-red-500/10'
                        : i === 1
                          ? 'top-[-200px] right-[-250px] bg-orange-500/10'
                          : 'bottom-[-300px] left-[20%] bg-yellow-500/10'
                    } 
                    blur-[120px]`}
                />
              ))}
            </div>
          </div>

          {/* Content Container */}
          <div className="w-full max-w-[440px] relative z-10">
            {/* Logo Section */}
            <div className="mb-12 text-center">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-4 mb-5 p-3 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.05]"
              >
                <img src={victory} alt="Logo" className="h-12 w-12 animate-pulse-glow" />
                <h1 className="text-4xl font-bold text-white tracking-tight">Oops!</h1>
              </motion.div>
            </div>

            {/* Error Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative group">
              <div className="absolute -inset-[1px] bg-gradient-to-r from-red-500/50 to-orange-500/50 rounded-2xl blur-md opacity-40 group-hover:opacity-60 transition duration-500" />
              <div className="relative bg-[#0C0C14]/95 backdrop-blur-xl rounded-2xl border border-white/[0.05] p-8">
                <div className="text-center space-y-6">
                  <motion.div
                    animate={{
                      rotateY: [0, 360],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="text-6xl mb-4"
                  >
                    ⚠️
                  </motion.div>

                  <h2 className="text-2xl font-bold text-white">Something went wrong</h2>

                  <p className="text-gray-400 text-sm">{this.state.error?.message || "We're having some technical difficulties"}</p>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={this.handleRefresh}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 
                        text-white rounded-lg font-medium hover:opacity-90 transition-all
                        focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    >
                      Try Again
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={this.handleGoHome}
                      className="flex-1 px-6 py-3 bg-[#15151F] text-white rounded-lg font-medium
                        border border-white/10 hover:bg-[#1C1C24] transition-all
                        focus:outline-none focus:ring-2 focus:ring-white/10"
                    >
                      Go Home
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
