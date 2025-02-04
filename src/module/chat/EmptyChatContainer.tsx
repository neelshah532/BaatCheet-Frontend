// import React from 'react'
// import { FiMessageCircle } from 'react-icons/fi'
// import { motion } from 'framer-motion'

// const EmptyChatContainer = () => {
//   return (
// <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex items-center justify-center bg-[#0C0C14] text-center">
//   <div>
//     <motion.div
//       animate={{
//         scale: [1, 1.1, 1],
//         rotate: [0, 10, -10, 0],
//       }}
//       transition={{
//         duration: 1.5,
//         repeat: Infinity,
//         repeatType: 'loop',
//       }}
//       className="mx-auto w-32 h-32 bg-[#1C1C24] rounded-full flex items-center justify-center mb-6"
//     >
//       <FiMessageCircle size={64} className="text-blue-500" />
//     </motion.div>
//     <h2 className="text-2xl font-bold text-white mb-4">Select a chat to start messaging</h2>
//     <p className="text-gray-400 max-w-md mx-auto">Choose a contact from the sidebar or start a new conversation</p>
//   </div>
// </motion.div>
//   )
// }

// export default EmptyChatContainer

// import React from 'react'
// import Lottie from 'react-lottie'
// import animationData from '../../assets/lottie-json.json'

import { motion } from 'framer-motion'
// import { FiMessageCircle } from 'react-icons/fi'

const EmptyChatContainer = () => {
  return (
    <div className="h-full bg-[#080810] backdrop-blur-xl md:flex items-center justify-center p-8 hidden">
      <div className="fixed inset-0 ">
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative group max-w-md flex-1 flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_#141420_0%,_#080810_100%)] backdrop-blur-xl rounded-full text-center "
      >
        <div
          className="absolute -inset-[1px] bg-gradient-to-r 
        from-blue-500/30 to-indigo-500/30 rounded-3xl blur-md 
        opacity-40 group-hover:opacity-60 transition duration-500"
        />
        <div
          className="relative bg-[#13131A]/90 backdrop-blur-xl 
        rounded-2xl border border-white/[0.05] p-8"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: 'loop',
            }}
            className="mx-auto w-32 h-32 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mb-6"
          >
            {/* <FiMessageCircle size={64} className="text-blue-500" /> */}
            <svg className="w-12 h-12 text-white " fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </motion.div>
          <h2
            className="text-3xl font-bold text-white mt-8 mb-4 
          bg-gradient-to-r from-blue-400 to-indigo-400 
          bg-clip-text text-transparent"
          >
            Welcome to ChatApp
          </h2>
          <p className="text-gray-400 text-lg">Select a chat to start messaging or create a new conversation</p>
        </div>
      </motion.div>
    </div>
  )
}

export default EmptyChatContainer
