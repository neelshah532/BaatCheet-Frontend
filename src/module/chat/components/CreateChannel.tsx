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

const CreateChannel = () => {
  const { addChannels, userInfo } = useAppStore()
  const [newChannelModal, setNewChannelModal] = useState(false)
  const [loadingStates, setLoadingStates] = useState<{ initialLoad: boolean; searching: boolean; selecting: boolean }>({
    initialLoad: true,
    searching: false,
    selecting: false,
  })

  // const [searchContact, setSearchContact] = useState<Contact[]>([])
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
      console.log(response)
      setAllContacts(response?.data?.contacts ?? [])
    }

    getData()
  }, [])

  const createChannel = async () => {
    setLoadingStates((prev) => ({ ...prev, selecting: true }))
    try {
      if (channelName.length > 0 && selectedContacts.length > 0) {
        const response = await http.post('/api/channel/create-channel', { name: channelName, members: selectedContacts.map((contact) => contact.value) }, { withCredentials: true })
        console.log(response)
        if (response.status === 200) {
          setChannelName('')
          setSelectedContacts([])
          addChannels(response?.data?.channel)
          setNewChannelModal(false)
        }
        setLoadingStates((prev) => ({ ...prev, selecting: false }))
      }
    } catch (error) {
      console.log(error)
    }
  }

  const renderContactList = () => {
    if (loadingStates.searching) {
      return <CustomLoader type="search" message="Searching contacts..." />
    }

    return (
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
    )
  }

  if (loadingStates.initialLoad) {
    return <CustomLoader type="default" message="Loading contacts..." />
  }

  return (
    <div>
      <ToolTip content="Create A New Channel" direction="top">
        <FaPlus
          className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300"
          onClick={() => setNewChannelModal(true)}
        />
      </ToolTip>

      {newChannelModal && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm bg-opacity-50 flex justify-center items-center z-20">
          <div className="bg-[#0C0C14] border border-white/[0.05] rounded-2xl border-none p-5 max-h-[80vh] flex flex-col w-[600px] h-[600px] gap-3">
            <div className="flex justify-between items-center  mb-3">
              <h2 className="text-white text-lg font-semibold text-center w-full">Please fill up the details for new channel</h2>
              <button className="p-2 rounded-lg bg-[#1C1C24] hover:bg-[#2C2C3A] hover:bg-white/[0.05] transition-colors duration-200" onClick={() => setNewChannelModal(false)}>
                <IoClose className="text-gray-400 hover:text-white transition-colors duration-200 font-bold text-lg" />
              </button>
            </div>
            <div>
              <input
                type="text"
                placeholder="Channel Name"
                className="w-full px-5 py-3.5 bg-[#1C1C24] rounded-lg border border-white/[0.05]
                    text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500
                    transition-all duration-300"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
              />
            </div>
            <div>
              <MultipleSelector
                className="w-full"
                defaultOption={allContacts}
                placeholder="Select contacts for channel"
                value={selectedContacts}
                onChange={setSelectedContacts}
                emptyIndicator={<p className="text-center text-gray-500">No contacts found matching your search</p>}
              />
            </div>
            <div>
              <button className="w-full bg-[#1C1C24] p-2 transition-all duration-300 hover:bg-white/[0.05]" onClick={createChannel}>
                createChannel
              </button>
            </div>
            <div className="mt-3 overflow-y-auto max-h-60 p-2 border-t border-neutral-700">
              {loadingStates.selecting ? <CustomLoader type="default" message="Selecting contact..." /> : renderContactList()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateChannel
