import SimplePeer from 'simple-peer'
import { Socket } from 'socket.io-client'
import { toast } from 'sonner'

type PeerConnectionsMap = {
  [userId: string]: SimplePeer.Instance
}

class WebRTCService {
  private peerConnections: PeerConnectionsMap = {}
  private socket: Socket | null = null
  private localStream: MediaStream | null = null
  private roomId: string | null = null
  private userId: string | null = null

  constructor() {
    this.peerConnections = {}
  }

  initialize(socket: Socket, userId: string) {
    this.socket = socket
    this.userId = userId

    this.setupSocketListeners()
  }

  private setupSocketListeners() {
    if (!this.socket) return

    // Unified WebRTC signaling event (offers, answers, ICE candidates)
    this.socket.on('webrtc-signal', ({ from, signal }) => {
      console.log(`Received WebRTC signal from ${from}`)
      let peer = this.peerConnections[from]

      // If receiving signal (e.g., offer) from peer and connection doesn't exist yet
      if (!peer && this.localStream) {
        console.log(`Creating non-initiator peer for ${from}`)
        peer = new SimplePeer({
          initiator: false,
          trickle: true,
          stream: this.localStream,
        })

        this.peerConnections[from] = peer
        this.setupPeerEvents(peer, from)
      }

      if (peer) {
        try {
          peer.signal(signal)
        } catch (err) {
          console.error(`Error signaling peer ${from}:`, err)
        }
      }
    })

    // When a user disconnects or leaves
    this.socket.on('user-disconnected', ({ userId }) => {
      this.removePeer(userId)
    })

    this.socket.on('user-left-call', ({ userId }) => {
      this.removePeer(userId)
    })
  }

  private setupPeerEvents(peer: SimplePeer.Instance, remoteUserId: string) {
    // When remote stream arrives
    peer.on('stream', (stream) => {
      console.log(`WebRTC stream received from ${remoteUserId}`)
      if (this.onStreamCallback) {
        this.onStreamCallback(remoteUserId, stream)
      }
    })

    // Emit ALL signals (offer, answer, ICE candidates) to target peer
    peer.on('signal', (data) => {
      if (this.socket) {
        this.socket.emit('webrtc-signal', {
          to: remoteUserId,
          from: this.userId,
          signal: data,
          roomId: this.roomId,
        })
      }
    })

    peer.on('close', () => {
      console.log(`Connection with ${remoteUserId} closed`)
      this.removePeer(remoteUserId)
    })

    peer.on('error', (err) => {
      console.error(`Error in connection with ${remoteUserId}:`, err)
      this.removePeer(remoteUserId)
    })
  }

  private onStreamCallback: ((userId: string, stream: MediaStream) => void) | null = null
  private onPeerDisconnectCallback: ((userId: string) => void) | null = null

  setOnStreamCallback(callback: (userId: string, stream: MediaStream) => void) {
    this.onStreamCallback = callback
  }

  setOnPeerDisconnectCallback(callback: (userId: string) => void) {
    this.onPeerDisconnectCallback = callback
  }

  // Start call with users (initiator)
  startCall(userIds: string[], localStream: MediaStream, roomId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.userId) {
        reject('Socket or user ID not available')
        return
      }

      this.localStream = localStream
      this.roomId = roomId

      userIds.forEach((remoteUserId) => {
        if (!this.peerConnections[remoteUserId]) {
          try {
            console.log(`Creating initiator peer for ${remoteUserId}`)
            const peer = new SimplePeer({
              initiator: true,
              trickle: true,
              stream: localStream,
            })

            this.peerConnections[remoteUserId] = peer
            this.setupPeerEvents(peer, remoteUserId)
          } catch (error) {
            console.error(`Error creating peer for ${remoteUserId}:`, error)
          }
        }
      })

      resolve()
    })
  }

  // Join call (non-initiator)
  joinCall(roomId: string, localStream: MediaStream): void {
    if (!this.socket || !this.userId) {
      toast.error('Socket or user ID not available')
      return
    }

    this.localStream = localStream
    this.roomId = roomId
  }

  leaveCall(): void {
    if (!this.socket || !this.roomId) return

    Object.keys(this.peerConnections).forEach(this.removePeer.bind(this))

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop())
      this.localStream = null
    }

    this.roomId = null
    this.peerConnections = {}
  }

  removePeer(userId: string): void {
    const peer = this.peerConnections[userId]
    if (peer) {
      peer.destroy()
      delete this.peerConnections[userId]

      if (this.onPeerDisconnectCallback) {
        this.onPeerDisconnectCallback(userId)
      }
    }
  }

  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled
      })
    }
  }

  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled
      })
    }
  }
}

export const webRTCService = new WebRTCService()
export default webRTCService
