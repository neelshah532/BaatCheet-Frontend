import { motion } from 'framer-motion'
import { FiArrowRight, FiActivity, FiGrid, FiCompass, FiHelpCircle, FiZap } from 'react-icons/fi'
import { TIME_CONTROL_PRESETS } from '../constants/game-data'

interface GameSelectionMenuProps {
  selectedTimeControl: (typeof TIME_CONTROL_PRESETS)[0]
  onSelectTimeControl: (tc: (typeof TIME_CONTROL_PRESETS)[0]) => void
  onSelectGame: (game: 'selection' | 'would-you-rather' | 'truth-or-dare' | 'tic-tac-toe' | 'chess' | 'chess-puzzle' | 'connect-four' | 'sliding-puzzle') => void
}

const GameSelectionMenu = ({ selectedTimeControl, onSelectTimeControl, onSelectGame }: GameSelectionMenuProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col justify-between overflow-y-auto custom-scrollbar p-1"
    >
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">Select Game</h3>
        <p className="text-xs text-slate-400 font-normal mt-0.5">Real-time games and interactive activities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-2">
        {/* Live Chess Master */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-slate-200 text-sm">
                <FiZap />
              </div>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Chess Clock</span>
            </div>
            <h4 className="text-sm font-semibold text-white">Live Chess</h4>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">
              Full FIDE-compliant chess with timers, captured pieces, and move notation.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/[0.06] gap-2">
            <select
              value={selectedTimeControl.id}
              onChange={(e) => {
                const found = TIME_CONTROL_PRESETS.find((tc) => tc.id === e.target.value)
                if (found) onSelectTimeControl(found)
              }}
              className="bg-black/50 border border-white/10 rounded-xl text-xs text-slate-300 font-medium px-2.5 py-1.5 outline-none cursor-pointer hover:border-white/20 transition-colors"
            >
              {TIME_CONTROL_PRESETS.map((tc) => (
                <option key={tc.id} value={tc.id} className="bg-slate-900 text-white">
                  {tc.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => onSelectGame('chess')}
              className="px-3.5 py-1.5 rounded-xl bg-white text-black hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Play Chess <FiArrowRight />
            </button>
          </div>
        </div>

        {/* Connect Four */}
        <button
          onClick={() => onSelectGame('connect-four')}
          className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 text-left transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-slate-200 text-sm">
                <FiGrid />
              </div>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Turn-based</span>
            </div>
            <h4 className="text-sm font-semibold text-white">Connect Four</h4>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">
              Drop discs into the 6x7 vertical grid. Connect 4 discs in a row to win.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-end text-xs font-medium text-slate-300 group-hover:text-white transition-colors gap-1">
            Start Match <FiArrowRight />
          </div>
        </button>

        {/* 15-Tile Sliding Puzzle */}
        <button
          onClick={() => onSelectGame('sliding-puzzle')}
          className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 text-left transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-slate-200 text-sm">
                <FiActivity />
              </div>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Race</span>
            </div>
            <h4 className="text-sm font-semibold text-white">15-Tile Puzzle</h4>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">Slide tiles into the empty space in a real-time race to arrange numbers 1 to 15.</p>
          </div>
          <div className="mt-4 flex items-center justify-end text-xs font-medium text-slate-300 group-hover:text-white transition-colors gap-1">
            Play Puzzle <FiArrowRight />
          </div>
        </button>

        {/* Chess Tactics Puzzles */}
        <button
          onClick={() => onSelectGame('chess-puzzle')}
          className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 text-left transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-slate-200 text-sm">
                <FiCompass />
              </div>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Tactics</span>
            </div>
            <h4 className="text-sm font-semibold text-white">Chess Puzzles</h4>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">Solve tactical find-the-best-move puzzles to sharpen strategy.</p>
          </div>
          <div className="mt-4 flex items-center justify-end text-xs font-medium text-slate-300 group-hover:text-white transition-colors gap-1">
            Solve Tactics <FiArrowRight />
          </div>
        </button>

        {/* Would You Rather */}
        <button
          onClick={() => onSelectGame('would-you-rather')}
          className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 text-left transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-slate-200 text-sm">
                <FiHelpCircle />
              </div>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Prompts</span>
            </div>
            <h4 className="text-sm font-semibold text-white">Would You Rather?</h4>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">Choose between two dilemmas. Answers reveal simultaneously when both submit.</p>
          </div>
          <div className="mt-4 flex items-center justify-end text-xs font-medium text-slate-300 group-hover:text-white transition-colors gap-1">
            Pick Dilemmas <FiArrowRight />
          </div>
        </button>

        {/* Tic Tac Toe */}
        <button
          onClick={() => onSelectGame('tic-tac-toe')}
          className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 text-left transition-all flex flex-col justify-between group cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-slate-200 text-sm">
                <FiGrid />
              </div>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Classic</span>
            </div>
            <h4 className="text-sm font-semibold text-white">Tic Tac Toe</h4>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">The classic 3x3 game with synchronized turns and score tracking.</p>
          </div>
          <div className="mt-4 flex items-center justify-end text-xs font-medium text-slate-300 group-hover:text-white transition-colors gap-1">
            Play 3x3 <FiArrowRight />
          </div>
        </button>
      </div>
    </motion.div>
  )
}

export default GameSelectionMenu
