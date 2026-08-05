import { useEffect, useRef } from 'react'
import { FaMicrophoneSlash } from 'react-icons/fa'
import { CallUser } from '../../../types'
import { motion } from 'framer-motion'
import '../../../styles/VideoCall.css'

interface VideoViewProps {
  user: CallUser
  isSelf?: boolean
  size?: 'small' | 'medium' | 'large' | 'full'
  isAudioOnly?: boolean
}

const VideoView = ({ user, isSelf = false, size = 'medium', isAudioOnly = false }: VideoViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  const sizeClasses = {
    small: 'w-40 h-56 rounded-2xl shadow-xl',
    medium: 'w-full h-full rounded-3xl',
    large: 'w-full h-full rounded-3xl',
    full: 'w-full h-full',
  }

  useEffect(() => {
    if (videoRef.current && user.stream) {
      videoRef.current.srcObject = user.stream
      if (isSelf) {
        videoRef.current.muted = true
      } else {
        videoRef.current.muted = false
      }
    }
  }, [user.stream, isSelf])

  const showPlaceholder =
    isAudioOnly || !user.video || !user.stream || user.stream.getVideoTracks().length === 0 || (user.stream.getVideoTracks().length > 0 && !user.stream.getVideoTracks()[0].enabled)

  const initials = user.firstName && user.lastName ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : user.firstName ? user.firstName[0].toUpperCase() : '?'

  const themeColor = typeof user.color === 'number' ? `hsl(${user.color * 20}, 70%, 40%)` : '#4F46E5'
  const themeGradient = `radial-gradient(circle at 50% 50%, ${themeColor} 0%, rgba(0,0,0,1) 80%)`

  return (
    <div className={`relative overflow-hidden bg-black flex items-center justify-center ${sizeClasses[size]} ${size !== 'full' ? 'border border-white/10 backdrop-blur-sm' : ''}`}>
      {/* The video element MUST remain in the DOM so remote audio tracks can be output by the browser! */}
      <video ref={videoRef} autoPlay playsInline className={`absolute inset-0 w-full h-full object-cover ${isSelf ? 'mirror' : ''} ${showPlaceholder ? 'hidden' : ''}`} />

      {showPlaceholder && (
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center z-10" style={{ background: themeGradient, opacity: 0.85 }}>
          <motion.div
            className="relative flex flex-col items-center justify-center"
            animate={user.audio ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center text-3xl font-light text-white shadow-2xl relative z-10 border border-white/20 backdrop-blur-md"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            >
              {initials}
            </div>

            {user.audio && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full border border-white/30"
                  animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeOut' }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border border-white/20"
                  animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                />
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* Gradient Vignette for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none z-15" />

      {/* User Details & Indicators */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-20">
        <div className="flex items-center space-x-3 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <span className="text-white text-sm font-medium tracking-wide">
            {user.firstName} {isSelf && '(You)'}
          </span>
          {!user.audio && (
            <div className="bg-red-500/80 p-1 rounded-full">
              <FaMicrophoneSlash className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VideoView
