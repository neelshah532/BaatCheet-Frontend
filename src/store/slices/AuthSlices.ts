import { AuthState, UserInfo } from '../../types'

export const createAuthSlice = (set: (state: Partial<AuthState>) => void) => ({
  userInfo: undefined,
  setUserInfo: (userInfo: UserInfo | undefined) => set({ userInfo }),
})
