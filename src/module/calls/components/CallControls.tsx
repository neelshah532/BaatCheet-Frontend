import { useEffect, useRef, useState } from 'react'
import { FaMicrophone, FaMicrophoneSlash, FaPhoneSlash, FaVideo, FaVideoSlash } from 'react-icons/fa'
import { useAppStore } from '../../../store/store'
import { useSocket } from '../../../hook/socketContext'
import { motion } from 'framer-motion'

interface CallControlsProps {
  containerClassName?: string
  buttonClassName?: string
}

const CallControls = ({
  containerClassName = 'flex justify-center space-x-6 px-8 py-4 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl',
  buttonClassName = 'w-14 h-14 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-lg relative',
}: CallControlsProps) => {
  const { toggleAudio, toggleVideo, endCall, localStream, activeCallId } = useAppStore()
  const socket = useSocket()
  const isVideoToggling = useRef(false)

  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)

  // Sync button state whenever localStream changes or tracks are added/removed
  useEffect(() => {
    if (!localStream) {
      setIsAudioEnabled(true)
      setIsVideoEnabled(false)
      return
    }

    const syncTracks = () => {
      const audioTrack = localStream.getAudioTracks()[0]
      const videoTracks = localStream.getVideoTracks()
      const activeVideoTrack = videoTracks.find((t) => t.readyState === 'live')

      setIsAudioEnabled(audioTrack ? audioTrack.enabled : true)
      setIsVideoEnabled(!!(activeVideoTrack && activeVideoTrack.enabled))
    }

    syncTracks()

    localStream.addEventListener('addtrack', syncTracks)
    localStream.addEventListener('removetrack', syncTracks)

    return () => {
      localStream.removeEventListener('addtrack', syncTracks)
      localStream.removeEventListener('removetrack', syncTracks)
    }
  }, [localStream])

  const handleToggleAudio = () => {
    const newState = !isAudioEnabled
    setIsAudioEnabled(newState)
    toggleAudio(newState)

    if (socket && activeCallId) {
      socket.emit('toggle-media', { roomId: activeCallId, type: 'audio', enabled: newState })
    }
  }

  const handleToggleVideo = async () => {
    // Prevent double-fire while async toggleVideo is in progress
    if (isVideoToggling.current) return
    isVideoToggling.current = true

    const newState = !isVideoEnabled
    try {
      await toggleVideo(newState)
      if (socket && activeCallId) {
        socket.emit('toggle-media', { roomId: activeCallId, type: 'video', enabled: newState })
      }
    } finally {
      isVideoToggling.current = false
    }
  }

  const handleEndCall = () => {
    if (socket && activeCallId) {
      socket.emit('end-call', { roomId: activeCallId })
    }
    endCall()
  }

  return (
    <div className={containerClassName}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggleAudio}
        className={`${buttonClassName} ${isAudioEnabled ? 'bg-white/20 hover:bg-white/30 backdrop-blur-md' : 'bg-red-500/90 hover:bg-red-600/90'}`}
        aria-label={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
      >
        {isAudioEnabled ? <FaMicrophone className="w-5 h-5 text-white" /> : <FaMicrophoneSlash className="w-5 h-5 text-white" />}
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleEndCall}
        className={`${buttonClassName} bg-red-600 hover:bg-red-700 w-16 h-16`}
        aria-label="End call"
      >
        <FaPhoneSlash className="w-6 h-6 text-white" />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggleVideo}
        className={`${buttonClassName} ${isVideoEnabled ? 'bg-white/20 hover:bg-white/30 backdrop-blur-md' : 'bg-red-500/90 hover:bg-red-600/90'}`}
        aria-label={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
      >
        {isVideoEnabled ? <FaVideo className="w-5 h-5 text-white" /> : <FaVideoSlash className="w-5 h-5 text-white" />}
      </motion.button>
    </div>
  )
}

export default CallControls
