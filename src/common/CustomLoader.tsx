import { motion } from 'framer-motion'

interface CustomLoaderProps {
  size?: 'small' | 'medium' | 'large'
  message?: string
  type?: 'default' | 'upload' | 'search'
}

const CustomLoader = ({ type = 'default', message = 'Loading...' }: CustomLoaderProps) => {
  const loaderGradients = {
    default: 'from-indigo-500 via-purple-500 to-pink-500',
    upload: 'from-emerald-500 via-teal-500 to-cyan-500',
    search: 'from-purple-500 via-indigo-500 to-blue-500',
  }

  const gradient = loaderGradients[type] || loaderGradients.default

  return (
    <div className="relative flex flex-col items-center justify-center p-6 select-none">
      <div className="relative z-10 flex flex-col items-center gap-3">
        {/* Animated Gradient Spinner Ring */}
        <div className="relative w-12 h-12 flex items-center justify-center">
          <motion.div
            className={`absolute inset-0 rounded-full bg-gradient-to-tr ${gradient} opacity-80 blur-sm`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className={`w-12 h-12 rounded-full bg-gradient-to-tr ${gradient} p-0.5 shadow-lg`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          >
            <div className="w-full h-full bg-[#0D0E12] rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
            </div>
          </motion.div>
        </div>

        <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-medium text-white/50 tracking-wide font-sans text-center">
          {message}
        </motion.p>
      </div>
    </div>
  )
}

export default CustomLoader
