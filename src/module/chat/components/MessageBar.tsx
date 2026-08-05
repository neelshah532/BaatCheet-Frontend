import EmojiPicker, { Theme } from 'emoji-picker-react'
import { useEffect, useRef, useState } from 'react'
import { GrAttachment } from 'react-icons/gr'
import { IoSend } from 'react-icons/io5'
import { RiEmojiStickerLine } from 'react-icons/ri'
import { useAppStore } from '../../../store/store'
import { useSocket } from '../../../hook/socketContext'
import http from '../../../services/http'
import { handleError } from '../../../common/HandleError'
import { motion } from 'framer-motion'

const MessageBar = () => {
  const emojiRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const { setIsUploading, setFileUploadProgress, selectedChatType, selectedChatData, userInfo } = useAppStore()
  const socket = useSocket()
  const [message, setMessage] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)

  const handleEmoji = (emoji: { emoji: string }) => {
    setMessage((msg) => msg + emoji.emoji)
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return

    if (selectedChatType === 'contact') {
      socket?.emit('sendMessage', {
        sender: userInfo?.id,
        recipient: typeof selectedChatData === 'string' ? selectedChatData : selectedChatData?._id,
        content: message,
        messageType: 'text',
        fileUrl: undefined,
      })
    } else if (selectedChatType === 'channel') {
      socket?.emit('sendChannelMessage', {
        sender: userInfo?.id,
        content: message,
        messageType: 'text',
        fileUrl: undefined,
        channelId: typeof selectedChatData === 'string' ? selectedChatData : selectedChatData?._id,
      })
    }
    setMessage('')
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  const handleFileChange = () => {
    if (fileRef.current) {
      fileRef.current.click()
    }
  }

  const handleAttachmentChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event?.target?.files?.[0]
      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        setIsUploading(true)
        const response = await http.post('/api/messages/upload-files', formData, {
          withCredentials: true,
          onUploadProgress: (data) => {
            setFileUploadProgress?.(Math.round((100 * data.loaded) / (data.total ?? 0)))
          },
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        if (response.status === 200 && response?.data) {
          setIsUploading(false)
          if (selectedChatType === 'contact') {
            socket?.emit('sendMessage', {
              sender: userInfo?.id,
              recipient: typeof selectedChatData === 'string' ? selectedChatData : selectedChatData?._id,
              content: undefined,
              messageType: 'file',
              fileUrl: response.data.filePath,
            })
          } else if (selectedChatType === 'channel') {
            socket?.emit('sendChannelMessage', {
              sender: userInfo?.id,
              content: undefined,
              messageType: 'file',
              fileUrl: response.data.filePath,
              channelId: typeof selectedChatData === 'string' ? selectedChatData : selectedChatData?._id,
            })
          }
        }
      }
    } catch (error) {
      setIsUploading(false)
      handleError(error)
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
    <div className="p-4 bg-[#0D0E12]/90 backdrop-blur-xl border-t border-white/[0.08] relative z-20">
      <div className="max-w-screen-2xl mx-auto flex items-center gap-3">
        {/* Floating Input Container */}
        <div className="flex-1 relative">
          <div className="flex items-center bg-white/[0.04] border border-white/10 focus-within:border-indigo-500/50 rounded-2xl transition-all duration-300 shadow-inner px-3 py-1.5">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 bg-transparent text-white placeholder-white/40 focus:outline-none text-sm tracking-wide font-sans"
            />

            {/* Attachment Button */}
            <button className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors" onClick={handleFileChange} title="Attach File">
              <GrAttachment className="text-lg" />
            </button>
            <input type="file" className="hidden" ref={fileRef} onChange={handleAttachmentChange} />

            {/* Emoji Trigger */}
            <div className="relative">
              <button onClick={() => setShowEmoji(!showEmoji)} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors" title="Select Emoji">
                <RiEmojiStickerLine className="text-xl" />
              </button>

              {/* Emoji Picker Popover */}
              {showEmoji && (
                <div className="absolute bottom-full right-0 mb-3 z-50 shadow-2xl rounded-2xl overflow-hidden border border-white/10" ref={emojiRef}>
                  <EmojiPicker theme={Theme.DARK} height={380} width={340} onEmojiClick={handleEmoji} autoFocusSearch={false} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Animated Send Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSendMessage}
          disabled={!message.trim()}
          className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg hover:shadow-indigo-500/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
        >
          <IoSend className="text-lg ml-0.5" />
        </motion.button>
      </div>
    </div>
  )
}

export default MessageBar
