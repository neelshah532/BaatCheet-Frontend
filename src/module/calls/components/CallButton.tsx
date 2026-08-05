import { useState } from 'react'
import { FaPhone, FaVideo } from 'react-icons/fa'
import { IoMdClose } from 'react-icons/io'
import { toast } from 'sonner'
import { useAppStore } from '../../../store/store'
import { useSocket } from '../../../hook/socketContext'
import { Contact } from '../../../types'
import { checkMediaDevices, requestMediaPermissions } from '../../../utils/mediaUtils'

interface CallButtonProps {
  contact: Contact
  className?: string
}

const CallButton = ({ contact, className = '' }: CallButtonProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isInitiatingCall, setIsInitiatingCall] = useState(false)
  const socket = useSocket()
  const { userInfo, startCall } = useAppStore()

  const handleStartCall = async (callType: 'audio' | 'video') => {
    if (!socket || !userInfo) {
      toast.error('Connection error. Please try again later.')
      return
    }

    setIsInitiatingCall(true)

    try {
      const hasDevices = await checkMediaDevices(callType === 'video')
      if (!hasDevices) {
        setIsInitiatingCall(false)
        return
      }

      const hasPermissions = await requestMediaPermissions(true, callType === 'video')
      if (!hasPermissions) {
        setIsInitiatingCall(false)
        return
      }

      const callStarted = await startCall([contact._id], callType)

      if (callStarted) {
        socket.emit('start-call', {
          recipientId: contact._id,
          isVideoEnabled: callType === 'video',
          isGroupCall: false,
        })

        setIsMenuOpen(false)
      }
    } catch (error) {
      console.error('Error initiating call:', error)
      toast.error('Failed to start call. Please try again later.')
    } finally {
      setIsInitiatingCall(false)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <button
        className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white hover:bg-green-600 transition-colors duration-200 shadow-md"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Call options"
        disabled={isInitiatingCall}
      >
        <FaPhone className="w-4 h-4" />
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 p-2 flex flex-col border border-gray-200 dark:border-gray-700 min-w-[140px]">
          <button
            className="flex items-center space-x-3 p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            onClick={() => handleStartCall('audio')}
            disabled={isInitiatingCall}
          >
            <FaPhone className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">Audio Call</span>
          </button>

          <button
            className="flex items-center space-x-3 p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            onClick={() => handleStartCall('video')}
            disabled={isInitiatingCall}
          >
            <FaVideo className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">Video Call</span>
          </button>

          <button
            className="flex items-center space-x-3 p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 text-red-500"
            onClick={() => setIsMenuOpen(false)}
            disabled={isInitiatingCall}
          >
            <IoMdClose className="w-4 h-4" />
            <span className="text-sm font-medium">Cancel</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default CallButton
