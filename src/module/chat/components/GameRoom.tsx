import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiVideoOff } from 'react-icons/fi'
import { useAppStore } from '../../../store/store'
import { useSocket } from '../../../hook/socketContext'
import SimplePeer from 'simple-peer'
import { Chess, Square } from 'chess.js'

import { GameRoomProps, GameStateSync, ChatMessage, FloatingEmoji, GameSessionState } from './game-room/types/game.types'
import { TIME_CONTROL_PRESETS, CHESS_PUZZLES, WOULD_YOU_RATHER_QUESTIONS, TRUTH_OR_DARE_CARDS } from './game-room/constants/game-data'
import { playSoundCue, getCapturedPieces } from './game-room/utils/chess-utils'

import GameSelectionMenu from './game-room/components/GameSelectionMenu'
import ChessBoardView from './game-room/components/ChessBoardView'
import ConnectFourView from './game-room/components/ConnectFourView'
import SlidingPuzzleView from './game-room/components/SlidingPuzzleView'
import CasualGamesView from './game-room/components/CasualGamesView'
import GameOverModal from './game-room/components/GameOverModal'
import GameMiniChat from './game-room/components/GameMiniChat'

const GameRoom = ({ onClose }: GameRoomProps) => {
  const socket = useSocket()
  const { selectedChatData, userInfo } = useAppStore()
  const myId = userInfo?.id || (userInfo as { _id?: string })?._id || ''
  const opponentId = typeof selectedChatData === 'object' ? selectedChatData._id || (selectedChatData as { id?: string }).id || '' : selectedChatData || ''
  const conversationId = [myId, opponentId].sort().join('-')

  useEffect(() => {
    if (socket && conversationId) {
      socket.emit('game:join-room', { conversationId })
      const handleConnect = () => {
        socket.emit('game:join-room', { conversationId })
      }
      socket.on('connect', handleConnect)
      return () => {
        socket.off('connect', handleConnect)
      }
    }
  }, [socket, conversationId])

  // Camera & WebRTC streams states
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const peerRef = useRef<SimplePeer.Instance | null>(null)

  // Game configuration states
  const [activeGame, setActiveGame] = useState<'selection' | 'would-you-rather' | 'truth-or-dare' | 'tic-tac-toe' | 'chess' | 'chess-puzzle' | 'connect-four' | 'sliding-puzzle'>(
    'selection'
  )
  const [score, setScore] = useState({ self: 0, opponent: 0 })

  // 1. "Would You Rather" game states
  const [wyrIndex, setWyrIndex] = useState(0)
  const [wyrSelection, setWyrSelection] = useState<'A' | 'B' | null>(null)
  const [opponentWyrSelection, setOpponentWyrSelection] = useState<'A' | 'B' | null>(null)

  // 2. "Truth or Dare" game states
  const [todType, setTodType] = useState<'truth' | 'dare' | null>(null)
  const [todPrompt, setTodPrompt] = useState<string | null>(null)

  // 3. "Tic Tac Toe" game states
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null))
  const [isMyTurn, setIsMyTurn] = useState(true)
  const [mySymbol] = useState<'X' | 'O'>('X')

  // 4. "Chess" & "Chess Puzzles" game states
  const chessInstanceRef = useRef(new Chess())
  const [chessFen, setChessFen] = useState(chessInstanceRef.current.fen())
  const [, setSelectedChessSlot] = useState<string | null>(null)
  const [moveFrom, setMoveFrom] = useState<string | null>(null)
  const [optionSquares, setOptionSquares] = useState<Record<string, { background: string; borderRadius?: string }>>({})
  const [isShaking, setIsShaking] = useState(false)
  const [drawOfferReceived, setDrawOfferReceived] = useState(false)
  const [gameResult, setGameResult] = useState<{ winnerId: string | null; reason: string; _id?: string } | null>(null)

  // Chess.com style UX & Clock states
  const [soundMuted, setSoundMuted] = useState(() => localStorage.getItem('chess_muted') === 'true')
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white')
  const [pendingPromotion, setPendingPromotion] = useState<{ from: string; to: string } | null>(null)
  const [previewFen, setPreviewFen] = useState<string | null>(null)
  const [clocks, setClocks] = useState<Record<string, { remainingMs: number; lastMoveTimestamp: Date | string | null }>>({})
  const [selectedTimeControl, setSelectedTimeControl] = useState(TIME_CONTROL_PRESETS[4]) // Blitz 5|0 default
  const [moveHistoryList, setMoveHistoryList] = useState<{ playerId: string; action: string; resultingState: string }[]>([])

  // Spectator detection
  const [gameSessionPlayers, setGameSessionPlayers] = useState<string[]>([])
  const isSpectator = gameSessionPlayers.length > 0 && !gameSessionPlayers.includes(myId)

  // Reaction state for game event messages
  const [gameEventReactions, setGameEventReactions] = useState<Record<string, { userId: string; emoji: string }[]>>({})
  const [activeGameReactionPicker, setActiveGameReactionPicker] = useState<string | null>(null)

  const [serverPlayerColor, setServerPlayerColor] = useState<'w' | 'b' | null>(null)
  const [currentTurnUserId, setCurrentTurnUserId] = useState<string>('')

  const myChessColor = serverPlayerColor || (myId && opponentId && myId < opponentId ? 'w' : 'b')
  const isMyChessTurn = currentTurnUserId ? currentTurnUserId === myId : chessInstanceRef.current.turn() === myChessColor

  // Chess puzzles states
  const [currentPuzzleIdx, setCurrentPuzzleIdx] = useState(0)
  const [puzzleStatus, setPuzzleStatus] = useState<'playing' | 'solved' | 'failed'>('playing')
  const [puzzleHint, setPuzzleHint] = useState<string | null>(null)

  // 5. Connect Four Game States
  const [c4Grid, setC4Grid] = useState<(string | null)[][]>(
    Array(6)
      .fill(null)
      .map(() => Array(7).fill(null))
  )
  const [c4ActiveTurn, setC4ActiveTurn] = useState<string>('')
  const isMyC4Turn = c4ActiveTurn === myId

  // 6. Sliding Tile Puzzle Game States
  const [slidingTiles, setSlidingTiles] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0])
  const [slidingMoveCount, setSlidingMoveCount] = useState<number>(0)
  const [slidingActiveTurn, setSlidingActiveTurn] = useState<string>('')
  const isMySlidingTurn = slidingActiveTurn === myId

  // Mini Chat & Floating Emojis states
  const [gameMessages, setGameMessages] = useState<ChatMessage[]>([])
  const [miniChatInput, setMiniChatInput] = useState('')
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Synchronize board orientation with server assigned player color
  useEffect(() => {
    if (serverPlayerColor) {
      setBoardOrientation(serverPlayerColor === 'w' ? 'white' : 'black')
    }
  }, [serverPlayerColor])

  // Live timer interval
  useEffect(() => {
    if (!currentTurnUserId || !clocks[currentTurnUserId]) return

    const interval = setInterval(() => {
      setClocks((prev) => {
        const current = prev[currentTurnUserId]
        if (!current || current.remainingMs <= 0) return prev
        return {
          ...prev,
          [currentTurnUserId]: {
            ...current,
            remainingMs: Math.max(0, current.remainingMs - 100),
          },
        }
      })
    }, 100)

    return () => clearInterval(interval)
  }, [currentTurnUserId, clocks])

  // Camera setup
  useEffect(() => {
    if (!isCameraOn) {
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop())
        setLocalStream(null)
      }
      return
    }

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        setLocalStream(stream)
        if (localVideoRef.current) localVideoRef.current.srcObject = stream
      })
      .catch((err) => {
        console.warn('Camera access denied or unavailable:', err)
        setCameraError('Camera disabled')
      })

    return () => {
      if (localStream) localStream.getTracks().forEach((t) => t.stop())
    }
  }, [isCameraOn])

  // Socket setup
  useEffect(() => {
    if (!socket || !myId) return

    const handleGameSignal = (data: { signal: SimplePeer.SignalData; from: string }) => {
      if (peerRef.current) {
        peerRef.current.signal(data.signal)
      } else if (data.signal.type === 'offer') {
        const peer = new SimplePeer({ initiator: false, trickled: false, stream: localStream || undefined })
        peer.on('signal', (signalData) => {
          socket.emit('game-signal', { signal: signalData, to: data.from, conversationId })
        })
        peer.on('stream', (stream) => {
          setRemoteStream(stream)
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream
        })
        peer.signal(data.signal)
        peerRef.current = peer
      }
    }

    const handleGameStateUpdated = (data: { gameState: GameStateSync }) => {
      const gs = data.gameState
      if (gs.activeGame) setActiveGame(gs.activeGame)
      if (gs.selection !== undefined) setOpponentWyrSelection(gs.selection)
      if (gs.todPrompt !== undefined) setTodPrompt(gs.todPrompt)
      if (gs.todType !== undefined) setTodType(gs.todType)
      if (gs.board) {
        setBoard(gs.board)
        setIsMyTurn(!isMyTurn)
      }
    }

    const handleGameState = (session: GameSessionState) => {
      if (session.players) {
        setGameSessionPlayers(session.players.map((p) => p.userId))
      }
      const myPlayer = session.players?.find((p) => p.userId === myId)
      if (myPlayer) {
        setServerPlayerColor(myPlayer.color as 'w' | 'b')
      }
      if (session.currentTurn) {
        setCurrentTurnUserId(session.currentTurn)
      }

      if (session.gameType === 'chess') {
        if (activeGame !== 'chess') {
          setActiveGame('chess')
        }
        chessInstanceRef.current.load(session.state.fen || '')
        setChessFen(session.state.fen || '')
        if (session.clocks) setClocks(session.clocks)
        if (session.moveHistory) setMoveHistoryList(session.moveHistory)
        if (session.result?.reason) {
          setGameResult(session.result)
        }
      } else if (session.gameType === 'connect-four') {
        if (activeGame !== 'connect-four') {
          setActiveGame('connect-four')
        }
        if (session.state.grid) setC4Grid(session.state.grid)
        setC4ActiveTurn(session.currentTurn)
        if (session.result?.reason) {
          setGameResult(session.result)
        }
      } else if (session.gameType === 'sliding-puzzle' || session.gameType === 'puzzle' || session.gameType === '2048') {
        if (activeGame !== 'sliding-puzzle') {
          setActiveGame('sliding-puzzle')
        }
        if (session.state.tiles) setSlidingTiles(session.state.tiles)
        if (session.state.moveCount !== undefined) setSlidingMoveCount(session.state.moveCount)
        setSlidingActiveTurn(session.currentTurn)
        if (session.result?.reason) {
          setGameResult(session.result)
        }
      }
    }

    const handleChessMoveAccepted = (session: GameSessionState) => {
      const prevFen = chessInstanceRef.current.fen()
      chessInstanceRef.current.load(session.state.fen || '')
      setChessFen(session.state.fen || '')
      setSelectedChessSlot(null)
      setMoveFrom(null)
      setOptionSquares({})
      setPendingPromotion(null)

      if (session.clocks) setClocks(session.clocks)
      if (session.moveHistory) setMoveHistoryList(session.moveHistory)

      if (session.currentTurn) {
        setCurrentTurnUserId(session.currentTurn)
      }
      if (session.result?.reason) {
        setGameResult(session.result)
        playSoundCue('end')
      } else if (chessInstanceRef.current.inCheck()) {
        playSoundCue('check')
      } else if (prevFen !== session.state.fen) {
        const prevCount = prevFen.split(' ')[0].replace(/[^a-zA-Z]/g, '').length
        const nextCount = (session.state.fen || '').split(' ')[0].replace(/[^a-zA-Z]/g, '').length
        if (nextCount < prevCount) {
          playSoundCue('capture')
        } else {
          playSoundCue('move')
        }
      }
    }

    const handleChessMoveRejected = () => {
      setIsShaking(true)
      if (chessFen) {
        try {
          chessInstanceRef.current.load(chessFen)
        } catch (err) {
          console.warn('Failed to reload FEN:', err)
        }
      }
      setSelectedChessSlot(null)
      setMoveFrom(null)
      setOptionSquares({})
      setTimeout(() => setIsShaking(false), 500)
    }

    const handleC4MoveAccepted = (session: GameSessionState) => {
      if (session.state.grid) setC4Grid(session.state.grid)
      setC4ActiveTurn(session.currentTurn)
      if (session.result?.reason) {
        setGameResult(session.result)
      }
    }

    const handleSlidingMoveAccepted = (session: GameSessionState) => {
      if (session.state.tiles) setSlidingTiles(session.state.tiles)
      if (session.state.moveCount !== undefined) setSlidingMoveCount(session.state.moveCount)
      setSlidingActiveTurn(session.currentTurn)
      if (session.result?.reason) {
        setGameResult(session.result)
      }
    }

    const handleGameResult = (result: { winnerId: string | null; reason: string; _id?: string }) => {
      setGameResult(result)
      const isWinner = result.winnerId && result.winnerId === userInfo.id
      const text = isWinner ? `🏆 You won! (${result.reason})` : result.winnerId ? `🎖 Partner won! (${result.reason})` : `🤝 Draw! (${result.reason})`
      setGameMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          senderId: 'system',
          text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          eventMessageId: result._id,
        },
      ])
    }

    const handleDrawOffered = () => {
      setDrawOfferReceived(true)
    }

    const handleDrawDeclined = () => {
      setDrawOfferReceived(false)
      setGameMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          senderId: 'system',
          text: 'Draw offer was declined.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    }

    const handleGameChatReceived = ({ senderId, message }: { senderId: string; message: string }) => {
      if (senderId !== myId) {
        setGameMessages((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            senderId: opponentId,
            text: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ])
      }
    }

    const handleGameReactionReceived = ({ emoji }: { emoji: string }) => {
      setFloatingEmojis((prev) => [...prev, { id: Date.now() + Math.random(), emoji, x: 10 + Math.random() * 80 }])
    }

    const handleMessageReactionUpdated = ({ messageId, reactions }: { messageId: string; reactions: { userId: string; emoji: string }[] }) => {
      setGameEventReactions((prev) => ({ ...prev, [messageId]: reactions }))
    }

    socket.on('game-signal-received', handleGameSignal)
    socket.on('game-state-updated', handleGameStateUpdated)
    socket.on('game:state', handleGameState)
    socket.on('chess:moveAccepted', handleChessMoveAccepted)
    socket.on('chess:moveRejected', handleChessMoveRejected)
    socket.on('c4:moveAccepted', handleC4MoveAccepted)
    socket.on('sliding:moveAccepted', handleSlidingMoveAccepted)
    socket.on('game:result', handleGameResult)
    socket.on('game:drawOffered', handleDrawOffered)
    socket.on('game:drawDeclined', handleDrawDeclined)
    socket.on('game-chat-received', handleGameChatReceived)
    socket.on('game-reaction-received', handleGameReactionReceived)
    socket.on('message:reactionUpdated', handleMessageReactionUpdated)

    socket.emit('join-game', { opponentId })

    return () => {
      socket.off('game-signal-received', handleGameSignal)
      socket.off('game-state-updated', handleGameStateUpdated)
      socket.off('game:state', handleGameState)
      socket.off('chess:moveAccepted', handleChessMoveAccepted)
      socket.off('chess:moveRejected', handleChessMoveRejected)
      socket.off('c4:moveAccepted', handleC4MoveAccepted)
      socket.off('sliding:moveAccepted', handleSlidingMoveAccepted)
      socket.off('game:result', handleGameResult)
      socket.off('game:drawOffered', handleDrawOffered)
      socket.off('game:drawDeclined', handleDrawDeclined)
      socket.off('game-chat-received', handleGameChatReceived)
      socket.off('game-reaction-received', handleGameReactionReceived)
      socket.off('message:reactionUpdated', handleMessageReactionUpdated)
    }
  }, [socket, myId, localStream, opponentId, activeGame])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [gameMessages])

  useEffect(() => {
    if (socket && conversationId && (activeGame === 'chess' || activeGame === 'connect-four' || activeGame === 'sliding-puzzle')) {
      socket.emit('game:initiate', {
        conversationId,
        gameType: activeGame,
        opponentId,
        timeControl: activeGame === 'chess' ? { initialSeconds: selectedTimeControl.initialSeconds, incrementSeconds: selectedTimeControl.incrementSeconds } : undefined,
      })
    }
  }, [socket, conversationId, activeGame, opponentId, selectedTimeControl])

  const syncGameState = (payload: GameStateSync) => {
    if (socket) {
      socket.emit('game-state-sync', { conversationId, opponentId, gameState: payload })
    }
  }

  const selectGame = (game: typeof activeGame) => {
    setActiveGame(game)
    syncGameState({ gameType: 'select-game', activeGame: game })
    if (game === 'chess') resetChess()
    if (game === 'chess-puzzle') startPuzzle(0)
    if (game === 'connect-four') {
      setC4Grid(
        Array(6)
          .fill(null)
          .map(() => Array(7).fill(null))
      )
    }
    if (game === 'sliding-puzzle') {
      setSlidingTiles([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0])
      setSlidingMoveCount(0)
    }
  }

  const handleC4Drop = (colIndex: number) => {
    if (!isMyC4Turn || gameResult || isSpectator) return
    if (socket) {
      socket.emit('c4:dropDisc', { conversationId, col: colIndex })
    }
  }

  const handleSlidingTileClick = (tileIndex: number) => {
    if (!isMySlidingTurn || gameResult || isSpectator) return
    if (socket) {
      socket.emit('sliding:moveTile', { conversationId, tileIndex })
    }
  }

  // Mini-Chat & Reaction triggers
  const handleSendGameMessage = () => {
    if (!miniChatInput.trim() || !socket) return
    const text = miniChatInput.trim()
    setGameMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        senderId: myId || 'self',
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    socket.emit('game-chat-message', { conversationId, senderId: myId, message: text })
    setMiniChatInput('')
  }

  const triggerReaction = (emoji: string) => {
    setFloatingEmojis((prev) => [...prev, { id: Date.now() + Math.random(), emoji, x: 10 + Math.random() * 80 }])
    if (socket) {
      socket.emit('game-reaction', { conversationId, emoji })
    }
  }

  const handleGameEventReaction = (messageId: string, emoji: string) => {
    if (!socket || !myId) return
    socket.emit('message:toggleReaction', { messageId, emoji })
    setActiveGameReactionPicker(null)
  }

  // Casual games action handlers
  const handleWyrSelect = (choice: 'A' | 'B') => {
    setWyrSelection(choice)
    syncGameState({ gameType: 'would-you-rather', selection: choice, index: wyrIndex })
  }

  const handleNextWyr = () => {
    const nextIdx = (wyrIndex + 1) % WOULD_YOU_RATHER_QUESTIONS.length
    setWyrIndex(nextIdx)
    setWyrSelection(null)
    setOpponentWyrSelection(null)
    syncGameState({ gameType: 'would-you-rather', index: nextIdx, selection: null })
  }

  const drawTod = (type: 'truth' | 'dare') => {
    const cards = TRUTH_OR_DARE_CARDS[type]
    const randomCard = cards[Math.floor(Math.random() * cards.length)]
    setTodType(type)
    setTodPrompt(randomCard)
    syncGameState({ gameType: 'truth-or-dare', todType: type, todPrompt: randomCard })
  }

  const checkWinner = (b: (string | null)[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ]
    for (let i = 0; i < lines.length; i++) {
      const [a, bIdx, c] = lines[i]
      if (b[a] && b[a] === b[bIdx] && b[a] === b[c]) {
        return b[a]
      }
    }
    return null
  }

  const handleCellClick = (index: number) => {
    if (!isMyTurn || board[index] !== null || checkWinner(board)) return
    const newBoard = [...board]
    newBoard[index] = mySymbol
    setBoard(newBoard)
    setIsMyTurn(false)
    syncGameState({ gameType: 'tic-tac-toe', board: newBoard })

    const winner = checkWinner(newBoard)
    if (winner) {
      setScore((prev) => ({ ...prev, self: prev.self + 1 }))
    }
  }

  const resetTicTacToe = () => {
    const emptyBoard = Array(9).fill(null)
    setBoard(emptyBoard)
    setIsMyTurn(true)
    syncGameState({ gameType: 'tic-tac-toe', board: emptyBoard })
  }

  // Chess handlers
  const resetChess = () => {
    chessInstanceRef.current.reset()
    setChessFen(chessInstanceRef.current.fen())
    setSelectedChessSlot(null)
    setMoveFrom(null)
    setOptionSquares({})
    setPendingPromotion(null)
    setPreviewFen(null)
    setDrawOfferReceived(false)
    setGameResult(null)
  }

  const executeChessMove = (from: string, to: string, promotion?: string) => {
    if (!isMyChessTurn || isSpectator || !!previewFen || !!gameResult) return false
    try {
      const move = chessInstanceRef.current.move({ from, to, promotion: promotion || 'q' })
      if (move) {
        setChessFen(chessInstanceRef.current.fen())
        setPendingPromotion(null)
        setMoveFrom(null)
        setOptionSquares({})
        if (socket) {
          socket.emit('chess:proposeMove', { conversationId, from, to, promotion })
        }
        return true
      }
    } catch (err) {
      console.warn('Invalid chess move:', err)
    }
    return false
  }

  const getMoveOptions = (square: Square) => {
    const moves = chessInstanceRef.current.moves({ square, verbose: true })
    if (moves.length === 0) {
      setOptionSquares({})
      return false
    }

    const newSquares: Record<string, { background: string; borderRadius?: string }> = {}
    moves.forEach((move) => {
      newSquares[move.to] = {
        background: chessInstanceRef.current.get(move.to as Square) ? 'rgba(239, 68, 68, 0.4)' : 'radial-gradient(circle, rgba(99,102,241,0.8) 25%, transparent 25%)',
        borderRadius: '50%',
      }
    })
    newSquares[square] = { background: 'rgba(245, 158, 11, 0.4)' }
    setOptionSquares(newSquares)
    return true
  }

  const handleSquareClick = (square: Square) => {
    if (!isMyChessTurn || isSpectator || !!previewFen || !!gameResult) return
    if (!moveFrom) {
      const hasMoves = getMoveOptions(square)
      if (hasMoves) setMoveFrom(square)
    } else {
      const moves = chessInstanceRef.current.moves({ square: moveFrom as Square, verbose: true })
      const foundMove = moves.find((m) => m.to === square)

      if (!foundMove) {
        const hasMoves = getMoveOptions(square)
        setMoveFrom(hasMoves ? square : null)
      } else {
        if (foundMove.promotion) {
          setPendingPromotion({ from: moveFrom, to: square })
        } else {
          executeChessMove(moveFrom, square)
        }
      }
    }
  }

  const handlePieceClick = (_piece: string, square: Square) => {
    handleSquareClick(square)
  }

  const handleChessPieceDrop = (sourceSquare: Square, targetSquare: Square) => {
    if (!isMyChessTurn || isSpectator || !!previewFen || !!gameResult) return false
    const moves = chessInstanceRef.current.moves({ square: sourceSquare, verbose: true })
    const foundMove = moves.find((m) => m.to === targetSquare)

    if (foundMove && foundMove.promotion) {
      setPendingPromotion({ from: sourceSquare, to: targetSquare })
      return false
    }
    return executeChessMove(sourceSquare, targetSquare)
  }

  const proposeDraw = () => {
    if (socket) socket.emit('game:proposeDraw', { conversationId })
  }

  const acceptDraw = () => {
    if (socket) socket.emit('game:acceptDraw', { conversationId })
    setDrawOfferReceived(false)
  }

  const declineDraw = () => {
    if (socket) socket.emit('game:declineDraw', { conversationId })
    setDrawOfferReceived(false)
  }

  const resignGame = () => {
    if (socket) socket.emit('game:resign', { conversationId })
  }

  const handleExitGame = () => {
    if (activeGame === 'selection') {
      onClose()
    } else {
      setActiveGame('selection')
      setGameResult(null)
      syncGameState({ gameType: 'select-game', activeGame: 'selection' })
    }
  }

  const handleLudoRematch = () => {
    selectGame(activeGame)
    setGameResult(null)
  }

  // Chess Puzzle handlers
  const startPuzzle = (idx: number) => {
    const puzzle = CHESS_PUZZLES[idx]
    if (!puzzle) return
    setCurrentPuzzleIdx(idx)
    setPuzzleStatus('playing')
    setPuzzleHint(null)
    chessInstanceRef.current.load(puzzle.fen)
    setChessFen(puzzle.fen)
  }

  const handlePuzzlePieceDrop = (sourceSquare: Square, targetSquare: Square) => {
    if (puzzleStatus !== 'playing') return false
    const puzzle = CHESS_PUZZLES[currentPuzzleIdx]
    const isCorrect = sourceSquare === puzzle.solution.from && targetSquare === puzzle.solution.to

    if (isCorrect) {
      try {
        chessInstanceRef.current.move({ from: sourceSquare, to: targetSquare, promotion: 'q' })
        setChessFen(chessInstanceRef.current.fen())
        setPuzzleStatus('solved')
        playSoundCue('end')
        return true
      } catch (err) {
        console.warn('Invalid puzzle move:', err)
      }
    } else {
      setPuzzleStatus('failed')
      playSoundCue('check')
      return false
    }
    return false
  }

  // Player clock computations
  const opponentUserId = opponentId
  const topUserClock = clocks[opponentUserId]
  const bottomUserClock = clocks[myId]
  const isTopUserTurn = currentTurnUserId === opponentUserId
  const isBottomUserTurn = currentTurnUserId === myId
  const topRemainingMs = topUserClock ? topUserClock.remainingMs : 0
  const bottomRemainingMs = bottomUserClock ? bottomUserClock.remainingMs : 0

  const capturedData = getCapturedPieces(previewFen || chessFen)
  const topCaptured = myChessColor === 'w' ? capturedData.capturedByBlack : capturedData.capturedByWhite
  const bottomCaptured = myChessColor === 'w' ? capturedData.capturedByWhite : capturedData.capturedByBlack
  const topAdvantage = myChessColor === 'w' ? capturedData.blackAdvantage : capturedData.whiteAdvantage
  const bottomAdvantage = myChessColor === 'w' ? capturedData.whiteAdvantage : capturedData.blackAdvantage

  const getCustomSquareStyles = (currentOptions: Record<string, { background: string; borderRadius?: string }>) => {
    const styles: Record<string, { background: string; borderRadius?: string }> = { ...currentOptions }
    if (chessInstanceRef.current && chessInstanceRef.current.inCheck()) {
      const boardPart = chessInstanceRef.current.fen().split(' ')[0]
      const rows = boardPart.split('/')
      for (let r = 0; r < 8; r++) {
        let col = 0
        for (let c = 0; c < rows[r].length; c++) {
          const char = rows[r][c]
          if (!isNaN(parseInt(char))) {
            col += parseInt(char)
          } else {
            if ((chessInstanceRef.current.turn() === 'w' && char === 'K') || (chessInstanceRef.current.turn() === 'b' && char === 'k')) {
              const file = String.fromCharCode(97 + col)
              const rank = 8 - r
              styles[`${file}${rank}`] = {
                background: 'rgba(239, 68, 68, 0.75)',
                borderRadius: '6px',
              }
            }
            col++
          }
        }
      }
    }
    return styles
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="fixed inset-4 sm:inset-10 z-[100] bg-[#0F1015]/95 border border-indigo-500/20 rounded-3xl shadow-[0_32px_128px_rgba(0,0,0,0.9)] backdrop-blur-2xl p-4 sm:p-6 flex flex-col lg:flex-row gap-4 overflow-hidden select-none text-white"
    >
      {/* Camera PiP Video Container (Top Overlay / Side Panel) */}
      {isCameraOn && (
        <div className="absolute top-4 right-4 z-40 flex items-center gap-2 bg-black/40 border border-white/10 p-1.5 rounded-2xl backdrop-blur-md shadow-xl">
          <div className="relative w-20 h-14 bg-slate-900 rounded-xl overflow-hidden border border-white/20">
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[7px] font-bold text-white bg-black/60 rounded">You</span>
          </div>

          {remoteStream && (
            <div className="relative w-20 h-14 bg-slate-900 rounded-xl overflow-hidden border border-white/20">
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[7px] font-bold text-white bg-black/60 rounded">Partner</span>
            </div>
          )}

          <button
            onClick={() => setIsCameraOn(false)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-xs"
            title="Turn Camera Off"
          >
            <FiVideoOff />
          </button>
        </div>
      )}

      {/* Main Game Dashboard Area */}
      <div className="flex-1 bg-white/[0.01] border border-white/[0.05] rounded-3xl p-5 shadow-2xl backdrop-blur-xl flex flex-col overflow-y-auto custom-scrollbar relative">
        <AnimatePresence mode="wait">
          {activeGame === 'selection' && <GameSelectionMenu selectedTimeControl={selectedTimeControl} onSelectTimeControl={setSelectedTimeControl} onSelectGame={selectGame} />}

          {(activeGame === 'chess' || activeGame === 'chess-puzzle') && (
            <ChessBoardView
              activeGame={activeGame}
              selectedTimeControl={selectedTimeControl}
              soundMuted={soundMuted}
              setSoundMuted={setSoundMuted}
              onExitGame={handleExitGame}
              selectedChatData={selectedChatData}
              topCaptured={topCaptured}
              topAdvantage={topAdvantage}
              topRemainingMs={topRemainingMs}
              isTopUserTurn={isTopUserTurn}
              bottomCaptured={bottomCaptured}
              bottomAdvantage={bottomAdvantage}
              bottomRemainingMs={bottomRemainingMs}
              isBottomUserTurn={isBottomUserTurn}
              chessInstanceRef={chessInstanceRef}
              previewFen={previewFen}
              chessFen={chessFen}
              isShaking={isShaking}
              drawOfferReceived={drawOfferReceived}
              acceptDraw={acceptDraw}
              declineDraw={declineDraw}
              pendingPromotion={pendingPromotion}
              executeChessMove={executeChessMove}
              handleChessPieceDrop={handleChessPieceDrop}
              handleSquareClick={handleSquareClick}
              handlePieceClick={handlePieceClick}
              getCustomSquareStyles={getCustomSquareStyles}
              optionSquares={optionSquares}
              boardOrientation={boardOrientation}
              setBoardOrientation={setBoardOrientation}
              isSpectator={isSpectator}
              gameResult={gameResult}
              proposeDraw={proposeDraw}
              resignGame={resignGame}
              moveHistoryList={moveHistoryList}
              setPreviewFen={setPreviewFen}
              currentPuzzleIdx={currentPuzzleIdx}
              puzzleStatus={puzzleStatus}
              puzzleHint={puzzleHint}
              setPuzzleHint={setPuzzleHint}
              startPuzzle={startPuzzle}
              handlePuzzlePieceDrop={handlePuzzlePieceDrop}
            />
          )}

          {activeGame === 'connect-four' && (
            <ConnectFourView
              c4Grid={c4Grid}
              isMyC4Turn={isMyC4Turn}
              gameResult={gameResult}
              isSpectator={isSpectator}
              myId={myId}
              onDropDisc={handleC4Drop}
              onExitGame={handleExitGame}
            />
          )}

          {activeGame === 'sliding-puzzle' && (
            <SlidingPuzzleView
              slidingTiles={slidingTiles}
              slidingMoveCount={slidingMoveCount}
              isMySlidingTurn={isMySlidingTurn}
              gameResult={gameResult}
              isSpectator={isSpectator}
              myId={myId}
              onTileClick={handleSlidingTileClick}
              onExitGame={handleExitGame}
            />
          )}

          {(activeGame === 'would-you-rather' || activeGame === 'truth-or-dare' || activeGame === 'tic-tac-toe') && (
            <CasualGamesView
              activeGame={activeGame}
              wyrIndex={wyrIndex}
              wyrSelection={wyrSelection}
              opponentWyrSelection={opponentWyrSelection}
              onWyrSelect={handleWyrSelect}
              onNextWyr={handleNextWyr}
              todType={todType}
              todPrompt={todPrompt}
              onDrawTod={drawTod}
              onClearTod={() => setTodPrompt(null)}
              board={board}
              isMyTurn={isMyTurn}
              mySymbol={mySymbol}
              score={score}
              onCellClick={handleCellClick}
              onResetTicTacToe={resetTicTacToe}
              checkWinner={checkWinner}
              onExitGame={handleExitGame}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Game Over Modal */}
      <GameOverModal gameResult={gameResult} myId={myId} isSpectator={isSpectator} onRematch={handleLudoRematch} onExitGame={handleExitGame} />

      {/* Mini-Chat Panel & Live Reactions */}
      <GameMiniChat
        gameMessages={gameMessages}
        miniChatInput={miniChatInput}
        setMiniChatInput={setMiniChatInput}
        onSendGameMessage={handleSendGameMessage}
        floatingEmojis={floatingEmojis}
        onTriggerReaction={triggerReaction}
        gameEventReactions={gameEventReactions}
        activeGameReactionPicker={activeGameReactionPicker}
        setActiveGameReactionPicker={setActiveGameReactionPicker}
        onGameEventReaction={handleGameEventReaction}
        myId={myId}
        chatEndRef={chatEndRef}
      />
    </motion.div>
  )
}

export default GameRoom
