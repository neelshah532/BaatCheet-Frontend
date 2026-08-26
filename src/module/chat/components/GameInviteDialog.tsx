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
        <>
          {/* Subtle Mobile Backdrop Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[119]"
          />

          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="fixed top-3 sm:top-6 left-1/2 -translate-x-1/2 z-[120] w-[calc(100vw-20px)] sm:w-[calc(100vw-32px)] max-w-md bg-[#0D0E15]/95 border border-indigo-500/30 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl text-white"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-xl text-white shadow-lg shadow-indigo-600/30 flex-shrink-0">
                <FaGamepad className="animate-bounce" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase border border-indigo-500/30">
                    Game Request
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white mt-1 truncate">
                  {incomingGameInvite.sender?.firstName ? `${incomingGameInvite.sender.firstName} ${incomingGameInvite.sender.lastName || ''}`.trim() : 'Partner'} invited you!
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-normal mt-0.5 line-clamp-2">
                  Join the Arena to play live chess, puzzles, or multiplayer games together.
                </p>
              </div>
            </div>

            <div className="mt-3.5 sm:mt-4 flex flex-col-reverse sm:flex-row gap-2">
              <button
                onClick={handleDecline}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <FiX className="text-sm" /> Decline
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <FiCheck className="text-sm" /> Accept & Play
              </button>
            </div>
          </motion.div>
        </>
      )}

      {/* 2. SENDER WAITING DIALOG: Waiting for partner */}
      {isWaitingForGameAcceptance && !incomingGameInvite && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[119]"
          />

          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="fixed top-3 sm:top-6 left-1/2 -translate-x-1/2 z-[120] w-[calc(100vw-20px)] sm:w-[calc(100vw-32px)] max-w-md bg-[#0D0E15]/95 border border-purple-500/30 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl text-white"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-xl text-white shadow-lg shadow-purple-600/30 flex-shrink-0">
                <FiLoader className="animate-spin text-lg" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase border border-purple-500/30">
                    Waiting For Partner
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white mt-1 truncate">Game Invitation Sent</h4>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-normal mt-0.5 line-clamp-2">
                  Waiting for {opponentName} to accept the game request...
                </p>
              </div>
            </div>

            <div className="mt-3.5 sm:mt-4 flex justify-end">
              <button
                onClick={handleCancelWait}
                className="w-full sm:w-auto py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <FiX className="text-xs" /> Cancel Invite
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default GameInviteDialog
