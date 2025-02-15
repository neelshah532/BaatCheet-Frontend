import { useEffect } from 'react'
import { useAppStore } from '../../store/store'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import ContactContainer from './ContactContainer'
import EmptyChatContainer from './EmptyChatContainer'
import ChatContainer from './ChatContainer'
import { motion } from 'framer-motion'

const Chat = () => {
  const { isUploading, isDownloading, fileUploadProgress, fileDownloadProgress, userInfo, selectedChatType, setIsUploading, setIsDownloading } = useAppStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!userInfo?.profileSetup) {
      toast.error('Please complete your profile setup')
      navigate('/profile')
    }
  }, [userInfo, navigate])

  const ProgressIndicator = ({ type, progress, onCancel }: { type: 'upload' | 'download'; progress: number; onCancel: () => void }) => (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-md">
      <div className="bg-gray-900/95 backdrop-blur-lg border border-white/10 rounded-xl p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="animate-pulse">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
            </div>
            <div className="flex flex-col">
              <span className="text-white/90 text-sm font-medium">{type === 'upload' ? 'Uploading' : 'Downloading'} File</span>
              <span className="text-white/60 text-xs">{progress}% completed</span>
            </div>
          </div>
          <button onClick={onCancel} className="text-white/60 hover:text-white/90 transition-colors px-2 py-1 text-sm">
            Cancel
          </button>
        </div>
        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
            style={{ width: `${progress}%` }}
            transition={{
              duration: 0.3,
              ease: 'easeInOut',
            }}
          />
        </div>
      </div>
    </div>
  )
  return (
    <div className="container-fluid h-[100vh] bg-[#0A0A0F] overflow-hidden flex flex-1 ">
      <div className="relative h-full w-full max-w-full">
        <div className="fixed inset-0 ">
          <div className="absolute inset-0 bg-[#080810]">
            <div className="absolute w-full h-full bg-[radial-gradient(ellipse_at_top,_#141420_0%,_#080810_100%)]" />
          </div>
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`absolute w-[600px] h-[600px] rounded-full 
                ${i === 0 ? 'top-[-300px] left-[-200px] bg-blue-500/10' : i === 1 ? 'top-[-200px] right-[-250px] bg-purple-500/10' : 'bottom-[-300px] left-[20%] bg-indigo-500/10'} 
                blur-[120px] animate-blob animation-delay-${i * 2000}`}
              />
            ))}
          </div>
        </div>

        <div className=" z-10 h-[100vh] flex flex-1 bg-[#0A0A0F] overflow-hidden text-white">
          {isUploading && <ProgressIndicator type="upload" progress={fileUploadProgress} onCancel={() => setIsUploading(false)} />}
          {isDownloading && <ProgressIndicator type="download" progress={fileDownloadProgress} onCancel={() => setIsDownloading(false)} />}
          <ContactContainer />
          {selectedChatType === undefined ? <EmptyChatContainer /> : <ChatContainer />}
        </div>
      </div>
    </div>
  )
}

export default Chat
