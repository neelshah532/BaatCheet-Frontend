import { useEffect, useState } from 'react'
import { RiCloseFill } from 'react-icons/ri'
import { FiArrowLeft } from 'react-icons/fi'
import { FaGamepad } from 'react-icons/fa'
import { HiOutlineSparkles } from 'react-icons/hi'
import { useAppStore } from '../../../store/store'
import { colors } from '../../../constants/color'
import CallButton from '../../calls/components/CallButton'
import aiService from '../../../services/ai'
import SummaryModal from './SummaryModal'
import { toast } from 'sonner'

import { useSocket } from '../../../hook/socketContext'

interface ChatHeaderProps {
  onToggleGame: () => void
  isGameActive: boolean
}

const ChatHeader = ({ onToggleGame, isGameActive }: ChatHeaderProps) => {
  const socket = useSocket()
  const { closeChat, selectedChatData, selectedChatType, selectedChatMessages, onlineUsers, setIsWaitingForGameAcceptance } = useAppStore()
  const [colorIndex, setColorIndex] = useState<number>(0)
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [isSummaryLoading, setIsSummaryLoading] = useState(false)

  const handleGameClick = () => {
    if (isGameActive) {
      onToggleGame()
      return
    }
    if (!socket || !selectedChatData) return
    const recipientId = typeof selectedChatData === 'object' ? selectedChatData._id : selectedChatData || ''
    socket.emit('game:request-invite', { recipientId })
    setIsWaitingForGameAcceptance(true)
  }

  const contactId = typeof selectedChatData === 'object' ? selectedChatData?._id || '' : ''
  const isOnline = selectedChatType === 'contact' ? (contactId ? onlineUsers.includes(contactId) : false) : true

  useEffect(() => {
    if (typeof selectedChatData !== 'string' && selectedChatData?.color) {
      setColorIndex(typeof selectedChatData.color === 'number' ? selectedChatData.color : 0)
    }
  }, [selectedChatData])

  const handleCatchMeUp = async () => {
    if (selectedChatMessages.length === 0) {
      toast.info('No messages in this chat to summarize.')
      return
    }

    setIsSummaryOpen(true)
    setIsSummaryLoading(true)
    setSummary(null)

    try {
      // Map only the most recent 20 messages to simple string format for AI analyzer
      const recentMessages = selectedChatMessages.slice(-20)
      const formattedMessages = recentMessages.map((m) => {
        const senderName = typeof m.sender === 'object' ? `${m.sender.firstName || ''} ${m.sender.lastName || ''}`.trim() || 'User' : m.sender === 'self' ? 'You' : 'User'
        return {
          sender: senderName,
          text: m.content || (m.messageType === 'file' ? '[Attached File]' : ''),
          time: m.timestamp,
        }
      })

      const response = await aiService.analyzeConversation(formattedMessages)
      setSummary(response)
    } catch (err) {
      console.error(err)
      toast.error('Failed to analyze the conversation. Please try again.')
      setIsSummaryOpen(false)
    } finally {
      setIsSummaryLoading(false)
    }
  }

  const name =
    selectedChatType === 'channel' && typeof selectedChatData !== 'string'
      ? selectedChatData?.name
      : selectedChatType === 'contact' && typeof selectedChatData !== 'string' && selectedChatData?.firstName
        ? `${selectedChatData?.firstName} ${selectedChatData?.lastName}`
        : typeof selectedChatData !== 'string'
          ? selectedChatData?.email
          : 'Chat'

  return (
    <div className="py-2.5 sm:py-3 px-3 sm:px-6 bg-[#0D0E12]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-md relative z-30 flex-shrink-0">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 overflow-hidden">
          {/* Back button for mobile */}
          <button
            onClick={closeChat}
            className="md:hidden p-1.5 -ml-1 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200 flex-shrink-0"
            aria-label="Go Back"
          >
            <FiArrowLeft size={18} />
          </button>

          {/* Avatar */}
          <div className="relative flex items-center justify-center flex-shrink-0">
            {selectedChatType === 'contact' ? (
              typeof selectedChatData !== 'string' && selectedChatData?.image ? (
                <div
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border border-white/20 shadow-md overflow-hidden"
                  style={{ backgroundColor: colors[colorIndex] }}
                >
                  <img src={`${import.meta.env.VITE_LOCAL_HOST}/${selectedChatData.image}`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold text-white shadow-md border border-white/20"
                  style={{ backgroundColor: colors[colorIndex] }}
                >
                  {typeof selectedChatData !== 'string' && selectedChatData?.firstName && selectedChatData?.lastName
                    ? `${selectedChatData.firstName[0]}${selectedChatData.lastName[0]}`.toUpperCase()
                    : '?'}
                </div>
              )
            ) : (
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/[0.08] flex items-center justify-center text-sm font-semibold text-white shadow-sm border border-white/10">
                #
              </div>
            )}

            {/* Status dot */}
            <div
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-[#0D0E12] ${
                isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-white/20'
              }`}
            />
          </div>

          {/* User Name & Status */}
          <div className="flex flex-col min-w-0 flex-1 overflow-hidden items-start">
            <h2 className="text-white text-sm sm:text-base font-medium tracking-tight truncate">{name}</h2>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isOnline ? 'bg-emerald-400' : 'bg-white/30'}`} />
              <span className="text-[11px] sm:text-xs text-slate-400 font-normal truncate">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          {/* Catch Me Up AI Button */}
          {selectedChatMessages.length > 0 && (
            <button
              onClick={handleCatchMeUp}
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer active:scale-95"
              title="Catch me up (AI Summary)"
            >
              <HiOutlineSparkles className="text-sm text-slate-400" />
              <span className="hidden sm:inline">Summarize</span>
            </button>
          )}

          {/* Game Room Button */}
          {selectedChatType === 'contact' && (
            <button
              onClick={handleGameClick}
              className={`px-2.5 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer active:scale-95 ${
                isGameActive
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-300 hover:bg-rose-500/25'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
              }`}
              title={isGameActive ? 'Close Game Room' : 'Start Match'}
            >
              <FaGamepad className="text-sm text-slate-400" />
              <span className="hidden sm:inline">{isGameActive ? 'Exit' : 'Game'}</span>
            </button>
          )}

          {selectedChatType === 'contact' && typeof selectedChatData !== 'string' && selectedChatData && <CallButton contact={selectedChatData} />}
          <button
            onClick={closeChat}
            className="hidden md:block p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5 transition-all duration-200"
            aria-label="Close Chat"
          >
            <RiCloseFill size={20} />
          </button>
        </div>
      </div>

      {/* Summary Modal */}
      <SummaryModal isOpen={isSummaryOpen} onClose={() => setIsSummaryOpen(false)} summary={summary} isLoading={isSummaryLoading} />
    </div>
  )
}

export default ChatHeader
