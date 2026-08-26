import { useState, Dispatch, SetStateAction, RefObject } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiFlag, FiLayers, FiAward, FiVolume2, FiVolumeX, FiChevronLeft, FiX } from 'react-icons/fi'
import { Chessboard } from 'react-chessboard'
import { Square, Chess } from 'chess.js'
import { TIME_CONTROL_PRESETS, CHESS_PUZZLES } from '../constants/game-data'
import { formatClockTime } from '../utils/chess-utils'

interface ChessBoardViewProps {
  activeGame: 'chess' | 'chess-puzzle'
  selectedTimeControl: (typeof TIME_CONTROL_PRESETS)[0]
  soundMuted: boolean
  setSoundMuted: Dispatch<SetStateAction<boolean>>
  onExitGame: () => void
  selectedChatData: Record<string, unknown> | string | null
  topCaptured: string[]
  topAdvantage: number
  topRemainingMs: number
  isTopUserTurn: boolean
  bottomCaptured: string[]
  bottomAdvantage: number
  bottomRemainingMs: number
  isBottomUserTurn: boolean
  chessInstanceRef: RefObject<Chess>
  previewFen: string | null
  chessFen: string
  isShaking: boolean
  drawOfferReceived: boolean
  acceptDraw: () => void
  declineDraw: () => void
  pendingPromotion: { from: string; to: string } | null
  executeChessMove: (from: string, to: string, promotion?: string) => boolean
  handleChessPieceDrop: (sourceSquare: Square, targetSquare: Square) => boolean
  handleSquareClick: (square: Square) => void
  handlePieceClick: (piece: string, square: Square) => void
  getCustomSquareStyles: (currentOptions: Record<string, { background: string; borderRadius?: string }>) => Record<string, { background: string; borderRadius?: string }>
  optionSquares: Record<string, { background: string; borderRadius?: string }>
  boardOrientation: 'white' | 'black'
  isSpectator: boolean
  gameResult: { winnerId: string | null; reason: string; _id?: string } | null
  proposeDraw: () => void
  resignGame: () => void
  moveHistoryList: { playerId: string; action: string; resultingState: string }[]
  setPreviewFen: (fen: string | null) => void
  // Chess Puzzle props
  currentPuzzleIdx: number
  puzzleStatus: 'playing' | 'solved' | 'failed'
  puzzleHint: string | null
  setPuzzleHint: (hint: string | null) => void
  startPuzzle: (idx: number) => void
  handlePuzzlePieceDrop: (sourceSquare: Square, targetSquare: Square) => boolean
}

const pieceSymbolMap: Record<string, string> = {
  p: '♟',
  r: '♜',
  n: '♞',
  b: '♝',
  q: '♛',
  k: '♚',
}

const ChessBoardView = ({
  activeGame,
  selectedTimeControl,
  soundMuted,
  setSoundMuted,
  onExitGame,
  selectedChatData,
  topCaptured,
  topAdvantage,
  topRemainingMs,
  isTopUserTurn,
  bottomCaptured,
  bottomAdvantage,
  bottomRemainingMs,
  isBottomUserTurn,
  chessInstanceRef,
  previewFen,
  chessFen,
  isShaking,
  drawOfferReceived,
  acceptDraw,
  declineDraw,
  pendingPromotion,
  executeChessMove,
  handleChessPieceDrop,
  handleSquareClick,
  handlePieceClick,
  getCustomSquareStyles,
  optionSquares,
  boardOrientation,
  isSpectator,
  gameResult,
  proposeDraw,
  resignGame,
  moveHistoryList,
  setPreviewFen,
  currentPuzzleIdx,
  puzzleStatus,
  puzzleHint,
  setPuzzleHint,
  startPuzzle,
  handlePuzzlePieceDrop,
}: ChessBoardViewProps) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  if (activeGame === 'chess-puzzle') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col justify-between h-full min-h-0">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 mb-2">
          <div className="flex items-center gap-2">
            <button onClick={onExitGame} className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer">
              <FiChevronLeft className="text-sm" />
            </button>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">Chess Puzzles</h4>
              <p className="text-[9px] text-white/40 font-light">Find the best tactic</p>
            </div>
          </div>
          <button onClick={onExitGame} className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs border border-white/10 transition-all">
            Exit
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full py-1">
          <div className="text-center mb-2">
            <h3 className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
              Puzzle {CHESS_PUZZLES[currentPuzzleIdx].id}: {CHESS_PUZZLES[currentPuzzleIdx].title}
            </h3>
            <p className="text-[11px] text-white/70 mt-0.5 leading-relaxed px-2">{CHESS_PUZZLES[currentPuzzleIdx].description}</p>
          </div>

          <div key={chessFen} className="w-full max-w-[min(100%,340px,40vh)] aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <Chessboard
              position={chessFen}
              onPieceDrop={handlePuzzlePieceDrop}
              boardOrientation="white"
              arePiecesDraggable={puzzleStatus === 'playing'}
              animationDuration={200}
              customBoardStyle={{
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
              customDarkSquareStyle={{ backgroundColor: '#164e63' }}
              customLightSquareStyle={{ backgroundColor: '#ecfeff' }}
            />
          </div>

          <div className="mt-3 flex flex-col items-center gap-2 w-full">
            {puzzleStatus === 'solved' && (
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <FiAward className="text-sm" /> Correct! Puzzle Solved!
              </motion.div>
            )}
            {puzzleStatus === 'failed' && (
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                Incorrect Move. Try again!
              </motion.div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPuzzleHint(CHESS_PUZZLES[currentPuzzleIdx].hint)}
                className="px-3 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-all cursor-pointer"
              >
                💡 Hint
              </button>
              <button
                onClick={() => startPuzzle(currentPuzzleIdx)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs font-semibold border border-white/10 transition-all cursor-pointer"
              >
                Reset
              </button>
              {puzzleStatus === 'solved' && currentPuzzleIdx < CHESS_PUZZLES.length - 1 && (
                <button
                  onClick={() => startPuzzle(currentPuzzleIdx + 1)}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Next Puzzle ➔
                </button>
              )}
            </div>

            {puzzleHint && (
              <p className="text-[10px] text-indigo-200 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-3 py-1 text-center leading-relaxed mt-1">
                <span className="font-bold text-indigo-400">Hint:</span> {puzzleHint}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  const partnerName = typeof selectedChatData === 'object' && selectedChatData?.firstName ? selectedChatData.firstName : 'Partner'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col justify-between h-full min-h-0 overflow-y-auto lg:overflow-visible custom-scrollbar relative"
    >
      {/* Sleek Minimal Sub-Header */}
      <div className="flex items-center justify-between pb-1.5 mb-1 px-1 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-bold border border-amber-500/30">{selectedTimeControl.label}</span>
          <button
            onClick={() => {
              const nextMuted = !soundMuted
              setSoundMuted(nextMuted)
              localStorage.setItem('chess_muted', String(nextMuted))
            }}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            title={soundMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {soundMuted ? <FiVolumeX className="text-xs text-rose-400" /> : <FiVolume2 className="text-xs" />}
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center gap-1 ${
              isHistoryOpen ? 'bg-white/15 text-white border-white/20 shadow-sm' : 'bg-white/5 text-slate-300 hover:text-white border-white/10'
            }`}
          >
            Moves {moveHistoryList.length > 0 && <span className="text-[10px] text-slate-400 font-mono">({Math.ceil(moveHistoryList.length / 2)})</span>}
          </button>
          <button
            onClick={onExitGame}
            className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium border border-white/10 transition-all cursor-pointer flex items-center gap-1"
          >
            <FiChevronLeft className="text-xs" /> Menu
          </button>
        </div>
      </div>

      {/* Main Grid: Left Board + Right Move List & Controls */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 items-center justify-center min-h-0">
        {/* Board Container Column */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center max-w-[390px] mx-auto w-full relative">
          {/* Top Player Info Bar */}
          <div
            className={`w-full flex items-center justify-between rounded-xl px-2.5 py-1.5 mb-1.5 transition-all duration-300 backdrop-blur-md ${
              isTopUserTurn
                ? 'bg-indigo-500/10 border border-indigo-500/30 shadow-[0_0_16px_rgba(99,102,241,0.15)]'
                : 'bg-white/[0.03] border border-white/[0.07]'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0">
                {partnerName[0]?.toUpperCase() || 'P'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-medium text-white truncate max-w-[110px]">{partnerName}</span>
                <div className="flex items-center gap-1 text-[9px] text-slate-400">
                  <span>{topCaptured.map((p) => pieceSymbolMap[p] || p).join('')}</span>
                  {topAdvantage > 0 && <span className="text-amber-400 font-semibold">+{topAdvantage}</span>}
                </div>
              </div>
            </div>

            {/* Top Clock */}
            {selectedTimeControl.initialSeconds > 0 && (
              <div
                className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  isTopUserTurn
                    ? topRemainingMs < 10000
                      ? 'bg-rose-950/90 text-rose-300 border border-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/50 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                    : 'bg-black/30 text-slate-400 border border-white/[0.06]'
                }`}
              >
                {formatClockTime(topRemainingMs)}
              </div>
            )}
          </div>

          {/* Chessboard Area */}
          <div className="relative w-full max-w-[min(100%,370px,44vh)] aspect-square shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(99,102,241,0.12)] rounded-2xl overflow-hidden border border-white/[0.12]">
            {/* Check alert badge */}
            {chessInstanceRef.current && chessInstanceRef.current.inCheck() && !chessInstanceRef.current.isCheckmate() && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 px-2.5 py-0.5 rounded-full bg-rose-600/90 border border-rose-400 text-[10px] font-semibold text-white shadow-lg">
                Check
              </div>
            )}

            {/* Draw offer prompt */}
            {drawOfferReceived && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 z-40 p-2.5 bg-[#0F1017]/95 border border-indigo-500/40 rounded-2xl flex items-center justify-between gap-3 w-[90%] shadow-2xl backdrop-blur-xl">
                <span className="text-xs text-white font-normal">Partner offered a draw</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={acceptDraw}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg shadow-md transition-colors cursor-pointer"
                  >
                    Accept
                  </button>
                  <button
                    onClick={declineDraw}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Decline
                  </button>
                </div>
              </div>
            )}

            {/* Pawn Promotion Popover */}
            {pendingPromotion && (
              <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Select Promotion Piece</span>
                <div className="flex gap-2 bg-[#0F1017] p-2.5 rounded-2xl border border-white/20 shadow-2xl">
                  {[
                    { char: 'q', label: '♛' },
                    { char: 'r', label: '♜' },
                    { char: 'b', label: '♝' },
                    { char: 'n', label: '♞' },
                  ].map((piece) => (
                    <button
                      key={piece.char}
                      onClick={() => executeChessMove(pendingPromotion.from, pendingPromotion.to, piece.char)}
                      className="w-11 h-11 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white text-xl font-bold transition-all hover:scale-105 flex items-center justify-center cursor-pointer"
                    >
                      {piece.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <motion.div animate={isShaking ? { x: [-8, 8, -6, 6, -4, 4, 0] } : { x: 0 }} transition={{ duration: 0.4 }} className="w-full h-full">
              <Chessboard
                position={previewFen || chessFen}
                onPieceDrop={handleChessPieceDrop}
                onSquareClick={handleSquareClick}
                onPieceClick={handlePieceClick}
                customSquareStyles={getCustomSquareStyles(optionSquares)}
                boardOrientation={boardOrientation}
                arePiecesDraggable={!isSpectator && !previewFen && isBottomUserTurn}
                animationDuration={200}
                showBoardNotation={true}
                customBoardStyle={{
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                }}
                customDarkSquareStyle={{ backgroundColor: '#2B3148' }}
                customLightSquareStyle={{ backgroundColor: '#E4E8EE' }}
              />
            </motion.div>
          </div>

          {/* Bottom Player Info Bar */}
          <div
            className={`w-full flex items-center justify-between rounded-xl px-2.5 py-1.5 mt-1.5 transition-all duration-300 backdrop-blur-md ${
              isBottomUserTurn
                ? 'bg-indigo-500/10 border border-indigo-500/30 shadow-[0_0_16px_rgba(99,102,241,0.15)]'
                : 'bg-white/[0.03] border border-white/[0.07]'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center text-[10px] font-semibold text-white">You</div>
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-white">You</span>
                <div className="flex items-center gap-1 text-[9px] text-slate-400">
                  <span>{bottomCaptured.map((p) => pieceSymbolMap[p] || p).join('')}</span>
                  {bottomAdvantage > 0 && <span className="text-amber-400 font-semibold">+{bottomAdvantage}</span>}
                </div>
              </div>
            </div>

            {/* Bottom Clock */}
            {selectedTimeControl.initialSeconds > 0 && (
              <div
                className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  isBottomUserTurn
                    ? bottomRemainingMs < 10000
                      ? 'bg-rose-950/90 text-rose-300 border border-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/50 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                    : 'bg-black/30 text-slate-400 border border-white/[0.06]'
                }`}
              >
                {formatClockTime(bottomRemainingMs)}
              </div>
            )}
          </div>

          {/* Quick Action Bar Under Bottom Player Bar */}
          <div className="grid grid-cols-2 gap-2 w-full mt-1.5">
            <button
              onClick={proposeDraw}
              disabled={!!gameResult || isSpectator}
              className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <FiLayers className="text-xs text-slate-400" /> Draw
            </button>
            <button
              onClick={resignGame}
              disabled={!!gameResult || isSpectator}
              className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-rose-500/15 disabled:opacity-40 text-slate-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <FiFlag className="text-xs" /> Resign
            </button>
          </div>
        </div>

        {/* Right Column: Move List on Large Screens */}
        <div className="lg:col-span-4 flex flex-col gap-2 h-full max-h-[380px] min-h-0 hidden lg:flex">
          <div className="flex-1 bg-slate-900/60 border border-white/10 rounded-2xl p-3 flex flex-col min-h-0 overflow-hidden shadow-inner">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-1.5">
              <span className="text-xs font-semibold text-slate-300">Move History</span>
              {previewFen && (
                <button
                  onClick={() => setPreviewFen(null)}
                  className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/40 cursor-pointer"
                >
                  Live 🔴
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 text-xs">
              {moveHistoryList.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[11px] text-white/30 italic">No moves made yet</div>
              ) : (
                Array.from({ length: Math.ceil(moveHistoryList.length / 2) }).map((_, i) => {
                  const whiteMove = moveHistoryList[i * 2]
                  const blackMove = moveHistoryList[i * 2 + 1]
                  return (
                    <div key={i} className="grid grid-cols-12 gap-1 py-1 px-2 rounded-lg hover:bg-white/5 transition-colors">
                      <span className="col-span-3 text-slate-500 font-mono text-[10px]">{i + 1}.</span>
                      <button
                        onClick={() => setPreviewFen(whiteMove.resultingState)}
                        className={`col-span-4 text-left font-mono font-medium rounded px-1 cursor-pointer ${
                          previewFen === whiteMove.resultingState ? 'bg-amber-500/30 text-amber-300 font-bold' : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        {whiteMove.action}
                      </button>
                      {blackMove && (
                        <button
                          onClick={() => setPreviewFen(blackMove.resultingState)}
                          className={`col-span-5 text-left font-mono font-medium rounded px-1 cursor-pointer ${
                            previewFen === blackMove.resultingState ? 'bg-amber-500/30 text-amber-300 font-bold' : 'text-slate-300 hover:text-white'
                          }`}
                        >
                          {blackMove.action}
                        </button>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Move History Drawer Popover on demand */}
      <AnimatePresence>
        {isHistoryOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="absolute inset-x-2 bottom-2 top-12 z-50 bg-[#0D0E15]/95 border border-indigo-500/30 rounded-2xl p-3 shadow-2xl backdrop-blur-2xl flex flex-col"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                📜 Full Move Notation {moveHistoryList.length > 0 && <span className="text-indigo-400 font-mono">({Math.ceil(moveHistoryList.length / 2)} moves)</span>}
              </span>
              <div className="flex items-center gap-2">
                {previewFen && (
                  <button
                    onClick={() => setPreviewFen(null)}
                    className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/40 cursor-pointer"
                  >
                    Live 🔴
                  </button>
                )}
                <button onClick={() => setIsHistoryOpen(false)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                  <FiX className="text-sm" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar my-2 space-y-1 text-xs">
              {moveHistoryList.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">No moves made yet</div>
              ) : (
                Array.from({ length: Math.ceil(moveHistoryList.length / 2) }).map((_, i) => {
                  const whiteMove = moveHistoryList[i * 2]
                  const blackMove = moveHistoryList[i * 2 + 1]
                  return (
                    <div key={i} className="grid grid-cols-12 gap-1 py-1.5 px-2 rounded-xl bg-white/[0.02] hover:bg-white/5 transition-colors">
                      <span className="col-span-2 text-slate-500 font-mono text-[10px]">{i + 1}.</span>
                      <button
                        onClick={() => setPreviewFen(whiteMove.resultingState)}
                        className={`col-span-5 text-left font-mono font-medium rounded px-2 py-0.5 cursor-pointer ${
                          previewFen === whiteMove.resultingState ? 'bg-amber-500/30 text-amber-300 font-bold' : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        {whiteMove.action}
                      </button>
                      {blackMove && (
                        <button
                          onClick={() => setPreviewFen(blackMove.resultingState)}
                          className={`col-span-5 text-left font-mono font-medium rounded px-2 py-0.5 cursor-pointer ${
                            previewFen === blackMove.resultingState ? 'bg-amber-500/30 text-amber-300 font-bold' : 'text-slate-300 hover:text-white'
                          }`}
                        >
                          {blackMove.action}
                        </button>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="py-1.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer active:scale-95"
              >
                Back to Board
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default ChessBoardView
