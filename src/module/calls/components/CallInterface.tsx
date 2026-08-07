import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../../../store/store'
import { useSocket } from '../../../hook/socketContext'
import { CallUser } from '../../../types'
import VideoView from './VideoView'
import CallControls from './CallControls'
import webRTCService from '../../../services/webrtc'

const CallInterface = () => {
  const { isInCall, callType, localStream, activeCallId, userInfo, callUsers, isCallInitiator, addCallUser, removeCallUser, updateCallUser, setLocalStream } = useAppStore()
  const socket = useSocket()
  const [isConnecting, setIsConnecting] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseMove = useCallback(() => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3500)
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    handleMouseMove()
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    }
  }, [handleMouseMove])

  const handleRemoteStream = useCallback(
    (userId: string, stream: MediaStream) => {
      console.log(`Received remote WebRTC stream for user: ${userId}`)
      updateCallUser(userId, {
        stream,
        video: stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled,
        audio: stream.getAudioTracks().length > 0 && stream.getAudioTracks()[0].enabled,
      })
    },
    [updateCallUser]
  )

  const handlePeerDisconnect = useCallback(
    (userId: string) => {
      removeCallUser(userId)
    },
    [removeCallUser]
  )

  useEffect(() => {
    if (!isInCall || !socket || !userInfo || !localStream || !activeCallId) return

    webRTCService.initialize(socket, userInfo.id)
    webRTCService.setOnStreamCallback(handleRemoteStream)
    webRTCService.setOnPeerDisconnectCallback(handlePeerDisconnect)

    if (isCallInitiator) {
      setIsConnecting(false)
    } else {
      webRTCService.joinCall(activeCallId, localStream)
      setIsConnecting(false)
    }

    socket.on('user-joined-call', ({ user, userId }) => {
      const remoteUser = user || { id: userId, firstName: 'User' }
      if (remoteUser.id && userInfo && remoteUser.id !== userInfo.id) {
        addCallUser({
          id: remoteUser.id,
          firstName: remoteUser.firstName || 'User',
          lastName: remoteUser.lastName || '',
          email: remoteUser.email || '',
          image: remoteUser.image,
          color: remoteUser.color || 0,
          audio: true,
          video: callType === 'video',
        })

        if (localStream && activeCallId) {
          console.log(`Initiating WebRTC peer connection to ${remoteUser.id}`)
          webRTCService.startCall([remoteUser.id], localStream, activeCallId).catch((err) => console.error('Failed WebRTC peer connection:', err))
        }
      }
    })

    socket.on('user-left-call', ({ userId }) => removeCallUser(userId))
    socket.on('user-media-toggle', ({ userId, type, enabled }) => {
      if (userId !== userInfo.id) {
        updateCallUser(userId, { [type]: enabled })
      }
    })

    return () => {
      webRTCService.leaveCall()
      socket.off('user-joined-call')
      socket.off('user-left-call')
      socket.off('user-media-toggle')
    }
  }, [isInCall, socket, userInfo, localStream, activeCallId, isCallInitiator, addCallUser, removeCallUser, updateCallUser, callType, handleRemoteStream, handlePeerDisconnect])

  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop())
        setLocalStream(null)
      }
    }
  }, [localStream, setLocalStream])

  if (!isInCall || !activeCallId) return null

  const hasVideoTrack = !!(localStream && localStream.getVideoTracks().length > 0 && localStream.getVideoTracks()[0].enabled)

  const selfUser: CallUser = {
    id: userInfo?.id || 'self',
    firstName: userInfo?.firstName || 'You',
    lastName: userInfo?.lastName || '',
    email: userInfo?.email || '',
    image: userInfo?.userImage,
    color: userInfo?.color || 0,
    stream: localStream,
    audio: localStream?.getAudioTracks()[0]?.enabled ?? false,
    video: hasVideoTrack,
  }

  const isGroupCall = callUsers.length > 1
  const isAudioOnly = callType === 'audio'

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black overflow-hidden flex flex-col font-sans">
        {isConnecting ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-50">
            <motion.div
              className="w-20 h-20 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            />
            <motion.p
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ repeat: Infinity, duration: 1.5, repeatType: 'reverse' }}
              className="text-white/80 mt-8 text-lg font-light tracking-widest uppercase"
            >
              Connecting securely
            </motion.p>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            {isGroupCall ? (
              <div className="w-full h-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 lg:p-8 auto-rows-fr">
                <VideoView user={selfUser} isSelf={true} size="medium" isAudioOnly={isAudioOnly} />
                {callUsers.map((user) => (
                  <VideoView key={user.id} user={user} size="medium" isAudioOnly={isAudioOnly} />
                ))}
              </div>
            ) : (
              <div className="w-full h-full relative">
                {callUsers.length > 0 ? (
                  <VideoView user={callUsers[0]} size="full" isAudioOnly={isAudioOnly} />
                ) : (
                  <VideoView user={selfUser} isSelf={true} size="full" isAudioOnly={isAudioOnly} />
                )}

                {callUsers.length > 0 && (
                  <motion.div
                    className="absolute top-6 right-6 z-40 cursor-move"
                    drag
                    dragConstraints={{ left: -1000, right: 0, top: 0, bottom: 800 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <VideoView user={selfUser} isSelf={true} size="small" isAudioOnly={isAudioOnly} />
                  </motion.div>
                )}
              </div>
            )}

            <AnimatePresence>
              {(showControls || isAudioOnly) && (
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="absolute bottom-10 left-0 right-0 flex justify-center z-50 pointer-events-none"
                >
                  <div className="pointer-events-auto">
                    <CallControls />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default CallInterface
