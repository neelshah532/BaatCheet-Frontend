import { motion } from 'framer-motion'
import { FiActivity, FiSmile, FiRotateCcw } from 'react-icons/fi'
import { WOULD_YOU_RATHER_QUESTIONS } from '../constants/game-data'

interface CasualGamesViewProps {
  activeGame: 'would-you-rather' | 'truth-or-dare' | 'tic-tac-toe'
  wyrIndex: number
  wyrSelection: 'A' | 'B' | null
  opponentWyrSelection: 'A' | 'B' | null
  onWyrSelect: (choice: 'A' | 'B') => void
  onNextWyr: () => void
  todType: 'truth' | 'dare' | null
  todPrompt: string | null
  onDrawTod: (type: 'truth' | 'dare') => void
  onClearTod: () => void
  board: (string | null)[]
  isMyTurn: boolean
  mySymbol: 'X' | 'O'
  score: { self: number; opponent: number }
  onCellClick: (index: number) => void
  onResetTicTacToe: () => void
  checkWinner: (b: (string | null)[]) => string | null
  onExitGame: () => void
}

const CasualGamesView = ({
  activeGame,
  wyrIndex,
  wyrSelection,
  opponentWyrSelection,
  onWyrSelect,
  onNextWyr,
  todType,
  todPrompt,
  onDrawTod,
  onClearTod,
  board,
  isMyTurn,
  mySymbol,
  score,
  onCellClick,
  onResetTicTacToe,
  checkWinner,
  onExitGame,
}: CasualGamesViewProps) => {
  return (
    <>
      {/* 1. WOULD YOU RATHER GAME SCREEN */}
      {activeGame === 'would-you-rather' && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 mb-3">
            <div>
              <h4 className="text-sm font-semibold text-white">Would You Rather?</h4>
              <p className="text-[10px] text-white/40 font-light mt-0.5">Reveal locked choices simultaneously</p>
            </div>
            <button
              onClick={onExitGame}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs border border-white/5 transition-all"
            >
              Exit Game
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full py-2">
            <div className="text-center mb-4">
              <span className="text-[9px] text-indigo-400 font-medium tracking-[0.2em] uppercase">
                Scenario {wyrIndex + 1} of {WOULD_YOU_RATHER_QUESTIONS.length}
              </span>
              <h3 className="text-sm text-white/90 leading-relaxed font-light mt-1 px-4">"{WOULD_YOU_RATHER_QUESTIONS[wyrIndex].q}"</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full px-4">
              <button
                onClick={() => onWyrSelect('A')}
                disabled={wyrSelection !== null}
                className={`p-5 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-1 ${
                  wyrSelection === 'A' ? 'bg-indigo-600/30 border-indigo-500 text-white' : 'bg-white/[0.02] border-white/[0.06] hover:border-white/15 text-white/80'
                }`}
              >
                <span className="text-[9px] tracking-wider uppercase font-semibold text-indigo-400 mb-1">Option A</span>
                <span className="text-[11px] font-light leading-relaxed">{WOULD_YOU_RATHER_QUESTIONS[wyrIndex].a}</span>
              </button>

              <button
                onClick={() => onWyrSelect('B')}
                disabled={wyrSelection !== null}
                className={`p-5 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-1 ${
                  wyrSelection === 'B' ? 'bg-purple-600/30 border-purple-500 text-white' : 'bg-white/[0.02] border-white/[0.06] hover:border-white/15 text-white/80'
                }`}
              >
                <span className="text-[9px] tracking-wider uppercase font-semibold text-purple-400 mb-1">Option B</span>
                <span className="text-[11px] font-light leading-relaxed">{WOULD_YOU_RATHER_QUESTIONS[wyrIndex].b}</span>
              </button>
            </div>

            <div className="mt-6 flex flex-col items-center">
              {wyrSelection && !opponentWyrSelection && (
                <div className="flex items-center gap-2 text-white/50 text-[11px] font-light animate-pulse">
                  <FiActivity className="text-indigo-400" /> Locked in! Waiting for partner...
                </div>
              )}
              {opponentWyrSelection && !wyrSelection && (
                <div className="flex items-center gap-2 text-indigo-400/80 text-[11px] font-light animate-pulse">
                  <FiSmile /> Partner has locked in their answer! Make your choice.
                </div>
              )}
              {wyrSelection && opponentWyrSelection && (
                <div className="flex flex-col items-center gap-2">
                  <div className="text-[11px] text-white/80 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-center font-light leading-relaxed">
                    <span className="font-semibold text-indigo-400">Match Reveal!</span>
                    <br />
                    You chose: <span className="font-semibold text-white">{wyrSelection === 'A' ? 'Option A' : 'Option B'}</span>
                    <br />
                    Partner chose: <span className="font-semibold text-white">{opponentWyrSelection === 'A' ? 'Option A' : 'Option B'}</span>
                  </div>
                  <button
                    onClick={onNextWyr}
                    className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold tracking-wide transition-all shadow-md"
                  >
                    Next Scenario
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. TRUTH OR DARE GAME SCREEN */}
      {activeGame === 'truth-or-dare' && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 mb-3">
            <div>
              <h4 className="text-sm font-semibold text-white">Truth or Dare</h4>
              <p className="text-[10px] text-white/40 font-light mt-0.5">LDR relationship building cards</p>
            </div>
            <button
              onClick={onExitGame}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs border border-white/5 transition-all"
            >
              Exit Game
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full py-4">
            {todPrompt ? (
              <motion.div
                key={todPrompt}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`w-full max-w-md p-6 rounded-3xl border text-center relative shadow-2xl ${
                  todType === 'truth' ? 'bg-indigo-950/20 border-indigo-500/20 shadow-indigo-500/5' : 'bg-rose-950/20 border-rose-500/20 shadow-rose-500/5'
                }`}
              >
                <span className={`text-[9px] tracking-[0.2em] uppercase font-bold ${todType === 'truth' ? 'text-indigo-400' : 'text-rose-400'}`}>
                  {todType === 'truth' ? 'Truth Card' : 'Dare Card'}
                </span>
                <p className="text-xs text-white/90 leading-relaxed font-light mt-3 px-2 select-text">"{todPrompt}"</p>
                <div className="mt-6 flex justify-center gap-3">
                  <button
                    onClick={onClearTod}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[10px] border border-white/5 transition-all"
                  >
                    Clear Card
                  </button>
                  <button
                    onClick={() => onDrawTod(todType!)}
                    className={`px-3 py-2 rounded-xl text-white text-[10px] font-semibold transition-all ${
                      todType === 'truth' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-rose-600 hover:bg-rose-500'
                    }`}
                  >
                    Draw Another
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-xs text-white/40 mb-4 font-light">Draw a card to challenge each other!</span>
                <div className="flex gap-4">
                  <button
                    onClick={() => onDrawTod('truth')}
                    className="px-5 py-3 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/25 border border-indigo-500/30 text-indigo-400 hover:text-indigo-300 font-semibold text-xs transition-all"
                  >
                    Ask a Truth
                  </button>
                  <button
                    onClick={() => onDrawTod('dare')}
                    className="px-5 py-3 rounded-xl bg-rose-600/10 hover:bg-rose-600/25 border border-rose-500/30 text-rose-400 hover:text-rose-300 font-semibold text-xs transition-all"
                  >
                    Give a Dare
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* 3. TIC TAC TOE SCREEN */}
      {activeGame === 'tic-tac-toe' && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 mb-3">
            <div>
              <h4 className="text-sm font-semibold text-white">Tic Tac Toe</h4>
              <p className="text-[10px] text-white/40 font-light mt-0.5">Turn-based multiplayer sync</p>
            </div>
            <button
              onClick={onExitGame}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs border border-white/5 transition-all"
            >
              Exit Game
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center max-sm:mx-auto w-full py-2">
            <div className="w-full flex items-center justify-between mb-4 px-1">
              <div className="flex flex-col">
                <span className="text-[8px] uppercase tracking-wider text-white/40">Your Symbol</span>
                <span className="text-xs font-bold text-indigo-400">{mySymbol}</span>
              </div>
              <div className="text-center bg-white/[0.03] border border-white/5 rounded-xl px-3 py-1 flex items-center gap-2">
                <span className="text-xs font-semibold text-white/80">{score.self}</span>
                <span className="text-[8px] uppercase text-white/30 tracking-widest font-mono">Score</span>
                <span className="text-xs font-semibold text-white/80">{score.opponent}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[8px] uppercase tracking-wider text-white/40">Status</span>
                {checkWinner(board) ? (
                  <span className="text-xs font-bold text-emerald-400">Finished!</span>
                ) : (
                  <span className={`text-xs font-semibold ${isMyTurn ? 'text-indigo-400 animate-pulse' : 'text-white/40'}`}>{isMyTurn ? 'Your Turn' : 'Waiting...'}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 w-full aspect-square max-w-[220px]">
              {board.map((cell, idx) => (
                <button
                  key={idx}
                  onClick={() => onCellClick(idx)}
                  disabled={cell !== null || !isMyTurn || checkWinner(board) !== null}
                  className={`h-full w-full aspect-square rounded-xl border transition-all duration-200 flex items-center justify-center text-xl font-bold select-none ${
                    cell === 'X'
                      ? 'text-indigo-400 border-indigo-500/25 bg-indigo-500/5'
                      : cell === 'O'
                        ? 'text-purple-400 border-purple-500/25 bg-purple-500/5'
                        : isMyTurn
                          ? 'border-white/[0.08] hover:border-indigo-500/30 hover:bg-indigo-500/5 cursor-pointer'
                          : 'border-white/[0.04] bg-white/[0.01]'
                  }`}
                >
                  {cell}
                </button>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={onResetTicTacToe}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5 text-[10px] font-medium flex items-center gap-1.5 transition-all"
              >
                <FiRotateCcw className="text-[10px]" /> Reset Grid
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  )
}

export default CasualGamesView
