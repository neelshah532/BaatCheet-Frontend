import { StateCreator } from 'zustand'
import { AppStore, CallState } from '../../types'
import { toast } from 'sonner'
import webRTCService from '../../services/webrtc'

export const createCallSlice: StateCreator<AppStore, [], [], CallState> = (set, get) => ({
  isInCall: false,
  isCallInitiator: false,
  callType: null,
  callUsers: [],
  localStream: null,
  activeCallId: null,
  incomingCall: {
    callId: null,
    caller: null,
    callType: null,
  },
  isCallRinging: false,

  startCall: async (recipients, callType) => {
    try {
      const constraints = {
        audio: true,
        video: callType === 'video',
      }

      let stream
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints)
      } catch (err) {
        if (callType === 'video') {
          console.warn('Video access failed, falling back to audio only:', err)
          toast.warning('Camera access failed. Continuing with audio only.')

          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
          } catch (audioErr) {
            console.error('Audio access also failed:', audioErr)
            toast.error('Unable to access microphone.')
            return false
          }
        } else {
          console.error('Audio access failed:', err)
          toast.error('Unable to access microphone.')
          return false
        }
      }

      set({
        isInCall: true,
        isCallInitiator: true,
        callType,
        localStream: stream,
        // activeCallId is intentionally NOT set here.
        // It will be set when the server responds with 'call-started'
        // containing the real roomId. Setting a temp id here causes
        // CallInterface.useEffect to re-run and destroy WebRTC peers
        // when the real id arrives.
        activeCallId: null,
        isCallRinging: true,
      })

      return true
    } catch (error) {
      console.error('Error accessing media devices:', error)
      toast.error('Failed to access camera/microphone.')
      return false
    }
  },

  joinCall: async (callId) => {
    try {
      const { incomingCall } = get()

      if (!incomingCall.callId && !callId) {
        toast.error('Invalid call ID')
        return false
      }

      const callType = incomingCall.callType || 'video'
      const constraints = {
        audio: true,
        video: callType === 'video',
      }

      let stream
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints)
      } catch (err) {
        if (callType === 'video') {
          console.warn('Video access failed, falling back to audio only:', err)
          toast.warning('Camera access failed. Continuing with audio only.')

          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
          } catch (audioErr) {
            console.error('Audio access also failed:', audioErr)
            toast.error('Unable to access microphone.')
            return false
          }
        } else {
          console.error('Audio access failed:', err)
          toast.error('Unable to access microphone.')
          return false
        }
      }

      const callerUser = incomingCall.caller

      set({
        isInCall: true,
        isCallInitiator: false,
        callType: callType,
        localStream: stream,
        activeCallId: callId || incomingCall.callId,
        callUsers: callerUser
          ? [
              {
                id: callerUser.id,
                firstName: callerUser.firstName || 'Caller',
                lastName: callerUser.lastName || '',
                email: callerUser.email || '',
                image: callerUser.image,
                color: callerUser.color || 0,
                audio: true,
                video: callType === 'video',
              },
            ]
          : [],
        incomingCall: {
          callId: null,
          caller: null,
          callType: null,
        },
        isCallRinging: false,
      })

      return true
    } catch (error) {
      console.error('Error joining call:', error)
      toast.error('Failed to join call.')
      return false
    }
  },

  endCall: () => {
    const { localStream } = get()

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
    }

    set({
      isInCall: false,
      isCallInitiator: false,
      callType: null,
      callUsers: [],
      localStream: null,
      activeCallId: null,
      isCallRinging: false,
    })
  },

  rejectCall: () => {
    set({
      incomingCall: {
        callId: null,
        caller: null,
        callType: null,
      },
    })
  },

  toggleAudio: (isEnabled) => {
    const { localStream } = get()

    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = isEnabled
      })
    }
  },

  toggleVideo: async (isEnabled) => {
    const { localStream } = get()
    if (!localStream) return

    try {
      await webRTCService.toggleVideo(isEnabled)
    } catch (err) {
      console.error('Failed to toggle video:', err)
      toast.error('Camera is currently unavailable or in use by another tab.')
      return
    }

    // Create a new MediaStream reference from the same tracks so React detects the change
    // (MediaStream is mutable, so mutating it in-place doesn\'t trigger re-renders)
    const refreshedStream = new MediaStream(localStream.getTracks())
    webRTCService.updateLocalStream(refreshedStream)
    set({ localStream: refreshedStream, callType: isEnabled ? 'video' : get().callType })
  },

  handleIncomingCall: (callData) => {
    set({
      incomingCall: {
        callId: callData.callId,
        caller: callData.caller,
        callType: callData.callType,
        webRTCConfig: callData.webRTCConfig,
      },
      webRTCConfig: callData.webRTCConfig || get().webRTCConfig,
      isCallRinging: true,
    })
  },

  resetCallState: () => {
    const { localStream } = get()

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
    }

    set({
      isInCall: false,
      isCallInitiator: false,
      callType: null,
      callUsers: [],
      localStream: null,
      activeCallId: null,
      incomingCall: {
        callId: null,
        caller: null,
        callType: null,
      },
      isCallRinging: false,
    })
  },

  addCallUser: (user) => {
    set((state) => {
      const exists = state.callUsers.some((u) => u.id === user.id)
      if (exists) {
        return {
          callUsers: state.callUsers.map((u) => (u.id === user.id ? { ...u, ...user } : u)),
        }
      }
      return { callUsers: [...state.callUsers, user] }
    })
  },

  removeCallUser: (userId) => {
    set((state) => ({
      callUsers: state.callUsers.filter((user) => user.id !== userId),
    }))
  },

  updateCallUser: (userId, updates) => {
    set((state) => ({
      callUsers: state.callUsers.map((user) => (user.id === userId ? { ...user, ...updates } : user)),
    }))
  },

  setLocalStream: (stream) => {
    if (stream) webRTCService.updateLocalStream(stream)
    set({ localStream: stream })
  },

  setActiveCallId: (callId) => {
    set({ activeCallId: callId })
  },

  setIsCallRinging: (isRinging) => {
    set({ isCallRinging: isRinging })
  },
})
