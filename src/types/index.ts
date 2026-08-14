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
  content?: string
  createdAt?: string
  updatedAt?: string
  _id?: string
  tempId?: string
  type?: 'text' | 'image' | 'file'
  timestamp?: Date | string
  messageType?: 'text' | 'image' | 'file'
  fileUrl?: string
  replyTo?: Message | string
  status?: 'sending' | 'sent' | 'delivered' | 'read'
  reactions?: { userId: string; emoji: string }[]
}

export interface ChatState {
  userInfo?: UserInfo
  selectedChatType?: string
  selectedChatData?: string | Contact
  selectedChatMessages: Message[]
  directContactMessages: Contact[]
  isUploading: boolean
  isDownloading: boolean
  fileUploadProgress: number
  fileDownloadProgress: number
  channels: Contact[]
  replyingToMessage: Message | null
  isGameActive: boolean
  incomingGameInvite: { senderId: string; sender: Contact } | null
  isWaitingForGameAcceptance: boolean
  onlineUsers: string[]
  setIncomingGameInvite: (invite: { senderId: string; sender: Contact } | null) => void
  setIsWaitingForGameAcceptance: (isWaiting: boolean) => void
  setOnlineUsers: (users: string[]) => void
  setUserOnline: (userId: string, isOnline: boolean) => void
  setIsGameActive: (isGameActive: boolean) => void
  setReplyingToMessage: (message: Message | null) => void
  setChannels: (channels: Contact[]) => void
  setIsUploading: (isUploading: boolean) => void
  setIsDownloading: (isDownloading: boolean) => void
  setFileUploadProgress: (fileUploadProgress: number) => void
  setFileDownloadProgress: (fileDownloadProgress: number) => void
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

// WebRTC Call Types
export interface CallUser {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  image?: string
  color?: number
  stream?: MediaStream
  audio: boolean
  video: boolean
  connectionState?: 'new' | 'connecting' | 'connected' | 'disconnected' | 'failed' | 'closed'
}

export interface CallState {
  isInCall: boolean
  isCallInitiator: boolean
  callType: 'video' | 'audio' | null
  callUsers: CallUser[]
  localStream: MediaStream | null
  activeCallId: string | null
  incomingCall: {
    callId: string | null
    caller: CallUser | null
    callType: 'video' | 'audio' | null
  }
  isCallRinging: boolean

  // Actions
  startCall: (recipients: string[], callType: 'video' | 'audio') => Promise<boolean>
  joinCall: (callId: string) => Promise<boolean>
  endCall: () => void
  rejectCall: (callId: string) => void
  toggleAudio: (isEnabled: boolean) => void
  toggleVideo: (isEnabled: boolean) => void
  handleIncomingCall: (callData: { callId: string; caller: CallUser; callType: 'video' | 'audio' }) => void
  resetCallState: () => void
  addCallUser: (user: CallUser) => void
  removeCallUser: (userId: string) => void
  updateCallUser: (userId: string, updates: Partial<CallUser>) => void
  setLocalStream: (stream: MediaStream | null) => void
  setActiveCallId: (callId: string | null) => void
  setIsCallRinging: (isRinging: boolean) => void
}

export type AppStore = AuthState & ChatState & CallState
