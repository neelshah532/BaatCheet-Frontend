import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../../../store/store'
import { useSocket } from '../../../hook/socketContext'
import { FiCheck, FiX, FiLoader, FiPlay } from 'react-icons/fi'

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

  const senderName = incomingGameInvite?.sender?.firstName
    ? `${incomingGameInvite.sender.firstName} ${incomingGameInvite.sender.lastName || ''}`.trim()
    : 'Partner'

  return (
    <AnimatePresence>
      {/* 1. RECEIVER PROMPT: Incoming Game Invite */}
      {incomingGameInvite && (
        <>
          {/* Subtle Mobile Backdrop Scrim */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[119]" />

          {/* Centered Fixed Wrapper Container */}
          <div className="fixed inset-x-0 top-3 sm:top-6 z-[120] flex justify-center px-3 sm:px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className="pointer-events-auto w-full max-w-sm sm:max-w-md bg-[#0F1017] border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-2xl text-white"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-base text-slate-200 flex-shrink-0">
                  <FiPlay className="ml-0.5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      Game Invite
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white mt-0.5 truncate">
                    {senderName}
                  </h4>
                  <p className="text-xs text-slate-400 font-normal mt-0.5">Invited you to play a live match</p>
                </div>
              </div>

              <div className="mt-3.5 flex flex-row gap-2">
                <button
                  onClick={handleDecline}
                  className="w-1/3 py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-medium transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                >
                  <FiX className="text-sm" /> Decline
                </button>
                <button
                  onClick={handleAccept}
                  className="flex-1 py-2 px-3 rounded-xl bg-white text-black hover:bg-slate-100 text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <FiCheck className="text-sm text-black" /> Accept Match
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* 2. SENDER WAITING DIALOG: Waiting for partner */}
      {isWaitingForGameAcceptance && !incomingGameInvite && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[119]" />

          {/* Centered Fixed Wrapper Container */}
          <div className="fixed inset-x-0 top-3 sm:top-6 z-[120] flex justify-center px-3 sm:px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className="pointer-events-auto w-full max-w-sm sm:max-w-md bg-[#0F1017] border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-2xl text-white"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-slate-300 flex-shrink-0">
                  <FiLoader className="animate-spin text-base" />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    Waiting for response
                  </span>
                  <h4 className="text-sm font-semibold text-white mt-0.5 truncate">Invitation Sent</h4>
                  <p className="text-xs text-slate-400 font-normal mt-0.5 truncate">Waiting for {opponentName} to accept...</p>
                </div>
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleCancelWait}
                  className="py-1.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-medium transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                >
                  <FiX className="text-xs" /> Cancel
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export default GameInviteDialog
