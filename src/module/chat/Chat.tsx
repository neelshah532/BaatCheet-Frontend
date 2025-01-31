import React, { useEffect } from 'react'
import { useAppStore } from '../../store/store'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import ContactContainer from './ContactContainer'
// import EmptyChatContainer from './EmptyChatContainer'
import ChatContainer from './ChatContainer'

const Chat = () => {
  const { userInfo } = useAppStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!userInfo?.profileSetup) {
      toast.error('Please complete your profile setup')
      navigate('/profile')
    }
  }, [userInfo, navigate])

  return (
    <>
      <div className=" container-fluid flex gap-0 h-[100vh] overflow-hidden text-white ">
        <ContactContainer />
        {/* <EmptyChatContainer /> */}
        <ChatContainer />
      </div>
    </>
  )
}

export default Chat
