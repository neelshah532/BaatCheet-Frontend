import { motion } from 'framer-motion'

interface GameOverModalProps {
  gameResult: { winnerId: string | null; reason: string; _id?: string } | null
  myId: string
  isSpectator: boolean
  onRematch: () => void
  onExitGame: () => void
}

const GameOverModal = ({ gameResult, myId, isSpectator, onRematch, onExitGame }: GameOverModalProps) => {
  if (!gameResult) return null

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0F1015] border border-indigo-500/40 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 mx-auto flex items-center justify-center text-3xl text-white shadow-lg mb-4 animate-bounce">
          {gameResult.winnerId === myId ? '🏆' : gameResult.winnerId ? '🎖' : '🤝'}
        </div>
        <h3 className="text-xl font-bold text-white mb-1">{gameResult.winnerId === myId ? 'Victory!' : gameResult.winnerId ? 'Defeat' : 'Draw'}</h3>
        <p className="text-xs text-white/60 mb-6 capitalize">{gameResult.reason === 'timeout' ? 'Time out (Clock Expired)' : gameResult.reason}</p>

        <div className="flex gap-3">
          {!isSpectator && (
            <button
              onClick={onRematch}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg transition-all"
            >
              Rematch
            </button>
          )}
          <button
            onClick={onExitGame}
            className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 font-semibold text-xs transition-all"
          >
            Exit Game
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default GameOverModal
