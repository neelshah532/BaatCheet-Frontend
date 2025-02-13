import { useEffect, useRef, ReactNode } from 'react'
import { useAppStore } from '../store/store'
import { io, Socket } from 'socket.io-client'
import { Message } from '../types'
import { SocketContext } from '../hook/socketContext'

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const socket = useRef<Socket | null>(null)
  const { userInfo } = useAppStore()

  useEffect(() => {
    if (userInfo) {
      socket.current = io(`${import.meta.env.VITE_LOCAL_HOST}`, {
        withCredentials: true,
        query: { userID: userInfo.id },
      })

      socket.current.on('connect', () => {
        console.log('Connected to the server')
      })

      const handleReceiveMessage = (message: Message) => {
        const { selectedChatData, selectedChatType, addMessage, addContactInContactList } = useAppStore.getState()
        if (
          selectedChatType !== undefined ||
          (typeof selectedChatData !== 'string' &&
            (selectedChatData?._id === (message.sender as { _id: string })._id || selectedChatData?._id === (message.recipient as { _id: string })._id))
        ) {
          console.log('Received Message:', message)
          addMessage(message)
        }
        addContactInContactList(message)
      }

      const handleReceiveChannelMessage = (message: Message) => {
        const { selectedChatData, selectedChatType, addMessage, addChannelinChannelList } = useAppStore.getState()

        if (typeof selectedChatData !== 'string' && selectedChatType !== undefined && selectedChatData?._id === message.channelId) {
          console.log('Received Channel Message:', message)
          addMessage(message)
        }
        if (message._id && message.channelId) {
          addChannelinChannelList({ _id: message._id, channelId: message.channelId })
        }
      }

      socket.current?.on('recieveMessage', handleReceiveMessage)
      socket.current?.on('recieveChannelMessage', handleReceiveChannelMessage)

      return () => {
        socket.current?.disconnect()
      }
    }
  }, [userInfo])

  return <SocketContext.Provider value={socket.current}>{children}</SocketContext.Provider>
}
