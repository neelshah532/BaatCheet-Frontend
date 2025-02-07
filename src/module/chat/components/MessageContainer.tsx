import React, { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../../../store/store'
import moment from 'moment'
import { Message } from '../../../types'
import '../../../styles/CustomScroll.css'
import CustomLoader from '../../../common/CustomLoader'

const MessageContainer = () => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { selectedChatType, selectedChatData, selectedChatMessages } = useAppStore()

  const renderMessages = () => {
    let lastDate: string | null = null
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format('YYYY-MM-DD')
      const showDate = messageDate !== lastDate
      lastDate = messageDate
      return (
        <div key={index}>
          {showDate && <div className="text-center text-gray-500 my-2">{moment(message.timestamp).format('LL')}</div>}
          {selectedChatType === 'contact' && renderDMmessages(message)}
        </div>
      )
    })
  }
  const renderDMmessages = (message: Message) => (
    <div className={`${message.sender === (typeof selectedChatData === 'object' && selectedChatData?._id) ? 'text-left' : 'text-right'}`}>
      {message.messageType === 'text' && (
        <div
          className={`${
            message.sender !== (typeof selectedChatData === 'object' && selectedChatData?._id)
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
              : 'bg-[#1C1C24] text-gray-100 border border-white/[0.05] '
          } border inline-block p-4 rounded my-1 max-w-[50%] break-words `}
        >
          {message.content}
        </div>
      )}
      <div className={`text-xs mt-1 ${message.sender !== (typeof selectedChatData === 'object' && selectedChatData?._id) ? 'text-white/70' : 'text-gray-400'}`}>
        {moment(message.timestamp).format('LT')}
      </div>
    </div>
  )

  useEffect(() => {
    // Simulate initial loading
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [selectedChatData])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedChatMessages])

  // useEffect(() => {
  //   // Show loading when new messages are being added
  //   if (selectedChatMessages.length > 0) {
  //     // setLoadingNewMessages(true)
  //     const timer = setTimeout(() => {
  //       // setLoadingNewMessages(false)
  //       scrollToBottom()
  //     }, 300)

  //     return () => clearTimeout(timer)
  //   }
  // }, [selectedChatMessages.length])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <CustomLoader type="default" message="Loading conversation..." />
      </div>
    )
  }

  if (selectedChatMessages.length === 0) {
    return <div className="flex-1 flex items-center justify-center text-gray-400">No messages yet. Start a conversation!</div>
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="h-full p-6 space-y-6">
        {/* Date Separator */}
        {selectedChatMessages.map((message, index) => {
          const messageDate = moment(message.timestamp).format('LL')
          const showDate = index === 0 || messageDate !== moment(selectedChatMessages[index - 1].timestamp).format('LL')

          return (
            <div key={index} className="space-y-4">
              {showDate && (
                <div className="flex items-center justify-center">
                  <div className="px-4 py-2 rounded-full bg-[#1C1C24] text-gray-400 text-xs">{messageDate}</div>
                </div>
              )}
              {renderMessages()}
            </div>
          )
        })}
        <div ref={scrollRef} />
      </div>
    </div>
  )
}

export default MessageContainer
