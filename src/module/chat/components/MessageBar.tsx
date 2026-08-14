import EmojiPicker, { Theme } from 'emoji-picker-react'
import { useEffect, useRef, useState } from 'react'
import { GrAttachment } from 'react-icons/gr'
import { IoSend } from 'react-icons/io5'
import { RiEmojiStickerLine } from 'react-icons/ri'
import { FiCornerUpLeft, FiX, FiFile } from 'react-icons/fi'
import { HiOutlineSparkles, HiSparkles } from 'react-icons/hi'
import { FaChevronDown } from 'react-icons/fa'
import { useAppStore } from '../../../store/store'
import { useSocket } from '../../../hook/socketContext'
import http from '../../../services/http'
import aiService from '../../../services/ai'
import { handleError } from '../../../common/HandleError'
import { motion, AnimatePresence } from 'framer-motion'
import { Message } from '../../../types'

interface DiffToken {
  type: 'added' | 'removed' | 'unchanged'
  text: string
}

function computeWordDiff(original: string, suggested: string): DiffToken[] {
  const origWords = original.trim().split(/\s+/)
  const suggWords = suggested.trim().split(/\s+/)

  const dp: number[][] = Array(origWords.length + 1)
    .fill(null)
    .map(() => Array(suggWords.length + 1).fill(0))

  for (let i = 1; i <= origWords.length; i++) {
    for (let j = 1; j <= suggWords.length; j++) {
      if (origWords[i - 1].toLowerCase().replace(/[^a-z0-9]/g, '') === suggWords[j - 1].toLowerCase().replace(/[^a-z0-9]/g, '')) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  const diff: DiffToken[] = []
  let i = origWords.length
  let j = suggWords.length

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origWords[i - 1].toLowerCase().replace(/[^a-z0-9]/g, '') === suggWords[j - 1].toLowerCase().replace(/[^a-z0-9]/g, '')) {
      diff.unshift({ type: 'unchanged', text: suggWords[j - 1] })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.unshift({ type: 'added', text: suggWords[j - 1] })
      j--
    } else {
      diff.unshift({ type: 'removed', text: origWords[i - 1] })
      i--
    }
  }

  return diff
}

const MessageBar = () => {
  const emojiRef = useRef<HTMLDivElement>(null)
  const aiMenuRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { setIsUploading, setFileUploadProgress, selectedChatType, selectedChatData, selectedChatMessages, userInfo, replyingToMessage, setReplyingToMessage, addMessage } =
    useAppStore()

  const socket = useSocket()
  const [message, setMessage] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [showAiMenu, setShowAiMenu] = useState(false)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [smartReplies, setSmartReplies] = useState<string[]>([])
  const [lastFetchedMsgId, setLastFetchedMsgId] = useState<string | null>(null)

  // Auto Grammar Suggestions States
  const [isCheckingGrammar, setIsCheckingGrammar] = useState(false)
  const [grammarSuggestion, setGrammarSuggestion] = useState<string | null>(null)
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([])

  const handleEmoji = (emoji: { emoji: string }) => {
    setMessage((msg) => msg + emoji.emoji)
  }

  // ─── Fetch Smart Replies ──────────────────────────────────────────────────
  useEffect(() => {
    if (selectedChatMessages.length === 0 || !userInfo) {
      setSmartReplies([])
      return
    }

    const lastMsg = selectedChatMessages[selectedChatMessages.length - 1]
    const isFromOther = typeof lastMsg.sender === 'object' ? lastMsg.sender?._id !== userInfo.id : lastMsg.sender !== userInfo.id

    // Only fetch if the last message is from the other user and has changed
    if (isFromOther && lastMsg._id && lastMsg._id !== lastFetchedMsgId && lastMsg.messageType === 'text') {
      const fetchReplies = async () => {
        try {
          const context = selectedChatMessages.slice(-5).map((m) => ({
            sender: typeof m.sender === 'object' ? m.sender?._id : m.sender,
            content: m.content || '',
          }))
          const replies = await aiService.generateSmartReply(lastMsg.content || '', context)
          setSmartReplies(replies)
          setLastFetchedMsgId(lastMsg._id!)
        } catch (err) {
          console.error('Failed to fetch smart replies:', err)
        }
      }
      fetchReplies()
    } else if (!isFromOther) {
      setSmartReplies([])
    }
  }, [selectedChatMessages, userInfo, lastFetchedMsgId])

  // ─── Auto Grammar Checker (Debounced) ──────────────────────────────────────
  useEffect(() => {
    if (!message.trim() || message.trim().length < 3) {
      setGrammarSuggestion(null)
      return
    }

    if (grammarSuggestion && message.trim().toLowerCase() === grammarSuggestion.trim().toLowerCase()) {
      setGrammarSuggestion(null)
      return
    }

    const checkTimeout = setTimeout(async () => {
      if (dismissedSuggestions.includes(message.trim())) {
        return
      }

      setIsCheckingGrammar(true)
      try {
        const corrected = await aiService.enhanceMessage(message, 'grammar')

        const cleanOrig = message
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
        const cleanCorr = corrected
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')

        if (corrected && corrected.trim() !== message.trim() && cleanOrig !== cleanCorr) {
          setGrammarSuggestion(corrected.trim())
        } else {
          setGrammarSuggestion(null)
        }
      } catch (err) {
        console.error('Grammar check failed:', err)
      } finally {
        setIsCheckingGrammar(false)
      }
    }, 2000)

    return () => clearTimeout(checkTimeout)
  }, [message, dismissedSuggestions, grammarSuggestion])

  const handleSendMessage = async (textToSend = message) => {
    const trimmed = textToSend.trim()
    if (!trimmed) return

    const tempId = `temp-${Date.now()}`
    const replyTargetId = replyingToMessage?._id

    const optimisticMessage: Message = {
      _id: tempId,
      tempId,
      sender: userInfo?.id || '',
      recipient: typeof selectedChatData === 'object' ? selectedChatData._id : selectedChatData || '',
      content: trimmed,
      messageType: 'text',
      status: 'sending',
      replyTo: replyingToMessage || undefined,
      timestamp: new Date().toISOString(),
    }

    addMessage(optimisticMessage)

    const payload = {
      sender: userInfo?.id,
      content: trimmed,
      messageType: 'text',
      fileUrl: undefined,
      replyTo: replyTargetId || null,
      tempId,
    }

    if (selectedChatType === 'contact') {
      socket?.emit('sendMessage', {
        ...payload,
        recipient: typeof selectedChatData === 'string' ? selectedChatData : selectedChatData?._id,
      })
    } else if (selectedChatType === 'channel') {
      socket?.emit('sendChannelMessage', {
        ...payload,
        channelId: typeof selectedChatData === 'string' ? selectedChatData : selectedChatData?._id,
      })
    }

    setMessage('')
    setReplyingToMessage(null)
    setSmartReplies([])
    setGrammarSuggestion(null)
    inputRef.current?.focus()
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  const handleFileChange = () => {
    fileRef.current?.click()
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
          const replyTargetId = replyingToMessage?._id
          const tempId = `temp-${Date.now()}`

          if (selectedChatType === 'contact') {
            socket?.emit('sendMessage', {
              sender: userInfo?.id,
              recipient: typeof selectedChatData === 'string' ? selectedChatData : selectedChatData?._id,
              content: undefined,
              messageType: 'file',
              fileUrl: response.data.filePath,
              replyTo: replyTargetId || null,
              tempId,
            })
          } else if (selectedChatType === 'channel') {
            socket?.emit('sendChannelMessage', {
              sender: userInfo?.id,
              content: undefined,
              messageType: 'file',
              fileUrl: response.data.filePath,
              channelId: typeof selectedChatData === 'string' ? selectedChatData : selectedChatData?._id,
              replyTo: replyTargetId || null,
              tempId,
            })
          }
          setReplyingToMessage(null)
        }
      }
    } catch (error) {
      setIsUploading(false)
      handleError(error)
    }
  }

  const handleEnhanceMessage = async (style: string) => {
    if (!message.trim()) return

    setIsEnhancing(true)
    setShowAiMenu(false)

    try {
      const enhanced = await aiService.enhanceMessage(message, style)
      setMessage(enhanced)
    } catch (err) {
      console.error(err)
    } finally {
      setIsEnhancing(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false)
      }
      if (aiMenuRef.current && !aiMenuRef.current.contains(e.target as Node)) {
        setShowAiMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const replySenderName = replyingToMessage
    ? typeof replyingToMessage.sender === 'object' && replyingToMessage.sender?.firstName
      ? `${replyingToMessage.sender.firstName} ${replyingToMessage.sender.lastName || ''}`
      : 'User'
    : ''

  const aiStyles = [
    { label: 'Fix Grammar', style: 'grammar', desc: 'Fix spelling & punctuation' },
    { label: 'Improve Writing', style: 'improve', desc: 'Refine vocabulary & flow' },
    { label: 'Make Friendly', style: 'casual', desc: 'Friendly and casual tone' },
    { label: 'Make Formal', style: 'formal', desc: 'Professional business tone' },
    { label: 'Rephrase', style: 'rephrase', desc: 'Alternative wording' },
    { label: 'Make Funny', style: 'funny', desc: 'Add some humor' },
    { label: 'Make Detailed', style: 'detailed', desc: 'Expand content with details' },
  ]

  const diffTokens = grammarSuggestion ? computeWordDiff(message, grammarSuggestion) : []

  return (
    <div className="p-2.5 sm:p-4 flex-shrink-0 bg-[#0D0E12]/90 backdrop-blur-xl border-t border-white/[0.08] relative z-20">
      <div className="max-w-screen-2xl mx-auto flex flex-col gap-2">
        {/* AI Smart Replies Container (Only visible when input is empty) */}
        <AnimatePresence>
          {smartReplies.length > 0 && message.trim() === '' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-1.5 sm:gap-2 pb-2 overflow-x-auto custom-scrollbar whitespace-nowrap"
            >
              <span className="text-[10px] text-indigo-400 font-medium flex items-center gap-1 uppercase tracking-wider mr-1 flex-shrink-0">
                <HiSparkles className="text-xs" /> Smart Reply:
              </span>
              {smartReplies.map((reply, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSendMessage(reply)}
                  className="px-3 py-1 sm:py-1.5 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/40 text-[11px] sm:text-xs font-light text-white/90 transition-all duration-200 flex-shrink-0"
                >
                  {reply}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Grammar Suggestion Container (Only visible when typing) */}
        <AnimatePresence>
          {grammarSuggestion && message.trim() !== '' && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-2.5 sm:p-3 text-xs backdrop-blur-md gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 flex-shrink-0">
                    <HiOutlineSparkles className="text-sm" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">Grammar Suggestion</span>
                    <span className="text-white/80 font-light truncate">
                      {diffTokens.map((token, idx) => {
                        if (token.type === 'added') {
                          return (
                            <span key={idx} className="text-emerald-400 font-semibold bg-emerald-500/20 px-1 rounded mx-0.5">
                              {token.text}
                            </span>
                          )
                        }
                        if (token.type === 'removed') {
                          return (
                            <span key={idx} className="line-through text-rose-400/80 mx-0.5">
                              {token.text}
                            </span>
                          )
                        }
                        return (
                          <span key={idx} className="mx-0.5">
                            {token.text}
                          </span>
                        )
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      setMessage(grammarSuggestion)
                      setGrammarSuggestion(null)
                    }}
                    className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-300 hover:text-white text-[10px] sm:text-[11px] font-semibold tracking-wide transition-all shadow-md active:scale-95 whitespace-nowrap"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => {
                      setDismissedSuggestions((prev) => [...prev, message.trim()])
                      setGrammarSuggestion(null)
                    }}
                    className="p-1 text-white/40 hover:text-white/80 transition-colors"
                    title="Dismiss suggestion"
                  >
                    <FiX className="text-sm" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reply Context Banner */}
        <AnimatePresence>
          {replyingToMessage && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="flex items-center justify-between bg-white/[0.04] border-l-4 border-indigo-500 border-t border-r border-b border-white/10 rounded-xl px-3 py-2 text-xs backdrop-blur-md">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FiCornerUpLeft className="text-indigo-400 text-sm flex-shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-indigo-400 truncate">Replying to {replySenderName}</span>
                    <span className="text-white/60 truncate font-light">
                      {replyingToMessage.messageType === 'file' ? (
                        <span className="flex items-center gap-1">
                          <FiFile className="text-xs" /> {replyingToMessage.fileUrl?.split('/').pop()}
                        </span>
                      ) : (
                        replyingToMessage.content
                      )}
                    </span>
                  </div>
                </div>
                <button onClick={() => setReplyingToMessage(null)} className="p-1 text-white/40 hover:text-white rounded-lg transition-colors flex-shrink-0">
                  <FiX className="text-sm" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Controls Container */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex-1 min-w-0 relative">
            <div className="flex items-center bg-white/[0.04] border border-white/10 focus-within:border-indigo-500/50 rounded-2xl transition-all duration-300 shadow-inner px-2.5 sm:px-3 py-1 sm:py-1.5 min-w-0">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isEnhancing ? 'AI is polishing...' : 'Type a message...'}
                disabled={isEnhancing}
                className="min-w-0 flex-1 px-1.5 sm:px-3 py-1.5 sm:py-2 bg-transparent text-white placeholder-white/40 focus:outline-none text-xs sm:text-sm tracking-wide font-sans disabled:opacity-50"
              />

              {/* Grammar checking background indicator */}
              {isCheckingGrammar && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
                  className="p-1.5 sm:p-2 text-indigo-400/70 flex-shrink-0"
                  title="Checking grammar..."
                >
                  <HiOutlineSparkles className="text-base sm:text-lg" />
                </motion.div>
              )}

              {/* Grammarly-like Writing Assistant Button */}
              <div className="relative flex-shrink-0" ref={aiMenuRef}>
                <button
                  onClick={() => setShowAiMenu(!showAiMenu)}
                  className={`p-1.5 sm:p-2 rounded-xl border transition-all duration-200 flex items-center gap-1 ${
                    showAiMenu ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300' : 'bg-white/5 border-white/5 text-white/50 hover:text-indigo-400 hover:bg-indigo-500/10'
                  }`}
                  title="AI Writing Assistant"
                  disabled={isEnhancing}
                >
                  <HiOutlineSparkles className={`text-base sm:text-xl ${isEnhancing ? 'animate-spin' : ''}`} />
                  <FaChevronDown className="text-[7px] sm:text-[8px]" />
                </button>

                <AnimatePresence>
                  {showAiMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-full right-0 mb-3 z-50 w-56 sm:w-64 max-w-[calc(100vw-24px)] rounded-2xl bg-[#0F1015]/95 border border-white/10 p-2.5 shadow-2xl backdrop-blur-xl"
                    >
                      <div className="px-2 pb-2 mb-1.5 border-b border-white/[0.08] flex items-center justify-between">
                        <span className="text-[10px] font-semibold tracking-wider text-indigo-400 uppercase">Tone Assistant</span>
                        <span className="text-[8px] text-white/40">Select style to refine</span>
                      </div>
                      <div className="space-y-0.5 max-h-48 overflow-y-auto custom-scrollbar">
                        {aiStyles.map((item) => (
                          <button
                            key={item.style}
                            onClick={() => handleEnhanceMessage(item.style)}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-indigo-500/10 text-white transition-all flex flex-col group"
                          >
                            <span className="text-xs font-medium group-hover:text-indigo-300">{item.label}</span>
                            <span className="text-[9px] text-white/40 group-hover:text-white/60 font-light">{item.desc}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                className="p-1.5 sm:p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors ml-0.5 flex-shrink-0"
                onClick={handleFileChange}
                title="Attach File"
              >
                <GrAttachment className="text-base sm:text-lg" />
              </button>
              <input type="file" className="hidden" ref={fileRef} onChange={handleAttachmentChange} />

              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setShowEmoji(!showEmoji)}
                  className="p-1.5 sm:p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  title="Select Emoji"
                >
                  <RiEmojiStickerLine className="text-base sm:text-xl" />
                </button>

                {showEmoji && (
                  <div className="absolute bottom-full right-0 mb-3 z-50 shadow-2xl rounded-2xl overflow-hidden border border-white/10 max-w-[calc(100vw-24px)]" ref={emojiRef}>
                    <EmojiPicker theme={Theme.DARK} height={320} width={300} onEmojiClick={handleEmoji} autoFocusSearch={false} />
                  </div>
                )}
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSendMessage()}
            disabled={!message.trim() || isEnhancing}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg hover:shadow-indigo-500/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 flex-shrink-0"
          >
            <IoSend className="text-base sm:text-lg ml-0.5" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default MessageBar
