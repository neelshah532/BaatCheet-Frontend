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
import { motion } from 'framer-motion'

interface ChatHeaderProps {
  onToggleGame: () => void
  isGameActive: boolean
}

const ChatHeader = ({ onToggleGame, isGameActive }: ChatHeaderProps) => {
  const { closeChat, selectedChatData, selectedChatType, selectedChatMessages } = useAppStore()
  const [colorIndex, setColorIndex] = useState<number>(0)
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [isSummaryLoading, setIsSummaryLoading] = useState(false)

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
    <div className="py-3 px-6 bg-[#0D0E12]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-md relative z-30">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-3">
          {/* Back button for mobile */}
          <button onClick={closeChat} className="md:hidden p-2 -ml-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200" aria-label="Go Back">
            <FiArrowLeft size={18} />
          </button>

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
          {/* Catch Me Up AI Button */}
          {selectedChatMessages.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCatchMeUp}
              className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-400 hover:text-indigo-300 transition-all duration-200 flex items-center gap-1.5 text-xs font-medium"
              title="Catch me up (AI Summary)"
            >
              <HiOutlineSparkles className="text-base" />
              <span className="hidden sm:inline">Catch Me Up</span>
            </motion.button>
          )}

          {/* Game Room Button */}
          {selectedChatType === 'contact' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleGame}
              className={`p-2 rounded-xl border transition-all duration-200 flex items-center gap-1.5 text-xs font-medium ${
                isGameActive
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:text-rose-300 animate-pulse'
                  : 'bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-400 hover:text-indigo-300'
              }`}
              title={isGameActive ? 'Close Game Room' : 'Open LDR Game Room'}
            >
              <FaGamepad className="text-base" />
              <span className="hidden sm:inline">{isGameActive ? 'Exit Game' : 'Game Room'}</span>
            </motion.button>
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
