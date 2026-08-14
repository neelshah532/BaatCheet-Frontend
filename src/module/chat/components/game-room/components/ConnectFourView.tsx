import { motion } from 'framer-motion'

interface ConnectFourViewProps {
  c4Grid: (string | null)[][]
  isMyC4Turn: boolean
  gameResult: { winnerId: string | null; reason: string; _id?: string } | null
  isSpectator: boolean
  myId: string
  onDropDisc: (colIndex: number) => void
  onExitGame: () => void
}

const ConnectFourView = ({ c4Grid, isMyC4Turn, gameResult, isSpectator, myId, onDropDisc, onExitGame }: ConnectFourViewProps) => {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 mb-3">
        <div>
          <h4 className="text-sm font-semibold text-white">Connect Four (Multiplayer)</h4>
          <p className="text-[10px] text-white/40 font-light mt-0.5">
            {gameResult
              ? `Winner: ${gameResult.winnerId === myId ? 'You! 🏆' : gameResult.winnerId ? 'Partner! 🎖' : 'Draw 🤝'}`
              : isMyC4Turn
                ? 'Your Turn — Click a column to drop your disc!'
                : "Waiting for partner's turn..."}
          </p>
        </div>
        <button onClick={onExitGame} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs border border-white/5 transition-all">
          Exit Game
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full py-2">
        {/* Column Drop Arrow Buttons */}
        <div className="grid grid-cols-7 gap-2 w-full max-w-sm mb-2">
          {Array.from({ length: 7 }).map((_, colIdx) => (
            <button
              key={colIdx}
              onClick={() => onDropDisc(colIdx)}
              disabled={!isMyC4Turn || !!gameResult || isSpectator || !!c4Grid[0][colIdx]}
              className="py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-500/60 disabled:opacity-30 text-indigo-300 text-xs font-bold transition-all border border-indigo-500/30 flex items-center justify-center shadow-md"
              title={`Drop in column ${colIdx + 1}`}
            >
              ↓
            </button>
          ))}
        </div>

        {/* 6x7 Grid Board Container */}
        <div className="bg-blue-950 border-4 border-blue-600 p-3 rounded-3xl shadow-2xl grid grid-rows-6 gap-2 w-full max-w-sm aspect-[7/6] relative">
          {c4Grid.map((row, rIdx) => (
            <div key={rIdx} className="grid grid-cols-7 gap-2 w-full h-full">
              {row.map((cell, cIdx) => (
                <div
                  key={cIdx}
                  onClick={() => onDropDisc(cIdx)}
                  className={`w-full aspect-square rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 border border-black/40 shadow-inner ${
                    cell === 'R'
                      ? 'bg-gradient-to-tr from-red-600 to-rose-400 shadow-[0_0_12px_rgba(239,68,68,0.6)]'
                      : cell === 'Y'
                        ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                        : 'bg-slate-900/90 hover:bg-slate-800'
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default ConnectFourView
