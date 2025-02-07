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
        const { selectedChatData, selectedChatType, addMessage } = useAppStore.getState()
        if (
          selectedChatType !== undefined ||
          (typeof selectedChatData !== 'string' &&
            (selectedChatData?._id === (message.sender as { _id: string })._id || selectedChatData?._id === (message.recipient as { _id: string })._id))
        ) {
          console.log('Received Message:', message)
          addMessage(message)
        }
      }

      socket.current?.on('recieveMessage', handleReceiveMessage)

      return () => {
        socket.current?.disconnect()
      }
    }
  }, [userInfo])

  return <SocketContext.Provider value={socket.current}>{children}</SocketContext.Provider>
}
