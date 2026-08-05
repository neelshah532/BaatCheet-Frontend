import { useEffect } from 'react'
import { useAppStore } from '../../store/store'
import { useSocket } from '../../hook/socketContext'
import IncomingCallDialog from './components/IncomingCallDialog'
import CallInterface from './components/CallInterface'
import { checkBrowserCompatibility } from '../../utils/mediaUtils'
import { toast } from 'sonner'

const CallsModule = () => {
  const { handleIncomingCall, resetCallState, setActiveCallId, addCallUser } = useAppStore()
  const socket = useSocket()

  useEffect(() => {
    checkBrowserCompatibility()
  }, [])

  useEffect(() => {
    if (!socket) return

    socket.on('call-started', (data) => {
      console.log('Call room created:', data)
      if (data.roomId) {
        setActiveCallId(data.roomId)
      }
    })

    // When recipient joins call room, populate existing participants (Caller A)
    socket.on('call-joined', (data) => {
      console.log('Call joined data:', data)
      if (data.roomId) {
        setActiveCallId(data.roomId)
      }
      if (data.participants && Array.isArray(data.participants)) {
        data.participants.forEach((participant) => {
          addCallUser({
            id: participant.id,
            firstName: participant.firstName || 'User',
            lastName: participant.lastName || '',
            email: participant.email || '',
            image: participant.image,
            color: participant.color || 0,
            audio: true,
            video: data.isVideoEnabled || false,
          })
        })
      }
    })

    socket.on('incoming-call', (data) => {
      console.log('Incoming call:', data)
      handleIncomingCall({
        callId: data.callId || data.roomId,
        caller: data.caller,
        callType: data.callType,
      })
    })

    socket.on('call-rejected', () => {
      toast.info('Call was declined by recipient.')
      resetCallState()
    })

    socket.on('call-ended', () => {
      toast.info('Call ended.')
      resetCallState()
    })

    socket.on('user-disconnected', ({ userId }) => {
      console.log(`Participant disconnected: ${userId}`)
    })

    socket.on('call-error', ({ message }) => {
      console.error('Call error:', message)
      toast.error(message || 'Call failed.')
      resetCallState()
    })

    return () => {
      socket.off('call-started')
      socket.off('call-joined')
      socket.off('incoming-call')
      socket.off('call-rejected')
      socket.off('call-ended')
      socket.off('user-disconnected')
      socket.off('call-error')
    }
  }, [socket, handleIncomingCall, resetCallState, setActiveCallId, addCallUser])

  useEffect(() => {
    const handleBeforeUnload = () => {
      resetCallState()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [resetCallState])

  return (
    <>
      <IncomingCallDialog />
      <CallInterface />
    </>
  )
}

export default CallsModule
