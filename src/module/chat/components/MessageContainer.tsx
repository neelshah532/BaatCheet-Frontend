import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../../../store/store'
import { useSocket } from '../../../hook/socketContext'
import moment from 'moment'
import { Message } from '../../../types'
import '../../../styles/CustomScroll.css'
import http from '../../../services/http'
import aiService from '../../../services/ai'
import { MdFolder } from 'react-icons/md'
import { IoMdArrowRoundDown } from 'react-icons/io'
import { IoCloseCircleSharp } from 'react-icons/io5'
import { FiCornerUpLeft, FiClock } from 'react-icons/fi'
import { BsCheck, BsCheckAll } from 'react-icons/bs'
import { FaLanguage } from 'react-icons/fa'
import { colors } from '../../../constants/color'
import { motion } from 'framer-motion'
import { handleError } from '../../../common/HandleError'
import { toast } from 'sonner'

const MessageContainer = () => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const socket = useSocket()
  const {
    selectedChatType,
    selectedChatData,
    selectedChatMessages,
    userInfo,
    isDownloading,
    setIsDownloading,
    setFileDownloadProgress,
    setSelectedChatMessages,
    setReplyingToMessage,
  } = useAppStore()

  const [showImage, setShowImage] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isLoadingNewMessages, setIsLoadingNewMessages] = useState<boolean>(false)

  // Translation States
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({})
  const [activeTranslateMenu, setActiveTranslateMenu] = useState<string | null>(null)
  const [translatingMessageId, setTranslatingMessageId] = useState<string | null>(null)

  const translateMenuRef = useRef<HTMLDivElement>(null)

  const languages = [
    { code: 'English', label: 'English' },
    { code: 'Spanish', label: 'Español' },
    { code: 'French', label: 'Français' },
    { code: 'Hindi', label: 'हिन्दी' },
    { code: 'German', label: 'Deutsch' },
    { code: 'Arabic', label: 'العربية' },
  ]

  // Listen for real-time delivery & read state updates over socket
  useEffect(() => {
    if (!socket) return

    const handleMessagesRead = () => {
      setSelectedChatMessages(selectedChatMessages.map((msg) => ({ ...msg, status: 'read' })))
    }

    socket.on('messages-read-update', handleMessagesRead)
    return () => {
      socket.off('messages-read-update', handleMessagesRead)
    }
  }, [socket, selectedChatMessages, setSelectedChatMessages])

  // Close translate menus on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (translateMenuRef.current && !translateMenuRef.current.contains(e.target as Node)) {
        setActiveTranslateMenu(null)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  // Emit mark-messages-read when opening/viewing DM messages
  useEffect(() => {
    if (socket && selectedChatType === 'contact' && selectedChatData && typeof selectedChatData === 'object') {
      socket.emit('mark-messages-read', { senderId: selectedChatData._id })
    }
  }, [socket, selectedChatType, selectedChatData, selectedChatMessages.length])

  const scrollToMessage = (msgId?: string) => {
    if (!msgId) return
    const el = document.getElementById(`message-${msgId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('ring-2', 'ring-indigo-400')
      setTimeout(() => el.classList.remove('ring-2', 'ring-indigo-400'), 1500)
    }
  }

  // Double check (white/slate) for Delivered, Blue double check for Read
  const renderStatusTicks = (status?: string) => {
    if (status === 'sending') {
      return <FiClock className="text-[10px] text-white/50 animate-pulse" title="Sending..." />
    }
    if (status === 'delivered') {
      return <BsCheckAll className="text-sm text-white/70" title="Delivered (Double Tick)" />
    }
    if (status === 'read') {
      return <BsCheckAll className="text-sm text-blue-400 font-bold drop-shadow-md" title="Read (Blue Tick)" />
    }
    return <BsCheck className="text-sm text-white/70" title="Sent (Single Tick)" />
  }

  const renderReplyCard = (replyTo?: Message | string) => {
    if (!replyTo) return null

    let authorName = 'Message'
    let contentSnippet = '...'
    let replyId = ''

    if (typeof replyTo === 'object') {
      replyId = replyTo._id || ''
      if (typeof replyTo.sender === 'object' && replyTo.sender?.firstName) {
        authorName = `${replyTo.sender.firstName} ${replyTo.sender.lastName || ''}`
      }
      contentSnippet = replyTo.messageType === 'file' ? `📎 ${replyTo.fileUrl?.split('/').pop() || 'Attachment'}` : replyTo.content || ''
    }

    return (
      <div
        onClick={() => scrollToMessage(replyId)}
        className="bg-black/30 border-l-2 border-indigo-400 rounded-lg p-2 mb-1.5 cursor-pointer hover:bg-black/40 transition-colors select-none"
      >
        <div className="text-[11px] font-semibold text-indigo-400 truncate">{authorName}</div>
        <div className="text-xs text-white/70 truncate font-light">{contentSnippet}</div>
      </div>
    )
  }

  const handleTranslate = async (message: Message, targetLang: string) => {
    if (!message._id || !message.content) return
    setActiveTranslateMenu(null)
    setTranslatingMessageId(message._id)

    try {
      const result = await aiService.translateText(message.content, targetLang)
      setTranslatedMessages((prev) => ({ ...prev, [message._id!]: result }))
      toast.success(`Translated to ${targetLang}!`)
    } catch (err) {
      console.error(err)
      toast.error('Translation failed.')
    } finally {
      setTranslatingMessageId(null)
    }
  }

  const toggleTranslateMenu = (msgId: string) => {
    setActiveTranslateMenu(activeTranslateMenu === msgId ? null : msgId)
  }

  const renderTranslationText = (message: Message) => {
    const translated = translatedMessages[message._id || '']
    if (translatingMessageId === message._id) {
      return (
        <span className="flex items-center gap-1.5 text-white/60">
          <svg className="animate-spin h-3 w-3 text-indigo-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Translating...
        </span>
      )
    }
    if (translated) {
      return (
        <div className="flex flex-col gap-1.5">
          <p className="italic text-white/95">{translated}</p>
          <button
            onClick={() => {
              setTranslatedMessages((prev) => {
                const next = { ...prev }
                delete next[message._id!]
                return next
              })
            }}
            className="text-[10px] text-indigo-300 hover:text-indigo-400 font-medium self-start flex items-center gap-1"
          >
            Show Original
          </button>
        </div>
      )
    }
    return message.content
  }

  const renderTranslateDropdown = (message: Message) => {
    if (activeTranslateMenu !== message._id) return null
    return (
      <div ref={translateMenuRef} className="absolute bottom-full mb-2 z-50 bg-[#0F1015]/95 border border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-xl w-40">
        <div className="text-[9px] font-semibold text-indigo-400 uppercase tracking-wider px-2 pb-1 border-b border-white/[0.08] mb-1.5">Translate to:</div>
        <div className="space-y-0.5 max-h-48 overflow-y-auto custom-scrollbar">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleTranslate(message, lang.code)}
              className="w-full text-left px-2.5 py-1.5 text-xs text-white/80 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-all"
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const renderChannelMessages = (message: Message) => {
    const isCurrentUser = typeof message.sender === 'object' && message.sender?._id === userInfo?.id

    return (
      <div className={`group relative mt-4 flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        {typeof message.sender === 'object' && message.sender?._id !== userInfo?.id && (
          <div className="flex items-center gap-2 mb-1.5 px-1">
            <div className="relative">
              {message.sender.image ? (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm overflow-hidden"
                  style={{ backgroundColor: colors[message.sender.color || 0] }}
                >
                  <img src={`${import.meta.env.VITE_LOCAL_HOST}/${message.sender.image}`} alt="Profile" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                  style={{ backgroundColor: colors[message.sender.color || 0] }}
                >
                  {message.sender.firstName ? message.sender.firstName[0].toUpperCase() : '?'}
                </div>
              )}
            </div>
            <span className="text-xs font-medium text-white/70">{`${message.sender.firstName || ''} ${message.sender.lastName || ''}`}</span>
            <span className="text-[10px] text-white/40">{moment(message.timestamp).format('LT')}</span>
          </div>
        )}

        <div className="relative flex items-center max-w-[80%] md:max-w-[60%]">
          {/* Action buttons */}
          <div
            className={`absolute ${isCurrentUser ? 'right-full mr-2.5' : 'left-full ml-2.5'} top-1/2 -translate-y-1/2 opacity-45 md:opacity-25 md:group-hover:opacity-100 hover:!opacity-100 flex items-center gap-1 transition-all duration-200 z-10`}
          >
            {message.messageType === 'text' && message._id && (
              <div className="relative">
                <button
                  onClick={() => toggleTranslateMenu(message._id!)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all duration-200"
                  title="Translate message"
                >
                  <FaLanguage className="text-sm" />
                </button>
                {renderTranslateDropdown(message)}
              </div>
            )}
            <button
              onClick={() => setReplyingToMessage(message)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all duration-200"
              title="Reply to message"
            >
              <FiCornerUpLeft className="text-xs" />
            </button>
          </div>

          <div
            className={`px-4 py-3 rounded-2xl w-full break-words text-sm tracking-wide leading-relaxed shadow-sm ${
              isCurrentUser
                ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-br-none border border-white/10'
                : 'bg-white/[0.05] text-white/90 border border-white/10 rounded-bl-none backdrop-blur-md'
            }`}
          >
            {renderReplyCard(message.replyTo)}

            {message.messageType === 'text' && renderTranslationText(message)}

            {message.messageType === 'file' &&
              (checkIfImage(message.fileUrl || '') ? (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer overflow-hidden rounded-xl border border-white/10 my-1"
                  onClick={() => {
                    setShowImage(true)
                    setImageUrl(message.fileUrl ?? null)
                  }}
                >
                  <img src={`${import.meta.env.VITE_LOCAL_HOST}/${message.fileUrl}`} alt="Attachment" className="w-full h-auto max-h-[300px] object-cover rounded-xl" />
                </motion.div>
              ) : (
                <div className="flex items-center gap-3 p-2 bg-black/20 rounded-xl my-1">
                  <div className="p-3 bg-white/10 rounded-xl text-white text-xl">
                    <MdFolder />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{message.fileUrl?.split('/').pop()}</p>
                  </div>
                  <button
                    onClick={() => downloadFile(message.fileUrl || '')}
                    className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                    title="Download File"
                  >
                    <IoMdArrowRoundDown className="text-base" />
                  </button>
                </div>
              ))}

            <div className={`text-[10px] mt-1 font-mono flex items-center justify-end gap-1 ${isCurrentUser ? 'text-white/60' : 'text-white/40'}`}>
              <span>{moment(message.timestamp).format('LT')}</span>
              {isCurrentUser && renderStatusTicks(message.status)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const checkIfImage = (filePath: string) => {
    const imageRegex = /\.(jpeg|jpg|gif|png|tiff|bmp|webp|heic|heif|svg|ico)$/i
    return imageRegex.test(filePath)
  }

  const downloadFile = async (url: string) => {
    if (isDownloading) return

    try {
      setIsDownloading(true)
      setFileDownloadProgress(0)

      const response = await http.get(`${import.meta.env.VITE_LOCAL_HOST}/${url}`, {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent
          const progress = Math.round((loaded * 100) / (total ?? 0))
          setFileDownloadProgress(progress)
        },
      })

      const blob = new Blob([response.data])
      const downloadUrl = window.URL.createObjectURL(blob)
      const filename = url.split('/').pop() ?? 'download'

      const link = document.createElement('a')
      link.href = downloadUrl
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(downloadUrl)

      setTimeout(() => {
        setIsDownloading(false)
        setFileDownloadProgress(0)
      }, 500)
    } catch (error) {
      handleError(error)
    }
  }

  const renderDMmessages = (message: Message) => {
    const isSentByMe = message.sender === userInfo?.id || (typeof message.sender === 'object' && message.sender?._id === userInfo?.id)

    return (
      <div className={`group relative mt-3 flex flex-col ${isSentByMe ? 'items-end' : 'items-start'}`}>
        <div className="relative flex items-center max-w-[80%] md:max-w-[60%]">
          {/* Action buttons */}
          <div
            className={`absolute ${isSentByMe ? 'right-full mr-2.5' : 'left-full ml-2.5'} top-1/2 -translate-y-1/2 opacity-45 md:opacity-25 md:group-hover:opacity-100 hover:!opacity-100 flex items-center gap-1 transition-all duration-200 z-10`}
          >
            {message.messageType === 'text' && message._id && (
              <div className="relative">
                <button
                  onClick={() => toggleTranslateMenu(message._id!)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all duration-200"
                  title="Translate message"
                >
                  <FaLanguage className="text-sm" />
                </button>
                {renderTranslateDropdown(message)}
              </div>
            )}
            <button
              onClick={() => setReplyingToMessage(message)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all duration-200"
              title="Reply to message"
            >
              <FiCornerUpLeft className="text-xs" />
            </button>
          </div>

          <div
            className={`px-4 py-3 rounded-2xl w-full break-words text-sm tracking-wide leading-relaxed shadow-sm ${
              isSentByMe
                ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-br-none border border-white/10'
                : 'bg-white/[0.05] text-white/90 border border-white/10 rounded-bl-none backdrop-blur-md'
            }`}
          >
            {renderReplyCard(message.replyTo)}

            {message.messageType === 'text' && renderTranslationText(message)}

            {message.messageType === 'file' &&
              (checkIfImage(message.fileUrl || '') ? (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer overflow-hidden rounded-xl border border-white/10 my-1"
                  onClick={() => {
                    setShowImage(true)
                    setImageUrl(message.fileUrl ?? null)
                  }}
                >
                  <img src={`${import.meta.env.VITE_LOCAL_HOST}/${message.fileUrl}`} alt="Attached preview" className="w-full h-auto max-h-[300px] object-cover rounded-xl" />
                </motion.div>
              ) : (
                <div className="flex items-center gap-3 p-2 bg-black/20 rounded-xl my-1">
                  <div className="p-3 bg-white/10 rounded-xl text-white text-xl">
                    <MdFolder />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{message.fileUrl?.split('/').pop()}</p>
                  </div>
                  <button
                    onClick={() => downloadFile(message.fileUrl || '')}
                    className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                    title="Download File"
                  >
                    <IoMdArrowRoundDown className="text-base" />
                  </button>
                </div>
              ))}

            <div className={`text-[10px] mt-1 font-mono flex items-center justify-end gap-1 ${isSentByMe ? 'text-white/60' : 'text-white/40'}`}>
              <span>{moment(message.timestamp).format('LT')}</span>
              {isSentByMe && renderStatusTicks(message.status)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderMessages = () => {
    let lastDate: string | null = null
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format('YYYY-MM-DD')
      const showDate = messageDate !== lastDate
      lastDate = messageDate
      return (
        <div key={message._id || index} id={message._id ? `message-${message._id}` : undefined}>
          {showDate && (
            <div className="flex items-center justify-center my-6">
              <div className="bg-white/[0.04] border border-white/10 backdrop-blur-md px-4 py-1 rounded-full text-[11px] font-medium tracking-wider text-white/50 uppercase">
                {moment(message.timestamp).format('MMMM D, YYYY')}
              </div>
            </div>
          )}
          {selectedChatType === 'contact' && renderDMmessages(message)}
          {selectedChatType === 'channel' && renderChannelMessages(message)}
        </div>
      )
    })
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedChatMessages])

  useEffect(() => {
    const getMessage = async () => {
      setIsLoadingNewMessages(true)
      try {
        const response = await http.post(
          '/api/messages/get-messages',
          {
            id: typeof selectedChatData === 'object' ? selectedChatData?._id : undefined,
          },
          { withCredentials: true }
        )
        if (response?.data?.messages) {
          setSelectedChatMessages(response?.data?.messages)
        }
      } catch (error) {
        handleError(error)
      } finally {
        setIsLoadingNewMessages(false)
      }
    }

    const getChannelMessage = async () => {
      setIsLoadingNewMessages(true)
      try {
        const response = await http.get(`/api/channel/get-channels-messages/${typeof selectedChatData === 'object' && selectedChatData?._id}`, { withCredentials: true })

        if (response?.data?.messages) {
          setSelectedChatMessages(response?.data?.messages)
        }
      } catch (error) {
        handleError(error)
      } finally {
        setIsLoadingNewMessages(false)
      }
    }

    if (typeof selectedChatData === 'object' && selectedChatData?._id) {
      setIsLoading(true)
      if (selectedChatType === 'contact') {
        getMessage()
        setIsLoading(false)
      }
      if (selectedChatType === 'channel') {
        getChannelMessage()
        setIsLoading(false)
      }
    } else setIsLoading(false)
  }, [selectedChatType, selectedChatData, setSelectedChatMessages])

  if (isLoading === true || isLoadingNewMessages === true) {
    return <div className="flex-1 bg-[#0b0c10]" />
  }

  if (isLoading === false && isLoadingNewMessages === false && selectedChatMessages.length === 0) {
    return <div className="flex-1 flex items-center justify-center text-white/40 text-sm font-light select-none">No messages yet. Send a greeting to start the conversation!</div>
  }

  const ImageViewer = ({ imageUrl, onClose, onDownload }: { imageUrl: string; onClose: () => void; onDownload: () => void }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6"
    >
      <div className="absolute top-6 right-6 flex gap-3 z-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onDownload}
          className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all duration-200"
        >
          <IoMdArrowRoundDown className="text-xl" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all duration-200"
        >
          <IoCloseCircleSharp className="text-xl" />
        </motion.button>
      </div>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-h-[85vh] max-w-[85vw] flex items-center justify-center">
        <img
          src={`${import.meta.env.VITE_LOCAL_HOST}/${imageUrl}`}
          alt="Preview"
          className="max-h-[85vh] max-w-[85vw] object-contain rounded-2xl shadow-2xl border border-white/10"
        />
      </motion.div>
    </motion.div>
  )

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 px-6 md:px-12 w-full">
      <div className="h-full space-y-4">
        {showImage && imageUrl && (
          <ImageViewer
            imageUrl={imageUrl}
            onClose={() => {
              setShowImage(false)
              setImageUrl(null)
            }}
            onDownload={() => downloadFile(imageUrl)}
          />
        )}
        {renderMessages()}
        <div ref={scrollRef} />
      </div>
    </div>
  )
}

export default MessageContainer
