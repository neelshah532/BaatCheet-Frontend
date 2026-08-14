import { useEffect, useRef, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../../../store/store'
import { useSocket } from '../../../hook/socketContext'
import { CallUser } from '../../../types'
import VideoView from './VideoView'
import CallControls from './CallControls'
import webRTCService from '../../../services/webrtc'
import { FiLoader, FiAlertCircle, FiRefreshCw, FiX } from 'react-icons/fi'

const CallInterface = () => {
  const { isInCall, callType, localStream, activeCallId, userInfo, callUsers, isCallInitiator, addCallUser, removeCallUser, updateCallUser } = useAppStore()
  const socket = useSocket()
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'slow' | 'connected' | 'failed'>('connecting')

  // Always-fresh refs so callbacks never close over stale values
  const localStreamRef = useRef<MediaStream | null>(null)
  const isCallInitiatorRef = useRef(isCallInitiator)
  const callTypeRef = useRef(callType)
  const userIdRef = useRef(userInfo?.id)

  localStreamRef.current = localStream
  isCallInitiatorRef.current = isCallInitiator
  callTypeRef.current = callType
  userIdRef.current = userInfo?.id

  // Monitor connection state & manage 15s warning & 45s hard timeout
  useEffect(() => {
    if (!isInCall || callUsers.length === 0) {
      setConnectionStatus('connecting')
      return
    }

    const allConnected = callUsers.every((u) => u.connectionState === 'connected' || (u.stream && u.stream.getAudioTracks().length > 0))

    if (allConnected) {
      setConnectionStatus('connected')
      return
    }

    const anyFailed = callUsers.some((u) => u.connectionState === 'failed')
    if (anyFailed) {
      setConnectionStatus('failed')
      return
    }

    const slowTimer = setTimeout(() => {
      setConnectionStatus((prev) => (prev === 'connecting' ? 'slow' : prev))
    }, 15000)

    const hardTimeoutTimer = setTimeout(() => {
      setConnectionStatus((prev) => (prev !== 'connected' ? 'failed' : prev))
    }, 45000)

    return () => {
      clearTimeout(slowTimer)
      clearTimeout(hardTimeoutTimer)
    }
  }, [isInCall, callUsers])

  const handleRetryCall = () => {
    setConnectionStatus('connecting')
    if (localStream && socket && activeCallId && userInfo) {
      webRTCService.cleanup(false)
      webRTCService.initialize(socket, userInfo.id, localStream, activeCallId)
      callUsers.forEach((user) => {
        webRTCService.connectToPeer(user.id)
      })
    }
  }

  const handleCancelCall = () => {
    if (socket && activeCallId) {
      socket.emit('end-call', { roomId: activeCallId })
    }
    useAppStore.getState().endCall()
  }

  const handleRemoteStream = useCallback(
    (userId: string, stream: MediaStream) => {
      console.log(`[WebRTC Diagnostic] handleRemoteStream called for ${userId}`, {
        audioTracks: stream.getAudioTracks().length,
        videoTracks: stream.getVideoTracks().length,
      })
      updateCallUser(userId, {
        stream,
        video: stream.getVideoTracks().some((t) => t.enabled && t.readyState === 'live'),
        audio: stream.getAudioTracks().some((t) => t.enabled),
      })
    },
    [updateCallUser]
  )

  const handlePeerDisconnect = useCallback((userId: string) => removeCallUser(userId), [removeCallUser])

  const handleConnectionState = useCallback(
    (userId: string, state: string) => {
      updateCallUser(userId, { connectionState: state as CallUser['connectionState'] })
    },
    [updateCallUser]
  )

  // ─── WebRTC Init ─────────────────────────────────────────────────────────────
  // Runs once when all prerequisites are available (isInCall + localStream + activeCallId).
  // Uses a ref so that when activeCallId changes (caller: temp→real roomId),
  // this effect does NOT re-run and destroy the WebRTC session.
  const webrtcInitialized = useRef(false)

  useEffect(() => {
    // Wait until we have EVERYTHING needed — especially activeCallId (real roomId from server)
    if (!isInCall || !socket || !userInfo || !activeCallId || !localStream) return

    // Init only once per call session
    if (webrtcInitialized.current) {
      // Update callbacks in case references changed — no peer teardown
      webRTCService.setOnStreamCallback(handleRemoteStream)
      webRTCService.setOnPeerDisconnectCallback(handlePeerDisconnect)
      webRTCService.setOnConnectionStateCallback(handleConnectionState)
      return
    }

    webrtcInitialized.current = true
    webRTCService.initialize(socket, userInfo.id, localStream, activeCallId)
    webRTCService.setOnStreamCallback(handleRemoteStream)
    webRTCService.setOnPeerDisconnectCallback(handlePeerDisconnect)
    webRTCService.setOnConnectionStateCallback(handleConnectionState)
    // Drain signals that arrived during state transition
    webRTCService.flushSignalQueue()
  })

  // ─── Socket Events ────────────────────────────────────────────────────────────
  // Registered ONCE when call goes live, cleaned up on call end.
  // Does NOT include localStream or activeCallId in deps — those are read via refs.
  useEffect(() => {
    if (!isInCall || !socket || !userInfo) return

    const onUserJoinedCall = ({ user, userId }: { user?: Partial<CallUser>; userId?: string }) => {
      const remoteId = user?.id || userId
      if (!remoteId || remoteId === userIdRef.current) return

      addCallUser({
        id: remoteId,
        firstName: user?.firstName || 'User',
        lastName: user?.lastName || '',
        email: user?.email || '',
        image: user?.image,
        color: user?.color || 0,
        audio: true,
        video: callTypeRef.current === 'video',
      })

      // Deterministic mesh topology initiation:
      // Initiator creates offer to everyone. Between non-initiator peers (e.g. B & C in a 3+ group call),
      // the peer with the lexicographically higher userId initiates to prevent dual-offer collisions.
      const shouldInitiate = isCallInitiatorRef.current || (userInfo?.id && userInfo.id > remoteId)
      if (shouldInitiate) {
        setTimeout(() => webRTCService.connectToPeer(remoteId), 100)
      }
    }

    const onUserLeftCall = ({ userId }: { userId: string }) => removeCallUser(userId)

    const onUserMediaToggle = ({ userId, type, enabled }: { userId: string; type: 'audio' | 'video'; enabled: boolean }) => {
      if (userId !== userIdRef.current) {
        updateCallUser(userId, { [type]: enabled })
      }
    }

    socket.on('user-joined-call', onUserJoinedCall)
    socket.on('user-left-call', onUserLeftCall)
    socket.on('user-media-toggle', onUserMediaToggle)

    return () => {
      socket.off('user-joined-call', onUserJoinedCall)
      socket.off('user-left-call', onUserLeftCall)
      socket.off('user-media-toggle', onUserMediaToggle)
      // Tear down WebRTC when the call truly ends
      webRTCService.cleanup()
      webrtcInitialized.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInCall, socket, userInfo?.id])

  if (!isInCall || !activeCallId) return null

  const hasLiveVideo = localStream?.getVideoTracks().some((t) => t.enabled && t.readyState === 'live') ?? false

  const selfUser: CallUser = {
    id: userInfo?.id || 'self',
    firstName: userInfo?.firstName || 'You',
    lastName: userInfo?.lastName || '',
    email: userInfo?.email || '',
    image: userInfo?.userImage,
    color: userInfo?.color || 0,
    stream: localStream,
    audio: localStream?.getAudioTracks()[0]?.enabled ?? true,
    video: hasLiveVideo,
  }

  const isGroupCall = callUsers.length > 1
  const isAudioOnlyMode = (callType === 'audio' || !callType) && !hasLiveVideo

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black overflow-hidden flex flex-col font-sans">
        <div className="relative w-full h-full flex items-center justify-center">
          {isGroupCall ? (
            <div className="w-full h-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 lg:p-8 auto-rows-fr">
              <VideoView user={selfUser} isSelf={true} size="medium" />
              {callUsers.map((user) => (
                <VideoView key={user.id} user={user} size="medium" />
              ))}
            </div>
          ) : (
            <div className="w-full h-full relative">
              {callUsers.length > 0 ? <VideoView user={callUsers[0]} size="full" /> : <VideoView user={selfUser} isSelf={true} size="full" />}

              {callUsers.length > 0 && (
                <motion.div
                  className="absolute top-6 right-6 z-40 cursor-move"
                  drag
                  dragConstraints={{ left: -1000, right: 0, top: 0, bottom: 800 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <VideoView user={selfUser} isSelf={true} size="small" />
                </motion.div>
              )}
            </div>
          )}

          {/* Connection Status Overlay Card (Connecting / Slow / Failed) */}
          {callUsers.length > 0 && connectionStatus !== 'connected' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute z-50 flex flex-col items-center justify-center p-6 rounded-3xl bg-[#0F1015]/90 border border-indigo-500/30 backdrop-blur-2xl shadow-[0_24px_64px_rgba(0,0,0,0.9)] max-w-sm w-[90%] text-center text-white"
            >
              {connectionStatus === 'connecting' && (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 text-2xl mb-3 relative">
                    <FiLoader className="animate-spin" />
                  </div>
                  <h3 className="text-base font-semibold text-white">Connecting Call</h3>
                  <p className="text-xs text-white/60 font-light mt-1">Establishing encrypted WebRTC connection...</p>
                </>
              )}

              {connectionStatus === 'slow' && (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-2xl mb-3 relative">
                    <FiLoader className="animate-spin" />
                  </div>
                  <h3 className="text-base font-semibold text-white">Having Trouble Connecting...</h3>
                  <p className="text-xs text-white/60 font-light mt-1">Traversing NAT firewalls across networks. Please wait a moment...</p>
                </>
              )}

              {connectionStatus === 'failed' && (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 text-2xl mb-3">
                    <FiAlertCircle />
                  </div>
                  <h3 className="text-base font-semibold text-white">Connection Failed</h3>
                  <p className="text-xs text-white/60 font-light mt-1">Unable to establish media stream across network firewalls.</p>

                  <div className="flex items-center gap-3 mt-5 w-full">
                    <button
                      onClick={handleRetryCall}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                    >
                      <FiRefreshCw className="text-sm" /> Retry Call
                    </button>
                    <button
                      onClick={handleCancelCall}
                      className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/10 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                    >
                      <FiX className="text-sm" /> Cancel
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className={`absolute bottom-10 left-0 right-0 flex justify-center z-50 ${isAudioOnlyMode ? '' : 'pointer-events-auto'}`}
          >
            <div className="pointer-events-auto">
              <CallControls />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default CallInterface
