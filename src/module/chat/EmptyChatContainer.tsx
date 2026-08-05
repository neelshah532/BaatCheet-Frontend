import { motion } from 'framer-motion'
import { FiMessageSquare, FiUsers, FiVideo, FiShield } from 'react-icons/fi'

const EmptyChatContainer = () => {
  const features = [
    {
      icon: <FiMessageSquare className="w-5 h-5 text-indigo-400" />,
      title: 'Direct Messaging',
      desc: 'Real-time encrypted text, file, and media sharing.',
    },
    {
      icon: <FiVideo className="w-5 h-5 text-emerald-400" />,
      title: 'HD Video & Audio',
      desc: 'Crystal-clear peer-to-peer WebRTC calls.',
    },
    {
      icon: <FiUsers className="w-5 h-5 text-purple-400" />,
      title: 'Channels & Groups',
      desc: 'Collaborate seamlessly in topic-based channels.',
    },
    {
      icon: <FiShield className="w-5 h-5 text-amber-400" />,
      title: 'Secure & Private',
      desc: 'End-to-end socket channels with user privacy.',
    },
  ]

  return (
    <div className="h-full bg-[#0D0E12] hidden md:flex flex-1 items-center justify-center p-8 relative overflow-hidden select-none">
      {/* Background Depth Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#161822_0%,_#0D0E12_70%)] opacity-80 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-xl w-full flex flex-col items-center text-center"
      >
        {/* Brand Badge */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mb-6 shadow-2xl backdrop-blur-xl">
          <FiMessageSquare className="w-8 h-8 text-indigo-400" />
        </div>

        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
          Welcome to <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">BaatCheet</span>
        </h2>
        <p className="text-white/50 text-base max-w-md mb-10 leading-relaxed font-light">Select a contact or channel from the sidebar to join the conversation.</p>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4 w-full text-left">
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="bg-white/[0.02] border border-white/[0.06] hover:border-white/15 p-4 rounded-2xl transition-all duration-300 backdrop-blur-md"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">{feat.icon}</div>
                <h3 className="text-sm font-semibold text-white/90">{feat.title}</h3>
              </div>
              <p className="text-xs text-white/40 leading-relaxed font-light pl-1">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default EmptyChatContainer
