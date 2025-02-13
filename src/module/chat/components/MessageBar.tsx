import EmojiPicker, { Theme } from 'emoji-picker-react'
import { useEffect, useRef, useState } from 'react'
import { GrAttachment } from 'react-icons/gr'
import { IoSend } from 'react-icons/io5'
import { RiEmojiStickerLine } from 'react-icons/ri'
import { useAppStore } from '../../../store/store'
import { useSocket } from '../../../hook/socketContext'
import http from '../../../services/http'
import { handleError } from '../../../common/HandleError'

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
  // console.log('message', message)

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
    console.log('clicked')
    if (fileRef.current) {
      console.log('fileRef', fileRef.current)
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
            // const progress = Math.round((data.loaded / (data.total ?? data.loaded)) * 100)
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
        console.log({ response })
      }
      console.log({ file })
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
    <div className="p-4 bg-[#13131A]/80 backdrop-blur-md border-t border-white/[0.05]">
      <div className="max-w-screen-2xl h-full mx-auto flex items-center gap-4">
        {/* Message Input */}
        <div className="flex-1 relative group ">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex  items-center bg-[#1C1C24] rounded-lg border border-white/[0.05] group-hover:border-indigo-500/50 transition-colors">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 bg-transparent text-white placeholder-gray-500 focus:outline-none"
            />
            {/* Attachment Button */}
            <button className="p-2 hover:bg-white/[0.05] rounded-lg text-gray-400 hover:text-white transition-colors" onClick={handleFileChange}>
              <GrAttachment className="text-xl" />
            </button>
            <input type="file" className="hidden" ref={fileRef} onChange={handleAttachmentChange} name="" id="" />
            {/* Emoji Button */}
            <div className="relative p-2">
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
          className="p-4 h-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white
            hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            transition-all duration-200"
        >
          <IoSend className="text-xl" />
        </button>
      </div>
    </div>
  )
}

export default MessageBar
