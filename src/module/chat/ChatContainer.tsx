import { useAppStore } from '../../store/store'
import ChatHeader from './components/ChatHeader'
import MessageBar from './components/MessageBar'
import MessageContainer from './components/MessageContainer'
import GameRoom from './components/GameRoom'

const ChatContainer = () => {
  const { isGameActive, setIsGameActive } = useAppStore()

  return (
    <div className="fixed top-0 inset-x-0 h-[100dvh] w-full bg-[#080810] backdrop-blur-xl flex flex-col overflow-hidden md:static md:flex-1 md:h-full">
      <div className="relative h-full flex flex-col">
        {/* Clean, refined background */}
        <div className="fixed inset-0 -z-50 bg-[#090A10]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(99,102,241,0.08),rgba(255,255,255,0))]" />
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
