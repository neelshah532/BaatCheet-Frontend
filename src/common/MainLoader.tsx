import { motion } from 'framer-motion'

const MainLoader = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#0A0A0F] to-[#1A1A2E] flex items-center justify-center z-50 overflow-hidden">
      {/* Floating Chat Bubbles with Fading Trails */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: -150, opacity: [0, 1, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeInOut',
          }}
          className={`absolute w-10 h-10 rounded-full bg-gradient-to-r 
            ${i % 2 === 0 ? 'from-blue-500 to-cyan-500' : 'from-purple-500 to-pink-500'}
            shadow-lg opacity-60 backdrop-blur-md`}
          style={{ left: `${15 + i * 13}%` }}
        />
      ))}

      {/* Dynamic Morphing Loader */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: [0.8, 1, 0.8], borderRadius: ['25%', '50%', '25%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-500 shadow-xl flex items-center justify-center z-20"
      >
        <span className="text-3xl font-bold text-white ">💬</span>
      </motion.div>

      <motion.h2
        animate={{ opacity: [0.3, 1, 0.3], y: [0, -5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute bottom-24 text-white/80 text-lg font-semibold tracking-wide"
      >
        Welcome to the BaatChaat
      </motion.h2>

      {/* Wave-like Text Animation */}
      <motion.h2
        animate={{ opacity: [0.3, 1, 0.3], y: [0, -5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute bottom-12 text-white/80 text-lg font-semibold tracking-wide"
      >
        Connecting your conversations...
      </motion.h2>
    </div>
  )
}

export default MainLoader
