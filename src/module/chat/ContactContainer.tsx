// import React from 'react'
// import { motion } from 'framer-motion'

// const ContactContainer = ({ searchTerm, onSelectChat, selectedChat }: any) => {
//   const mockContacts = [
//     {
//       id: 1,
//       name: 'John Doe',
//       lastMessage: 'Hey, how are you?',
//       avatar: 'https://via.placeholder.com/150',
//       unreadCount: 2,
//       status: 'online',
//       lastSeen: 'Last seen 2 minutes ago',
//     },
//     {
//       id: 2,
//       name: 'Jane Smith',
//       lastMessage: 'See you later!',
//       avatar: 'https://via.placeholder.com/150',
//       unreadCount: 0,
//       status: 'offline',
//       lastSeen: 'Last seen 5 hours ago',
//     },
//   ]
//   const filteredContacts = mockContacts.filter((contact) => contact.name.toLowerCase().includes(searchTerm.toLowerCase()))

//   return (
//     <motion.div className="flex-1 overflow-y-auto custom-scrollbar">
//       {filteredContacts.map((contact) => (
//         <motion.div
//           key={contact.id}
//           whileHover={{ scale: 1.02 }}
//           onClick={() => onSelectChat(contact)}
//           className={`flex items-center p-4 cursor-pointer
//             ${selectedChat?.id === contact.id ? 'bg-[#2C2C3A]' : 'hover:bg-[#1C1C24]'}`}
//         >
//           <div className="relative">
//             <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full object-cover" />
//             {contact.status === 'online' && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#13131A]" />}
//           </div>
//           <div className="ml-4 flex-1">
//             <div className="flex justify-between items-center">
//               <h3 className="font-semibold">{contact.name}</h3>
//               <span className="text-xs text-gray-400">12:34 PM</span>
//             </div>
//             <div className="flex justify-between items-center">
//               <p className="text-sm text-gray-400 truncate">{contact.lastMessage}</p>
//               {contact.unreadCount > 0 && <div className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">{contact.unreadCount}</div>}
//             </div>
//           </div>
//         </motion.div>
//       ))}
//     </motion.div>
//   )
// }

// export default ContactContainer

import React from 'react'
import victory from '../../assets/Victoryicon.svg'

const Title = ({ text }: { text: string }) => {
  return <h6 className="uppercase tracking-widest text-neutral-400 pl-10 font-light text-opacity-90 text-sm">{text}</h6>
}

const ContactContainer = () => {
  return (
    <div className="relative md:w-[35vw] lg:w-[30vw] xl:w-[20vw] bg-[#1b1c24] border-r-2 border-[#2f303b] w-full">
      <div className="pt-3">
        <img src={victory} alt="" width={78} height={32} />
      </div>
      <div className="my-5">
        <div className="flex items-center justify-between pr-10">
          <Title text="Direct Message" />
        </div>
      </div>
      <div className="my-5">
        <div className="flex items-center justify-between pr-10">
          <Title text="Channels" />
        </div>
      </div>
    </div>
  )
}

export default ContactContainer
