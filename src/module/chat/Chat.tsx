import { useEffect } from 'react'
import { useAppStore } from '../../store/store'
import { useNavigate } from 'react-router-dom'
import ContactContainer from './ContactContainer'
import EmptyChatContainer from './EmptyChatContainer'
import ChatContainer from './ChatContainer'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUploadCloud, FiDownloadCloud, FiX } from 'react-icons/fi'

import GameInviteDialog from './components/GameInviteDialog'

const Chat = () => {
  const { isUploading, isDownloading, fileUploadProgress, fileDownloadProgress, userInfo, selectedChatType, setIsUploading, setIsDownloading } = useAppStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!userInfo?.profileSetup) {
      navigate('/profile')
    }
  }, [userInfo, navigate])

  const ProgressIndicator = ({ type, progress, onCancel }: { type: 'upload' | 'download'; progress: number; onCancel: () => void }) => (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] w-[90vw] max-w-md"
      >
        <div className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                {type === 'upload' ? <FiUploadCloud className="w-5 h-5 animate-bounce" /> : <FiDownloadCloud className="w-5 h-5 animate-bounce" />}
              </div>
              <div className="flex flex-col">
                <span className="text-white/90 text-sm font-semibold tracking-wide">{type === 'upload' ? 'Uploading File...' : 'Downloading File...'}</span>
                <span className="text-white/50 text-xs font-mono">{progress}% completed</span>
              </div>
            </div>
            <button onClick={onCancel} className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors" aria-label="Cancel progress">
              <FiX className="w-4 h-4" />
            </button>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )

  return (
    <div className="h-[100dvh] w-full bg-[#0B0C10] overflow-hidden flex flex-1 font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Subtle Depth Background */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_#1A1C24_0%,_#0B0C10_60%)] opacity-80" />

      <div className="relative z-10 h-full w-full flex flex-1 overflow-hidden text-white">
        <GameInviteDialog />
        {isUploading && <ProgressIndicator type="upload" progress={fileUploadProgress} onCancel={() => setIsUploading(false)} />}
        {isDownloading && <ProgressIndicator type="download" progress={fileDownloadProgress} onCancel={() => setIsDownloading(false)} />}

        {/* Sidebar wrapper */}
        <div className={`${selectedChatType !== undefined ? 'hidden md:flex' : 'flex'} md:w-[35vw] lg:w-[30vw] xl:w-[22vw] w-full h-full flex-shrink-0`}>
          <ContactContainer />
        </div>

        {/* Chat window wrapper */}
        <div className={`${selectedChatType === undefined ? 'hidden md:flex' : 'flex'} flex-1 h-full`}>
          {selectedChatType === undefined ? <EmptyChatContainer /> : <ChatContainer />}
        </div>
      </div>
    </div>
  )
}

export default Chat
