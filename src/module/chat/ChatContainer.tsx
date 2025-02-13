import ChatHeader from './components/ChatHeader'
import MessageBar from './components/MessageBar'
import MessageContainer from './components/MessageContainer'

const ChatContainer = () => {
  return (
    <div className="fixed top-0 h-[100vh] w-full bg-[#080810] backdrop-blur-xl flex flex-col md:static md:flex-1">
      <div className="relative h-full flex flex-col">
        {/* Gradient background effect */}
        <div className="fixed inset-0  -z-50 ">
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
        <div className="relative z-10 flex flex-col h-full">
          <ChatHeader />
          <MessageContainer />
          <MessageBar />
        </div>
      </div>
    </div>
  )
}

export default ChatContainer
