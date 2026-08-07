import { StateCreator } from 'zustand'
import { ChatState, Contact } from '../../types'

export const createChatSlice: StateCreator<ChatState> = (set, get) => ({
  selectedChatType: undefined,
  selectedChatData: undefined,
  selectedChatMessages: [],
  directContactMessages: [],
  isUploading: false,
  isDownloading: false,
  fileUploadProgress: 0,
  fileDownloadProgress: 0,
  channels: [],
  replyingToMessage: null,
  isGameActive: false,
  incomingGameInvite: null,
  isWaitingForGameAcceptance: false,
  onlineUsers: [],

  setIncomingGameInvite: (invite) => set({ incomingGameInvite: invite }),
  setIsWaitingForGameAcceptance: (isWaiting) => set({ isWaitingForGameAcceptance: isWaiting }),
  setOnlineUsers: (users) => set({ onlineUsers: users.map((u) => u.toString().trim()) }),
  setUserOnline: (userId, isOnline) =>
    set((state) => {
      const cleanId = userId ? userId.toString().trim() : ''
      if (!cleanId) return state
      const exists = state.onlineUsers.includes(cleanId)
      if (isOnline && !exists) {
        return { onlineUsers: [...state.onlineUsers, cleanId] }
      }
      if (!isOnline && exists) {
        return { onlineUsers: state.onlineUsers.filter((id) => id !== cleanId) }
      }
      return state
    }),
  setIsGameActive: (isGameActive) => set({ isGameActive }),
  setReplyingToMessage: (message) => set({ replyingToMessage: message }),
  setChannels: (channels) => set({ channels }),
  setIsUploading: (isUploading) => set({ isUploading }),
  setIsDownloading: (isDownloading) => set({ isDownloading }),
  setFileUploadProgress: (progress) => set({ fileUploadProgress: progress }),
  setFileDownloadProgress: (progress) => set({ fileDownloadProgress: progress }),
  setSelectedChatType: (type) => set({ selectedChatType: type }),
  setSelectedChatData: (data) => set({ selectedChatData: data, isGameActive: false }),
  setSelectedChatMessages: (messages) => set({ selectedChatMessages: messages }),
  closeChat: () => {
    set({ selectedChatType: undefined, selectedChatData: undefined, selectedChatMessages: [], replyingToMessage: null, isGameActive: false })
  },
  setDirectContactMessages: (directContactMessages) => set({ directContactMessages }),
  addChannels: (channel) => {
    const channels = get().channels
    set({ channels: [...(Array.isArray(channel) ? channel : [channel]), ...channels] })
  },

  // Optimistic-update-then-reconcile discipline
  addMessage: (incomingMessage) => {
    const selectedChatMessages = get().selectedChatMessages

    const tempIndex = selectedChatMessages.findIndex(
      (m) => (incomingMessage.tempId && m.tempId === incomingMessage.tempId) || (m._id?.startsWith('temp-') && m.content === incomingMessage.content)
    )

    if (tempIndex !== -1) {
      const updatedMessages = [...selectedChatMessages]
      updatedMessages[tempIndex] = incomingMessage
      set({ selectedChatMessages: updatedMessages })
      return
    }

    const exists = selectedChatMessages.some((m) => m._id && m._id === incomingMessage._id)
    if (exists) {
      set({
        selectedChatMessages: selectedChatMessages.map((m) => (m._id === incomingMessage._id ? { ...m, ...incomingMessage } : m)),
      })
      return
    }

    set({
      selectedChatMessages: [...selectedChatMessages, incomingMessage],
    })
  },

  addChannelinChannelList: (message: { _id: string; channelId: string }) => {
    set((state) => {
      const index = state.channels.findIndex((item) => (item as Contact)._id === message.channelId)

      if (index !== -1) {
        const updatedChannels = [...state.channels] as Contact[]
        const [selectedChannel] = updatedChannels.splice(index, 1)
        return { channels: [selectedChannel, ...updatedChannels] as Contact[] }
      }

      return state
    })
  },

  addContactInContactList: (message) => {
    const userID = get().userInfo?.id
    if (!userID) return
    const FromId =
      typeof message.sender === 'string'
        ? message.sender
        : message.sender._id === userID
          ? typeof message.recipient === 'string'
            ? message.recipient
            : message.recipient._id
          : message.sender._id
    const fromData: Contact =
      typeof message.sender === 'string' ? { _id: message.sender } : message.sender._id === userID ? (message.recipient as Contact) : (message.sender as Contact)
    set((state) => {
      const index = state.directContactMessages.findIndex((item) => item._id === FromId)
      if (index !== -1) {
        const updatedContacts = [state.directContactMessages[index], ...state.directContactMessages.slice(0, index), ...state.directContactMessages.slice(index + 1)]
        return { directContactMessages: updatedContacts }
      }
      return { directContactMessages: [fromData, ...state.directContactMessages] }
    })
  },
})
