import { useEffect } from 'react'
import { useAppStore } from '../../store/store'
import { useSocket } from '../../hook/socketContext'
import IncomingCallDialog from './components/IncomingCallDialog'
import CallInterface from './components/CallInterface'
import { checkBrowserCompatibility } from '../../utils/mediaUtils'
import { toast } from 'sonner'

import webRTCService from '../../services/webrtc'

const CallsModule = () => {
  const { handleIncomingCall, resetCallState, setActiveCallId, addCallUser, userInfo } = useAppStore()
  const socket = useSocket()

  useEffect(() => {
    checkBrowserCompatibility()
  }, [])

  useEffect(() => {
    if (!socket) return

    socket.on('call-started', (data) => {
      if (data.roomId) {
        setActiveCallId(data.roomId)
      }
      if (data.webRTCConfig) {
        useAppStore.setState({ webRTCConfig: data.webRTCConfig })
      }
    })
    socket.on('call-joined', (data) => {
      if (data.roomId) {
        setActiveCallId(data.roomId)
      }
      if (data.webRTCConfig) {
        useAppStore.setState({ webRTCConfig: data.webRTCConfig })
      }
      if (data.participants && Array.isArray(data.participants)) {
        data.participants.forEach((participant: { id: string; firstName?: string; lastName?: string; email?: string; image?: string; color?: number }) => {
          if (!participant.id || participant.id === userInfo?.id) return
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
          if (userInfo?.id && userInfo.id > participant.id) {
            setTimeout(() => webRTCService.connectToPeer(participant.id), 150)
          }
        })
      }
    })

    socket.on('incoming-call', (data) => {
      if (data.webRTCConfig) {
        useAppStore.setState({ webRTCConfig: data.webRTCConfig })
      }
      handleIncomingCall({
        callId: data.callId || data.roomId,
        caller: data.caller,
        callType: data.callType,
        webRTCConfig: data.webRTCConfig,
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

    socket.on('user-disconnected', () => {})

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
