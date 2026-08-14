import { motion } from 'framer-motion'

interface SlidingPuzzleViewProps {
  slidingTiles: number[]
  slidingMoveCount: number
  isMySlidingTurn: boolean
  gameResult: { winnerId: string | null; reason: string; _id?: string } | null
  isSpectator: boolean
  myId: string
  onTileClick: (tileIndex: number) => void
  onExitGame: () => void
}

const SlidingPuzzleView = ({ slidingTiles, slidingMoveCount, isMySlidingTurn, gameResult, isSpectator, myId, onTileClick, onExitGame }: SlidingPuzzleViewProps) => {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 mb-3">
        <div>
          <h4 className="text-sm font-semibold text-white">15-Tile Sliding Puzzle</h4>
          <p className="text-[10px] text-white/40 font-light mt-0.5">
            {gameResult
              ? `Puzzle Solved! Winner: ${gameResult.winnerId === myId ? 'You! 🏆' : 'Partner! 🎖'}`
              : isMySlidingTurn
                ? 'Your Turn — Click a tile next to the empty slot to slide it!'
                : "Waiting for partner's move..."}
          </p>
        </div>
        <button onClick={onExitGame} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs border border-white/5 transition-all">
          Exit Game
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full py-2">
        <div className="flex items-center justify-between w-full mb-3 px-2">
          <span className="text-xs text-white/60 font-medium">
            Moves: <strong className="text-amber-400 font-mono">{slidingMoveCount}</strong>
          </span>
          <span className="text-[10px] text-white/40 uppercase tracking-widest">Goal: Arrange 1..15</span>
        </div>

        {/* 4x4 Sliding Tile Grid */}
        <div className="grid grid-cols-4 grid-rows-4 gap-2.5 w-full aspect-square bg-slate-900 border border-white/15 p-3 rounded-3xl shadow-2xl">
          {slidingTiles.map((tileVal, idx) => {
            const isEmpty = tileVal === 0
            return (
              <button
                key={idx}
                onClick={() => onTileClick(idx)}
                disabled={isEmpty || !isMySlidingTurn || !!gameResult || isSpectator}
                className={`w-full h-full rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-200 shadow-md ${
                  isEmpty
                    ? 'bg-transparent border border-dashed border-white/10 pointer-events-none'
                    : 'bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border border-white/20 hover:scale-105 active:scale-95 shadow-indigo-900/40'
                }`}
              >
                {!isEmpty && tileVal}
              </button>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

export default SlidingPuzzleView
