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

import { useCallback, useEffect, useState } from 'react'
import victory from '../../assets/Victoryicon.svg'
import DirectMessage from './components/DirectMessage'
import ProfileInfo from './components/ProfileInfo'
import http from '../../services/http'
import { useAppStore } from '../../store/store'
import '../../styles/CustomScroll.css'
import ContactList from '../../common/ContactList'
import CreateChannel from './components/CreateChannel'
import { handleError } from '../../common/HandleError'
import CustomLoader from '../../common/CustomLoader'

const Title = ({ text }: { text: string }) => {
  return <h6 className="uppercase tracking-widest text-neutral-400 pl-10 font-light text-opacity-90 text-sm">{text}</h6>
}

const ContactContainer = () => {
  const { directContactMessages, setDirectContactMessages, channels, setChannels } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)

  const getContacts = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await http.get('/api/contacts/get-contact-for-dm', { withCredentials: true })
      if (response?.data?.contacts) {
        setDirectContactMessages(response?.data?.contacts)
      }
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }, [setDirectContactMessages])

  const getChannels = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await http.get('/api/channel/get-channels', { withCredentials: true })
      if (response?.data?.channels) {
        console.log('channel data', response?.data?.channels)
        setChannels(response?.data?.channels)
      }
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }, [setChannels])

  useEffect(() => {
    getChannels()
    getContacts()
  }, [getContacts, getChannels])

  if (isLoading === true && !directContactMessages && !channels) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <CustomLoader type="default" message="Loading conversation..." />
      </div>
    )
  }

  return (
    <div
      className="relative md:w-[35vw] lg:w-[30vw] xl:w-[20vw] 
   border-r border-white/[0.05] 
  shadow-lg shadow-black/10 w-full"
    >
      <div className="h-16 px-6 flex items-center justify-between border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <img src={victory} alt="logo" className="h-8 w-8" />
          <h1 className="text-lg font-semibold text-white">ChatApp</h1>
        </div>
      </div>
      <div className="px-4 py-6 space-y-6 ">
        {/* Direct Messages */}
        <div>
          <div className="flex items-center justify-between px-2 mb-4 custom-scrollbar ">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider ">
              <Title text="Direct Message" />
            </h2>
            <DirectMessage />
          </div>
          <div className=" max-h-[38vh] overflow-auto custom-scrollbar">
            {isLoading === true && <CustomLoader type="search" message="Searching contacts..." />}
            {directContactMessages.length === 0 && <div className="flex flex-col justify-center items-center mt-5 text-white text-opacity-80 text-center"> no contacts found</div>}
            <ContactList contacts={directContactMessages} />
          </div>
        </div>

        {/* Channels */}
        <div>
          <div className="flex items-center justify-between px-2 mb-4 custom-scrollbar ">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider ">
              <Title text="Create Channel" />
            </h2>
            <CreateChannel />
          </div>
          <div className=" max-h-[38vh] overflow-auto custom-scrollbar">
            {isLoading && <CustomLoader type="search" message="Searching Channel..." />}
            <ContactList contacts={channels} isChannel={true} />
          </div>
          {/* Contact list would go here */}
        </div>
      </div>

      {/* Profile Section */}
      <ProfileInfo />
    </div>
  )
}

export default ContactContainer
