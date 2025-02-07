import EmojiPicker, { Theme } from 'emoji-picker-react'
import { useEffect, useRef, useState } from 'react'
import { GrAttachment } from 'react-icons/gr'
import { IoSend } from 'react-icons/io5'
import { RiEmojiStickerLine } from 'react-icons/ri'
import { useAppStore } from '../../../store/store'
import { useSocket } from '../../../hook/socketContext'

const MessageBar = () => {
  const emojiRef = useRef<HTMLDivElement>(null)
  const { selectedChatType, selectedChatData, userInfo } = useAppStore()
  const socket = useSocket()
  const [message, setMessage] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)

  const handleEmoji = (emoji: { emoji: string }) => {
    setMessage((msg) => msg + emoji.emoji)
  }
  // console.log('message', message)

  const handleSendMessage = async () => {
    // console.log(message)
    // setMessage('')
    if (selectedChatType === 'contact') {
      socket?.emit('sendMessage', {
        sender: userInfo?.id,
        recipient: typeof selectedChatData === 'string' ? selectedChatData : selectedChatData?._id,
        content: message,
        messageType: 'text',
        fileUrl: undefined,
      })
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [emojiRef])

  return (
    <div className="h-[10vh] bg-[#1c1d25] flex justify-center items-center px-6 mb-6 gap-6">
      <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-5 pr-5">
        <input
          type="text"
          className="flex-1 p-5 bg-transparent rounded-md focus:outline-none"
          placeholder="Enter Message Here"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all">
          <GrAttachment className="text-2xl" />
        </button>
        <div className="relative">
          <button className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all" onClick={() => setShowEmoji(!showEmoji)}>
            <RiEmojiStickerLine className="text-2xl" />
          </button>
          <div className="absolute bottom-16 right-0" ref={emojiRef}>
            <EmojiPicker theme={Theme.DARK} height={500} width={400} open={showEmoji} onEmojiClick={handleEmoji} autoFocusSearch={false} />
          </div>
        </div>
      </div>
      <button
        className="bg-[#8471ff] flex justify-center items-center p-5 rounded-md hover:bg-[#741bda] focus:bg-[#741bda] focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
        onClick={() => handleSendMessage()}
      >
        <IoSend className="text-2xl" />
      </button>
    </div>
  )
}

export default MessageBar
