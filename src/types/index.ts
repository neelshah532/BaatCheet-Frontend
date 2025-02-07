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
  firstName?: string
  lastName?: string
  color?: number | string
  userImage?: string
  token?: string
}
export interface AuthState {
  userInfo?: UserInfo | undefined
  setUserInfo: (userInfo: UserInfo | undefined) => void
}

export interface Contact {
  _id: string
  firstName?: string
  lastName?: string
  email?: string
  image?: string
  color?: number
}

export interface Message {
  recipient: string | { _id: string }
  sender: string | { _id: string }
  content: string
  createdAt: string
  updatedAt: string
  _id?: string
  type?: 'text' | 'image' | 'file'
  timestamp?: Date | string
  messageType?: 'text' | 'image' | 'file'
}

export interface ChatState {
  selectedChatType: string | undefined
  selectedChatData: string | Contact | undefined
  selectedChatMessages: Message[]
  setSelectedChatType: (type: string | undefined) => void
  setSelectedChatData: (data: string | Contact | undefined) => void
  setSelectedChatMessages: (messages: Message[]) => void
  closeChat: () => void
  addMessage: (message: Message) => void
}
