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
        <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center mb-6 shadow-2xl backdrop-blur-xl text-indigo-400">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        </div>

        <h2 className="text-2xl font-light tracking-widest text-white mb-2 uppercase">
          Welcome to <span className="font-semibold text-indigo-400">BaatCheet</span>
        </h2>
        <p className="text-white/40 text-sm max-w-md mb-10 leading-relaxed font-light">Select a contact or channel from the sidebar to join the conversation.</p>

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
