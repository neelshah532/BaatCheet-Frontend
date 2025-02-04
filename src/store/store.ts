import { create } from 'zustand'
import { createAuthSlice } from './slices/AuthSlices'
import { createChatSlice } from './slices/ChatSlices'
import { AuthState, ChatState } from '../types'

// Define the combined store type
type AppStore = AuthState & ChatState

export const useAppStore = create<AppStore>()((set, get, store) => ({
  ...createAuthSlice(set),
  ...createChatSlice(set, get, store),
}))
