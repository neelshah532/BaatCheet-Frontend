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
    <div className="p-4 bg-[#13131A]/80 backdrop-blur-md border-t border-white/[0.05]">
      <div className="max-w-screen-2xl mx-auto flex items-center gap-4">
        {/* Message Input */}
        <div className="flex-1 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center bg-[#1C1C24] rounded-lg border border-white/[0.05] group-hover:border-indigo-500/50 transition-colors">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 bg-transparent text-white placeholder-gray-500 focus:outline-none"
            />

            {/* Attachment Button */}
            <button className="p-2 hover:bg-white/[0.05] rounded-lg text-gray-400 hover:text-white transition-colors">
              <GrAttachment className="text-xl" />
            </button>

            {/* Emoji Button */}
            <div className="relative">
              <button onClick={() => setShowEmoji(!showEmoji)} className="p-2 hover:bg-white/[0.05] rounded-lg text-gray-400 hover:text-white transition-colors">
                <RiEmojiStickerLine className="text-xl" />
              </button>

              {/* Emoji Picker */}
              {showEmoji && (
                <div className="absolute bottom-full right-0 mb-2" ref={emojiRef}>
                  <EmojiPicker theme={Theme.DARK} height={400} width={350} onEmojiClick={handleEmoji} autoFocusSearch={false} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSendMessage}
          disabled={!message.trim()}
          className="p-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white
            hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            transition-all duration-200"
        >
          <IoSend className="text-xl" />
        </button>
      </div>
    </div>
  )

  // return (
  //   <div className="h-[10vh] bg-[#1c1d25] flex justify-center items-center px-6 mb-6 gap-6">
  //     <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-5 pr-5">
  //       <input
  //         type="text"
  //         className="flex-1 p-5 bg-transparent rounded-md focus:outline-none"
  //         placeholder="Enter Message Here"
  //         value={message}
  //         onChange={(e) => setMessage(e.target.value)}
  //       />
  //       <button className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all">
  //         <GrAttachment className="text-2xl" />
  //       </button>
  //       <div className="relative">
  //         <button className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all" onClick={() => setShowEmoji(!showEmoji)}>
  //           <RiEmojiStickerLine className="text-2xl" />
  //         </button>
  //         <div className="absolute bottom-16 right-0" ref={emojiRef}>
  //           <EmojiPicker theme={Theme.DARK} height={500} width={400} open={showEmoji} onEmojiClick={handleEmoji} autoFocusSearch={false} />
  //         </div>
  //       </div>
  //     </div>
  //     <button
  //       className="bg-[#8471ff] flex justify-center items-center p-5 rounded-md hover:bg-[#741bda] focus:bg-[#741bda] focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
  //       onClick={() => handleSendMessage()}
  //     >
  //       <IoSend className="text-2xl" />
  //     </button>
  //   </div>
  // )
}

export default MessageBar
