import { AuthState, UserInfo } from '../../types'

const getInitialUserInfo = (): UserInfo | undefined => {
  try {
    const stored = localStorage.getItem('userInfo')
    return stored ? JSON.parse(stored) : undefined
  } catch {
    return undefined
  }
}

export const createAuthSlice = (set: (state: Partial<AuthState>) => void) => ({
  userInfo: getInitialUserInfo(),
  setUserInfo: (userInfo: UserInfo | undefined) => {
    try {
      if (userInfo) {
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
      } else {
        localStorage.removeItem('userInfo')
      }
    } catch (e) {
      console.warn('Failed to sync userInfo to localStorage:', e)
    }
    set({ userInfo })
  },
})
