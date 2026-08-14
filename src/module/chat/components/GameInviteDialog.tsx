import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../../../store/store'
import { useSocket } from '../../../hook/socketContext'
import { FaGamepad } from 'react-icons/fa'
import { FiCheck, FiX, FiLoader } from 'react-icons/fi'

const GameInviteDialog = () => {
  const socket = useSocket()
  const { incomingGameInvite, setIncomingGameInvite, isWaitingForGameAcceptance, setIsWaitingForGameAcceptance, selectedChatData } = useAppStore()

  const opponentId = typeof selectedChatData === 'object' ? selectedChatData?._id : selectedChatData || ''
  const opponentName = typeof selectedChatData === 'object' && selectedChatData?.firstName ? `${selectedChatData.firstName} ${selectedChatData.lastName || ''}`.trim() : 'Partner'

  const handleAccept = () => {
    if (!socket || !incomingGameInvite) return
    socket.emit('game:invite-accepted', { senderId: incomingGameInvite.senderId, timeControl: incomingGameInvite.timeControl })
    setIncomingGameInvite(null)
  }

  const handleDecline = () => {
    if (!socket || !incomingGameInvite) return
    socket.emit('game:invite-declined', { senderId: incomingGameInvite.senderId })
    setIncomingGameInvite(null)
  }

  const handleCancelWait = () => {
    if (socket && opponentId) {
      socket.emit('game:invite-canceled', { recipientId: opponentId })
    }
    setIsWaitingForGameAcceptance(false)
  }

  return (
    <AnimatePresence>
      {/* 1. RECEIVER PROMPT: Incoming Game Invite */}
      {incomingGameInvite && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[120] w-[calc(100vw-32px)] max-w-md bg-[#0F1015]/95 border border-indigo-500/30 rounded-2xl p-3.5 sm:p-4 shadow-[0_16px_48px_rgba(0,0,0,0.9)] backdrop-blur-2xl text-white"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-xl text-white shadow-lg flex-shrink-0">
              <FaGamepad className="animate-bounce" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-semibold tracking-wider uppercase border border-indigo-500/30">
                  Game Request
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white mt-1 truncate">
                {incomingGameInvite.sender?.firstName ? `${incomingGameInvite.sender.firstName} ${incomingGameInvite.sender.lastName || ''}`.trim() : 'Partner'} invited you!
              </h4>
              <p className="text-[11px] text-white/50 font-light mt-0.5">Join the Game Room to play real-time interactive games together.</p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleAccept}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
            >
              <FiCheck className="text-sm" /> Accept & Play
            </button>
            <button
              onClick={handleDecline}
              className="py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              <FiX className="text-sm" /> Decline
            </button>
          </div>
        </motion.div>
      )}

      {/* 2. SENDER WAITING DIALOG: Waiting for partner */}
      {isWaitingForGameAcceptance && !incomingGameInvite && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[120] w-[calc(100vw-32px)] max-w-md bg-[#0F1015]/95 border border-purple-500/30 rounded-2xl p-3.5 sm:p-4 shadow-[0_16px_48px_rgba(0,0,0,0.9)] backdrop-blur-2xl text-white"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-xl text-white shadow-lg flex-shrink-0 relative">
              <FiLoader className="animate-spin text-lg" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-semibold tracking-wider uppercase border border-purple-500/30">
                  Waiting For Partner
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white mt-1 truncate">Game Invitation Sent</h4>
              <p className="text-[11px] text-white/50 font-light mt-0.5">Waiting for {opponentName} to accept the game request...</p>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleCancelWait}
              className="py-1.5 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <FiX className="text-xs" /> Cancel Invite
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default GameInviteDialog
