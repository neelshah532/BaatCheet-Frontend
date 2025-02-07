import { StateCreator } from 'zustand'
import { ChatState } from '../../types'

export const createChatSlice: StateCreator<ChatState> = (set, get) => ({
  selectedChatType: undefined,
  selectedChatData: undefined,
  selectedChatMessages: [],
  setSelectedChatType: (type) => set({ selectedChatType: type }),
  setSelectedChatData: (data) => set({ selectedChatData: data }),
  setSelectedChatMessages: (messages) => set({ selectedChatMessages: messages }),
  closeChat: () => {
    set({ selectedChatType: undefined, selectedChatData: undefined, selectedChatMessages: [] })
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
          recipient: selectedChatType === 'channel' ? message.recipient : message.recipient._id,
          sender: selectedChatType === 'channel' ? message.sender : message.sender._id,
        },
      ],
    })
  },
})
