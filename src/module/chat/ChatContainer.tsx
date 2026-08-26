import { useAppStore } from '../../store/store'
import ChatHeader from './components/ChatHeader'
import MessageBar from './components/MessageBar'
import MessageContainer from './components/MessageContainer'
import GameRoom from './components/GameRoom'

const ChatContainer = () => {
  const { isGameActive, setIsGameActive } = useAppStore()

  return (
    <div className="fixed top-0 inset-x-0 h-[100dvh] w-full bg-[#07080D]/70 backdrop-blur-3xl flex flex-col overflow-hidden md:static md:flex-1 md:h-full">
      <div className="relative h-full flex flex-col">
        {/* Subtle Ambient Depth */}
        <div className="fixed inset-0 -z-50 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/[0.05] blur-[120px] rounded-full" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          {isGameActive ? (
            <GameRoom onClose={() => setIsGameActive(false)} />
          ) : (
            <>
              <ChatHeader onToggleGame={() => setIsGameActive(!isGameActive)} isGameActive={isGameActive} />
              <MessageContainer />
              <MessageBar />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatContainer
