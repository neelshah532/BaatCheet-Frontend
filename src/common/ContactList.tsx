import { useEffect, useState } from 'react'
import { useAppStore } from '../store/store'
import { colors } from '../constants/color'
import { Contact } from '../types'
import { AnimatePresence, motion } from 'motion/react'
import '../styles/ContactList.css'
import { BiUser } from 'react-icons/bi'

const ContactList = ({ contacts, isChannel = false }: { contacts: Contact[] | string[]; isChannel?: boolean }) => {
  const { selectedChatData, setSelectedChatData, setSelectedChatType, setSelectedChatMessages } = useAppStore()
  const [colorIndex, setColorIndex] = useState<number>(0)

  const handleClick = (contact: Contact) => {
    if (isChannel) setSelectedChatType('channel')
    else setSelectedChatType('contact')
    setSelectedChatData(contact)
    if (selectedChatData && typeof selectedChatData === 'object' && selectedChatData?._id !== contact._id) {
      setSelectedChatMessages([])
    }
  }
  console.log('contacts', contacts)
  useEffect(() => {
    if (typeof selectedChatData !== 'string' && selectedChatData?.color) {
      setColorIndex(typeof selectedChatData.color === 'number' ? selectedChatData.color : 0)
    }
  }, [selectedChatData])

  return (
    <div className="contact-list-container">
      <AnimatePresence initial={false}>
        {contacts.map((contact, index) => (
          <motion.div
            key={typeof contact === 'object' ? contact._id : index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            onClick={() => typeof contact === 'object' && handleClick(contact)}
            className={`group p-2 mx-2 my-1 rounded-xl cursor-pointer
                transition-all duration-300  hover:border-[1px] hover:border-indigo-300/20
                ${
                  selectedChatData && typeof selectedChatData === 'object' && selectedChatData?._id === (typeof contact === 'object' ? contact._id : '')
                    ? 'bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border border-indigo-500/20'
                    : ''
                }`}
          >
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative">
                {typeof contact === 'object' && contact.image ? (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center  border-2 border-indigo-500/20
                                group-hover:border-indigo-500/40 transition-all duration-300"
                    style={{ backgroundColor: colors[colorIndex] }}
                  >
                    <img src={`${import.meta.env.VITE_LOCAL_HOST}/${contact.image}`} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                  </div>
                ) : (
                  <div
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500
                                flex items-center justify-center text-white text-base font-medium"
                  >
                    {typeof contact === 'object' && contact?.firstName && contact?.lastName ? (
                      `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase()
                    ) : (
                      <>{isChannel ? <div> #</div> : <BiUser className="text-2xl" />}</>
                    )}
                  </div>
                )}
                <div className="absolute bottom-1 right-0 w-3 h-3 bg-green-500 rounded-full border-[1.5px] border-[#13131A]" />
              </motion.div>

              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">
                  {isChannel
                    ? typeof contact === 'object'
                      ? contact.name
                      : contact
                    : typeof contact === 'object' && contact?.firstName && contact?.lastName
                      ? `${contact.firstName} ${contact.lastName}`
                      : typeof contact === 'object' && contact.email
                        ? contact.email
                        : 'Unknown'}
                </h3>
                {/* <p className="text-gray-400 text-sm truncate">{isChannel ? 'Channel' : 'Last seen recently'}</p> */}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {/* {contacts.map((contact: Contact) => (
        <div
          key={typeof contact === 'object' ? contact._id : contact}
          onClick={() => typeof contact === 'object' && handleClick(contact)}
          className={`contact-item ${
            selectedChatData && typeof selectedChatData === 'object' && selectedChatData?._id === (typeof contact === 'object' ? contact._id : contact) ? 'contact-item-active' : ''
          }`}
        >
          <div className="contact-content">
            {!isChannel ? (
              <div className="contact-avatar">
                {typeof contact === 'object' && contact.image ? (
                  <div className="avatar-container" style={{ backgroundColor: colors[colorIndex] }}>
                    <img src={`${import.meta.env.VITE_LOCAL_HOST}/${contact.image}`} alt="Profile" className="avatar-image" />
                  </div>
                ) : (
                  <div className="avatar-fallback" style={{ backgroundColor: colors[colorIndex] }}>
                    {contact?.firstName && contact?.lastName ? `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase() : '?'}
                  </div>
                )}
              </div>
            ) : (
              <div className="channel-avatar">#</div>
            )}

            <div className="contact-info">
              <span className="contact-name">
                {isChannel ? contact.firstName : contact?.firstName && contact?.lastName ? `${contact.firstName} ${contact.lastName}` : typeof contact === 'string' ? contact : ''}
              </span>
            </div>
          </div>
        </div>
      ))} */}
    </div>
  )
}

export default ContactList
