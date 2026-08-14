import SimplePeer from 'simple-peer'
import { Socket } from 'socket.io-client'

type PeerConnectionsMap = {
  [userId: string]: SimplePeer.Instance
}

const defaultIceServers = [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478' }]

class WebRTCService {
  private peerConnections: PeerConnectionsMap = {}
  private socket: Socket | null = null
  private localStream: MediaStream | null = null
  private roomId: string | null = null
  private userId: string | null = null
  private isInitialized = false

  // Queue signals that arrive before the peer is created
  private signalQueue: { from: string; signal: SimplePeer.SignalData }[] = []

  private onStreamCallback: ((userId: string, stream: MediaStream) => void) | null = null
  private onPeerDisconnectCallback: ((userId: string) => void) | null = null

  private iceServers: RTCIceServer[] = defaultIceServers

  setOnStreamCallback(callback: (userId: string, stream: MediaStream) => void) {
    this.onStreamCallback = callback
  }

  setOnPeerDisconnectCallback(callback: (userId: string) => void) {
    this.onPeerDisconnectCallback = callback
  }

  initialize(socket: Socket, userId: string, localStream: MediaStream, roomId: string, customIceServers?: RTCIceServer[]) {
    if (customIceServers && customIceServers.length > 0) {
      this.iceServers = customIceServers
    }

    if (this.isInitialized && this.roomId === roomId) {
      // Just update callbacks if re-initializing same session
      return
    }
    // Clean up previous session if any
    this.cleanup(false)

    this.socket = socket
    this.userId = userId
    this.localStream = localStream
    this.roomId = roomId
    this.isInitialized = true
    this.signalQueue = []

    this.registerSocketListeners()
  }

  private registerSocketListeners() {
    if (!this.socket) return

    // Remove stale listeners first
    this.socket.off('webrtc-signal')

    this.socket.on('webrtc-signal', ({ from, signal }: { from: string; signal: SimplePeer.SignalData }) => {
      this.handleSignal(from, signal)
    })
  }

  private handleSignal(from: string, signal: SimplePeer.SignalData) {
    let peer = this.peerConnections[from]

    if (!peer) {
      if (!this.localStream) {
        // Stream not ready yet — queue the signal
        console.warn(`[WebRTC] No local stream yet, queuing signal from ${from}`)
        this.signalQueue.push({ from, signal })
        return
      }
      peer = this.createPeer(false, from)
    }

    try {
      peer.signal(signal)
    } catch (err) {
      console.error(`[WebRTC] Error signaling peer ${from}:`, err)
    }
  }

  private createPeer(initiator: boolean, remoteUserId: string): SimplePeer.Instance {
    console.log(`[WebRTC Diagnostic] Creating peer for ${remoteUserId} (initiator: ${initiator})`)
    if (this.localStream) {
      console.log('[WebRTC Diagnostic] LOCAL MEDIA TRACKS:', {
        audio: this.localStream.getAudioTracks().map((t) => ({ id: t.id, readyState: t.readyState, enabled: t.enabled })),
        video: this.localStream.getVideoTracks().map((t) => ({ id: t.id, readyState: t.readyState, enabled: t.enabled })),
      })
    }

    const peer = new SimplePeer({
      initiator,
      trickle: true,
      stream: this.localStream!,
      config: { iceServers: this.iceServers },
    })

    this.peerConnections[remoteUserId] = peer

    // Add state change listeners on underlying RTCPeerConnection for diagnostics
    const pc = (peer as unknown as { _pc: RTCPeerConnection })._pc
    if (pc) {
      pc.onsignalingstatechange = () => console.log(`[WebRTC Diagnostic] Peer ${remoteUserId} signalingState:`, pc.signalingState)
      pc.onicegatheringstatechange = () => console.log(`[WebRTC Diagnostic] Peer ${remoteUserId} iceGatheringState:`, pc.iceGatheringState)
      pc.oniceconnectionstatechange = () => console.log(`[WebRTC Diagnostic] Peer ${remoteUserId} iceConnectionState:`, pc.iceConnectionState)
      pc.onconnectionstatechange = () => console.log(`[WebRTC Diagnostic] Peer ${remoteUserId} connectionState:`, pc.connectionState)
    }

    peer.on('stream', (stream: MediaStream) => {
      console.log(`[WebRTC Diagnostic] REMOTE STREAM RECEIVED from ${remoteUserId}:`, {
        streamId: stream.id,
        tracks: stream.getTracks().map((t) => ({ kind: t.kind, id: t.id, readyState: t.readyState, enabled: t.enabled })),
      })
      if (this.onStreamCallback) this.onStreamCallback(remoteUserId, stream)
    })

    peer.on('track', (track: MediaStreamTrack, stream: MediaStream) => {
      console.log(`[WebRTC Diagnostic] REMOTE TRACK RECEIVED from ${remoteUserId}:`, {
        kind: track.kind,
        id: track.id,
        readyState: track.readyState,
        enabled: track.enabled,
        streamId: stream.id,
      })
      if (this.onStreamCallback) this.onStreamCallback(remoteUserId, stream)
    })

    peer.on('signal', (data: SimplePeer.SignalData) => {
      if (this.socket) {
        this.socket.emit('webrtc-signal', {
          to: remoteUserId,
          from: this.userId,
          signal: data,
          roomId: this.roomId,
        })
      }
    })

    peer.on('connect', () => {
      console.log(`[WebRTC Diagnostic] Peer connection ESTABLISHED with ${remoteUserId}`)
    })

    peer.on('close', () => {
      console.log(`[WebRTC Diagnostic] Peer connection CLOSED with ${remoteUserId}`)
      this.removePeer(remoteUserId)
    })

    peer.on('error', (err: Error) => {
      console.error(`[WebRTC Diagnostic] Peer ${remoteUserId} error:`, err)
    })

    return peer
  }

  /**
   * Called by the call initiator when the other user joins the room.
   */
  connectToPeer(remoteUserId: string) {
    if (this.peerConnections[remoteUserId]) {
      console.warn(`[WebRTC] Already connected to ${remoteUserId}`)
      return
    }
    if (!this.localStream) {
      console.error('[WebRTC] No local stream — cannot initiate peer')
      return
    }
    this.createPeer(true, remoteUserId)
  }

  /**
   * Called after localStream is ready to flush any queued signals
   * (race: signal arrives before stream is ready)
   */
  flushSignalQueue() {
    while (this.signalQueue.length > 0) {
      const { from, signal } = this.signalQueue.shift()!
      this.handleSignal(from, signal)
    }
  }

  /** Toggle audio mute — track.enabled does NOT renegotiate, just mutes locally */
  toggleAudio(enabled: boolean) {
    this.localStream?.getAudioTracks().forEach((t) => {
      t.enabled = enabled
    })
  }

  /**
   * Toggle video.
   * - If video track exists: enable/disable it (no renegotiation needed).
   * - If no video track: acquire camera and add via RTCPeerConnection.addTrack
   *   which triggers automatic renegotiation in modern browsers.
   */
  async toggleVideo(enabled: boolean): Promise<void> {
    if (!this.localStream) return

    const existingTracks = this.localStream.getVideoTracks()

    if (existingTracks.length > 0) {
      existingTracks.forEach((t) => {
        t.enabled = enabled
      })
      // Sync the sender's track enabled state on each peer
      Object.values(this.peerConnections).forEach((peer) => {
        const pc = (peer as unknown as { _pc: RTCPeerConnection })._pc
        if (!pc) return
        pc.getSenders().forEach((s) => {
          if (s.track?.kind === 'video') s.track.enabled = enabled
        })
      })
    } else if (enabled) {
      const camStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      const newTrack = camStream.getVideoTracks()[0]
      if (!newTrack) return

      this.localStream.addTrack(newTrack)

      await Promise.all(
        Object.values(this.peerConnections).map(async (peer) => {
          const pc = (peer as unknown as { _pc: RTCPeerConnection })._pc
          if (!pc) return
          try {
            pc.addTrack(newTrack, this.localStream!)
          } catch (e) {
            console.error('[WebRTC] addTrack failed:', e)
          }
        })
      )
      console.log('[WebRTC] Video track added to all peers')
    }
  }

  removePeer(userId: string) {
    const peer = this.peerConnections[userId]
    if (peer) {
      try {
        peer.destroy()
      } catch {
        // peer may already be closed
      }
      delete this.peerConnections[userId]
      this.onPeerDisconnectCallback?.(userId)
    }
  }

  cleanup(stopTracks = true) {
    if (this.socket) {
      this.socket.off('webrtc-signal')
    }

    Object.keys(this.peerConnections).forEach((uid) => {
      try {
        this.peerConnections[uid].destroy()
      } catch {
        // peer may already be closed
      }
    })
    this.peerConnections = {}
    this.signalQueue = []

    if (stopTracks && this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop())
    }

    this.localStream = null
    this.roomId = null
    this.isInitialized = false
    console.log('[WebRTC] Cleaned up')
  }
}

export const webRTCService = new WebRTCService()
export default webRTCService
