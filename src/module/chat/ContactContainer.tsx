import { useCallback, useEffect, useState } from 'react'
import DirectMessage from './components/DirectMessage'
import ProfileInfo from './components/ProfileInfo'
import http from '../../services/http'
import { useAppStore } from '../../store/store'
import '../../styles/CustomScroll.css'
import ContactList from '../../common/ContactList'
import CreateChannel from './components/CreateChannel'
import { handleError } from '../../common/HandleError'
import CustomLoader from '../../common/CustomLoader'

const SectionTitle = ({ text }: { text: string }) => {
  return <h6 className="uppercase tracking-widest text-white/40 font-semibold text-[11px] select-none">{text}</h6>
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
        setChannels(response?.data?.channels)
      }
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }, [setChannels])

  useEffect(() => {
    void getChannels()
    void getContacts()
  }, [getContacts, getChannels])

  return (
    <div
      className="relative w-full border-r border-white/[0.08] bg-[#0D0E12]/95 backdrop-blur-2xl
      flex flex-col h-full overflow-hidden select-none z-10"
    >
      {/* App Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-white/[0.08] bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-xl bg-white/[0.02] border border-white/10 shadow-md text-indigo-400">
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M16 26C21.5228 26 26 21.5228 26 16C26 10.4772 21.5228 6 16 6C10.4772 6 6 10.4772 6 16C6 18.3263 6.79328 20.4674 8.12519 22.1704L7 25L9.82958 23.8752C11.5326 25.2071 13.6737 26 16 26Z"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M12 13H20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M12 17H17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[13px] font-medium tracking-[0.2em] text-white uppercase font-sans">BaatCheet</span>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6 flex-1 overflow-y-auto custom-scrollbar pb-20">
        {/* Direct Messages */}
        <div>
          <div className="flex items-center justify-between px-2 mb-3">
            <SectionTitle text="Direct Messages" />
            <DirectMessage />
          </div>
          <div className="max-h-[35vh] overflow-y-auto custom-scrollbar">
            {isLoading && directContactMessages.length === 0 ? (
              <CustomLoader type="search" message="Fetching contacts..." />
            ) : directContactMessages.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-white/30 font-light border border-dashed border-white/5 rounded-2xl">
                No direct messages yet. Click + to start a chat.
              </div>
            ) : (
              <ContactList contacts={directContactMessages} />
            )}
          </div>
        </div>

        {/* Channels */}
        <div>
          <div className="flex items-center justify-between px-2 mb-3">
            <SectionTitle text="Channels" />
            <CreateChannel />
          </div>
          <div className="max-h-[35vh] overflow-y-auto custom-scrollbar">
            {isLoading && channels.length === 0 ? (
              <CustomLoader type="search" message="Fetching channels..." />
            ) : channels.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-white/30 font-light border border-dashed border-white/5 rounded-2xl">
                No channels created yet. Click + to create one.
              </div>
            ) : (
              <ContactList contacts={channels} isChannel={true} />
            )}
          </div>
        </div>
      </div>

      {/* User Profile Footer */}
      <ProfileInfo />
    </div>
  )
}

export default ContactContainer
