export const playSoundCue = (type: 'move' | 'capture' | 'castle' | 'check' | 'end') => {
  if (typeof window === 'undefined') return
  if (localStorage.getItem('chess_muted') === 'true') return

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    const now = ctx.currentTime

    if (type === 'move') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.08)
      gain.gain.setValueAtTime(0.3, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08)
      osc.start(now)
      osc.stop(now + 0.08)
    } else if (type === 'capture') {
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(260, now)
      osc.frequency.exponentialRampToValueAtTime(130, now + 0.12)
      gain.gain.setValueAtTime(0.5, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12)
      osc.start(now)
      osc.stop(now + 0.12)
    } else if (type === 'castle') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(523.25, now)
      osc.frequency.setValueAtTime(659.25, now + 0.08)
      gain.gain.setValueAtTime(0.3, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16)
      osc.start(now)
      osc.stop(now + 0.16)
    } else if (type === 'check') {
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(880, now)
      osc.frequency.setValueAtTime(440, now + 0.1)
      gain.gain.setValueAtTime(0.25, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
      osc.start(now)
      osc.stop(now + 0.2)
    } else if (type === 'end') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(523.25, now)
      osc.frequency.setValueAtTime(659.25, now + 0.12)
      osc.frequency.setValueAtTime(783.99, now + 0.24)
      gain.gain.setValueAtTime(0.4, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4)
      osc.start(now)
      osc.stop(now + 0.4)
    }
  } catch {
    // Autoplay fail-safe
  }
}

export const getCapturedPieces = (fen: string) => {
  const defaultCount: Record<string, number> = { p: 8, n: 2, b: 2, r: 2, q: 1, P: 8, N: 2, B: 2, R: 2, Q: 1 }
  const currentCount: Record<string, number> = { p: 0, n: 0, b: 0, r: 0, q: 0, P: 0, N: 0, B: 0, R: 0, Q: 0 }

  const boardPart = fen.split(' ')[0]
  for (const char of boardPart) {
    if (currentCount[char] !== undefined) {
      currentCount[char]++
    }
  }

  const capturedByWhite: string[] = []
  const capturedByBlack: string[] = []

  const pieceTypes = ['p', 'n', 'b', 'r', 'q']
  pieceTypes.forEach((p) => {
    const missingBlack = (defaultCount[p] || 0) - (currentCount[p] || 0)
    for (let i = 0; i < missingBlack; i++) capturedByWhite.push(p)

    const P = p.toUpperCase()
    const missingWhite = (defaultCount[P] || 0) - (currentCount[P] || 0)
    for (let i = 0; i < missingWhite; i++) capturedByBlack.push(P)
  })

  const pieceValues: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, P: 1, N: 3, B: 3, R: 5, Q: 9 }
  const whiteVal = capturedByWhite.reduce((sum, p) => sum + (pieceValues[p] || 0), 0)
  const blackVal = capturedByBlack.reduce((sum, p) => sum + (pieceValues[p] || 0), 0)

  return {
    capturedByWhite,
    capturedByBlack,
    whiteAdvantage: whiteVal - blackVal,
    blackAdvantage: blackVal - whiteVal,
  }
}

export const formatClockTime = (ms: number) => {
  if (ms <= 0) return '0:00'
  const totalSecs = Math.floor(ms / 1000)
  const mins = Math.floor(totalSecs / 60)
  const secs = totalSecs % 60
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}
