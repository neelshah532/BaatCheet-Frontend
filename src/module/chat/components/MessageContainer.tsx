import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../../../store/store'
import moment from 'moment'
import { Message } from '../../../types'
import '../../../styles/CustomScroll.css'
import http from '../../../services/http'
import { MdFolder } from 'react-icons/md'
import { IoMdArrowRoundDown } from 'react-icons/io'
import { IoCloseCircleSharp } from 'react-icons/io5'
import { colors } from '../../../constants/color'
import { motion } from 'framer-motion'
import { handleError } from '../../../common/HandleError'
import CustomLoader from '../../../common/CustomLoader'

const MessageContainer = () => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { selectedChatType, selectedChatData, selectedChatMessages, userInfo, isDownloading, setIsDownloading, setFileDownloadProgress, setSelectedChatMessages } = useAppStore()
  const [showImage, setShowImage] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isLoadingNewMessages, setIsLoadingNewMessages] = useState<boolean>(false)

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
          {selectedChatType === 'channel' && renderChannelMessages(message)}
        </div>
      )
    })
  }

  const renderChannelMessages = (message: Message) => {
    const isCurrentUser = typeof message.sender === 'object' && message.sender?._id === userInfo?.id

    return (
      <div className={`mt-5 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
        {/* Sender Avatar */}
        {typeof message.sender === 'object' && message.sender?._id !== userInfo?.id ? (
          <div className="flex items-center justify-end  gap-3">
            <div className="relative">
              {message.sender.image ? (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                  style={{ backgroundColor: colors[message.sender.color || 0] }}
                >
                  <img src={`${import.meta.env.VITE_LOCAL_HOST}/${message.sender.image}`} alt="Profile Preview" className="w-10 h-10 rounded-full object-cover" />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white" style={{ backgroundColor: colors[message.sender.color || 0] }}>
                  {message.sender.firstName ? message.sender.firstName.split('').shift() : message.sender.email?.split('').shift() || '?'}
                </div>
              )}
            </div>
            <span className="text-sm text-white/80">{`${message.sender.firstName} ${message.sender.lastName}`}</span>
            <span className="text-sm text-white/80">{moment(message.timestamp).format('LT')}</span>
          </div>
        ) : (
          <div className="text-sm text-white/80 ">{moment(message.timestamp).format('LT')}</div>
        )}
        {/* Text Message */}
        {message.messageType === 'text' && (
          <div
            className={`${
              isCurrentUser ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' : 'bg-[#1C1C24] text-gray-100 border border-white/[0.05]'
            } border inline-block p-4 rounded my-1 max-w-[50%] break-words mt-2`}
          >
            {message.content}
          </div>
        )}

        {message.messageType === 'file' && (
          <div
            className={`${
              typeof message.sender === 'object' && message.sender?._id === userInfo?.id
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                : 'bg-[#1C1C24] text-gray-100 border border-white/[0.05] '
            } border inline-block p-4 rounded my-1 max-w-[50%] break-words `}
          >
            {checkIfImage(message.fileUrl || '') ? (
              <div
                className="cursor-pointer"
                onClick={() => {
                  setShowImage(true)
                  setImageUrl(message.fileUrl ?? null)
                }}
              >
                <img src={`${import.meta.env.VITE_LOCAL_HOST}/${message.fileUrl}`} alt="" height={300} width={300} />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <span className="text-white/80 text-3xl bg-black/20 rounded-full p-3">
                  <MdFolder />
                </span>
                <span>{message.fileUrl?.split('/').pop()}</span>
                <span
                  className="bg-black/20 rounded-full p-3 text-2xl hover:bg-black/50 cursor-pointer transition-all duration-300 "
                  onClick={() => downloadFile(message.fileUrl || '')}
                >
                  <IoMdArrowRoundDown />
                </span>
              </div>
            )}
          </div>
        )}
        <div></div>
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
    return (
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
        {message.messageType === 'file' && (
          <div
            className={`${
              message.sender !== (typeof selectedChatData === 'object' && selectedChatData?._id)
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                : 'bg-[#1C1C24] text-gray-100 border border-white/[0.05] '
            } border inline-block p-4 rounded my-1 max-w-full sm:max-w-[70%] md:max-w-[60%] lg:max-w-[50%] break-words `}
          >
            {checkIfImage(message.fileUrl || '') ? (
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer"
                onClick={() => {
                  setShowImage(true)
                  setImageUrl(message.fileUrl ?? null)
                }}
              >
                <img
                  src={`${import.meta.env.VITE_LOCAL_HOST}/${message.fileUrl}`}
                  alt=""
                  height={300}
                  width={300}
                  className="w-full h-auto max-h-[300px] object-cover transition-transform duration-300"
                />
              </motion.div>
            ) : (
              <div className="group flex flex-col items-center gap-4 p-3 rounded-xl ">
                <div className="flex items-center gap-3 flex-1 min-w-0 max-lg:flex-col  ">
                  <span className="text-white/80 text-2xl bg-black/20 rounded-full p-3">
                    <MdFolder />
                  </span>
                  {/* <span className="text-sm text-center truncate text-wrap ">{message.fileUrl?.split('/').pop()}</span> */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm">{message.fileUrl?.split('/').pop()}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => downloadFile(message.fileUrl || '')}
                  className="bg-black/20 p-3 text-2xl hover:bg-black/30 text-white px-4 py-2 rounded-lg transition-all duration-300"
                >
                  <IoMdArrowRoundDown className="text-lg" />
                  <span className="text-sm font-medium">Download</span>
                </motion.button>
              </div>
            )}
          </div>
        )}
        <div className={`text-xs mt-1 ${message.sender !== (typeof selectedChatData === 'object' && selectedChatData?._id) ? 'text-white/70' : 'text-gray-400'}`}>
          {moment(message.timestamp).format('LT')}
        </div>
      </div>
    )
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
          console.log(response?.data?.messages)
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
          console.log(response?.data?.messages)
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
    return (
      <div className="flex-1 flex items-center justify-center">
        <CustomLoader type="default" message="Loading conversation..." />
      </div>
    )
  }
  if (isLoading === false && isLoadingNewMessages == false && selectedChatMessages.length === 0) {
    return <div className="flex-1 flex items-center justify-center text-gray-400">No messages yet. Start a conversation!</div>
  }
  const ImageViewer = ({ imageUrl, onClose, onDownload }: { imageUrl: string; onClose: () => void; onDownload: () => void }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-2 z-20 bg-black/90 backdrop-blur-lg">
      <div className="absolute top-4 right-4 flex gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onDownload}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300"
        >
          <IoMdArrowRoundDown className="text-white text-xl" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300"
        >
          <IoCloseCircleSharp className="text-white text-xl" />
        </motion.button>
      </div>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="h-full w-full flex items-center justify-center p-8">
        <img src={`${import.meta.env.VITE_LOCAL_HOST}/${imageUrl}`} alt="Full screen preview" className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl" />
      </motion.div>
    </motion.div>
  )

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full">
      <div className="h-full p-6 space-y-6">
        {showImage && imageUrl && (
          <div>
            <ImageViewer
              imageUrl={imageUrl}
              onClose={() => {
                setShowImage(false)
                setImageUrl(null)
              }}
              onDownload={() => downloadFile(imageUrl)}
            />
          </div>
        )}
        {renderMessages()}
        <div ref={scrollRef} />
      </div>
    </div>
  )
}

export default MessageContainer
