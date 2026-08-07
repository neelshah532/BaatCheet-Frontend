import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiVideo, FiVideoOff, FiActivity, FiArrowRight, FiRotateCcw, FiSmile, FiSend, FiAward, FiHelpCircle, FiFlag, FiLayers } from 'react-icons/fi'
import { useAppStore } from '../../../store/store'
import { useSocket } from '../../../hook/socketContext'
import SimplePeer from 'simple-peer'
import { colors } from '../../../constants/color'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { JigsawPuzzle } from 'react-jigsaw-puzzle'
import 'react-jigsaw-puzzle/lib/jigsaw-puzzle.css'

interface GameRoomProps {
  onClose: () => void
}

interface GameStateSync {
  gameType: string
  index?: number
  selection?: 'A' | 'B' | null
  todType?: 'truth' | 'dare' | null
  todPrompt?: string | null
  board?: (string | null)[]
  isMyTurn?: boolean
  mySymbol?: 'X' | 'O'
  fen?: string
  puzzleId?: number
  puzzleSolved?: boolean
}

interface Player {
  userId: string
  color: string
  connectionStatus: 'connected' | 'disconnected'
}

interface LudoToken {
  userId: string
  color: 'red' | 'green'
  tokenIndex: number
  position: number // -1 = base, 0 = start, 57 = home goal
}

interface JigsawPiece {
  pieceIndex: number
  row: number
  col: number
  x: number
  y: number
  placed: boolean
}

interface GameSessionState {
  _id: string
  gameType: string
  conversationId: string
  players: Player[]
  status: 'waiting' | 'active' | 'paused' | 'completed' | 'abandoned'
  currentTurn: string
  state: {
    fen?: string
    tokens?: LudoToken[]
    currentRoll?: number
    consecutiveSixes?: number
    rollState?: 'idle' | 'rolled'
    imageUrl?: string
    rows?: number
    cols?: number
    horizontalEdges?: number[][]
    verticalEdges?: number[][]
    puzzleState?: Record<string, JigsawPiece[]>
  }
  result?: {
    winnerId: string | null
    reason: string
  }
}

interface ChatMessage {
  id: string
  senderId: string
  text: string
  time: string
  eventMessageId?: string // set for game_event messages that have a DB _id so reactions can be attached
}

interface FloatingEmoji {
  id: number
  emoji: string
  x: number
}

const WOULD_YOU_RATHER_QUESTIONS = [
  {
    q: 'Would you rather have to speak in rhymes for the rest of the day OR only communicate in sign language?',
    a: 'Speak in rhymes',
    b: 'Use sign language',
  },
  {
    q: 'Would you rather live in a futuristic luxury smart home OR in a quiet, cozy cabin in the deep wilderness?',
    a: 'Futuristic smart home',
    b: 'Cozy cabin in wilderness',
  },
  {
    q: 'Would you rather only be able to see each other once a year for a month OR see each other every weekend for only 2 hours?',
    a: 'Once a year for a month',
    b: 'Every weekend for 2 hours',
  },
  {
    q: "Would you rather have a direct portal to each other's living rooms OR get 1 million dollars but you can't see each other for 2 years?",
    a: 'Direct portal',
    b: '1 Million Dollars',
  },
  {
    q: 'Would you rather share all of your thoughts in real-time OR never be able to talk about your feelings?',
    a: 'Share all thoughts',
    b: 'Never talk about feelings',
  },
]

const TRUTH_OR_DARE_CARDS = {
  truth: [
    'What is the first thing you noticed about me when we met?',
    'If you could change one thing about our daily communication, what would it be?',
    'What is your favorite memory of us together?',
    'What is the most thoughtful thing I have ever done for you?',
    'If you had to describe our bond in three words, what would they be?',
  ],
  dare: [
    'Send me a silly face photo right now in direct messages.',
    'Do a 15-second funny dance on your camera feed.',
    'Sing the chorus of your favorite love song to me right now.',
    'Show me the most random item in your room and explain why you have it.',
    "Say 'I love you' or a cute compliment in a funny accent.",
  ],
}

const CHESS_PUZZLES = [
  {
    id: 1,
    title: "Scholar's Mate Defence",
    description: 'White is threatening checkmate on f7. Find the winning checkmate move for White to finish the game right now!',
    fen: 'r1bqkbnr/pp1ppppp/2n5/2p5/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    solution: { from: 'f3', to: 'f7' },
    hint: 'Move your Queen from f3 to capture the pawn on f7.',
  },
  {
    id: 2,
    title: 'Back Rank Defiance',
    description: 'Find the back rank checkmate. Deliver mate on the 8th row!',
    fen: '6k1/5ppp/8/8/8/8/8/3R2K1 w - - 0 1',
    solution: { from: 'd1', to: 'd8' },
    hint: 'Move the Rook on d1 all the way to d8.',
  },
  {
    id: 3,
    title: 'Promote to Win',
    description: 'The pawn is one step away from promotion. Move it to the 8th rank to claim victory!',
    fen: '3r4/P7/8/8/8/8/8/k3K3 w - - 0 1',
    solution: { from: 'a7', to: 'a8' },
    hint: 'Move the pawn from a7 to a8.',
  },
]

const LUDO_PATH_COORDS = [
  [6, 1],
  [6, 2],
  [6, 3],
  [6, 4],
  [6, 5],
  [5, 6],
  [4, 6],
  [3, 6],
  [2, 6],
  [1, 6],
  [0, 6],
  [0, 7],
  [0, 8],
  [1, 8],
  [2, 8],
  [3, 8],
  [4, 8],
  [5, 8],
  [6, 9],
  [6, 10],
  [6, 11],
  [6, 12],
  [6, 13],
  [6, 14],
  [7, 14],
  [8, 14],
  [8, 13],
  [8, 12],
  [8, 11],
  [8, 10],
  [8, 9],
  [9, 8],
  [10, 8],
  [11, 8],
  [12, 8],
  [13, 8],
  [14, 8],
  [14, 7],
  [14, 6],
  [13, 6],
  [12, 6],
  [11, 6],
  [10, 6],
  [9, 6],
  [8, 5],
  [8, 4],
  [8, 3],
  [8, 2],
  [8, 1],
  [8, 0],
  [7, 0],
  [6, 0],
]

// Safe spots absolute indices on path
const LUDO_SAFE_CELLS_INDICES = [0, 8, 13, 21, 26, 34, 39, 47]

const DiceFace = ({ value }: { value: number }) => {
  const pips =
    {
      1: [[50, 50]],
      2: [
        [25, 25],
        [75, 75],
      ],
      3: [
        [25, 25],
        [50, 50],
        [75, 75],
      ],
      4: [
        [25, 25],
        [25, 75],
        [75, 25],
        [75, 75],
      ],
      5: [
        [25, 25],
        [25, 75],
        [50, 50],
        [75, 25],
        [75, 75],
      ],
      6: [
        [25, 25],
        [25, 50],
        [25, 75],
        [75, 25],
        [75, 50],
        [75, 75],
      ],
    }[value as 1 | 2 | 3 | 4 | 5 | 6] || []

  return (
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 border border-orange-300 shadow-lg relative flex items-center justify-center flex-shrink-0 animate-bounce">
      {pips.map(([x, y], idx) => (
        <span key={idx} className="absolute w-2 h-2 rounded-full bg-white shadow-inner" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }} />
      ))}
    </div>
  )
}

const GameRoom = ({ onClose }: GameRoomProps) => {
  const socket = useSocket()
  const { selectedChatData, userInfo } = useAppStore()
  const opponentId = typeof selectedChatData === 'object' ? selectedChatData._id : selectedChatData || ''
  const conversationId = [userInfo?.id, opponentId].sort().join('-')

  // Camera & WebRTC streams states
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const peerRef = useRef<SimplePeer.Instance | null>(null)

  // Game configuration states
  const [activeGame, setActiveGame] = useState<'selection' | 'would-you-rather' | 'truth-or-dare' | 'tic-tac-toe' | 'chess' | 'chess-puzzle' | 'ludo' | 'jigsaw'>('selection')
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
  const [mySymbol, setMySymbol] = useState<'X' | 'O'>('X')

  // 4. "Chess" & "Chess Puzzles" game states
  const chessInstanceRef = useRef(new Chess())
  const [chessFen, setChessFen] = useState(chessInstanceRef.current.fen())
  const [isShaking, setIsShaking] = useState(false)
  const [drawOfferReceived, setDrawOfferReceived] = useState(false)
  const [gameResult, setGameResult] = useState<{ winnerId: string | null; reason: string; _id?: string } | null>(null)

  // Spectator detection — user is a spectator if a session is loaded but they're not listed as a player
  const [gameSessionPlayers, setGameSessionPlayers] = useState<string[]>([])
  const isSpectator = gameSessionPlayers.length > 0 && !gameSessionPlayers.includes(userInfo?.id || '')

  // Reaction state for game event messages (e.g. game_result)
  const [gameEventReactions, setGameEventReactions] = useState<Record<string, { userId: string; emoji: string }[]>>({})
  const [activeGameReactionPicker, setActiveGameReactionPicker] = useState<string | null>(null)

  const [serverPlayerColor, setServerPlayerColor] = useState<'w' | 'b' | null>(null)
  const [currentTurnUserId, setCurrentTurnUserId] = useState<string>('')

  const myChessColor = serverPlayerColor || (userInfo?.id && opponentId && userInfo.id < opponentId ? 'w' : 'b')
  const isMyChessTurn = currentTurnUserId ? currentTurnUserId === userInfo?.id : chessInstanceRef.current.turn() === myChessColor

  // Chess puzzles states
  const [currentPuzzleIdx, setCurrentPuzzleIdx] = useState(0)
  const [puzzleStatus, setPuzzleStatus] = useState<'playing' | 'solved' | 'failed'>('playing')
  const [puzzleHint, setPuzzleHint] = useState<string | null>(null)

  // 5. "Ludo" game states
  const [ludoTokens, setLudoTokens] = useState<LudoToken[]>([])
  const [ludoRoll, setLudoRoll] = useState<number>(0)
  const [ludoRollableIndices, setLudoRollableIndices] = useState<number[]>([])
  const [ludoActiveTurn, setLudoActiveTurn] = useState<string>('')
  const [ludoRollState, setLudoRollState] = useState<'idle' | 'rolled'>('idle')

  const isMyLudoTurn = ludoActiveTurn === userInfo?.id

  // Visual local animated positions for step-by-step walking along Ludo track
  const [visualLudoTokens, setVisualLudoTokens] = useState<LudoToken[]>([])

  // 6. "Jigsaw" game states
  const [puzzleImage, setPuzzleImage] = useState<string>('')
  const [puzzleRows, setPuzzleRows] = useState<number>(4)
  const [puzzleCols, setPuzzleCols] = useState<number>(3)

  // Mini Chat & Floating Emojis states
  const [gameMessages, setGameMessages] = useState<ChatMessage[]>([])
  const [miniChatInput, setMiniChatInput] = useState('')
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Color Index mapping for avatars
  const [colorIndex, setColorIndex] = useState<number>(0)
  useEffect(() => {
    if (typeof selectedChatData !== 'string' && selectedChatData?.color) {
      setColorIndex(typeof selectedChatData.color === 'number' ? selectedChatData.color : 0)
    }
  }, [selectedChatData])

  // Ludo step-by-step walking animation loop
  useEffect(() => {
    if (ludoTokens.length === 0) return
    if (visualLudoTokens.length === 0) {
      setVisualLudoTokens(ludoTokens)
      return
    }

    const timer = setTimeout(() => {
      let changed = false
      const nextTokens = visualLudoTokens.map((vt) => {
        const target = ludoTokens.find((lt) => lt.userId === vt.userId && lt.tokenIndex === vt.tokenIndex)
        if (!target) return vt
        if (vt.position !== target.position) {
          changed = true
          if (vt.position === -1) {
            return { ...vt, position: 0 }
          }
          if (target.position === -1) {
            return { ...vt, position: -1 }
          }
          return { ...vt, position: vt.position + 1 }
        }
        return vt
      })

      if (changed) {
        setVisualLudoTokens(nextTokens)
      }
    }, 150)

    return () => clearTimeout(timer)
  }, [ludoTokens, visualLudoTokens])

  // Get User Media Stream
  useEffect(() => {
    let activeStream: MediaStream | null = null
    const startCamera = async () => {
      try {
        setCameraError(null)
        if (!isCameraOn) {
          setLocalStream(null)
          return
        }
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        setLocalStream(stream)
        activeStream = stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
      } catch (err) {
        console.error('Camera access failed:', err)
        setCameraError('Please enable camera permissions to stream video.')
      }
    }
    startCamera()

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop())
      }
      if (peerRef.current) {
        peerRef.current.destroy()
        peerRef.current = null
      }
    }
  }, [isCameraOn])

  // Setup game WebRTC signaling, game states, and mini-chat listeners
  useEffect(() => {
    if (!socket || !userInfo || !localStream) return

    // Notify opponent we joined the game room
    socket.emit('join-game', { opponentId })

    const handleOpponentJoin = () => {
      const peer = new SimplePeer({
        initiator: true,
        trickle: true,
        stream: localStream,
      })

      peer.on('signal', (signal) => {
        socket.emit('game-signal', { opponentId, signal })
      })

      peer.on('stream', (stream) => {
        setRemoteStream(stream)
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream
        }
      })

      peerRef.current = peer
    }

    const handleGameSignal = ({ from, signal }: { from: string; signal: SimplePeer.SignalData }) => {
      if (from !== opponentId) return
      let peer = peerRef.current

      if (!peer) {
        peer = new SimplePeer({
          initiator: false,
          trickle: true,
          stream: localStream,
        })

        peer.on('signal', (sig) => {
          socket.emit('game-signal', { opponentId, signal: sig })
        })

        peer.on('stream', (stream) => {
          setRemoteStream(stream)
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream
          }
        })

        peerRef.current = peer
      }
      peer.signal(signal)
    }

    const handleGameStateUpdated = ({ gameState }: { gameState: GameStateSync }) => {
      if (gameState.gameType === 'would-you-rather') {
        if (gameState.index !== undefined) setWyrIndex(gameState.index)
        if (gameState.selection !== undefined) setOpponentWyrSelection(gameState.selection)
      } else if (gameState.gameType === 'truth-or-dare') {
        if (gameState.todType !== undefined) setTodType(gameState.todType)
        if (gameState.todPrompt !== undefined) setTodPrompt(gameState.todPrompt)
      } else if (gameState.gameType === 'tic-tac-toe') {
        if (gameState.board !== undefined) setBoard(gameState.board)
        if (gameState.isMyTurn !== undefined) setIsMyTurn(!gameState.isMyTurn)
        if (gameState.mySymbol !== undefined) setMySymbol(gameState.mySymbol === 'X' ? 'O' : 'X')
      } else if (gameState.gameType === 'reset') {
        setActiveGame('selection')
        setBoard(Array(9).fill(null))
        chessInstanceRef.current.reset()
        setChessFen(chessInstanceRef.current.fen())
        setSelectedChessSlot(null)
        setWyrSelection(null)
        setOpponentWyrSelection(null)
        setTodType(null)
        setTodPrompt(null)
        setGameResult(null)
        setDrawOfferReceived(false)
        setLudoTokens([])
        setVisualLudoTokens([])
        setLudoRoll(0)
        setLudoRollableIndices([])
      }
    }

    // Authoritative State updates
    const handleGameState = (session: GameSessionState) => {
      // Track player IDs for spectator detection
      setGameSessionPlayers(session.players.map((p) => p.userId))

      const myPlayer = session.players.find((p) => p.userId === userInfo?.id)
      if (myPlayer) {
        setServerPlayerColor(myPlayer.color)
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
        if (session.result) {
          setGameResult(session.result)
        }
      } else if (session.gameType === 'ludo') {
        if (activeGame !== 'ludo') {
          setActiveGame('ludo')
        }
        if (session.state.tokens) setLudoTokens(session.state.tokens)
        if (session.state.currentRoll !== undefined) setLudoRoll(session.state.currentRoll)
        setLudoActiveTurn(session.currentTurn)
        if (session.state.rollState) setLudoRollState(session.state.rollState)
        if (session.result) {
          setGameResult(session.result)
        }
      } else if (session.gameType === 'puzzle') {
        if (activeGame !== 'jigsaw') {
          setActiveGame('jigsaw')
        }
        if (session.state.imageUrl) setPuzzleImage(session.state.imageUrl)
        if (session.state.rows) setPuzzleRows(session.state.rows)
        if (session.state.cols) setPuzzleCols(session.state.cols)
        if (session.result) {
          setGameResult(session.result)
        }
      }
    }

    const handleChessMoveAccepted = (session: GameSessionState) => {
      chessInstanceRef.current.load(session.state.fen || '')
      setChessFen(session.state.fen || '')
      setSelectedChessSlot(null)
      if (session.currentTurn) {
        setCurrentTurnUserId(session.currentTurn)
      }
      if (session.result) {
        setGameResult(session.result)
      }
    }

    const handleChessMoveRejected = () => {
      setIsShaking(true)
      setSelectedChessSlot(null)
      setTimeout(() => setIsShaking(false), 500)
    }

    const handleLudoDiceResult = (data: { roll: number; legalTokenIndices: number[]; gameState: GameSessionState; forfeit?: boolean; eventMessageId?: string }) => {
      setLudoRoll(data.roll)
      setLudoRollableIndices(data.legalTokenIndices || [])
      setLudoActiveTurn(data.gameState.currentTurn)
      if (data.gameState.state.tokens) setLudoTokens(data.gameState.state.tokens)
      if (data.gameState.state.rollState) setLudoRollState(data.gameState.state.rollState)
      if (data.forfeit) {
        setGameMessages((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            senderId: 'system',
            text: 'Turn forfeited after rolling three consecutive 6s.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ])
      } else if (data.eventMessageId) {
        // Push a reactable dice result event message into the mini-chat
        const isMyRoll = data.gameState.currentTurn !== userInfo.id // after roll, turn may have passed
        const diceEmoji = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][data.roll] || String(data.roll)
        setGameMessages((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            senderId: isMyRoll ? userInfo.id : opponentId,
            text: `Rolled ${diceEmoji} (${data.roll})`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            eventMessageId: data.eventMessageId,
          },
        ])
      }
    }

    const handleLudoMoveAccepted = (session: GameSessionState) => {
      if (session.state.tokens) setLudoTokens(session.state.tokens)
      setLudoActiveTurn(session.currentTurn)
      setLudoRoll(0)
      setLudoRollableIndices([])
      if (session.state.rollState) setLudoRollState(session.state.rollState)
      if (session.result) {
        setGameResult(session.result)
      }
    }

    // Authoritative Puzzle updates
    const handlePuzzleMoveAccepted = (data: { gameState: GameSessionState }) => {
      const session = data.gameState
      if (session.result) {
        setGameResult(session.result)
      }
    }

    const handleGameResult = (result: { winnerId: string | null; reason: string; _id?: string }) => {
      setGameResult(result)
      // Push a system message into the mini-chat so players can react to it
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

    const handleGameChatReceived = ({ message }: { senderId: string; message: string }) => {
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

    const handleGameReactionReceived = ({ emoji }: { emoji: string }) => {
      setFloatingEmojis((prev) => [...prev, { id: Date.now() + Math.random(), emoji, x: 10 + Math.random() * 80 }])
    }

    // Listen for reactions on game_event messages (same event as regular message reactions)
    const handleMessageReactionUpdated = ({ messageId, reactions }: { messageId: string; reactions: { userId: string; emoji: string }[] }) => {
      setGameEventReactions((prev) => ({ ...prev, [messageId]: reactions }))
    }

    socket.on('opponent-joined-game', handleOpponentJoin)
    socket.on('game-signal-received', handleGameSignal)
    socket.on('game-state-updated', handleGameStateUpdated)
    socket.on('game:state', handleGameState)
    socket.on('chess:moveAccepted', handleChessMoveAccepted)
    socket.on('chess:moveRejected', handleChessMoveRejected)
    socket.on('ludo:diceResult', handleLudoDiceResult)
    socket.on('ludo:moveAccepted', handleLudoMoveAccepted)
    socket.on('puzzle:moveAccepted', handlePuzzleMoveAccepted)
    socket.on('game:result', handleGameResult)
    socket.on('game:drawOffered', handleDrawOffered)
    socket.on('game:drawDeclined', handleDrawDeclined)
    socket.on('game-chat-received', handleGameChatReceived)
    socket.on('game-reaction-received', handleGameReactionReceived)
    socket.on('message:reactionUpdated', handleMessageReactionUpdated)

    socket.emit('join-game', { opponentId })

    return () => {
      socket.off('opponent-joined-game', handleOpponentJoin)
      socket.off('game-signal-received', handleGameSignal)
      socket.off('game-state-updated', handleGameStateUpdated)
      socket.off('game:state', handleGameState)
      socket.off('chess:moveAccepted', handleChessMoveAccepted)
      socket.off('chess:moveRejected', handleChessMoveRejected)
      socket.off('ludo:diceResult', handleLudoDiceResult)
      socket.off('ludo:moveAccepted', handleLudoMoveAccepted)
      socket.off('puzzle:moveAccepted', handlePuzzleMoveAccepted)
      socket.off('game:result', handleGameResult)
      socket.off('game:drawOffered', handleDrawOffered)
      socket.off('game:drawDeclined', handleDrawDeclined)
      socket.off('game-chat-received', handleGameChatReceived)
      socket.off('game-reaction-received', handleGameReactionReceived)
      socket.off('message:reactionUpdated', handleMessageReactionUpdated)
    }
  }, [socket, userInfo, localStream, opponentId, activeGame])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [gameMessages])

  useEffect(() => {
    if (socket && conversationId && (activeGame === 'chess' || activeGame === 'ludo' || activeGame === 'jigsaw')) {
      socket.emit('game:initiate', {
        conversationId,
        gameType: activeGame === 'jigsaw' ? 'puzzle' : activeGame,
        opponentId,
      })
    }
  }, [socket, conversationId, activeGame, opponentId])

  const syncGameState = (payload: GameStateSync) => {
    if (socket) {
      socket.emit('game-state-sync', { opponentId, gameState: payload })
    }
  }

  // ─── CHAT & REACTION ACTIONS ────────────────────────────────────────────────
  const handleSendGameMessage = () => {
    if (!miniChatInput.trim() || !socket) return
    const text = miniChatInput.trim()
    setGameMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        senderId: userInfo?.id || 'self',
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    socket.emit('game-chat-message', { opponentId, message: text })
    setMiniChatInput('')
  }

  const triggerReaction = (emoji: string) => {
    setFloatingEmojis((prev) => [...prev, { id: Date.now() + Math.random(), emoji, x: 10 + Math.random() * 80 }])
    if (socket) {
      socket.emit('game-reaction', { opponentId, emoji })
    }
  }

  // ─── WOULD YOU RATHER ACTIONS ──────────────────────────────────────────────
  const handleWyrSelect = (option: 'A' | 'B') => {
    setWyrSelection(option)
    syncGameState({ gameType: 'would-you-rather', selection: option })
  }

  const handleNextWyr = () => {
    const nextIdx = (wyrIndex + 1) % WOULD_YOU_RATHER_QUESTIONS.length
    setWyrIndex(nextIdx)
    setWyrSelection(null)
    setOpponentWyrSelection(null)
    syncGameState({ gameType: 'would-you-rather', index: nextIdx, selection: null })
  }

  // ─── TRUTH OR DARE ACTIONS ──────────────────────────────────────────────────
  const drawTod = (type: 'truth' | 'dare') => {
    const arr = TRUTH_OR_DARE_CARDS[type]
    const randomPrompt = arr[Math.floor(Math.random() * arr.length)]
    setTodType(type)
    setTodPrompt(randomPrompt)
    syncGameState({ gameType: 'truth-or-dare', todType: type, todPrompt: randomPrompt })
  }

  // ─── TIC TAC TOE ACTIONS ────────────────────────────────────────────────────
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
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i]
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a]
      }
    }
    return null
  }

  const handleCellClick = (index: number) => {
    if (board[index] || !isMyTurn || checkWinner(board)) return

    const newBoard = [...board]
    newBoard[index] = mySymbol
    setBoard(newBoard)
    setIsMyTurn(false)

    syncGameState({
      gameType: 'tic-tac-toe',
      board: newBoard,
      isMyTurn: false,
      mySymbol: mySymbol,
    })

    const winner = checkWinner(newBoard)
    if (winner) {
      if (winner === mySymbol) {
        setScore((prev) => ({ ...prev, self: prev.self + 1 }))
      } else {
        setScore((prev) => ({ ...prev, opponent: prev.opponent + 1 }))
      }
    }
  }

  const resetTicTacToe = () => {
    const emptyBoard = Array(9).fill(null)
    setBoard(emptyBoard)
    setIsMyTurn(true)
    syncGameState({
      gameType: 'tic-tac-toe',
      board: emptyBoard,
      isMyTurn: true,
    })
  }

  // ─── CHESS ACTIONS ──────────────────────────────────────────────────────────
  // onPieceDrop is called by react-chessboard when the user drags and drops a piece.
  // The server is authoritative: we only emit the proposal, never modify local state directly.
  const handleChessPieceDrop = (sourceSquare: string, targetSquare: string): boolean => {
    if (gameResult || !isMyChessTurn || isSpectator) return false
    if (socket) {
      socket.emit('chess:proposeMove', {
        conversationId,
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      })
    }
    // Return false so react-chessboard doesn't snap the piece locally.
    // The server will broadcast the accepted move which we apply via handleChessMoveAccepted.
    return false
  }

  const proposeDraw = () => {
    if (socket) {
      socket.emit('game:drawOffer', { conversationId })
      setGameMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          senderId: 'system',
          text: 'Draw offer sent to partner.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    }
  }

  const acceptDraw = () => {
    if (socket) {
      socket.emit('game:drawAccept', { conversationId })
      setDrawOfferReceived(false)
    }
  }

  const declineDraw = () => {
    if (socket) {
      socket.emit('game:drawDecline', { conversationId })
      setDrawOfferReceived(false)
    }
  }

  const resignGame = () => {
    if (socket) {
      socket.emit('game:resign', { conversationId })
    }
  }

  const resetChess = () => {
    chessInstanceRef.current.reset()
    const startFen = chessInstanceRef.current.fen()
    setChessFen(startFen)
    setSelectedChessSlot(null)
    setGameResult(null)
    syncGameState({
      gameType: 'chess',
      fen: startFen,
    })
  }

  const startPuzzle = (index: number) => {
    setCurrentPuzzleIdx(index)
    const puzzle = CHESS_PUZZLES[index]
    chessInstanceRef.current.load(puzzle.fen)
    setChessFen(puzzle.fen)
    setPuzzleStatus('playing')
    setPuzzleHint(null)
  }

  // Puzzle onPieceDrop handler for react-chessboard in puzzle mode
  const handlePuzzlePieceDrop = (sourceSquare: string, targetSquare: string): boolean => {
    if (puzzleStatus !== 'playing') return false
    const puzzle = CHESS_PUZZLES[currentPuzzleIdx]
    if (sourceSquare === puzzle.solution.from && targetSquare === puzzle.solution.to) {
      chessInstanceRef.current.move({ from: sourceSquare, to: targetSquare, promotion: 'q' })
      setChessFen(chessInstanceRef.current.fen())
      setPuzzleStatus('solved')
      setScore((prev) => ({ ...prev, self: prev.self + 1 }))
      return true
    }
    setPuzzleStatus('failed')
    return false
  }

  // ─── LUDO ACTIONS ───────────────────────────────────────────────────────────
  const handleLudoRoll = () => {
    if (!socket || !isMyLudoTurn || ludoRollState === 'rolled') return
    socket.emit('ludo:rollDice', { conversationId })
  }

  const handleLudoMove = (tokenIdx: number) => {
    if (!socket || !isMyLudoTurn || ludoRollState !== 'rolled' || !ludoRollableIndices.includes(tokenIdx)) return
    socket.emit('ludo:proposeMove', { conversationId, tokenIndex: tokenIdx })
  }

  const handleLudoRematch = () => {
    if (socket) {
      socket.emit('game:rematch', { conversationId })
    }
  }

  const getLudoGridCoords = (t: LudoToken) => {
    if (t.position === -1) {
      const isRed = t.color === 'red'
      const offsets = [
        [2, 2],
        [2, 3],
        [3, 2],
        [3, 3],
      ]
      const greenOffsets = [
        [2, 11],
        [2, 12],
        [3, 11],
        [3, 12],
      ]
      return isRed ? offsets[t.tokenIndex] : greenOffsets[t.tokenIndex]
    }

    if (t.position === 57) {
      return [7, 7]
    }

    if (t.position >= 51 && t.position <= 56) {
      const isRed = t.color === 'red'
      if (isRed) {
        return [7, 1 + (t.position - 51)]
      } else {
        return [7, 13 - (t.position - 51)]
      }
    }

    const startOffset = t.color === 'red' ? 0 : 26
    const absPos = (t.position + startOffset) % 52
    return LUDO_PATH_COORDS[absPos]
  }

  // ─── JIGSAW PUZZLE ACTIONS ──────────────────────────────────────────────────
  // handleJigsawSolved is called by react-jigsaw-puzzle's onSolved callback.
  // We emit puzzle:solved to the server which marks the session complete and broadcasts game:result.
  const handleJigsawSolved = () => {
    if (!socket || !!gameResult) return
    socket.emit('puzzle:solved', { conversationId })
  }

  // ─── GAME EVENT REACTIONS ───────────────────────────────────────────────────
  const handleGameEventReaction = (messageId: string, emoji: string) => {
    if (!socket || !messageId) return
    socket.emit('message:addReaction', { messageId, emoji, conversationId })
    setActiveGameReactionPicker(null)
  }

  // Reset selection and exit
  const handleExitGame = () => {
    setActiveGame('selection')
    setBoard(Array(9).fill(null))
    chessInstanceRef.current.reset()
    setChessFen(chessInstanceRef.current.fen())
    setSelectedChessSlot(null)
    setWyrSelection(null)
    setOpponentWyrSelection(null)
    setTodType(null)
    setTodPrompt(null)
    setGameResult(null)
    setDrawOfferReceived(false)
    setLudoTokens([])
    setVisualLudoTokens([])
    setLudoRoll(0)
    setLudoRollableIndices([])
    setGameSessionPlayers([])
    setGameEventReactions({})
    syncGameState({ gameType: 'reset' })
    onClose()
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-5 p-5 overflow-hidden h-[calc(100vh-80px)] relative">
      {/* Absolute Floating Reactions Overlay */}
      <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
        <AnimatePresence>
          {floatingEmojis.map((e) => (
            <motion.div
              key={e.id}
              initial={{ y: '100vh', opacity: 1, scale: 1 }}
              animate={{ y: '-10vh', opacity: 0, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3, ease: 'easeOut' }}
              className="absolute text-3xl select-none"
              style={{ left: `${e.x}%` }}
              onAnimationComplete={() => setFloatingEmojis((prev) => prev.filter((item) => item.id !== e.id))}
            >
              {e.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Video feeds container */}
      <div className="flex flex-row lg:flex-col gap-4 w-full lg:w-56 flex-shrink-0">
        {/* Local Stream */}
        <div className="relative flex-1 lg:flex-none lg:h-36 bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
          {cameraError ? (
            <div className="h-full flex flex-col items-center justify-center p-3 text-center">
              <FiVideoOff className="text-lg text-white/30 mb-1" />
              <span className="text-[9px] text-white/40 leading-relaxed font-light">{cameraError}</span>
            </div>
          ) : (
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover transform -scale-x-100" />
          )}

          <button
            onClick={() => setIsCameraOn(!isCameraOn)}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-all z-20"
            title={isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
          >
            {isCameraOn ? <FiVideo className="text-[10px]" /> : <FiVideoOff className="text-[10px] text-rose-400" />}
          </button>
          <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[8px] tracking-wider uppercase font-semibold text-white bg-black/60 backdrop-blur-md rounded-md">You</span>
        </div>

        {/* Remote Stream */}
        <div className="relative flex-1 lg:flex-none lg:h-36 bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
          {remoteStream ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-3 text-center">
              {typeof selectedChatData !== 'string' && selectedChatData?.image ? (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center border border-white/10 overflow-hidden mb-1.5"
                  style={{ backgroundColor: colors[colorIndex] }}
                >
                  <img src={`${import.meta.env.VITE_LOCAL_HOST}/${selectedChatData.image}`} alt="Profile" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold text-white border border-white/10 mb-1.5"
                  style={{ backgroundColor: colors[colorIndex] }}
                >
                  {typeof selectedChatData !== 'string' && selectedChatData?.firstName ? selectedChatData.firstName[0].toUpperCase() : '?'}
                </div>
              )}
              <span className="text-[9px] text-white/40 font-light animate-pulse">Waiting...</span>
            </div>
          )}
          <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[8px] tracking-wider uppercase font-semibold text-white bg-black/60 backdrop-blur-md rounded-md">
            {typeof selectedChatData !== 'string' && selectedChatData?.firstName ? selectedChatData.firstName : 'Partner'}
          </span>
        </div>
      </div>

      {/* Main Game Dashboard Area */}
      <div className="flex-1 bg-white/[0.01] border border-white/[0.05] rounded-3xl p-5 shadow-2xl backdrop-blur-xl flex flex-col overflow-y-auto custom-scrollbar relative">
        <AnimatePresence mode="wait">
          {/* 1. SELECTION SCREEN */}
          {activeGame === 'selection' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full py-4"
            >
              <div className="text-center mb-6">
                <span className="text-[10px] text-indigo-400 font-semibold tracking-[0.25em] uppercase">Interactive Bond</span>
                <h3 className="text-xl font-light tracking-wide text-white mt-1">LDR Connection Games</h3>
                <p className="text-xs text-white/40 leading-relaxed font-light mt-1">Select a game to start playing with each other in real-time.</p>
              </div>

              <div className="space-y-3">
                {/* Chess option */}
                <button
                  onClick={() => {
                    setActiveGame('chess')
                    resetChess()
                  }}
                  className="w-full p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-amber-500/30 hover:bg-amber-500/[0.03] text-left transition-all duration-300 flex items-center justify-between group"
                >
                  <div className="pr-4">
                    <h4 className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">Chess (Rule Validated)</h4>
                    <p className="text-[11px] text-white/45 font-light leading-relaxed mt-1">
                      Challenge each other to a game of Chess! Battle-tested validation manages checkmates, draws, and FIDE guidelines.
                    </p>
                  </div>
                  <FiArrowRight className="text-white/30 group-hover:text-amber-400 transition-colors text-base flex-shrink-0" />
                </button>

                {/* Chess Tactics Puzzles */}
                <button
                  onClick={() => {
                    setActiveGame('chess-puzzle')
                    startPuzzle(0)
                  }}
                  className="w-full p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-cyan-500/30 hover:bg-cyan-500/[0.03] text-left transition-all duration-300 flex items-center justify-between group"
                >
                  <div className="pr-4">
                    <h4 className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">Chess Tactics Puzzles</h4>
                    <p className="text-[11px] text-white/45 font-light leading-relaxed mt-1">
                      Solve tactical find-the-best-move puzzles to test your intelligence and earn score counts.
                    </p>
                  </div>
                  <FiArrowRight className="text-white/30 group-hover:text-cyan-400 transition-colors text-base flex-shrink-0" />
                </button>

                {/* Ludo Board */}
                <button
                  onClick={() => {
                    setActiveGame('ludo')
                    setLudoRoll(0)
                    setLudoTokens([])
                    setVisualLudoTokens([])
                  }}
                  className="w-full p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-orange-500/30 hover:bg-orange-500/[0.03] text-left transition-all duration-300 flex items-center justify-between group"
                >
                  <div className="pr-4">
                    <h4 className="text-xs font-semibold text-white group-hover:text-orange-300 transition-colors">Ludo Board (Multiplayer)</h4>
                    <p className="text-[11px] text-white/45 font-light leading-relaxed mt-1">
                      Race all 4 tokens around the board using authoritative dice rolls, safe squares protection, and capture triggers.
                    </p>
                  </div>
                  <FiArrowRight className="text-white/30 group-hover:text-orange-400 transition-colors text-base flex-shrink-0" />
                </button>

                {/* Jigsaw Puzzle */}
                <button
                  onClick={() => {
                    setActiveGame('jigsaw')
                  }}
                  className="w-full p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-pink-500/30 hover:bg-pink-500/[0.03] text-left transition-all duration-300 flex items-center justify-between group"
                >
                  <div className="pr-4">
                    <h4 className="text-xs font-semibold text-white group-hover:text-pink-300 transition-colors">Classic Jigsaw Puzzle</h4>
                    <p className="text-[11px] text-white/45 font-light leading-relaxed mt-1">
                      Assemble irregular tabbed interlocking jigsaw pieces together in a race to the finish!
                    </p>
                  </div>
                  <FiArrowRight className="text-white/30 group-hover:text-pink-400 transition-colors text-base flex-shrink-0" />
                </button>

                {/* Would You Rather */}
                <button
                  onClick={() => setActiveGame('would-you-rather')}
                  className="w-full p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-indigo-500/30 hover:bg-indigo-500/[0.03] text-left transition-all duration-300 flex items-center justify-between group"
                >
                  <div className="pr-4">
                    <h4 className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">Would You Rather?</h4>
                    <p className="text-[11px] text-white/45 font-light leading-relaxed mt-1">
                      Choose between two LDR dilemmas. Both choices are revealed when both lock in answers!
                    </p>
                  </div>
                  <FiArrowRight className="text-white/30 group-hover:text-indigo-400 transition-colors text-base flex-shrink-0" />
                </button>

                {/* Truth or Dare */}
                <button
                  onClick={() => setActiveGame('truth-or-dare')}
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
                  onClick={() => setActiveGame('tic-tac-toe')}
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
          )}

          {/* 2. CHESS SCREEN */}
          {activeGame === 'chess' && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-white">Chess</h4>
                  <p className="text-[10px] text-white/40 font-light mt-0.5">
                    {gameResult ? `Game Over: ${gameResult.reason}` : isMyChessTurn ? 'Your Turn' : 'Waiting for partner...'}
                  </p>
                </div>
                <button
                  onClick={handleExitGame}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs border border-white/5 transition-all"
                >
                  Exit Game
                </button>
              </div>

              {/* react-chessboard library replaces the hand-drawn unicode grid */}
              <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full py-2">
                {chessInstanceRef.current.inCheck() && !chessInstanceRef.current.isCheckmate() && (
                  <div className="mb-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-[10px] font-bold text-amber-400 animate-bounce">Check!</div>
                )}

                {drawOfferReceived && (
                  <div className="mb-3 p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl flex items-center justify-between gap-4 w-full">
                    <span className="text-[10px] text-white/80">Opponent offered a draw.</span>
                    <div className="flex gap-2">
                      <button onClick={acceptDraw} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-semibold rounded-lg transition-colors">
                        Accept
                      </button>
                      <button onClick={declineDraw} className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[9px] font-semibold rounded-lg transition-colors">
                        Decline
                      </button>
                    </div>
                  </div>
                )}

                {isSpectator && (
                  <div className="mb-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-[10px] font-semibold text-purple-400">👁 Spectating</div>
                )}

                <motion.div key={chessFen} animate={isShaking ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}} transition={{ duration: 0.4 }} className="w-full">
                  <Chessboard
                    position={chessFen}
                    onPieceDrop={handleChessPieceDrop}
                    boardOrientation={myChessColor === 'w' ? 'white' : 'black'}
                    arePiecesDraggable={!gameResult && isMyChessTurn && !isSpectator}
                    customBoardStyle={{
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    }}
                    customDarkSquareStyle={{ backgroundColor: '#312e81' }}
                    customLightSquareStyle={{ backgroundColor: '#e0e7ff' }}
                  />
                </motion.div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={proposeDraw}
                    disabled={!!gameResult || isSpectator}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 text-white/70 hover:text-white border border-white/5 text-[9px] font-semibold tracking-wider uppercase transition-all flex items-center gap-1.5"
                  >
                    <FiLayers className="text-[10px]" /> Offer Draw
                  </button>
                  <button
                    onClick={resignGame}
                    disabled={!!gameResult || isSpectator}
                    className="px-3.5 py-2 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 disabled:opacity-40 text-rose-400 border border-rose-500/20 text-[9px] font-semibold tracking-wider uppercase transition-all flex items-center gap-1.5"
                  >
                    <FiFlag className="text-[10px]" /> Resign
                  </button>
                  {gameResult && !isSpectator && (
                    <button
                      onClick={handleLudoRematch}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-semibold tracking-wider uppercase transition-all flex items-center gap-1.5"
                    >
                      Rematch
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. LUDO BOARD SCREEN */}
          {activeGame === 'ludo' && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-white">Ludo (Authoritative)</h4>
                  <p className="text-[10px] text-white/40 font-light mt-0.5">
                    {gameResult
                      ? `Winner: ${gameResult.winnerId === userInfo?.id ? 'You' : 'Partner'} (${gameResult.reason})`
                      : isMyLudoTurn
                        ? 'Your Turn - Roll the dice or select a legal token to move!'
                        : "Waiting for partner's turn..."}
                  </p>
                </div>
                <button
                  onClick={handleExitGame}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs border border-white/5 transition-all"
                >
                  Exit Game
                </button>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full py-2">
                {/* Visual 15x15 Ludo Board Grid */}
                <div className="grid grid-cols-15 grid-rows-15 gap-0.5 w-full aspect-square border border-white/15 bg-slate-900 rounded-3xl overflow-hidden relative shadow-2xl p-1 mb-4 select-none">
                  {/* Render 15x15 grid layout cell highlights */}
                  {Array.from({ length: 15 }).map((_, r) => {
                    return Array.from({ length: 15 }).map((_, c) => {
                      let bg = 'bg-slate-800'
                      let content = null

                      // Red Home Base (Top-Left 6x6)
                      if (r < 6 && c < 6) {
                        bg = 'bg-rose-600/35 border border-rose-500/20'
                        if (r === 0 || r === 5 || c === 0 || c === 5) {
                          bg = 'bg-rose-700/60 border border-rose-500/30 shadow-inner'
                        }
                      }
                      // Green Home Base (Top-Right 6x6)
                      else if (r < 6 && c > 8) {
                        bg = 'bg-emerald-600/35 border border-emerald-500/20'
                        if (r === 0 || r === 5 || c === 9 || c === 14) {
                          bg = 'bg-emerald-700/60 border border-emerald-500/30 shadow-inner'
                        }
                      }
                      // Blue Home Base (Bottom-Left 6x6)
                      else if (r > 8 && c < 6) {
                        bg = 'bg-blue-600/35 border border-blue-500/20'
                        if (r === 9 || r === 14 || c === 0 || c === 5) {
                          bg = 'bg-blue-700/60 border border-blue-500/30 shadow-inner'
                        }
                      }
                      // Yellow Home Base (Bottom-Right 6x6)
                      else if (r > 8 && c > 8) {
                        bg = 'bg-amber-500/35 border border-amber-500/20'
                        if (r === 9 || r === 14 || c === 9 || c === 14) {
                          bg = 'bg-amber-600/60 border border-amber-500/30 shadow-inner'
                        }
                      }
                      // Center triangular wedges
                      else if (r >= 6 && r <= 8 && c >= 6 && c <= 8) {
                        bg = 'bg-slate-900'
                      }
                      // Red Entry & Home path
                      else if (r === 7 && c >= 1 && c <= 5) {
                        bg = 'bg-rose-500 border border-rose-400/20'
                      } else if (r === 6 && c === 1) {
                        bg = 'bg-rose-500/80 border border-rose-400/30'
                      }
                      // Green Entry & Home path
                      else if (r === 7 && c >= 9 && c <= 13) {
                        bg = 'bg-emerald-500 border border-emerald-400/20'
                      } else if (r === 8 && c === 13) {
                        bg = 'bg-emerald-500/80 border border-emerald-400/30'
                      }
                      // Top cross columns path
                      else if (c === 7 && r >= 1 && r <= 5) {
                        bg = 'bg-slate-700/50'
                      }
                      // Bottom cross columns path
                      else if (c === 7 && r >= 9 && r <= 13) {
                        bg = 'bg-slate-700/50'
                      }
                      // Walkable paths
                      else {
                        bg = 'bg-slate-700/20 border border-white/5'
                      }

                      // Check safe spot matches (render Star icon)
                      const isCommonCell = LUDO_PATH_COORDS.findIndex(([pr, pc]) => pr === r && pc === c)
                      if (isCommonCell !== -1 && LUDO_SAFE_CELLS_INDICES.includes(isCommonCell)) {
                        bg = 'bg-indigo-500/40 border border-indigo-400/30 shadow-md'
                        content = <span className="text-[12px] text-indigo-300 font-bold select-none">★</span>
                      }

                      return (
                        <div key={`${r}-${c}`} className={`w-full aspect-square flex items-center justify-center relative rounded-md transition-all ${bg}`}>
                          {content}
                        </div>
                      )
                    })
                  })}

                  {/* Absolute Center Wedge Overlay */}
                  <div
                    className="absolute z-10 pointer-events-none"
                    style={{
                      gridRowStart: 7,
                      gridRowEnd: 10,
                      gridColumnStart: 7,
                      gridColumnEnd: 10,
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <polygon points="0,0 50,50 0,100" fill="rgba(239, 68, 68, 0.6)" stroke="rgba(239,68,68,0.8)" strokeWidth="0.5" />
                      <polygon points="100,0 50,50 100,100" fill="rgba(16, 185, 129, 0.6)" stroke="rgba(16,185,129,0.8)" strokeWidth="0.5" />
                      <polygon points="0,0 50,50 100,0" fill="rgba(245, 158, 11, 0.4)" stroke="rgba(245,158,11,0.6)" strokeWidth="0.5" />
                      <polygon points="0,100 50,50 100,100" fill="rgba(59, 130, 246, 0.4)" stroke="rgba(59,130,246,0.6)" strokeWidth="0.5" />
                    </svg>
                  </div>

                  {/* Render animated custom tokens */}
                  {visualLudoTokens.map((token) => {
                    const [row, col] = getLudoGridCoords(token)
                    const actualToken = ludoTokens.find((lt) => lt.userId === token.userId && lt.tokenIndex === token.tokenIndex)
                    const isMine = token.userId === userInfo?.id
                    const isRollable = isMine && actualToken && ludoRollableIndices.includes(actualToken.tokenIndex)

                    return (
                      <button
                        key={`${token.userId}-${token.tokenIndex}`}
                        onClick={() => handleLudoMove(token.tokenIndex)}
                        disabled={!isRollable || !isMyLudoTurn || ludoRollState !== 'rolled'}
                        style={{
                          gridRowStart: row + 1,
                          gridColumnStart: col + 1,
                          width: '80%',
                          height: '80%',
                          justifySelf: 'center',
                          alignSelf: 'center',
                        }}
                        className={`rounded-full flex items-center justify-center text-[7px] font-bold text-white shadow-xl z-30 border-2 transition-all duration-300 transform hover:scale-110 active:scale-95 ${
                          token.color === 'red'
                            ? 'bg-rose-600 hover:bg-rose-500 border-rose-400 shadow-rose-900/40'
                            : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 shadow-emerald-900/40'
                        } ${isRollable && ludoRollState === 'rolled' && isMyLudoTurn ? 'ring-4 ring-amber-400 animate-pulse scale-125 z-40' : ''}`}
                      >
                        {/* Pawn shaped symbol */}♟
                      </button>
                    )
                  })}
                </div>

                {/* Dice actions */}
                <div className="flex flex-col items-center gap-3 select-none">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleLudoRoll}
                      disabled={!isMyLudoTurn || ludoRollState === 'rolled' || !!gameResult}
                      className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md"
                    >
                      Roll Dice
                    </button>
                    {ludoRoll > 0 && <DiceFace value={ludoRoll} />}
                  </div>

                  {gameResult && (
                    <button
                      onClick={handleLudoRematch}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold tracking-wider uppercase transition-all shadow-md"
                    >
                      Rematch
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* 4. CLASSIC JIGSAW PUZZLE SCREEN */}
          {activeGame === 'jigsaw' && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-white">Classic Jigsaw Puzzle (Race)</h4>
                  <p className="text-[10px] text-white/40 font-light mt-0.5">
                    {gameResult ? `Winner: ${gameResult.winnerId === userInfo?.id ? 'You! 🎉' : 'Partner wins!'}` : 'Assemble the puzzle — first to finish wins!'}
                  </p>
                </div>
                <button
                  onClick={handleExitGame}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs border border-white/5 transition-all"
                >
                  Exit Game
                </button>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center w-full py-2 gap-4">
                {/* Status bar */}
                <div className="w-full max-w-[600px] flex items-center justify-between text-[10px] text-white/60 bg-white/5 border border-white/5 p-2.5 rounded-xl">
                  <span>{gameResult ? (gameResult.winnerId === userInfo?.id ? '🏆 You solved it first!' : '⏳ Partner solved it first!') : 'Solving...'}</span>
                  {isSpectator && <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[9px] font-semibold">👁 Spectating</span>}
                </div>

                {/* Reference thumbnail */}
                {puzzleImage && (
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] text-white/40 uppercase tracking-widest">Target</span>
                    <div className="w-20 h-14 border border-white/20 rounded-lg overflow-hidden shadow-lg">
                      <img src={puzzleImage} alt="Reference" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}

                {/* react-jigsaw-puzzle library renders its own board */}
                {puzzleImage && !gameResult && (
                  <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ width: 600, height: 450 }}>
                    <JigsawPuzzle imageSrc={puzzleImage} rows={puzzleRows || 4} columns={puzzleCols || 3} onSolved={handleJigsawSolved} />
                  </div>
                )}

                {gameResult && !isSpectator && (
                  <button
                    onClick={handleLudoRematch}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md"
                  >
                    Rematch
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* 5. CHESS PUZZLE SCREEN */}
          {activeGame === 'chess-puzzle' && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-white">Chess Puzzles</h4>
                  <p className="text-[10px] text-white/40 font-light mt-0.5">Solve the challenge to earn bond points</p>
                </div>
                <button
                  onClick={handleExitGame}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs border border-white/5 transition-all"
                >
                  Exit Game
                </button>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full py-2">
                <div className="text-center mb-4">
                  <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">
                    Puzzle {CHESS_PUZZLES[currentPuzzleIdx].id}: {CHESS_PUZZLES[currentPuzzleIdx].title}
                  </h3>
                  <p className="text-[11px] text-white/80 mt-1 leading-relaxed px-4">{CHESS_PUZZLES[currentPuzzleIdx].description}</p>
                </div>

                {/* react-chessboard for chess puzzles */}
                <div key={chessFen} className="w-full">
                  <Chessboard
                    position={chessFen}
                    onPieceDrop={handlePuzzlePieceDrop}
                    boardOrientation="white"
                    arePiecesDraggable={puzzleStatus === 'playing'}
                    customBoardStyle={{
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    }}
                    customDarkSquareStyle={{ backgroundColor: '#164e63' }}
                    customLightSquareStyle={{ backgroundColor: '#ecfeff' }}
                  />
                </div>

                <div className="mt-4 flex flex-col items-center gap-2.5 w-full">
                  {puzzleStatus === 'solved' && (
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                      <FiAward className="text-base" /> Correct! Solution Solved!
                    </motion.div>
                  )}
                  {puzzleStatus === 'failed' && (
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex items-center gap-2 text-xs font-bold text-rose-400">
                      Incorrect Move. Try again!
                    </motion.div>
                  )}

                  {puzzleHint && (
                    <p className="text-[10px] text-white/50 bg-white/5 border border-white/5 rounded-xl px-4 py-1.5 text-center leading-relaxed">
                      <span className="font-semibold text-indigo-400">Hint:</span> {puzzleHint}
                    </p>
                  )}

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setPuzzleHint(CHESS_PUZZLES[currentPuzzleIdx].hint)}
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5 text-[10px] font-medium flex items-center gap-1.5 transition-all"
                    >
                      <FiHelpCircle className="text-[10px]" /> Show Hint
                    </button>
                    <button
                      onClick={() => startPuzzle(currentPuzzleIdx)}
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5 text-[10px] font-medium flex items-center gap-1.5 transition-all"
                    >
                      <FiRotateCcw className="text-[10px]" /> Reset Puzzle
                    </button>
                    {currentPuzzleIdx < CHESS_PUZZLES.length - 1 && (
                      <button
                        onClick={() => startPuzzle(currentPuzzleIdx + 1)}
                        className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-semibold tracking-wide transition-all shadow-md"
                      >
                        Next Puzzle
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 5. WOULD YOU RATHER GAME SCREEN */}
          {activeGame === 'would-you-rather' && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-white">Would You Rather?</h4>
                  <p className="text-[10px] text-white/40 font-light mt-0.5">Reveal locked choices simultaneously</p>
                </div>
                <button
                  onClick={handleExitGame}
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
                    onClick={() => handleWyrSelect('A')}
                    disabled={wyrSelection !== null}
                    className={`p-5 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-1 ${
                      wyrSelection === 'A' ? 'bg-indigo-600/30 border-indigo-500 text-white' : 'bg-white/[0.02] border-white/[0.06] hover:border-white/15 text-white/80'
                    }`}
                  >
                    <span className="text-[9px] tracking-wider uppercase font-semibold text-indigo-400 mb-1">Option A</span>
                    <span className="text-[11px] font-light leading-relaxed">{WOULD_YOU_RATHER_QUESTIONS[wyrIndex].a}</span>
                  </button>

                  <button
                    onClick={() => handleWyrSelect('B')}
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
                        onClick={handleNextWyr}
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

          {/* 6. TRUTH OR DARE GAME SCREEN */}
          {activeGame === 'truth-or-dare' && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-white">Truth or Dare</h4>
                  <p className="text-[10px] text-white/40 font-light mt-0.5">LDR relationship building cards</p>
                </div>
                <button
                  onClick={handleExitGame}
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
                        onClick={() => setTodPrompt(null)}
                        className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[10px] border border-white/5 transition-all"
                      >
                        Clear Card
                      </button>
                      <button
                        onClick={() => drawTod(todType!)}
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
                        onClick={() => drawTod('truth')}
                        className="px-5 py-3 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/25 border border-indigo-500/30 text-indigo-400 hover:text-indigo-300 font-semibold text-xs transition-all"
                      >
                        Ask a Truth
                      </button>
                      <button
                        onClick={() => drawTod('dare')}
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

          {/* 7. TIC TAC TOE SCREEN */}
          {activeGame === 'tic-tac-toe' && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-white">Tic Tac Toe</h4>
                  <p className="text-[10px] text-white/40 font-light mt-0.5">Turn-based multiplayer sync</p>
                </div>
                <button
                  onClick={handleExitGame}
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
                      onClick={() => handleCellClick(idx)}
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
                    onClick={resetTicTacToe}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5 text-[10px] font-medium flex items-center gap-1.5 transition-all"
                  >
                    <FiRotateCcw className="text-[10px]" /> Reset Grid
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mini-Chat Panel & Live Reactions */}
      <div className="w-full lg:w-72 bg-white/[0.02] border border-white/[0.06] rounded-3xl p-4 flex flex-col justify-between flex-shrink-0 backdrop-blur-xl h-64 lg:h-full">
        <div className="border-b border-white/[0.05] pb-3 mb-2 flex items-center justify-between">
          <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">Live Chat & Reactions</span>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2.5 my-2 max-h-48 lg:max-h-none">
          {gameMessages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center py-8">
              <span className="text-[10px] text-white/30 font-light">Say something cute or react during the game!</span>
            </div>
          ) : (
            gameMessages.map((msg) => {
              const isMe = msg.senderId === userInfo?.id || msg.senderId === 'self'
              const isSystem = msg.senderId === 'system'
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`px-3 py-2 rounded-2xl max-w-[85%] text-xs break-words leading-relaxed ${
                      isSystem
                        ? 'bg-white/5 text-white/40 text-center italic border border-white/5 text-[9px]'
                        : isMe
                          ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-br-none'
                          : 'bg-white/10 text-white/90 rounded-bl-none border border-white/5'
                    }`}
                  >
                    {msg.text}
                  </div>
                  {/* Reaction badge for game_event messages that have a server _id */}
                  {msg.eventMessageId && (
                    <div className="flex items-center gap-1 mt-0.5 px-1">
                      {(gameEventReactions[msg.eventMessageId] || [])
                        .reduce((acc: { emoji: string; count: number }[], r) => {
                          const ex = acc.find((a) => a.emoji === r.emoji)
                          if (ex) ex.count++
                          else acc.push({ emoji: r.emoji, count: 1 })
                          return acc
                        }, [])
                        .map(({ emoji, count }) => (
                          <button
                            key={emoji}
                            onClick={() => handleGameEventReaction(msg.eventMessageId!, emoji)}
                            className="flex items-center gap-0.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full px-1.5 py-0.5 text-[9px] transition-all"
                          >
                            {emoji} {count > 1 && <span className="text-white/60">{count}</span>}
                          </button>
                        ))}
                      <button
                        onClick={() => setActiveGameReactionPicker(activeGameReactionPicker === msg.eventMessageId ? null : msg.eventMessageId!)}
                        className="p-0.5 text-white/30 hover:text-white/70 transition-colors"
                      >
                        <FiSmile className="text-[10px]" />
                      </button>
                      {activeGameReactionPicker === msg.eventMessageId && (
                        <div className="flex gap-1 bg-black/80 border border-white/10 rounded-xl px-2 py-1 shadow-xl z-50">
                          {['❤️', '😂', '😮', '🔥', '🎉', '👏'].map((em) => (
                            <button key={em} onClick={() => handleGameEventReaction(msg.eventMessageId!, em)} className="hover:scale-125 transition-transform text-sm">
                              {em}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <span className="text-[8px] text-white/30 mt-0.5 px-1">{msg.time}</span>
                </div>
              )
            })
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="space-y-2 mt-auto">
          <div className="flex items-center justify-around bg-white/[0.02] border border-white/[0.05] rounded-xl py-1 px-1.5">
            {['❤️', '😂', '😮', '😢', '🎉', '🔥'].map((emoji) => (
              <button key={emoji} onClick={() => triggerReaction(emoji)} className="hover:scale-125 hover:-translate-y-0.5 active:scale-95 transition-all p-1 text-sm select-none">
                {emoji}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="Type message..."
              value={miniChatInput}
              onChange={(e) => setMiniChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendGameMessage()}
              className="flex-1 bg-white/[0.03] border border-white/[0.08] text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-white/20"
            />
            <button
              onClick={handleSendGameMessage}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md flex-shrink-0"
              title="Send message"
            >
              <FiSend className="text-xs" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameRoom
