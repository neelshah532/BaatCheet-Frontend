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
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-semibold tracking-wider uppercase">
            Arcade Hub
          </span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">Choose a Multiplayer Experience</h3>
        <p className="text-xs text-slate-400 font-normal mt-1">Play real-time tactical board games, solve fast puzzles, or connect through couple prompts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 my-2">
        {/* Live Chess Master */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] hover:border-amber-500/40 hover:shadow-[0_8px_30px_rgba(245,158,11,0.12)] transition-all duration-300 flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-sm">
                <FiZap />
              </div>
              <span className="text-[9px] font-bold tracking-widest uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">FIDE Clock</span>
            </div>
            <h4 className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">Chess (Live Master)</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
              Full FIDE-compliant chess with legal move suggestions, live clocks, captured pieces, and move history.
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/5 gap-2">
            <select
              value={selectedTimeControl.id}
              onChange={(e) => {
                const found = TIME_CONTROL_PRESETS.find((tc) => tc.id === e.target.value)
                if (found) onSelectTimeControl(found)
              }}
              className="bg-slate-900/90 border border-white/15 rounded-xl text-[11px] text-amber-300 font-medium px-2.5 py-1.5 outline-none cursor-pointer hover:border-amber-500/40 transition-colors"
            >
              {TIME_CONTROL_PRESETS.map((tc) => (
                <option key={tc.id} value={tc.id} className="bg-slate-900 text-white">
                  {tc.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => onSelectGame('chess')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Play Chess <FiArrowRight />
            </button>
          </div>
        </div>

        {/* Connect Four */}
        <button
          onClick={() => onSelectGame('connect-four')}
          className="w-full p-4 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] hover:border-indigo-500/40 hover:shadow-[0_8px_30px_rgba(99,102,241,0.12)] text-left transition-all duration-300 flex flex-col justify-between group cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm">
                <FiGrid />
              </div>
              <span className="text-[9px] font-bold tracking-widest uppercase text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">Turn-based</span>
            </div>
            <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">Connect Four</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
              Drop discs into the 6x7 vertical grid. Connect 4 discs horizontally, vertically, or diagonally to win!
            </p>
          </div>
          <div className="mt-4 flex items-center justify-end text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform gap-1">
            Start Match <FiArrowRight />
          </div>
        </button>

        {/* 15-Tile Sliding Puzzle */}
        <button
          onClick={() => onSelectGame('sliding-puzzle')}
          className="w-full p-4 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] hover:border-purple-500/40 hover:shadow-[0_8px_30px_rgba(168,85,247,0.12)] text-left transition-all duration-300 flex flex-col justify-between group cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-sm">
                <FiActivity />
              </div>
              <span className="text-[9px] font-bold tracking-widest uppercase text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">Speed Race</span>
            </div>
            <h4 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">15-Tile Sliding Puzzle</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-1">Slide tiles into the empty space in a real-time multiplayer race to arrange numbers 1 to 15!</p>
          </div>
          <div className="mt-4 flex items-center justify-end text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition-transform gap-1">
            Play Puzzle <FiArrowRight />
          </div>
        </button>

        {/* Chess Tactics Puzzles */}
        <button
          onClick={() => onSelectGame('chess-puzzle')}
          className="w-full p-4 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] hover:border-cyan-500/40 hover:shadow-[0_8px_30px_rgba(6,182,212,0.12)] text-left transition-all duration-300 flex flex-col justify-between group cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm">
                <FiCompass />
              </div>
              <span className="text-[9px] font-bold tracking-widest uppercase text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">IQ Training</span>
            </div>
            <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">Chess Tactics Puzzles</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-1">Solve tactical find-the-best-move puzzles to test your intelligence and sharpen strategy.</p>
          </div>
          <div className="mt-4 flex items-center justify-end text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform gap-1">
            Solve Tactics <FiArrowRight />
          </div>
        </button>

        {/* Would You Rather */}
        <button
          onClick={() => onSelectGame('would-you-rather')}
          className="w-full p-4 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] hover:border-rose-500/40 hover:shadow-[0_8px_30px_rgba(244,63,94,0.12)] text-left transition-all duration-300 flex flex-col justify-between group cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 text-sm">
                <FiHelpCircle />
              </div>
              <span className="text-[9px] font-bold tracking-widest uppercase text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">Bonding</span>
            </div>
            <h4 className="text-sm font-semibold text-white group-hover:text-rose-300 transition-colors">Would You Rather?</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-1">Choose between two spicy dilemmas. Answers reveal simultaneously when both submit!</p>
          </div>
          <div className="mt-4 flex items-center justify-end text-xs font-semibold text-rose-400 group-hover:translate-x-1 transition-transform gap-1">
            Pick Dilemmas <FiArrowRight />
          </div>
        </button>

        {/* Tic Tac Toe */}
        <button
          onClick={() => onSelectGame('tic-tac-toe')}
          className="w-full p-4 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] hover:border-emerald-500/40 hover:shadow-[0_8px_30px_rgba(16,185,129,0.12)] text-left transition-all duration-300 flex flex-col justify-between group cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm">
                <FiGrid />
              </div>
              <span className="text-[9px] font-bold tracking-widest uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Classic</span>
            </div>
            <h4 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">Tic Tac Toe</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-1">The classic grid game with instantaneous live turn synchronisation and score counter.</p>
          </div>
          <div className="mt-4 flex items-center justify-end text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform gap-1">
            Play 3x3 <FiArrowRight />
          </div>
        </button>
      </div>
    </motion.div>
  )
}

export default GameSelectionMenu
