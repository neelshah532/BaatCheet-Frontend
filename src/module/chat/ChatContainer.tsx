// import React, { useState } from 'react'
// import ContactContainer from './ContactContainer'
// import { FiMessageCircle, FiSearch, FiUser } from 'react-icons/fi'
// import { motion } from 'framer-motion'

// const ChatContainer = () => {
//   const [searchTerm, setSearchTerm] = useState('')

//   return (
//     <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} transition={{ type: 'tween', duration: 0.3 }} className="w-[340px] bg-[#13131A] border-r border-white/10 flex flex-col">
//       {/* Header */}
//       <div className="p-4 flex justify-between items-center bg-[#1C1C24]">
//         <div className="flex items-center space-x-3">
//           <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="cursor-pointer">
//             <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
//               <FiUser size={24} />
//             </div>
//           </motion.div>
//           <h1 className="text-xl font-bold">ChatApp</h1>
//         </div>
//         <div className="flex items-center space-x-3">
//           <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="text-gray-400 hover:text-white">
//             <FiMessageCircle size={24} />
//           </motion.button>
//         </div>
//       </div>

//       {/* Search Bar */}
//       <div className="p-4">
//         <div className="relative">
//           <input
//             type="text"
//             placeholder="Search contacts"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full px-4 py-2 bg-[#15151F] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           />
//           <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
//         </div>
//       </div>

//       {/* Contact List */}
//       <ContactContainer searchTerm={searchTerm} onSelectChat={onSelectChat} selectedChat={selectedChat} />
//     </motion.div>
//   )
// }

// export default ChatContainer

import React from 'react'
import ChatHeader from './components/ChatHeader'
import MessageBar from './components/MessageBar'
import MessageContainer from './components/MessageContainer'

const ChatContainer = () => {
  return (
    <div className="fixed top-0 h-[100vh] w-full bg-[#1c1d25] flex flex-col md:static md:flex-1 ">
      <ChatHeader />
      <MessageContainer />
      <MessageBar />
    </div>
  )
}

export default ChatContainer
