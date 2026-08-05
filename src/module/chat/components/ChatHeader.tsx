import { useEffect, useState } from 'react'
import { RiCloseFill } from 'react-icons/ri'
import { useAppStore } from '../../../store/store'
import { colors } from '../../../constants/color'
import CallButton from '../../calls/components/CallButton'

const ChatHeader = () => {
  const { closeChat, selectedChatData, selectedChatType } = useAppStore()
  const [colorIndex, setColorIndex] = useState<number>(0)

  useEffect(() => {
    if (typeof selectedChatData !== 'string' && selectedChatData?.color) {
      setColorIndex(typeof selectedChatData.color === 'number' ? selectedChatData.color : 0)
    }
  }, [selectedChatData])

  const name =
    selectedChatType === 'channel' && typeof selectedChatData !== 'string'
      ? selectedChatData?.name
      : selectedChatType === 'contact' && typeof selectedChatData !== 'string' && selectedChatData?.firstName
        ? `${selectedChatData?.firstName} ${selectedChatData?.lastName}`
        : typeof selectedChatData !== 'string'
          ? selectedChatData?.email
          : 'Chat'

  return (
    <div className="py-3 px-6 bg-[#0D0E12]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-md relative z-30">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative flex items-center justify-center">
            {selectedChatType === 'contact' ? (
              typeof selectedChatData !== 'string' && selectedChatData?.image ? (
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center border border-white/20 shadow-md overflow-hidden"
                  style={{ backgroundColor: colors[colorIndex] }}
                >
                  <img src={`${import.meta.env.VITE_LOCAL_HOST}/${selectedChatData.image}`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-md border border-white/20"
                  style={{ backgroundColor: colors[colorIndex] }}
                >
                  {typeof selectedChatData !== 'string' && selectedChatData?.firstName && selectedChatData?.lastName
                    ? `${selectedChatData.firstName[0]}${selectedChatData.lastName[0]}`.toUpperCase()
                    : '?'}
                </div>
              )
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-lg font-bold text-white shadow-md border border-white/20">
                #
              </div>
            )}

            {/* Status dot */}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0D0E12]" />
          </div>

          {/* User Name & Status */}
          <div className="flex flex-col">
            <h2 className="text-white text-base font-semibold tracking-wide">{name}</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-white/50 font-light">Online & Active</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {selectedChatType === 'contact' && typeof selectedChatData !== 'string' && selectedChatData && <CallButton contact={selectedChatData} />}
          <button
            onClick={closeChat}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5 transition-all duration-200"
            aria-label="Close Chat"
          >
            <RiCloseFill size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatHeader
