import { useCallback, useEffect, useState } from 'react'
import { useAppStore } from '../store/store'
import { colors } from '../constants/color'
import { Contact } from '../types'
import { AnimatePresence, motion } from 'framer-motion'
import '../styles/ContactList.css'
import { BiUser } from 'react-icons/bi'
import { FiHash } from 'react-icons/fi'

const ContactList = ({ contacts, isChannel = false }: { contacts: Contact[] | string[]; isChannel?: boolean }) => {
  const { selectedChatData, setSelectedChatData, setSelectedChatType, setSelectedChatMessages, onlineUsers } = useAppStore()
  const [colorIndex, setColorIndex] = useState<number>(0)

  const handleClick = useCallback(
    (contact: Contact) => {
      if (isChannel) setSelectedChatType('channel')
      else setSelectedChatType('contact')
      setSelectedChatData(contact)
      if (selectedChatData && typeof selectedChatData === 'object' && selectedChatData?._id !== contact._id) {
        setSelectedChatMessages([])
      }
    },
    [isChannel, selectedChatData, setSelectedChatData, setSelectedChatMessages, setSelectedChatType]
  )

  useEffect(() => {
    if (typeof selectedChatData !== 'string' && selectedChatData?.color) {
      setColorIndex(typeof selectedChatData.color === 'number' ? selectedChatData.color : 0)
    }
  }, [selectedChatData])

  return (
    <div className="space-y-1">
      <AnimatePresence initial={false}>
        {contacts.map((contact, index) => {
          const isSelected = selectedChatData && typeof selectedChatData === 'object' && selectedChatData?._id === (typeof contact === 'object' ? contact._id : '')

          const name = isChannel
            ? typeof contact === 'object'
              ? contact.name
              : contact
            : typeof contact === 'object' && contact?.firstName && contact?.lastName
              ? `${contact.firstName} ${contact.lastName}`
              : typeof contact === 'object' && contact.email
                ? contact.email
                : 'Unknown'

          return (
            <motion.div
              key={typeof contact === 'object' ? contact._id : index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              onClick={() => typeof contact === 'object' && handleClick(contact)}
              className={`group relative p-2.5 rounded-2xl cursor-pointer transition-all duration-200 ${
                isSelected ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 shadow-lg' : 'hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  {typeof contact === 'object' && contact.image ? (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center border border-white/10 overflow-hidden shadow-sm"
                      style={{ backgroundColor: colors[colorIndex] }}
                    >
                      <img src={`${import.meta.env.VITE_LOCAL_HOST}/${contact.image}`} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-sm border border-white/10 ${
                        isChannel ? 'bg-gradient-to-tr from-indigo-600 to-purple-600' : ''
                      }`}
                      style={!isChannel ? { backgroundColor: colors[colorIndex] } : undefined}
                    >
                      {isChannel ? (
                        <FiHash className="text-sm" />
                      ) : typeof contact === 'object' && contact?.firstName && contact?.lastName ? (
                        `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase()
                      ) : (
                        <BiUser className="text-base" />
                      )}
                    </div>
                  )}
                  {!isChannel && (
                    <div
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-[#0D0E12] ${
                        typeof contact === 'object' && contact?._id && onlineUsers.includes(contact._id) ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-white/20'
                      }`}
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-medium truncate ${isSelected ? 'text-white font-semibold' : 'text-white/80 group-hover:text-white'}`}>{name}</h3>
                  <p className="text-[11px] text-white/40 truncate font-light mt-0.5">{isChannel ? 'Channel' : 'Click to chat'}</p>
                </div>
              </div>

              {isSelected && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-gradient-to-b from-indigo-400 to-purple-500 rounded-full"
                />
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export default ContactList
