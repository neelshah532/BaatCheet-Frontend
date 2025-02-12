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
  name?: string
}

export interface Message {
  recipient: string | { _id: string }
  sender:
    | string
    | {
        color?: number
        image?: boolean
        _id?: string
        firstName?: string
        lastName?: string
        email?: string
      }
  channelId?: string
  content: string
  createdAt: string
  updatedAt: string
  _id?: string
  type?: 'text' | 'image' | 'file'
  timestamp?: Date | string
  messageType?: 'text' | 'image' | 'file'
  fileUrl?: string
}

export interface ChatState {
  userInfo?: UserInfo
  selectedChatType?: string
  selectedChatData?: string | Contact
  selectedChatMessages: Message[]
  directContactMessages: Contact[]
  isUploading: boolean
  // isDownloading: boolean
  fileUploadProgress: number
  // fileDownloadProgress: number
  channels: Contact[]
  setChannels: (channels: Contact[]) => void
  setIsUploading: (isUploading: boolean) => void
  // setIsDownloading: (isDownloading: boolean) => void
  setFileUploadProgress: (fileUploadProgress: number) => void
  // setFileDownloadProgress: (fileDownloadProgress: number) => void
  setSelectedChatType: (type?: string) => void
  setSelectedChatData: (data?: string | Contact) => void
  setSelectedChatMessages: (messages: Message[]) => void
  setDirectContactMessages: (directContactMessages: Contact[]) => void
  closeChat: () => void
  addMessage: (message: Message) => void
  addChannels: (channel: Contact | Contact[]) => void
  addChannelinChannelList: (message: { _id: string; channelId: string }) => void
  addContactInContactList: (message: Message) => void
}

export interface ContactOption {
  label: string
  value: string
}
