import React, { useEffect } from 'react'
import { useAppStore } from '../../store/store'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import ContactContainer from './ContactContainer'
import EmptyChatContainer from './EmptyChatContainer'
import ChatContainer from './ChatContainer'

const Chat = () => {
  const { userInfo, selectedChatType } = useAppStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!userInfo?.profileSetup) {
      toast.error('Please complete your profile setup')
      navigate('/profile')
    }
  }, [userInfo, navigate])

  return (
    <div className="container-fluid h-[100vh] bg-[#0A0A0F] overflow-hidden ">
      <div className="relative h-full w-full max-w-full">
        {/* Background gradient effect */}
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

        {/* Content */}
        <div className="relative z-10 h-full flex">
          <ContactContainer />
          <div className="flex-1">{selectedChatType === undefined ? <EmptyChatContainer /> : <ChatContainer />}</div>
        </div>
      </div>
    </div>
  )
}

export default Chat
