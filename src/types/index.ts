export interface TabItem {
  id: number
  name: string
}

export interface FormFields {
  email: string
  password: string
  confirmPassword?: string
  fullName?: string
}

export interface UserInfo {
  id: string
  email?: string
  profileSetup?: boolean
}
export interface AuthState {
  userInfo?: UserInfo
  setUserInfo: (userInfo: UserInfo) => void
}
