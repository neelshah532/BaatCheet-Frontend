import React, { useEffect, useState } from 'react'
import ToolTip from '../../../common/ToolTip'
import { FaPlus } from 'react-icons/fa'
import Lottie from 'react-lottie'
import animationData from '../../../assets/lottie-json.json'
import http from '../../../services/http'
import { colors } from '../../../constants/color'
import { useAppStore } from '../../../store/store'
import { Contact } from '../../../types'
import { IoClose } from 'react-icons/io5'
import { FiSearch } from 'react-icons/fi'
import '../../../styles/CustomScroll.css'
import { handleError } from '../../../common/HandleError'
import CustomLoader from '../../../common/CustomLoader'
import { motion, AnimatePresence } from 'framer-motion'

const DirectMessage: React.FC = () => {
  const { setSelectedChatType, setSelectedChatData, userInfo } = useAppStore()
  const [openNewContactModal, setOpenNewContactModal] = useState(false)
  const [searchCon, setSearchCon] = useState('')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0)
  const [loadingStates, setLoadingStates] = useState<{ initialLoad: boolean; searching: boolean; selecting: boolean }>({
    initialLoad: true,
    searching: false,
    selecting: false,
  })

  useEffect(() => {
    if (userInfo?.profileSetup) {
      setSelectedColorIndex(typeof userInfo?.color === 'number' ? userInfo.color : 0)
      setLoadingStates((prev) => ({ ...prev, initialLoad: false }))
    }
  }, [userInfo])

  const searchContacts = async (search: string) => {
    try {
      if (!search) {
        setContacts([])
        return
      }

      const response = await http.post('/api/contacts/search', { search }, { withCredentials: true })
      if (response?.data?.contacts) {
        setContacts(response.data.contacts)
      } else {
        setContacts([])
      }
    } catch (error) {
      handleError(error)
      setContacts([])
    } finally {
      setLoadingStates((prev) => ({ ...prev, searching: false }))
    }
  }

  useEffect(() => {
    if (searchCon) {
      setLoadingStates((prev) => ({ ...prev, searching: true }))
      const timer = setTimeout(() => {
        searchContacts(searchCon)
      }, 500)

      return () => clearTimeout(timer)
    } else {
      setContacts([])
      setLoadingStates((prev) => ({ ...prev, searching: false }))
    }
  }, [searchCon])

  const selectNewContact = async (contact: Contact) => {
    setLoadingStates((prev) => ({ ...prev, selecting: true }))
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      setSelectedChatType('contact')
      setSelectedChatData(contact)
      setContacts([])
      setSearchCon('')
      setOpenNewContactModal(false)
    } finally {
      setLoadingStates((prev) => ({ ...prev, selecting: false }))
    }
  }

  const renderContactList = () => {
    if (loadingStates.searching) {
      return <CustomLoader type="search" message="Searching contacts..." />
    }

    if (contacts.length > 0) {
      return (
        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
          {contacts.map((contact) => (
            <motion.div
              key={contact._id}
              whileHover={{ x: 4, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              className="flex items-center gap-3.5 p-3 rounded-2xl cursor-pointer border border-white/5 hover:border-white/10 transition-all duration-200"
              onClick={() => selectNewContact(contact)}
            >
              <div className="relative w-11 h-11 flex-shrink-0">
                {contact.image ? (
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center border border-white/10 overflow-hidden shadow-sm"
                    style={{ backgroundColor: colors[contact?.color ?? 0] }}
                  >
                    <img src={`${import.meta.env.VITE_LOCAL_HOST}/${contact.image}`} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-xs font-semibold text-white shadow-sm border border-white/10"
                    style={{ backgroundColor: colors[contact?.color ?? selectedColorIndex] }}
                  >
                    {contact.firstName && contact.lastName ? `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase() : '?'}
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-[#0D0E12]" />
              </div>

              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-semibold text-white truncate">{contact.firstName && contact.lastName ? `${contact.firstName} ${contact.lastName}` : 'User'}</span>
                <span className="text-xs text-white/40 font-mono truncate">{contact.email}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )
    }

    /* PRESERVED LOTTIE ANIMATION GIF FROM ORIGINAL UI */
    return (
      <div className="flex flex-col justify-center items-center py-6 text-center">
        <Lottie
          isClickToPauseDisabled={true}
          options={{
            loop: true,
            autoplay: true,
            animationData,
            rendererSettings: {
              preserveAspectRatio: 'xMidYMid slice',
            },
          }}
          height={120}
          width={120}
        />
        <p className="text-sm font-medium text-white/70 mt-3">
          Search contacts by name or email <span className="text-indigo-400">👋</span>
        </p>
      </div>
    )
  }

  if (loadingStates.initialLoad) {
    return <CustomLoader type="default" message="Loading contacts..." />
  }

  return (
    <div>
      <ToolTip content="Select New Contact" direction="top">
        <button
          onClick={() => setOpenNewContactModal(true)}
          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all"
        >
          <FaPlus className="text-xs" />
        </button>
      </ToolTip>

      <AnimatePresence>
        {openNewContactModal && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0D0E12]/95 border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl backdrop-blur-2xl flex flex-col gap-4"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <h2 className="text-base font-bold text-white tracking-wide">New Conversation</h2>
                <button
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5 transition-all"
                  onClick={() => setOpenNewContactModal(false)}
                >
                  <IoClose className="text-lg" />
                </button>
              </div>

              {/* Search Bar Input */}
              <div className="relative flex items-center">
                <FiSearch className="absolute left-4 text-white/40 text-base" />
                <input
                  type="text"
                  placeholder="Search user by name or email..."
                  className="w-full pl-11 pr-4 py-3 bg-white/[0.04] rounded-2xl border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all font-sans"
                  value={searchCon}
                  onChange={(e) => setSearchCon(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Results Container */}
              <div className="pt-2">{loadingStates.selecting ? <CustomLoader type="default" message="Opening conversation..." /> : renderContactList()}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DirectMessage
