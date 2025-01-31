// import React from 'react'
// import { FiMessageCircle } from 'react-icons/fi'
// import { motion } from 'framer-motion'

// const EmptyChatContainer = () => {
//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex items-center justify-center bg-[#0C0C14] text-center">
//       <div>
//         <motion.div
//           animate={{
//             scale: [1, 1.1, 1],
//             rotate: [0, 10, -10, 0],
//           }}
//           transition={{
//             duration: 1.5,
//             repeat: Infinity,
//             repeatType: 'loop',
//           }}
//           className="mx-auto w-32 h-32 bg-[#1C1C24] rounded-full flex items-center justify-center mb-6"
//         >
//           <FiMessageCircle size={64} className="text-blue-500" />
//         </motion.div>
//         <h2 className="text-2xl font-bold text-white mb-4">Select a chat to start messaging</h2>
//         <p className="text-gray-400 max-w-md mx-auto">Choose a contact from the sidebar or start a new conversation</p>
//       </div>
//     </motion.div>
//   )
// }

// export default EmptyChatContainer

import React from 'react'
import Lottie from 'react-lottie'
import animationData from '../../assets/lottie-json.json'

const EmptyChatContainer = () => {
  return (
    <div className="flex-1 md:bg-[#1c1d25] md:flex flex-col justify-center items-center hidden duration-1000 transition-all">
      <Lottie
        isClickToPauseDisabled={true}
        options={{
          loop: true,
          autoplay: true,
          animationData,
        }}
        height={200}
        width={200}
      />
      <div className="text-opacity-80 text-white flex flex-col gap-5 items-center mt-10 lg:text-4xl text-3xl transition-all duration-300 text-center">
        <h3 className="poppins-thin">
          Hi <span className="text-blue-500">👋</span> Select a chat to start messaging
        </h3>
      </div>
    </div>
  )
}

export default EmptyChatContainer
