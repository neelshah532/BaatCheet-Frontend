import { useEffect, useState } from 'react'
import { FaPhone, FaPhoneSlash, FaVideo } from 'react-icons/fa'
import { useAppStore } from '../../../store/store'
import { useSocket } from '../../../hook/socketContext'
import { motion, AnimatePresence } from 'framer-motion'

// Base64 encoded short ringtone
const RINGTONE_DATA_URL =
  'data:audio/mpeg;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA/////////////////////AAB//////////////////////////////////8AAAAAAEAAD///////////////////////////////////////////8AAAEAAAH///////////////////////////////////////////8AAAAQAABA////////////////////////////////////////////AAAAAD///////7+/v7+/v7+/v7+/v+/v7+/v7+/v7+/v7+/z8/Pz8/Pz8/Pz8/P/////////////AAAAMkxBTUUzLjEwMAQGAAAAADcAAAAAACsEDeAyQAEBXwAAAD//uQxAAAE7C1oUMMTcCICSr8SYm5ES29YYzMkOQ0nw5iZ4h7iHuwgCIIBhOvv4IA/wQ//zFP/AAAcIJESEACBAQB5//xA/wEQ//85Ev8D//85CP/kP/8uP/+AgQIACgQU//+//////////jP//z////Kf//n/////4h//N///////+U////OQ//k//5D//Rn///Gf/6P/+j/gkdv/kjFq3QcB////9ycnJycnJAAA6pObm5uQIJ///93d3d3dwABG3///d0gEMCCCKf//4AZAgMY//5d/AgEAOQ//oAKVACAMJBIJf4EABjEP/6QEUkUhBx6WZrHiXfbjkUF0PBdBlCR'

const IncomingCallDialog = () => {
  const { incomingCall, joinCall, rejectCall, isInCall } = useAppStore()
  const socket = useSocket()
  const [audio] = useState<HTMLAudioElement | null>(typeof Audio !== 'undefined' ? new Audio(RINGTONE_DATA_URL) : null)

  useEffect(() => {
    // Play ringtone when there's an incoming call
    if (incomingCall.callId && !isInCall && audio) {
      audio.loop = true
      audio.play().catch((error) => {
        console.warn('Browser blocked autoplay of ringtone.', error)
      })
    }

    return () => {
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
    }
  }, [incomingCall.callId, isInCall, audio])

  const handleAcceptCall = async () => {
    if (!incomingCall.callId || !socket) return

    const callJoined = await joinCall(incomingCall.callId)

    if (callJoined && socket) {
      socket.emit('accept-call', {
        roomId: incomingCall.callId,
        callerId: incomingCall.caller?.id,
      })
    }
  }

  const handleRejectCall = () => {
    if (!incomingCall.callId || !socket) return

    socket.emit('reject-call', {
      roomId: incomingCall.callId,
      callerId: incomingCall.caller?.id,
    })

    rejectCall(incomingCall.callId)
  }

  if (!incomingCall.callId || isInCall) return null

  const caller = incomingCall.caller
  const callType = incomingCall.callType
  const themeColor = typeof caller?.color === 'number' ? `hsl(${caller.color * 20}, 70%, 50%)` : '#4F46E5'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xl"
      >
        {/* Ambient background glow */}
        <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(circle at 50% 50%, ${themeColor} 0%, transparent 60%)` }} />

        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative w-[340px] bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 flex flex-col items-center shadow-2xl overflow-hidden"
        >
          {/* Ringing animation rings */}
          <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.5, 2], opacity: [0.8, 0.4, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full border-2 border-green-400"
            />
            <motion.div
              animate={{ scale: [1, 1.5, 2], opacity: [0.8, 0.4, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.6, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full border-2 border-green-400"
            />

            <div
              className="relative z-10 w-24 h-24 rounded-full flex items-center justify-center text-3xl font-light text-white shadow-xl bg-gray-800 border border-white/20 overflow-hidden"
              style={{ backgroundColor: caller?.image ? 'transparent' : themeColor }}
            >
              {caller?.image ? (
                <img src={caller.image} alt={`${caller?.firstName} ${caller?.lastName}`} className="w-full h-full object-cover" />
              ) : (
                <span>{caller?.firstName?.[0]?.toUpperCase() || '?'}</span>
              )}
            </div>
          </div>

          <h4 className="text-2xl font-semibold mb-1 text-white tracking-wide">
            {caller?.firstName} {caller?.lastName}
          </h4>
          <p className="text-sm text-white/60 mb-10 tracking-widest uppercase">Incoming {callType} Call...</p>

          <div className="flex justify-between w-full px-4 gap-8">
            {/* Reject Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRejectCall}
              className="w-16 h-16 rounded-full bg-red-500/90 flex flex-col items-center justify-center text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]"
            >
              <FaPhoneSlash className="w-6 h-6 mb-1" />
            </motion.button>

            {/* Accept Button */}
            <motion.button
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAcceptCall}
              className="w-16 h-16 rounded-full bg-green-500 flex flex-col items-center justify-center text-white shadow-[0_0_20px_rgba(34,197,94,0.6)]"
            >
              {callType === 'video' ? <FaVideo className="w-6 h-6 mb-1" /> : <FaPhone className="w-6 h-6 mb-1" />}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default IncomingCallDialog
