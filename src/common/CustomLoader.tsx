// components/loaders/CustomLoader.tsx
import { motion } from 'framer-motion'

interface CustomLoaderProps {
  size?: 'small' | 'medium' | 'large'
  message?: string
  type?: 'default' | 'upload' | 'search'
}

const CustomLoader = ({ type = 'default', message = 'Loading...' }: CustomLoaderProps) => {
  const loaderTypes = {
    default: {
      gradient: 'from-blue-500 to-indigo-500',
      particles: 8,
    },
    upload: {
      gradient: 'from-green-500 to-teal-500',
      particles: 15,
    },
    search: {
      gradient: 'from-purple-500 to-pink-500',
      particles: 8,
    },
  }

  const { gradient, particles } = loaderTypes[type]

  return (
    <div className="relative flex items-center justify-center p-4">
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          className={`w-16 h-16 rounded-full bg-gradient-to-r ${gradient} relative`}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
        >
          <div className="absolute inset-2 bg-[#13131A] rounded-full" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { delay: 0.3 },
          }}
          className="mt-4 text-sm text-gray-400"
        >
          {message}
        </motion.p>
      </div>

      {/* Particle Effect */}
      {[...Array(particles)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${gradient} opacity-30`}
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 8 + 4}px`,
            height: `${Math.random() * 8 + 4}px`,
          }}
          animate={{
            x: Math.random() * 100 - 50,
            y: Math.random() * 100 - 50,
            opacity: [0.2, 0.5, 0.2],
            transition: {
              duration: Math.random() * 8 + 5,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
        />
      ))}
    </div>
  )
}

export default CustomLoader
