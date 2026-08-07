import { useEffect, useRef, ReactNode } from 'react'
import { useAppStore } from '../store/store'
import { io, Socket } from 'socket.io-client'
import { Message } from '../types'
import { SocketContext } from '../hook/socketContext'
import { toast } from 'sonner'

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const socket = useRef<Socket | null>(null)
  const { userInfo } = useAppStore()

  useEffect(() => {
    const currentUserId = userInfo?.id || (userInfo as { _id?: string })?._id
    if (currentUserId) {
      socket.current = io(`${import.meta.env.VITE_LOCAL_HOST}`, {
        withCredentials: true,
        query: { userID: currentUserId },
      })

      socket.current.on('connect', () => {
        console.log('Connected to socket server')
        socket.current?.emit('get-online-users')
      })

      const handleOnlineUsersList = (users: string[]) => {
        const { setOnlineUsers } = useAppStore.getState()
        setOnlineUsers(users)
      }

      const handleUserStatusChanged = (data: { userId: string; isOnline: boolean }) => {
        const { setUserOnline } = useAppStore.getState()
        setUserOnline(data.userId, data.isOnline)
      }

      const handleReactionUpdated = (data: { messageId: string; reactions: { userId: string; emoji: string }[] }) => {
        const { selectedChatMessages, setSelectedChatMessages } = useAppStore.getState()
        const updated = selectedChatMessages.map((msg) => (msg._id === data.messageId ? { ...msg, reactions: data.reactions } : msg))
        setSelectedChatMessages(updated)
      }

      const handleReceiveMessage = (message: Message) => {
        const { selectedChatData, selectedChatType, addMessage, addContactInContactList } = useAppStore.getState()
        const senderId = typeof message.sender === 'object' ? message.sender?._id : message.sender

        if (selectedChatType === 'contact' && typeof selectedChatData !== 'string' && selectedChatData?._id === senderId) {
          // Send mark-messages-read ack immediately back to server
          socket.current?.emit('mark-messages-read', { senderId })
          addMessage({ ...message, status: 'read' })
        } else if (
          selectedChatType !== undefined ||
          (typeof selectedChatData !== 'string' &&
            (selectedChatData?._id === senderId || selectedChatData?._id === (typeof message.recipient === 'object' ? message.recipient?._id : message.recipient)))
        ) {
          addMessage(message)
        }
        addContactInContactList(message)
      }

      const handleReceiveChannelMessage = (message: Message) => {
        const { selectedChatData, selectedChatType, addMessage, addChannelinChannelList } = useAppStore.getState()

        if (typeof selectedChatData !== 'string' && selectedChatType !== undefined && selectedChatData?._id === message.channelId) {
          addMessage(message)
        }
        if (message._id && message.channelId) {
          addChannelinChannelList({ _id: message._id, channelId: message.channelId })
        }
      }

      const handleMessagesReadUpdate = (data: { readBy: string; senderId: string }) => {
        const { selectedChatMessages, setSelectedChatMessages, userInfo: currentUser } = useAppStore.getState()
        if (data.readBy && currentUser?.id) {
          const updated = selectedChatMessages.map((msg) => {
            const msgSenderId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender
            if (msgSenderId === currentUser.id) {
              return { ...msg, status: 'read' as const }
            }
            return msg
          })
          setSelectedChatMessages(updated)
        }
      }

      const handleGameInviteReceived = (data: { senderId: string; sender: Contact }) => {
        const { setIncomingGameInvite } = useAppStore.getState()
        setIncomingGameInvite(data)
      }

      const handleGameInviteApproved = () => {
        const { setIncomingGameInvite, setIsWaitingForGameAcceptance, setIsGameActive } = useAppStore.getState()
        setIncomingGameInvite(null)
        setIsWaitingForGameAcceptance(false)
        setIsGameActive(true)
      }

      const handleGameInviteRejected = (data: { message?: string }) => {
        const { setIsWaitingForGameAcceptance } = useAppStore.getState()
        setIsWaitingForGameAcceptance(false)
        toast.info(data?.message || 'Game invitation declined.')
      }

      const handleGameInviteCanceled = () => {
        const { setIncomingGameInvite } = useAppStore.getState()
        setIncomingGameInvite(null)
      }

      const handleGameInvited = (data: { initiatorId: string; gameType: string }) => {
        const { selectedChatData, setIsGameActive } = useAppStore.getState()
        const currentSelectedId = typeof selectedChatData === 'object' ? selectedChatData?._id : selectedChatData
        if (currentSelectedId === data.initiatorId) {
          setIsGameActive(true)
        }
      }

      socket.current?.on('online-users-list', handleOnlineUsersList)
      socket.current?.on('user-status-changed', handleUserStatusChanged)
      socket.current?.on('message:reactionUpdated', handleReactionUpdated)
      socket.current?.on('recieveMessage', handleReceiveMessage)
      socket.current?.on('recieveChannelMessage', handleReceiveChannelMessage)
      socket.current?.on('messages-read-update', handleMessagesReadUpdate)
      socket.current?.on('game:invited', handleGameInvited)
      socket.current?.on('game:invite-received', handleGameInviteReceived)
      socket.current?.on('game:invite-approved', handleGameInviteApproved)
      socket.current?.on('game:invite-rejected', handleGameInviteRejected)
      socket.current?.on('game:invite-canceled', handleGameInviteCanceled)

      return () => {
        socket.current?.off('online-users-list', handleOnlineUsersList)
        socket.current?.off('user-status-changed', handleUserStatusChanged)
        socket.current?.off('message:reactionUpdated', handleReactionUpdated)
        socket.current?.off('game:invited', handleGameInvited)
        socket.current?.off('game:invite-received', handleGameInviteReceived)
        socket.current?.off('game:invite-approved', handleGameInviteApproved)
        socket.current?.off('game:invite-rejected', handleGameInviteRejected)
        socket.current?.off('game:invite-canceled', handleGameInviteCanceled)
        socket.current?.disconnect()
      }
    }
  }, [userInfo])

  return <SocketContext.Provider value={socket.current}>{children}</SocketContext.Provider>
}
