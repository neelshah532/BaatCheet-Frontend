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
import '../../../styles/CustomScroll.css'
import { handleError } from '../../../common/HandleError'

const DirectMessage: React.FC = () => {
  const { setSelectedChatType, setSelectedChatData } = useAppStore()
  const [openNewContactModal, setOpenNewContactModal] = useState(false)
  const [searchCon, setSearchCon] = useState('')

  const [contacts, setContacts] = useState<Contact[]>([])
  const { userInfo } = useAppStore()
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0)

  useEffect(() => {
    if (userInfo?.profileSetup) {
      setSelectedColorIndex(typeof userInfo?.color === 'number' ? userInfo.color : 0)
    }
  }, [userInfo])

  const searchContacts = async (search: string) => {
    try {
      if (!search) {
        setContacts([])
        return
      }

      const response = await http.post('/api/contacts/search', { search }, { withCredentials: true })
      // console.log('Response:', response)
      if (response?.data?.contacts) {
        setContacts(response?.data?.contacts)
      } else {
        setContacts([])
      }
    } catch (error) {
      handleError(error)
      setContacts([])
    }
  }
  // console.log('Contacts:', contacts)

  // Debounce input to prevent multiple API calls on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      searchContacts(searchCon)
    }, 1000)

    return () => clearTimeout(timer)
  }, [searchCon])

  const selectNewContact = (contact: Contact) => {
    setOpenNewContactModal(false)
    setSearchCon('')
    setSelectedChatType('contact')
    setSelectedChatData(contact)
    setContacts([])
    // console.log('Selected contact:', contact)
  }

  return (
    <div>
      <ToolTip content="Select New Contact" direction="top">
        <FaPlus
          className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300"
          onClick={() => setOpenNewContactModal(true)}
        />
      </ToolTip>

      {openNewContactModal && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm bg-opacity-50 flex justify-center items-center z-20">
          <div className="bg-[#0C0C14] border border-white/[0.05] rounded-2xl  border-none p-5 max-h-[80vh] flex flex-col w-[400px] h-[400px]">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-white text-lg font-semibold">Please Select New Contact</h2>
              <button className="p-2 rounded-lg bg-[#1C1C24] hover:bg-[#2C2C3A] hover:bg-white/[0.05] transition-colors duration-200" onClick={() => setOpenNewContactModal(false)}>
                <IoClose className="text-gray-400 hover:text-white transition-colors duration-200 font-bold text-lg" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Search Contacts"
              className="w-full px-5 py-3.5 bg-[#1C1C24] rounded-lg border border-white/[0.05]
                    text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500
                    transition-all duration-300"
              value={searchCon}
              onChange={(e) => setSearchCon(e.target.value)}
            />
            <div className="mt-3 overflow-y-auto max-h-60 p-2 border-t border-neutral-700">
              {contacts.length > 0 && (
                <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                  <div className="flex flex-col gap-5">
                    {contacts.map((contact) => (
                      <div
                        key={contact._id}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/[0.05] 
                        cursor-pointer transition-colors duration-200 text-white"
                        onClick={() => selectNewContact(contact)}
                      >
                        <div className="relative w-12 h-12">
                          {contact.image ? (
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                              style={{ backgroundColor: colors[contact?.color ?? 0] }}
                            >
                              <img src={`${import.meta.env.VITE_LOCAL_HOST}/${contact.image}`} alt="Profile Preview" className="w-10 h-10 rounded-full object-cover" />
                            </div>
                          ) : (
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white"
                              style={{ backgroundColor: colors[selectedColorIndex] }}
                            >
                              {contact.firstName && contact.lastName ? `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase() : '?'}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span>{contact.firstName && contact.lastName ? `${contact.firstName}${' '}${contact.lastName}`.toUpperCase() : '?'}</span>
                          <span className="text-xs text-white">{contact.email}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {contacts.length <= 0 && (
                <div className="flex flex-col justify-center items-center mt-5 text-white text-opacity-80 text-center">
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
                  <h3 className="poppins-thin mt-5">
                    Hi <span className="text-blue-500">👋</span> Search New Contact.
                  </h3>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DirectMessage
