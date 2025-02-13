import { StateCreator } from 'zustand'
import { ChatState, Contact } from '../../types'

export const createChatSlice: StateCreator<ChatState> = (set, get) => ({
  selectedChatType: undefined,
  selectedChatData: undefined,
  selectedChatMessages: [],
  directContactMessages: [],
  isUploading: false,
  // isDownloading: false,
  fileUploadProgress: 0,
  // fileDownloadProgress: 0,
  channels: [],
  setChannels: (channels) => set({ channels }),
  setIsUploading: (isUploading) => set({ isUploading }),
  // setIsDownloading: (isDownloading) => set({ isDownloading }),
  setFileUploadProgress: (fileUploadProgress) => set({ fileUploadProgress }),
  // setFileDownloadProgress: (fileDownloadProgress) => set({ fileDownloadProgress }),
  setSelectedChatType: (type) => set({ selectedChatType: type }),
  setSelectedChatData: (data) => set({ selectedChatData: data }),
  setSelectedChatMessages: (messages) => set({ selectedChatMessages: messages }),
  closeChat: () => {
    set({ selectedChatType: undefined, selectedChatData: undefined, selectedChatMessages: [] })
  },
  setDirectContactMessages: (directContactMessages) => set({ directContactMessages }),
  addChannels: (channel) => {
    const channels = get().channels
    set({ channels: [...(Array.isArray(channel) ? channel : [channel]), ...channels] })
  },
  addMessage: (message) => {
    // const { selectedChatMessages, selectedChatType } = get()
    const selectedChatType = get().selectedChatType
    const selectedChatMessages = get().selectedChatMessages
    set({
      selectedChatMessages: [
        ...selectedChatMessages,
        {
          ...message,
          recipient: selectedChatType === 'channel' ? message.recipient : typeof message.recipient === 'string' ? message.recipient : message.recipient._id,
          sender: selectedChatType === 'channel' ? message.sender : typeof message.sender === 'string' ? message.sender : message.sender?._id || '',
        },
      ],
    })
  },

  addChannelinChannelList: (message: { _id: string; channelId: string }) => {
    set((state) => {
      const index = state.channels.findIndex((item) => (item as Contact)._id === message.channelId)

      if (index !== -1) {
        const updatedChannels = [...state.channels] as Contact[]
        const [selectedChannel] = updatedChannels.splice(index, 1) // Remove the selected channel
        return { channels: [selectedChannel, ...updatedChannels] as Contact[] } // Move it to the first index
      }

      return state // Return the unchanged state if the channel is not found
    })
  },
  // Moves the most recently messaged contact to the top of the list
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
