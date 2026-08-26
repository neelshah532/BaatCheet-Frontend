import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiVideo, FiVideoOff, FiX, FiMessageSquare, FiGrid, FiMinimize2, FiMaximize2 } from 'react-icons/fi'
import { useAppStore } from '../../../store/store'
import { useSocket } from '../../../hook/socketContext'
import SimplePeer from 'simple-peer'
import { Chess, Square } from 'chess.js'
import { toast } from 'sonner'

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

const normalizeId = (id: unknown): string => {
  if (!id) return ''
  if (typeof id === 'object' && id !== null) {
    return ((id as { _id?: string; id?: string })._id || (id as { id?: string }).id || '').toString()
  }
  return String(id)
}

const GameRoom = ({ onClose }: GameRoomProps) => {
  const socket = useSocket()
  const { selectedChatData, userInfo } = useAppStore()
  const myId = normalizeId(userInfo?.id || (userInfo as { _id?: string })?._id)
  const opponentId = normalizeId(typeof selectedChatData === 'object' ? selectedChatData?._id || (selectedChatData as { id?: string })?.id : selectedChatData)
  const conversationId = [myId, opponentId].sort().join('-')
  const partnerName = typeof selectedChatData === 'object' && selectedChatData?.firstName ? `${selectedChatData.firstName} ${selectedChatData.lastName || ''}`.trim() : 'Partner'
  const myInitial = userInfo?.firstName ? userInfo.firstName[0].toUpperCase() : 'Y'
  const partnerInitial = typeof selectedChatData === 'object' && selectedChatData?.firstName ? selectedChatData.firstName[0].toUpperCase() : 'P'

  // Responsive mobile tab
  const [mobileTab, setMobileTab] = useState<'game' | 'chat'>('game')

  // Socket room join & listen for mutual room reset/close
  useEffect(() => {
    if (!socket || !conversationId) return

    socket.emit('game:join-room', { conversationId })
    const handleConnect = () => {
      socket.emit('game:join-room', { conversationId })
    }

    const handleGameRoomClosed = (data: { closedBy: string; conversationId: string }) => {
      if (data.conversationId === conversationId) {
        toast.info('Game room was closed by partner.')
        onClose()
      }
    }

    socket.on('connect', handleConnect)
    socket.on('game:room-closed', handleGameRoomClosed)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('game:room-closed', handleGameRoomClosed)
    }
  }, [socket, conversationId, onClose])

  // Clean exit handler that notifies partner and resets the room for both users
  const handleCloseGameRoom = () => {
    if (socket && conversationId) {
      socket.emit('game:close-room', { conversationId })
    }
    onClose()
  }

  // Camera & WebRTC streams states
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isVideoFloatingOpen, setIsVideoFloatingOpen] = useState(true)
  const [isVideoMinimized, setIsVideoMinimized] = useState(false)
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
  const isMyChessTurn = currentTurnUserId ? normalizeId(currentTurnUserId) === myId : chessInstanceRef.current.turn() === myChessColor

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
  const isMyC4Turn = normalizeId(c4ActiveTurn) === myId

  // 6. Sliding Tile Puzzle Game States
  const [slidingTiles, setSlidingTiles] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0])
  const [slidingMoveCount, setSlidingMoveCount] = useState<number>(0)
  const [slidingActiveTurn, setSlidingActiveTurn] = useState<string>('')
  const isMySlidingTurn = normalizeId(slidingActiveTurn) === myId

  // Chat notification toast, quick-reply & unread states
  const [latestChatNotification, setLatestChatNotification] = useState<{ senderName: string; text: string; id: string } | null>(null)
  const [isReplyingInToast, setIsReplyingInToast] = useState(false)
  const [toastReplyText, setToastReplyText] = useState('')
  const chatNotifTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [lastReadMessageCount, setLastReadMessageCount] = useState(0)

  // Mini Chat & Floating Emojis states
  const [gameMessages, setGameMessages] = useState<ChatMessage[]>([])
  const [miniChatInput, setMiniChatInput] = useState('')
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Synchronize board orientation with server assigned player color
  useEffect(() => {
    if (serverPlayerColor) {
      setBoardOrientation(serverPlayerColor === 'w' ? 'white' : 'black')
    } else if (myId && opponentId) {
      setBoardOrientation(myId < opponentId ? 'white' : 'black')
    }
  }, [serverPlayerColor, myId, opponentId])

  // Live timer interval
  useEffect(() => {
    if (!currentTurnUserId || !clocks[currentTurnUserId]) return

    const interval = setInterval(() => {
      setClocks((prev) => {
        const activeClock = prev[currentTurnUserId]
        if (!activeClock || activeClock.remainingMs <= 0) return prev
        return {
          ...prev,
          [currentTurnUserId]: {
            ...activeClock,
            remainingMs: Math.max(0, activeClock.remainingMs - 100),
          },
        }
      })
    }, 100)

    return () => clearInterval(interval)
  }, [currentTurnUserId, clocks])

  // Media streams setup for in-game video
  useEffect(() => {
    let streamInstance: MediaStream | null = null

    if (!isCameraOn) {
      setLocalStream((prevStream) => {
        if (prevStream) {
          prevStream.getTracks().forEach((t) => t.stop())
        }
        return null
      })
      return
    }

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        streamInstance = stream
        setLocalStream(stream)
        if (localVideoRef.current) localVideoRef.current.srcObject = stream
      })
      .catch((err) => {
        console.warn('Camera access denied or unavailable:', err)
      })

    return () => {
      if (streamInstance) streamInstance.getTracks().forEach((t) => t.stop())
    }
  }, [isCameraOn])

  // Keep local and remote video elements updated with streams
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  // WebRTC peer connection for 2-player video in GameRoom
  useEffect(() => {
    if (!socket || !myId || !opponentId || !localStream || !isCameraOn) return

    const isInitiator = myId > opponentId
    let peer: SimplePeer.Instance | null = null

    try {
      peer = new SimplePeer({
        initiator: isInitiator,
        trickle: false,
        stream: localStream,
      })

      peer.on('signal', (signalData) => {
        socket.emit('game-signal', { signal: signalData, opponentId, conversationId })
      })

      peer.on('stream', (stream) => {
        setRemoteStream(stream)
      })

      peer.on('error', (err) => {
        console.warn('Game WebRTC peer error:', err)
      })

      peerRef.current = peer
    } catch (err) {
      console.warn('Failed to initialize SimplePeer in GameRoom:', err)
    }

    const handleGameSignal = (data: { signal: SimplePeer.SignalData; from: string }) => {
      const fromId = normalizeId(data.from)
      if (fromId === opponentId && peerRef.current) {
        try {
          peerRef.current.signal(data.signal)
        } catch (err) {
          console.warn('Error handling game signal:', err)
        }
      }
    }

    socket.on('game-signal-received', handleGameSignal)

    return () => {
      socket.off('game-signal-received', handleGameSignal)
      if (peer) {
        peer.destroy()
        peerRef.current = null
      }
    }
  }, [socket, myId, opponentId, localStream, isCameraOn, conversationId])

  // Socket state & real-time sync listeners
  useEffect(() => {
    if (!socket) return

    const handleGameState = (data: { gameState: GameStateSync; senderId: string }) => {
      const { gameState, senderId } = data
      if (normalizeId(senderId) === myId) return

      if (gameState.gameType === 'select-game') {
        setActiveGame(gameState.activeGame)
        setGameResult(null)
      } else if (gameState.gameType === 'wyr-sync') {
        if (gameState.index !== undefined) setWyrIndex(gameState.index)
        if (gameState.selection !== undefined) setOpponentWyrSelection(gameState.selection)
      } else if (gameState.gameType === 'tod-sync') {
        if (gameState.type !== undefined) setTodType(gameState.type)
        if (gameState.prompt !== undefined) setTodPrompt(gameState.prompt)
      } else if (gameState.gameType === 'ttt-sync') {
        if (gameState.board !== undefined) setBoard(gameState.board)
        if (gameState.isMyTurn !== undefined) setIsMyTurn(!gameState.isMyTurn)
        if (gameState.score !== undefined) setScore(gameState.score)
      } else if (gameState.gameType === 'chess-draw-offer') {
        setDrawOfferReceived(true)
      } else if (gameState.gameType === 'chess-draw-accept') {
        setGameResult({ winnerId: null, reason: 'Agreement' })
        playSoundCue('end')
      } else if (gameState.gameType === 'chess-resign') {
        setGameResult({ winnerId: myId, reason: 'Resignation' })
        playSoundCue('end')
      } else if (gameState.gameType === 'connect-four-sync') {
        if (gameState.grid) setC4Grid(gameState.grid)
        if (gameState.currentTurn) setC4ActiveTurn(gameState.currentTurn)
        if (gameState.result) setGameResult(gameState.result)
      } else if (gameState.gameType === 'sliding-puzzle-sync') {
        if (gameState.tiles) setSlidingTiles(gameState.tiles)
        if (gameState.moveCount !== undefined) setSlidingMoveCount(gameState.moveCount)
        if (gameState.currentTurn) setSlidingActiveTurn(gameState.currentTurn)
        if (gameState.result) setGameResult(gameState.result)
      }
    }

    const handleSessionCreated = (session: GameSessionState) => {
      setGameSessionPlayers(session.players.map((p) => normalizeId(p.userId)))
      const me = session.players.find((p) => normalizeId(p.userId) === myId)
      if (me) setServerPlayerColor(me.color)

      if (session.currentTurn) setCurrentTurnUserId(normalizeId(session.currentTurn))
      if (session.clocks) setClocks(session.clocks)

      if (session.gameType === 'chess') {
        setActiveGame('chess')
        if (session.state?.fen) {
          chessInstanceRef.current.load(session.state.fen)
          setChessFen(session.state.fen)
        }
        if (session.moveHistory) setMoveHistoryList(session.moveHistory)
      } else if (session.gameType === 'connect-four') {
        setActiveGame('connect-four')
        if (session.state?.grid) setC4Grid(session.state.grid)
        if (session.currentTurn) setC4ActiveTurn(normalizeId(session.currentTurn))
      } else if (session.gameType === 'sliding-puzzle') {
        setActiveGame('sliding-puzzle')
        if (session.state?.tiles) setSlidingTiles(session.state.tiles)
        if (session.state?.moveCount) setSlidingMoveCount(session.state.moveCount)
        if (session.currentTurn) setSlidingActiveTurn(normalizeId(session.currentTurn))
      }
      setGameResult(null)
    }

    const handleChessMoveAccepted = (data: {
      fen?: string
      state?: { fen?: string }
      action?: string
      playerId?: string
      resultingState?: string
      currentTurn?: string
      clocks?: Record<string, { remainingMs: number; lastMoveTimestamp: Date | string | null }>
      moveHistory?: { playerId: string; action: string; resultingState: string }[]
    }) => {
      const fen = data.state?.fen || data.fen || data.resultingState
      if (fen) {
        try {
          chessInstanceRef.current.load(fen)
          setChessFen(fen)
        } catch (err) {
          console.warn('Failed to load FEN into chess instance:', err)
        }
      }
      if (data.currentTurn) {
        setCurrentTurnUserId(normalizeId(data.currentTurn))
      }
      if (data.clocks) setClocks(data.clocks)
      if (data.moveHistory) setMoveHistoryList(data.moveHistory)
      setPreviewFen(null)

      const lastMovePlayerId = data.playerId || (data.moveHistory && data.moveHistory[data.moveHistory.length - 1]?.playerId)
      if (lastMovePlayerId && normalizeId(lastMovePlayerId) === myId) {
        playSoundCue('move')
      } else {
        playSoundCue('notify')
      }
    }

    const handleChessMoveRejected = (data: { reason: string }) => {
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
      console.warn('Move rejected:', data.reason)
    }

    const handleGameEnded = (data: { winnerId: string | null; reason: string; session: GameSessionState }) => {
      setGameResult({ winnerId: data.winnerId ? normalizeId(data.winnerId) : null, reason: data.reason })
      playSoundCue('end')
    }

    const handleGameChatReceived = (data: { senderId: string; message: string; messageId?: string; msgId?: string }) => {
      if (normalizeId(data.senderId) === myId) return
      const id = data.msgId || data.messageId || `${data.senderId}-${Date.now()}-${Math.random()}`
      setGameMessages((prev) => {
        // Prevent duplicate messages with identical ID or identical text within 2 seconds
        if (prev.some((m) => m.id === id || (m.text === data.message && normalizeId(m.senderId) === normalizeId(data.senderId) && m.id.startsWith(`${data.senderId}-`)))) {
          return prev
        }
        return [
          ...prev,
          {
            id,
            senderId: data.senderId,
            text: data.message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            eventMessageId: data.messageId,
          },
        ]
      })

      // Non-intrusive floating toast preview when player is focusing on the game board
      if (chatNotifTimeoutRef.current) clearTimeout(chatNotifTimeoutRef.current)
      setLatestChatNotification({ senderName: partnerName, text: data.message, id: String(Date.now()) })
      chatNotifTimeoutRef.current = setTimeout(() => {
        setLatestChatNotification(null)
      }, 4000)
    }

    const handleGameReactionReceived = (data: { emoji: string; senderId?: string; reactionId?: string }) => {
      if (data.senderId && normalizeId(data.senderId) === myId) return
      const id = data.reactionId || `${data.senderId || 'peer'}-${Date.now()}-${Math.random()}`
      setFloatingEmojis((prev) => {
        if (prev.some((item) => String(item.id) === String(id))) return prev
        return [...prev, { id: Number(id) || Date.now() + Math.random(), emoji: data.emoji, x: 20 + Math.random() * 60 }]
      })
      setTimeout(() => {
        setFloatingEmojis((prev) => prev.filter((item) => String(item.id) !== String(id)))
      }, 2500)
    }

    const handleReactionToggled = (data: { messageId: string; reactions: { userId: string; emoji: string }[] }) => {
      setGameEventReactions((prev) => ({
        ...prev,
        [data.messageId]: data.reactions,
      }))
    }

    socket.on('game-state-updated', handleGameState)
    socket.on('game:session-created', handleSessionCreated)
    socket.on('chess:moveAccepted', handleChessMoveAccepted)
    socket.on('chess:moveRejected', handleChessMoveRejected)
    socket.on('game:ended', handleGameEnded)
    socket.on('game-chat-received', handleGameChatReceived)
    socket.on('game-reaction-received', handleGameReactionReceived)
    socket.on('message:reactionToggled', handleReactionToggled)

    return () => {
      socket.off('game-state-updated', handleGameState)
      socket.off('game:session-created', handleSessionCreated)
      socket.off('chess:moveAccepted', handleChessMoveAccepted)
      socket.off('chess:moveRejected', handleChessMoveRejected)
      socket.off('game:ended', handleGameEnded)
      socket.off('game-chat-received', handleGameChatReceived)
      socket.off('game-reaction-received', handleGameReactionReceived)
      socket.off('message:reactionToggled', handleReactionToggled)
    }
  }, [socket, myId, myChessColor, partnerName])

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [gameMessages])

  const syncGameState = (payload: GameStateSync) => {
    if (socket) {
      socket.emit('game-state-sync', {
        conversationId,
        opponentId,
        gameState: payload,
      })
    }
  }

  // Mini-Chat & Reaction triggers
  const handleSendGameMessage = () => {
    if (!miniChatInput.trim() || !socket) return
    const text = miniChatInput.trim()
    const msgId = `${myId}-${Date.now()}`
    setGameMessages((prev) => [
      ...prev,
      {
        id: msgId,
        senderId: myId || 'self',
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    socket.emit('game-chat-message', { conversationId, senderId: myId, message: text, msgId })
    setMiniChatInput('')
  }

  const handleSendToastReply = () => {
    if (!toastReplyText.trim() || !socket) return
    const text = toastReplyText.trim()
    const msgId = `${myId}-${Date.now()}`
    setGameMessages((prev) => [
      ...prev,
      {
        id: msgId,
        senderId: myId || 'self',
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    socket.emit('game-chat-message', { conversationId, senderId: myId, message: text, msgId })
    playSoundCue('move')
    setToastReplyText('')
    setIsReplyingInToast(false)
    setLatestChatNotification(null)
  }

  const triggerReaction = (emoji: string) => {
    const reactionId = `${myId}-${Date.now()}`
    setFloatingEmojis((prev) => [...prev, { id: Date.now() + Math.random(), emoji, x: 15 + Math.random() * 70 }])
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => String(item.id) !== reactionId))
    }, 2500)
    if (socket) {
      socket.emit('game-reaction', { conversationId, opponentId, emoji, senderId: myId, reactionId })
    }
  }

  const handleGameEventReaction = (messageId: string, emoji: string) => {
    if (!socket || !myId) return
    socket.emit('message:toggleReaction', { messageId, emoji })
    setActiveGameReactionPicker(null)
  }

  // 1. "Would You Rather" Logic
  const handleWyrSelect = (option: 'A' | 'B') => {
    setWyrSelection(option)
    syncGameState({ gameType: 'wyr-sync', index: wyrIndex, selection: option })
  }

  const handleNextWyr = () => {
    const nextIdx = (wyrIndex + 1) % WOULD_YOU_RATHER_QUESTIONS.length
    setWyrIndex(nextIdx)
    setWyrSelection(null)
    setOpponentWyrSelection(null)
    syncGameState({ gameType: 'wyr-sync', index: nextIdx, selection: null })
  }

  // 2. "Truth or Dare" Logic
  const drawTod = (type: 'truth' | 'dare') => {
    const cards = TRUTH_OR_DARE_CARDS[type]
    const randomCard = cards[Math.floor(Math.random() * cards.length)]
    setTodType(type)
    setTodPrompt(randomCard)
    syncGameState({ gameType: 'tod-sync', type, prompt: randomCard })
  }

  // 3. "Tic Tac Toe" Logic
  const handleCellClick = (index: number) => {
    if (!isMyTurn || board[index] || checkWinner(board)) return
    const newBoard = [...board]
    newBoard[index] = mySymbol
    setBoard(newBoard)
    setIsMyTurn(false)

    const winner = checkWinner(newBoard)
    let newScore = { ...score }
    if (winner === mySymbol) {
      newScore = { ...score, self: score.self + 1 }
      setScore(newScore)
    }

    syncGameState({
      gameType: 'ttt-sync',
      board: newBoard,
      isMyTurn: false,
      score: newScore,
    })
  }

  const resetTicTacToe = () => {
    const freshBoard = Array(9).fill(null)
    setBoard(freshBoard)
    setIsMyTurn(true)
    syncGameState({
      gameType: 'ttt-sync',
      board: freshBoard,
      isMyTurn: true,
      score,
    })
  }

  const checkWinner = (squares: (string | null)[]) => {
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
    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a]
      }
    }
    return null
  }

  // 4. "Chess" & "Chess Tactics Puzzles" Logic
  const executeChessMove = (from: string, to: string, promotionPiece?: string) => {
    if (!socket) return false
    const timeSpentMs = 0
    socket.emit('chess:proposeMove', {
      conversationId,
      from,
      to,
      promotion: promotionPiece || 'q',
      move: { from, to, promotion: promotionPiece || 'q' },
      timeSpentMs,
    })
    setMoveFrom(null)
    setSelectedChessSlot(null)
    setOptionSquares({})
    setPendingPromotion(null)
    return true
  }

  const handleChessPieceDrop = (sourceSquare: Square, targetSquare: Square) => {
    if (isSpectator || previewFen || !isMyChessTurn) return false

    const piece = chessInstanceRef.current.get(sourceSquare)
    if (!piece || piece.color !== myChessColor) return false

    const isPawn = piece && piece.type === 'p'
    const isPromotion = isPawn && ((piece.color === 'w' && targetSquare[1] === '8') || (piece.color === 'b' && targetSquare[1] === '1'))

    if (isPromotion) {
      setPendingPromotion({ from: sourceSquare, to: targetSquare })
      return true
    }

    try {
      const move = chessInstanceRef.current.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      })
      if (!move) return false

      const nextFen = chessInstanceRef.current.fen()
      setChessFen(nextFen)
      playSoundCue('move')

      executeChessMove(sourceSquare, targetSquare)
      return true
    } catch {
      return false
    }
  }

  const handlePieceClick = (piece: string, square: Square) => {
    if (isSpectator || previewFen || !isMyChessTurn) return
    const pieceColor = piece[0]
    if (pieceColor !== myChessColor) return

    setMoveFrom(square)
    setSelectedChessSlot(square)

    const moves = chessInstanceRef.current.moves({ square, verbose: true })
    const newOptionSquares: Record<string, { background: string; borderRadius?: string }> = {}

    moves.forEach((move) => {
      newOptionSquares[move.to] = {
        background:
          chessInstanceRef.current.get(move.to as Square) && chessInstanceRef.current.get(move.to as Square)?.color !== pieceColor
            ? 'radial-gradient(circle, rgba(239,68,68,0.7) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(16,185,129,0.7) 25%, transparent 25%)',
        borderRadius: '50%',
      }
    })
    setOptionSquares(newOptionSquares)
  }

  const handleSquareClick = (square: Square) => {
    if (isSpectator || previewFen || !isMyChessTurn) return

    if (!moveFrom) {
      const piece = chessInstanceRef.current.get(square)
      if (piece && piece.color === myChessColor) {
        handlePieceClick(`${piece.color}${piece.type.toUpperCase()}`, square)
      }
      return
    }

    const piece = chessInstanceRef.current.get(moveFrom as Square)
    const isPawn = piece && piece.type === 'p'
    const isPromotion = isPawn && ((piece.color === 'w' && square[1] === '8') || (piece.color === 'b' && square[1] === '1'))

    if (isPromotion) {
      setPendingPromotion({ from: moveFrom, to: square })
      return
    }

    try {
      const move = chessInstanceRef.current.move({
        from: moveFrom,
        to: square,
        promotion: 'q',
      })
      if (move) {
        const nextFen = chessInstanceRef.current.fen()
        setChessFen(nextFen)
        playSoundCue('move')
        executeChessMove(moveFrom, square)
      }
    } catch (err) {
      console.warn('Invalid square click move:', err)
    }

    setMoveFrom(null)
    setSelectedChessSlot(null)
    setOptionSquares({})
  }

  const proposeDraw = () => {
    if (isSpectator || gameResult) return
    syncGameState({ gameType: 'chess-draw-offer' })
  }

  const acceptDraw = () => {
    syncGameState({ gameType: 'chess-draw-accept' })
    setGameResult({ winnerId: null, reason: 'Agreement' })
    setDrawOfferReceived(false)
    playSoundCue('end')
  }

  const declineDraw = () => {
    setDrawOfferReceived(false)
  }

  const resignGame = () => {
    if (isSpectator || gameResult) return
    syncGameState({ gameType: 'chess-resign' })
    setGameResult({ winnerId: opponentId, reason: 'Resignation' })
    playSoundCue('end')
  }

  // 5. Connect Four Handlers
  const handleC4Drop = (colIndex: number) => {
    if (!isMyC4Turn || isSpectator || !!gameResult) return
    const newGrid = c4Grid.map((row) => [...row])
    let placedRow = -1
    for (let r = 5; r >= 0; r--) {
      if (!newGrid[r][colIndex]) {
        newGrid[r][colIndex] = myId === (conversationId.split('-')[0] || '') ? 'R' : 'Y'
        placedRow = r
        break
      }
    }
    if (placedRow === -1) return

    setC4Grid(newGrid)
    const nextTurn = opponentId
    setC4ActiveTurn(nextTurn)

    const checkC4Winner = (grid: (string | null)[][]) => {
      const R = 6
      const C = 7
      for (let r = 0; r < R; r++) {
        for (let c = 0; c < C; c++) {
          const val = grid[r][c]
          if (!val) continue
          if (c + 3 < C && val === grid[r][c + 1] && val === grid[r][c + 2] && val === grid[r][c + 3]) return val
          if (r + 3 < R && val === grid[r + 1][c] && val === grid[r + 2][c] && val === grid[r + 3][c]) return val
          if (r + 3 < R && c + 3 < C && val === grid[r + 1][c + 1] && val === grid[r + 2][c + 2] && val === grid[r + 3][c + 3]) return val
          if (r - 3 >= 0 && c + 3 < C && val === grid[r - 1][c + 1] && val === grid[r - 2][c + 2] && val === grid[r - 3][c + 3]) return val
        }
      }
      return null
    }

    const winnerVal = checkC4Winner(newGrid)
    let result: { winnerId: string | null; reason: string } | null = null
    if (winnerVal) {
      result = { winnerId: myId, reason: '4 In A Row!' }
      setGameResult(result)
      playSoundCue('end')
    }

    syncGameState({
      gameType: 'connect-four-sync',
      grid: newGrid,
      currentTurn: nextTurn,
      result: result || undefined,
    })
  }

  // 6. Sliding Tile Puzzle Handlers
  const handleSlidingTileClick = (tileIndex: number) => {
    if (!isMySlidingTurn || isSpectator || !!gameResult) return
    const emptyIndex = slidingTiles.indexOf(0)
    const row = Math.floor(tileIndex / 4)
    const col = tileIndex % 4
    const emptyRow = Math.floor(emptyIndex / 4)
    const emptyCol = emptyIndex % 4

    const isAdjacent = (Math.abs(row - emptyRow) === 1 && col === emptyCol) || (Math.abs(col - emptyCol) === 1 && row === emptyRow)
    if (!isAdjacent) return

    const nextTiles = [...slidingTiles]
    nextTiles[emptyIndex] = nextTiles[tileIndex]
    nextTiles[tileIndex] = 0

    const nextMoves = slidingMoveCount + 1
    setSlidingTiles(nextTiles)
    setSlidingMoveCount(nextMoves)

    const isSolved = nextTiles.slice(0, 15).every((val, i) => val === i + 1) && nextTiles[15] === 0
    let result: { winnerId: string | null; reason: string } | null = null
    if (isSolved) {
      result = { winnerId: myId, reason: `Solved in ${nextMoves} moves!` }
      setGameResult(result)
      playSoundCue('end')
    }

    const nextTurn = opponentId
    setSlidingActiveTurn(nextTurn)

    syncGameState({
      gameType: 'sliding-puzzle-sync',
      tiles: nextTiles,
      moveCount: nextMoves,
      currentTurn: nextTurn,
      result: result || undefined,
    })
  }

  // Game Selection switch
  const selectGame = (game: typeof activeGame) => {
    setActiveGame(game)
    setGameResult(null)

    // Synchronize both players to the same game screen immediately
    syncGameState({ gameType: 'select-game', activeGame: game })

    if (game === 'chess') {
      chessInstanceRef.current = new Chess()
      setChessFen(chessInstanceRef.current.fen())
      setMoveHistoryList([])
      if (socket) {
        socket.emit('game:create-session', {
          conversationId,
          gameType: 'chess',
          timeControl: selectedTimeControl,
        })
      }
    } else if (game === 'connect-four') {
      const initGrid = Array(6)
        .fill(null)
        .map(() => Array(7).fill(null))
      setC4Grid(initGrid)
      setC4ActiveTurn(myId)
      if (socket) {
        socket.emit('game:create-session', {
          conversationId,
          gameType: 'connect-four',
        })
      }
    } else if (game === 'sliding-puzzle') {
      const shuffled = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0].sort(() => Math.random() - 0.5)
      setSlidingTiles(shuffled)
      setSlidingMoveCount(0)
      setSlidingActiveTurn(myId)
      if (socket) {
        socket.emit('game:create-session', {
          conversationId,
          gameType: 'sliding-puzzle',
        })
      }
    }
  }

  const handleExitGame = () => {
    if (activeGame === 'chess' || activeGame === 'connect-four' || activeGame === 'sliding-puzzle') {
      setActiveGame('selection')
      setGameResult(null)
      if (socket) {
        socket.emit('game:create-session', {
          conversationId,
          gameType: 'selection',
        })
      }
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
  const isBottomUserTurn = currentTurnUserId ? normalizeId(currentTurnUserId) === myId : chessInstanceRef.current.turn() === myChessColor
  const isTopUserTurn = !isBottomUserTurn
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

  const handleSwitchToChat = () => {
    setMobileTab('chat')
    setLastReadMessageCount(gameMessages.length)
    setLatestChatNotification(null)
  }

  const unreadCount = mobileTab === 'chat' ? 0 : Math.max(0, gameMessages.length - lastReadMessageCount)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 sm:inset-3 md:inset-5 z-[100] bg-[#0A0B10]/98 border border-white/10 rounded-none sm:rounded-3xl shadow-[0_32px_128px_rgba(0,0,0,0.95)] backdrop-blur-3xl p-2.5 sm:p-4 md:p-5 flex flex-col overflow-hidden select-none text-white relative"
    >
      {/* 2026 Dynamic Island / Quick-Reply Floating Capsule */}
      <AnimatePresence>
        {latestChatNotification && mobileTab === 'game' && (
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -25, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-[#0D0E15]/95 border border-indigo-500/40 shadow-[0_16px_48px_rgba(0,0,0,0.9)] backdrop-blur-2xl rounded-2xl p-2.5 max-w-[92%] sm:max-w-md w-full text-white"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {partnerInitial}
              </div>
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setIsReplyingInToast(!isReplyingInToast)}>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-bold text-indigo-300 truncate">{latestChatNotification.senderName}</span>
                  <span className="text-[9px] text-slate-400 font-medium">💬 {isReplyingInToast ? 'Close Reply' : 'Quick Reply'}</span>
                </div>
                <p className="text-xs text-white truncate font-normal">{latestChatNotification.text}</p>
              </div>
              <button
                onClick={() => {
                  setLatestChatNotification(null)
                  setIsReplyingInToast(false)
                }}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <FiX className="text-xs" />
              </button>
            </div>

            {/* Direct Quick-Reply Input Area */}
            {isReplyingInToast && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 pt-2 border-t border-white/10 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Type quick reply..."
                    value={toastReplyText}
                    onChange={(e) => setToastReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendToastReply()
                    }}
                    className="flex-1 bg-white/5 border border-white/15 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
                  />
                  <button
                    onClick={handleSendToastReply}
                    className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer active:scale-95 flex items-center gap-1"
                  >
                    Send
                  </button>
                </div>
                {/* Quick Emoji Taps */}
                <div className="flex items-center justify-between px-1">
                  {['❤️', '😂', '🔥', '👍', '🎉', '😮'].map((em) => (
                    <button
                      key={em}
                      onClick={() => {
                        triggerReaction(em)
                        setLatestChatNotification(null)
                        setIsReplyingInToast(false)
                      }}
                      className="hover:scale-125 transition-transform text-sm cursor-pointer p-0.5"
                    >
                      {em}
                    </button>
                  ))}
                  <button onClick={handleSwitchToChat} className="text-[10px] text-indigo-400 hover:underline font-semibold cursor-pointer">
                    Open Full Chat ➔
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-2 sm:px-3 py-2 border-b border-white/[0.08] mb-3 gap-2 flex-shrink-0">
        {/* Left: Room & Opponent Info */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-slate-300">
            <FiGrid className="text-sm" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-semibold text-white tracking-tight">Arena</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <span className="text-[11px] text-slate-400 block -mt-0.5">{partnerName}</span>
          </div>
        </div>

        {/* Center: Mobile Segmented Switcher (Visible on < lg) */}
        <div className="flex lg:hidden items-center bg-white/[0.04] p-0.5 rounded-xl border border-white/[0.08] text-xs">
          <button
            onClick={() => setMobileTab('game')}
            className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer relative ${
              mobileTab === 'game' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FiGrid className="text-xs" /> Board
            {isBottomUserTurn && mobileTab === 'chat' && activeGame !== 'selection' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
          </button>
          <button
            onClick={handleSwitchToChat}
            className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer relative ${
              mobileTab === 'chat' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FiMessageSquare className="text-xs" /> Chat
            {unreadCount > 0 && <span className="text-[9px] bg-indigo-500 text-white px-1.5 py-0.2 rounded-full font-mono font-medium">{unreadCount}</span>}
          </button>
        </div>

        {/* Right: Video Controls + Exit Button */}
        <div className="flex items-center gap-2">
          {/* Toggle Video Floating Widget */}
          <button
            onClick={() => setIsVideoFloatingOpen(!isVideoFloatingOpen)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              isVideoFloatingOpen ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' : 'bg-white/5 text-slate-400 hover:text-white border-white/10'
            }`}
            title="Toggle Floating Video Call"
          >
            {isVideoFloatingOpen ? <FiVideo className="text-sm" /> : <FiVideoOff className="text-sm" />}
            <span className="hidden sm:inline">{isVideoFloatingOpen ? 'Video' : 'No Video'}</span>
          </button>

          {/* Clean Close Room Button */}
          <button
            onClick={handleCloseGameRoom}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all flex items-center gap-1 text-xs font-medium cursor-pointer active:scale-95"
            title="Close Game Room"
          >
            <FiX className="text-sm" />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </div>

      {/* Freely Draggable Floating 2-User Video Stream Widget (PiP) */}
      <AnimatePresence>
        {isVideoFloatingOpen && (
          <motion.div
            drag
            dragMomentum={false}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute top-16 right-4 z-40 bg-slate-950/90 border border-white/15 p-2 rounded-2xl shadow-2xl backdrop-blur-2xl flex flex-col gap-1.5 cursor-grab active:cursor-grabbing select-none touch-none ${
              isVideoMinimized ? 'w-auto' : 'w-auto'
            }`}
          >
            <div className="flex items-center justify-between px-1 pb-1 border-b border-white/10 gap-3">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live PiP
                <span className="text-[8px] text-slate-500 font-normal">⠿ Move</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsCameraOn(!isCameraOn)}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 text-xs transition-colors cursor-pointer"
                  title={isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
                >
                  {isCameraOn ? <FiVideo className="text-[10px]" /> : <FiVideoOff className="text-[10px] text-rose-400" />}
                </button>
                <button
                  onClick={() => setIsVideoMinimized(!isVideoMinimized)}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 text-xs transition-colors cursor-pointer"
                  title={isVideoMinimized ? 'Expand Videos' : 'Minimize'}
                >
                  {isVideoMinimized ? <FiMaximize2 className="text-[10px]" /> : <FiMinimize2 className="text-[10px]" />}
                </button>
              </div>
            </div>

            {!isVideoMinimized && (
              <div className="flex items-center gap-2">
                {/* You Stream Tile */}
                <div className="relative w-24 sm:w-28 h-16 sm:h-20 bg-slate-900 rounded-xl overflow-hidden border border-white/15 shadow-inner flex items-center justify-center">
                  {isCameraOn && localStream ? (
                    <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md">{myInitial}</div>
                  )}
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.2 text-[8px] font-bold text-white bg-black/70 rounded backdrop-blur-sm">You</span>
                </div>

                {/* Partner Stream Tile */}
                <div className="relative w-24 sm:w-28 h-16 sm:h-20 bg-slate-900 rounded-xl overflow-hidden border border-white/15 shadow-inner flex items-center justify-center">
                  {remoteStream ? (
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-md animate-pulse">
                        {partnerInitial}
                      </div>
                      <span className="text-[8px] text-slate-400 mt-1 font-medium">Connecting...</span>
                    </div>
                  )}
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.2 text-[8px] font-bold text-white bg-black/70 rounded backdrop-blur-sm truncate max-w-[70px]">
                    {partnerName.split(' ')[0]}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area: Responsive Split or Tab View */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3.5 overflow-hidden relative">
        {/* Game Dashboard Container */}
        <div
          className={`flex-1 bg-white/[0.02] border border-white/[0.08] rounded-3xl p-3.5 sm:p-5 shadow-2xl backdrop-blur-2xl flex flex-col overflow-y-auto custom-scrollbar relative ${
            mobileTab === 'game' ? 'flex' : 'hidden lg:flex'
          }`}
        >
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
        <div className={`h-full flex-col min-h-0 ${mobileTab === 'chat' ? 'flex flex-1' : 'hidden lg:flex'}`}>
          {/* Turn Arrival Alert Strip when user is inside Chat tab */}
          <AnimatePresence>
            {isBottomUserTurn && mobileTab === 'chat' && activeGame !== 'selection' && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                onClick={() => setMobileTab('game')}
                className="mb-2 py-1.5 px-3 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center justify-between gap-2 cursor-pointer hover:bg-emerald-500/20 transition-all shadow-sm flex-shrink-0"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="truncate text-[11px] text-slate-200">Your turn</span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 flex-shrink-0">View Board ➔</span>
              </motion.div>
            )}
          </AnimatePresence>

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
        </div>
      </div>
    </motion.div>
  )
}

export default GameRoom
