import { create } from 'zustand'
import { createAuthSlice } from './slices/AuthSlices'
import { createChatSlice } from './slices/ChatSlices'
import { createCallSlice } from './slices/CallSlices'
import { AppStore } from '../types'

export const useAppStore = create<AppStore>()((set, get, store) => ({
  ...createAuthSlice(set),
  ...createChatSlice(set, get, store),
  ...createCallSlice(set, get, store),
}))
