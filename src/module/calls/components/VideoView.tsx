import { useEffect, useRef, useState } from 'react'
import { FaMicrophoneSlash } from 'react-icons/fa'
import { CallUser } from '../../../types'
import { motion } from 'framer-motion'
import '../../../styles/VideoCall.css'

interface VideoViewProps {
  user: CallUser
  isSelf?: boolean
  size?: 'small' | 'medium' | 'large' | 'full'
}

const VideoView = ({ user, isSelf = false, size = 'medium' }: VideoViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasActiveVideo, setHasActiveVideo] = useState(false)

  const sizeClasses: Record<string, string> = {
    small: 'w-40 h-56 rounded-2xl shadow-2xl',
    medium: 'w-full h-full rounded-3xl',
    large: 'w-full h-full rounded-3xl',
    full: 'w-full h-full',
  }

  useEffect(() => {
    const stream = user.stream

    // ─── Live video track detection ───────────────────────────────────────
    const checkVideo = () => {
      if (!stream) {
        setHasActiveVideo(false)
        return
      }
      const active = stream.getVideoTracks().some((t) => t.enabled && t.readyState === 'live')
      setHasActiveVideo(active)
    }

    // ─── Bind stream to <video> element ──────────────────────────────────
    if (videoRef.current) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream ?? null
      }
      videoRef.current.muted = isSelf
      if (stream && stream.getTracks().length > 0) {
        videoRef.current.play().catch((err: Error) => {
          console.warn('[VideoView] video play() notice:', err.message)
        })
      }
    }

    checkVideo()

    if (stream) {
      stream.addEventListener('addtrack', checkVideo)
      stream.addEventListener('removetrack', checkVideo)
      stream.getTracks().forEach((t) => {
        t.addEventListener('unmute', checkVideo)
        t.addEventListener('mute', checkVideo)
      })

      return () => {
        stream.removeEventListener('addtrack', checkVideo)
        stream.removeEventListener('removetrack', checkVideo)
        stream.getTracks().forEach((t) => {
          t.removeEventListener('unmute', checkVideo)
          t.removeEventListener('mute', checkVideo)
        })
      }
    }
  }, [user.stream, user.video, isSelf])

  const showPlaceholder = !hasActiveVideo

  const initials = user.firstName && user.lastName ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : user.firstName ? user.firstName[0].toUpperCase() : '?'

  const themeColor = typeof user.color === 'number' ? `hsl(${user.color * 20}, 70%, 40%)` : '#4F46E5'
  const themeGradient = `radial-gradient(circle at 50% 50%, ${themeColor} 0%, rgba(0,0,0,1) 80%)`

  return (
    <div className={`relative overflow-hidden bg-black flex items-center justify-center ${sizeClasses[size]} ${size !== 'full' ? 'border border-white/10 backdrop-blur-sm' : ''}`}>
      {/* Video is always in the DOM — opacity hides it but keeps audio running seamlessly */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isSelf}
        onLoadedMetadata={() => {
          if (videoRef.current && user.stream) {
            videoRef.current.play().catch(() => {})
          }
          if (user.stream) {
            const active = user.stream.getVideoTracks().some((t) => t.enabled && t.readyState === 'live')
            setHasActiveVideo(active)
          }
        }}
        onCanPlay={() => {
          if (user.stream) {
            const active = user.stream.getVideoTracks().some((t) => t.enabled && t.readyState === 'live')
            setHasActiveVideo(active)
          }
        }}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isSelf ? 'mirror' : ''} ${showPlaceholder ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      />

      {showPlaceholder && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10" style={{ background: themeGradient, opacity: 0.85 }}>
          <motion.div
            className="relative flex flex-col items-center justify-center"
            animate={user.audio ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center text-3xl font-light text-white shadow-2xl border border-white/20 backdrop-blur-md"
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

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none z-15" />

      {/* Name badge */}
      <div className="absolute bottom-4 left-4 right-4 flex items-end z-20">
        <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
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
