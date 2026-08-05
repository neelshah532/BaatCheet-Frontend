import { StateCreator } from 'zustand'
import { AppStore, CallState } from '../../types'
import { toast } from 'sonner'

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
        activeCallId: Date.now().toString(),
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

      set({
        isInCall: true,
        isCallInitiator: false,
        callType: callType,
        localStream: stream,
        activeCallId: callId || incomingCall.callId,
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

    if (localStream) {
      const videoTracks = localStream.getVideoTracks()
      if (videoTracks.length > 0) {
        videoTracks.forEach((track) => {
          track.enabled = isEnabled
        })
      } else if (isEnabled) {
        try {
          const videoStream = await navigator.mediaDevices.getUserMedia({ video: true })
          const newTrack = videoStream.getVideoTracks()[0]
          if (newTrack) {
            localStream.addTrack(newTrack)
            set({ callType: 'video' })
          }
        } catch (err) {
          console.error('Failed to get video track:', err)
          toast.error('Could not access camera device.')
        }
      }
    }
  },

  handleIncomingCall: (callData) => {
    set({
      incomingCall: {
        callId: callData.callId,
        caller: callData.caller,
        callType: callData.callType,
      },
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
    set({ localStream: stream })
  },

  setActiveCallId: (callId) => {
    set({ activeCallId: callId })
  },

  setIsCallRinging: (isRinging) => {
    set({ isCallRinging: isRinging })
  },
})
