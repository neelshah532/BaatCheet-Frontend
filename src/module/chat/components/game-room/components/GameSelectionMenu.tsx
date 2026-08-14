import { motion } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'
import { TIME_CONTROL_PRESETS } from '../constants/game-data'

interface GameSelectionMenuProps {
  selectedTimeControl: (typeof TIME_CONTROL_PRESETS)[0]
  onSelectTimeControl: (tc: (typeof TIME_CONTROL_PRESETS)[0]) => void
  onSelectGame: (game: 'selection' | 'would-you-rather' | 'truth-or-dare' | 'tic-tac-toe' | 'chess' | 'chess-puzzle' | 'connect-four' | 'sliding-puzzle') => void
}

const GameSelectionMenu = ({ selectedTimeControl, onSelectTimeControl, onSelectGame }: GameSelectionMenuProps) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col justify-between">
      <div>
        <h3 className="text-base font-semibold text-white tracking-wide">Choose an Interactive Game</h3>
        <p className="text-xs text-white/45 font-light mt-1">Play real-time games, solve puzzles, or answer bond-building prompts together.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4">
        {/* Live Chess Master */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-amber-500/30 hover:bg-amber-500/[0.03] transition-all duration-300 flex flex-col justify-between group">
          <div className="pr-4">
            <h4 className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">Chess (Live Master)</h4>
            <p className="text-[11px] text-white/45 font-light leading-relaxed mt-1">
              Full FIDE-compliant chess engine with legal move highlighting, live clocks, captured pieces, and move history.
            </p>
          </div>
          <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5">
            <select
              value={selectedTimeControl.id}
              onChange={(e) => {
                const found = TIME_CONTROL_PRESETS.find((tc) => tc.id === e.target.value)
                if (found) onSelectTimeControl(found)
              }}
              className="bg-black/40 border border-white/10 rounded-lg text-[10px] text-amber-300 font-medium px-2 py-1 outline-none"
            >
              {TIME_CONTROL_PRESETS.map((tc) => (
                <option key={tc.id} value={tc.id} className="bg-slate-900 text-white">
                  {tc.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => onSelectGame('chess')}
              className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 text-xs font-semibold border border-amber-500/30 flex items-center gap-1 transition-all"
            >
              Play Chess <FiArrowRight />
            </button>
          </div>
        </div>

        {/* Connect Four */}
        <button
          onClick={() => onSelectGame('connect-four')}
          className="w-full p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-amber-500/30 hover:bg-amber-500/[0.03] text-left transition-all duration-300 flex items-center justify-between group"
        >
          <div className="pr-4">
            <h4 className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">Connect Four (Multiplayer)</h4>
            <p className="text-[11px] text-white/45 font-light leading-relaxed mt-1">
              Drop discs into the 6x7 grid. Connect 4 discs vertically, horizontally, or diagonally to win!
            </p>
          </div>
          <FiArrowRight className="text-white/30 group-hover:text-amber-400 transition-colors text-base flex-shrink-0" />
        </button>

        {/* 15-Tile Sliding Puzzle */}
        <button
          onClick={() => onSelectGame('sliding-puzzle')}
          className="w-full p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-purple-500/30 hover:bg-purple-500/[0.03] text-left transition-all duration-300 flex items-center justify-between group"
        >
          <div className="pr-4">
            <h4 className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors">15-Tile Sliding Puzzle</h4>
            <p className="text-[11px] text-white/45 font-light leading-relaxed mt-1">Slide tiles into the empty space in a real-time multiplayer race to order numbers 1 to 15!</p>
          </div>
          <FiArrowRight className="text-white/30 group-hover:text-purple-400 transition-colors text-base flex-shrink-0" />
        </button>

        {/* Chess Tactics Puzzles */}
        <button
          onClick={() => onSelectGame('chess-puzzle')}
          className="w-full p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-cyan-500/30 hover:bg-cyan-500/[0.03] text-left transition-all duration-300 flex items-center justify-between group"
        >
          <div className="pr-4">
            <h4 className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">Chess Tactics Puzzles</h4>
            <p className="text-[11px] text-white/45 font-light leading-relaxed mt-1">Solve tactical find-the-best-move puzzles to test your intelligence and earn score counts.</p>
          </div>
          <FiArrowRight className="text-white/30 group-hover:text-cyan-400 transition-colors text-base flex-shrink-0" />
        </button>

        {/* Would You Rather */}
        <button
          onClick={() => onSelectGame('would-you-rather')}
          className="w-full p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-indigo-500/30 hover:bg-indigo-500/[0.03] text-left transition-all duration-300 flex items-center justify-between group"
        >
          <div className="pr-4">
            <h4 className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">Would You Rather?</h4>
            <p className="text-[11px] text-white/45 font-light leading-relaxed mt-1">Choose between two LDR dilemmas. Both choices are revealed when both lock in answers!</p>
          </div>
          <FiArrowRight className="text-white/30 group-hover:text-indigo-400 transition-colors text-base flex-shrink-0" />
        </button>

        {/* Truth or Dare */}
        <button
          onClick={() => onSelectGame('truth-or-dare')}
          className="w-full p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-purple-500/30 hover:bg-purple-500/[0.03] text-left transition-all duration-300 flex items-center justify-between group"
        >
          <div className="pr-4">
            <h4 className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors">Truth or Dare</h4>
            <p className="text-[11px] text-white/45 font-light leading-relaxed mt-1">Draw random cards featuring LDR relationship prompts or fun camera challenges.</p>
          </div>
          <FiArrowRight className="text-white/30 group-hover:text-purple-400 transition-colors text-base flex-shrink-0" />
        </button>

        {/* Tic Tac Toe */}
        <button
          onClick={() => onSelectGame('tic-tac-toe')}
          className="w-full p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/30 hover:bg-emerald-500/[0.03] text-left transition-all duration-300 flex items-center justify-between group"
        >
          <div className="pr-4">
            <h4 className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">Tic Tac Toe</h4>
            <p className="text-[11px] text-white/45 font-light leading-relaxed mt-1">Play the classic grid game in real-time. Keep score and train your focus.</p>
          </div>
          <FiArrowRight className="text-white/30 group-hover:text-emerald-400 transition-colors text-base flex-shrink-0" />
        </button>
      </div>
    </motion.div>
  )
}

export default GameSelectionMenu
