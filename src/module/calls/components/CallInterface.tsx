import { useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../../../store/store'
import { useSocket } from '../../../hook/socketContext'
import { CallUser } from '../../../types'
import VideoView from './VideoView'
import CallControls from './CallControls'
import webRTCService from '../../../services/webrtc'

const CallInterface = () => {
  const { isInCall, callType, localStream, activeCallId, userInfo, callUsers, isCallInitiator, addCallUser, removeCallUser, updateCallUser } = useAppStore()
  const socket = useSocket()

  // Always-fresh refs so callbacks never close over stale values
  const localStreamRef = useRef<MediaStream | null>(null)
  const isCallInitiatorRef = useRef(isCallInitiator)
  const callTypeRef = useRef(callType)
  const userIdRef = useRef(userInfo?.id)

  localStreamRef.current = localStream
  isCallInitiatorRef.current = isCallInitiator
  callTypeRef.current = callType
  userIdRef.current = userInfo?.id

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
      return
    }

    webrtcInitialized.current = true
    webRTCService.initialize(socket, userInfo.id, localStream, activeCallId)
    webRTCService.setOnStreamCallback(handleRemoteStream)
    webRTCService.setOnPeerDisconnectCallback(handlePeerDisconnect)
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
