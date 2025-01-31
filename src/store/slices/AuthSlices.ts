import { StateCreator } from 'zustand'
import { AuthState, UserInfo } from '../../types'

export const createAuthSlice: StateCreator<AuthState> = (set) => ({
  userInfo: undefined,
  setUserInfo: (userInfo: UserInfo | undefined) => set({ userInfo }),
})
