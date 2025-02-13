// Add message bubble styling
const MessageBubble = ({ isOwn, content }) => (
  <div
    className={`
    relative group p-4 rounded-2xl max-w-[70%]
    ${isOwn ? 'ml-auto bg-gradient-to-r from-blue-500/80 to-indigo-500/80' : 'bg-[#15151F]/80 backdrop-blur-sm'}
    hover:scale-[1.02] transition-transform duration-200
  `}
  >
    <div
      className="absolute inset-0 rounded-2xl bg-gradient-to-r 
      from-white/5 to-transparent opacity-0 group-hover:opacity-100 
      transition-opacity duration-300"
    />
    {content}
  </div>
)

export default MessageBubble
