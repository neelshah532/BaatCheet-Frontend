import { StateCreator } from 'zustand'
import { ChatState, Contact } from '../../types'

export const createChatSlice: StateCreator<ChatState> = (set) => ({
  selectedChatType: undefined,
  selectedChatData: undefined,
  selectedChatMessages: [],
  setSelectedChatType: (type: string | undefined) => set({ selectedChatType: type }),
  setSelectedChatData: (data: string | undefined | Contact) => set({ selectedChatData: data }),
  setSelectedChatMessages: (messages: string[] | undefined) => set({ selectedChatMessages: messages }),
  closeChat: () => {
    set({ selectedChatType: undefined, selectedChatData: undefined, selectedChatMessages: [] })
  },
})
