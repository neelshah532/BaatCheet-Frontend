import { useEffect, useState } from 'react'
import ToolTip from '../../../common/ToolTip'
import { FaPlus } from 'react-icons/fa'
import Lottie from 'react-lottie'
import animationData from '../../../assets/lottie-json.json'
import http from '../../../services/http'
import { useAppStore } from '../../../store/store'
import { ContactOption } from '../../../types'
import { IoClose } from 'react-icons/io5'
import '../../../styles/CustomScroll.css'
import CustomLoader from '../../../common/CustomLoader'
import MultipleSelector from '../../../common/MultipleSelector'
import { motion, AnimatePresence } from 'framer-motion'

const CreateChannel = () => {
  const { addChannels, userInfo } = useAppStore()
  const [newChannelModal, setNewChannelModal] = useState(false)
  const [loadingStates, setLoadingStates] = useState<{ initialLoad: boolean; searching: boolean; selecting: boolean }>({
    initialLoad: true,
    searching: false,
    selecting: false,
  })

  const [allContacts, setAllContacts] = useState<ContactOption[]>([])
  const [selectedContacts, setSelectedContacts] = useState<ContactOption[]>([])
  const [channelName, setChannelName] = useState<string>('')

  useEffect(() => {
    if (userInfo?.profileSetup) {
      setLoadingStates((prev) => ({ ...prev, initialLoad: false }))
    }
  }, [userInfo])

  useEffect(() => {
    const getData = async () => {
      const response = await http.get('/api/contacts/get-all-contacts', { withCredentials: true })
      setAllContacts(response?.data?.contacts ?? [])
    }
    getData()
  }, [])

  const createChannel = async () => {
    setLoadingStates((prev) => ({ ...prev, selecting: true }))
    try {
      if (channelName.length > 0 && selectedContacts.length > 0) {
        const response = await http.post('/api/channel/create-channel', { name: channelName, members: selectedContacts.map((contact) => contact.value) }, { withCredentials: true })
        if (response.status === 200) {
          setChannelName('')
          setSelectedContacts([])
          addChannels(response?.data?.channel)
          setNewChannelModal(false)
        }
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoadingStates((prev) => ({ ...prev, selecting: false }))
    }
  }

  /* PRESERVED LOTTIE ANIMATION GIF FROM ORIGINAL UI */
  const renderContactList = () => {
    if (loadingStates.searching) {
      return <CustomLoader type="search" message="Searching contacts..." />
    }

    return (
      <div className="flex flex-col justify-center items-center py-4 text-center">
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
          height={100}
          width={100}
        />
        <p className="text-xs font-medium text-white/60 mt-2">
          Add members to build your channel <span className="text-indigo-400">🚀</span>
        </p>
      </div>
    )
  }

  if (loadingStates.initialLoad) {
    return <CustomLoader type="default" message="Loading contacts..." />
  }

  return (
    <div>
      <ToolTip content="Create A New Channel" direction="top">
        <button
          onClick={() => setNewChannelModal(true)}
          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all"
        >
          <FaPlus className="text-xs" />
        </button>
      </ToolTip>

      <AnimatePresence>
        {newChannelModal && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0D0E12]/95 border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl backdrop-blur-2xl flex flex-col gap-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <h2 className="text-base font-bold text-white tracking-wide">Create New Channel</h2>
                <button
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5 transition-all"
                  onClick={() => setNewChannelModal(false)}
                >
                  <IoClose className="text-lg" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-white/60 pl-1 mb-1 block">Channel Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Project Updates, General Chat"
                    className="w-full px-4 py-3 bg-white/[0.04] rounded-2xl border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all font-sans"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-white/60 pl-1 mb-1 block">Select Members</label>
                  <MultipleSelector
                    className="w-full bg-white/[0.04] border border-white/10 rounded-2xl text-sm"
                    defaultOption={allContacts}
                    placeholder="Search and select members..."
                    value={selectedContacts}
                    onChange={setSelectedContacts}
                    emptyIndicator={<p className="text-center text-xs text-white/40 py-2">No contacts found</p>}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={createChannel}
                disabled={!channelName.trim() || selectedContacts.length === 0 || loadingStates.selecting}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-xl disabled:opacity-40 transition-all"
              >
                {loadingStates.selecting ? 'Creating Channel...' : 'Create Channel'}
              </motion.button>

              <div className="pt-2 border-t border-white/10">{renderContactList()}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CreateChannel
