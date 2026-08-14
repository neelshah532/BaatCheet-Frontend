export interface GameRoomProps {
  onClose: () => void
}

export interface GameStateSync {
  gameType: string
  activeGame?: 'selection' | 'would-you-rather' | 'truth-or-dare' | 'tic-tac-toe' | 'chess' | 'chess-puzzle' | 'connect-four' | 'sliding-puzzle'
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

export interface Player {
  userId: string
  color: string
  connectionStatus: 'connected' | 'disconnected'
}

export interface GameSessionState {
  _id: string
  gameType: string
  conversationId: string
  players: Player[]
  status: 'waiting' | 'active' | 'paused' | 'completed' | 'abandoned'
  currentTurn: string
  timeControl?: { initialSeconds: number; incrementSeconds: number }
  clocks?: Record<string, { remainingMs: number; lastMoveTimestamp: Date | string | null }>
  moveHistory?: { playerId: string; action: string; resultingState: string }[]
  state: {
    fen?: string
    grid?: (string | null)[][]
    tiles?: number[]
    moveCount?: number
  }
  result?: {
    winnerId: string | null
    reason: string
  }
}

export interface ChatMessage {
  id: string
  senderId: string
  text: string
  time: string
  eventMessageId?: string
}

export interface FloatingEmoji {
  id: number
  emoji: string
  x: number
}
