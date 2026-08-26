import { motion } from 'framer-motion'
import { FiMessageSquare, FiUsers, FiVideo, FiShield } from 'react-icons/fi'

const EmptyChatContainer = () => {
  const features = [
    {
      icon: <FiMessageSquare className="w-4 h-4 text-indigo-400" />,
      title: 'Direct Messaging',
      desc: 'Real-time encrypted text, file, and rich media communication.',
      accent: 'group-hover:border-indigo-500/30 group-hover:bg-indigo-500/[0.04]',
    },
    {
      icon: <FiVideo className="w-4 h-4 text-emerald-400" />,
      title: 'HD Video & Audio',
      desc: 'Ultra-low latency peer-to-peer WebRTC voice & video calls.',
      accent: 'group-hover:border-emerald-500/30 group-hover:bg-emerald-500/[0.04]',
    },
    {
      icon: <FiUsers className="w-4 h-4 text-violet-400" />,
      title: 'Channels & Groups',
      desc: 'Organized topic-based rooms for seamless community collaboration.',
      accent: 'group-hover:border-violet-500/30 group-hover:bg-violet-500/[0.04]',
    },
    {
      icon: <FiShield className="w-4 h-4 text-amber-400" />,
      title: 'Interactive Gaming',
      desc: 'Synchronized live chess, puzzles, and interactive activities in real-time.',
      accent: 'group-hover:border-amber-500/30 group-hover:bg-amber-500/[0.04]',
    },
  ]

  return (
    <div className="h-full bg-[#08090E]/60 backdrop-blur-3xl hidden md:flex flex-1 items-center justify-center p-8 relative overflow-hidden select-none">
      {/* Ambient background light */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/[0.06] blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-lg w-full flex flex-col items-center text-center"
      >
        {/* Luminous Brand Emblem */}
        <div className="relative mb-6">
          <div className="absolute -inset-2 bg-indigo-500/20 blur-xl rounded-full" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-b from-white/[0.1] to-white/[0.02] border border-white/15 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl text-indigo-400">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        </div>

        <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight mb-2">
          Welcome to <span className="bg-gradient-to-r from-indigo-300 via-indigo-200 to-white bg-clip-text text-transparent">BaatCheet</span>
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-sm mb-8 leading-relaxed font-normal">
          Select a contact or channel from the sidebar to start a real-time conversation.
        </p>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 gap-3 w-full text-left">
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className={`group bg-white/[0.02] border border-white/[0.07] p-3.5 rounded-2xl transition-all duration-300 backdrop-blur-md cursor-default ${feat.accent}`}
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="p-1.5 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">{feat.icon}</div>
                <h3 className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">{feat.title}</h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-normal pl-0.5">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default EmptyChatContainer
