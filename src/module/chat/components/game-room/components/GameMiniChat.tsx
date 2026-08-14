import { RefObject } from 'react'
import { FiSmile, FiSend } from 'react-icons/fi'
import { ChatMessage, FloatingEmoji } from '../types/game.types'

interface GameMiniChatProps {
  gameMessages: ChatMessage[]
  miniChatInput: string
  setMiniChatInput: (val: string) => void
  onSendGameMessage: () => void
  floatingEmojis: FloatingEmoji[]
  onTriggerReaction: (emoji: string) => void
  gameEventReactions: Record<string, { userId: string; emoji: string }[]>
  activeGameReactionPicker: string | null
  setActiveGameReactionPicker: (id: string | null) => void
  onGameEventReaction: (messageId: string, emoji: string) => void
  myId: string
  chatEndRef: RefObject<HTMLDivElement>
}

const GameMiniChat = ({
  gameMessages,
  miniChatInput,
  setMiniChatInput,
  onSendGameMessage,
  floatingEmojis,
  onTriggerReaction,
  gameEventReactions,
  activeGameReactionPicker,
  setActiveGameReactionPicker,
  onGameEventReaction,
  myId,
  chatEndRef,
}: GameMiniChatProps) => {
  return (
    <div className="w-full lg:w-72 bg-white/[0.02] border border-white/[0.06] rounded-3xl p-4 flex flex-col justify-between flex-shrink-0 backdrop-blur-xl h-64 lg:h-full relative overflow-hidden">
      {/* Floating Emojis Particle Animation Layer */}
      {floatingEmojis.map((item) => (
        <span key={item.id} className="absolute bottom-12 text-2xl animate-float-up pointer-events-none z-50 select-none" style={{ left: `${item.x}%` }}>
          {item.emoji}
        </span>
      ))}

      <div className="border-b border-white/[0.05] pb-3 mb-2 flex items-center justify-between">
        <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">Live Chat & Reactions</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2.5 my-2 max-h-48 lg:max-h-none">
        {gameMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center py-8">
            <span className="text-[10px] text-white/30 font-light">Say something cute or react during the game!</span>
          </div>
        ) : (
          gameMessages.map((msg) => {
            const isMe = msg.senderId === myId || msg.senderId === 'self'
            const isSystem = msg.senderId === 'system'
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-3 py-2 rounded-2xl max-w-[85%] text-xs break-words leading-relaxed ${
                    isSystem
                      ? 'bg-white/5 text-white/40 text-center italic border border-white/5 text-[9px]'
                      : isMe
                        ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-br-none'
                        : 'bg-white/10 text-white/90 rounded-bl-none border border-white/5'
                  }`}
                >
                  {msg.text}
                </div>
                {/* Reaction badge for game_event messages that have a server _id */}
                {msg.eventMessageId && (
                  <div className="flex items-center gap-1 mt-0.5 px-1">
                    {(gameEventReactions[msg.eventMessageId] || [])
                      .reduce((acc: { emoji: string; count: number }[], r) => {
                        const ex = acc.find((a) => a.emoji === r.emoji)
                        if (ex) ex.count++
                        else acc.push({ emoji: r.emoji, count: 1 })
                        return acc
                      }, [])
                      .map(({ emoji, count }) => (
                        <button
                          key={emoji}
                          onClick={() => onGameEventReaction(msg.eventMessageId!, emoji)}
                          className="flex items-center gap-0.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full px-1.5 py-0.5 text-[9px] transition-all"
                        >
                          {emoji} {count > 1 && <span className="text-white/60">{count}</span>}
                        </button>
                      ))}
                    <button
                      onClick={() => setActiveGameReactionPicker(activeGameReactionPicker === msg.eventMessageId ? null : msg.eventMessageId!)}
                      className="p-0.5 text-white/30 hover:text-white/70 transition-colors"
                    >
                      <FiSmile className="text-[10px]" />
                    </button>
                    {activeGameReactionPicker === msg.eventMessageId && (
                      <div className="flex gap-1 bg-black/80 border border-white/10 rounded-xl px-2 py-1 shadow-xl z-50">
                        {['❤️', '😂', '😮', '🔥', '🎉', '👏'].map((em) => (
                          <button key={em} onClick={() => onGameEventReaction(msg.eventMessageId!, em)} className="hover:scale-125 transition-transform text-sm">
                            {em}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <span className="text-[8px] text-white/30 mt-0.5 px-1">{msg.time}</span>
              </div>
            )
          })
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="space-y-2 mt-auto">
        <div className="flex items-center justify-around bg-white/[0.02] border border-white/[0.05] rounded-xl py-1 px-1.5">
          {['❤️', '😂', '😮', '😢', '🎉', '🔥'].map((emoji) => (
            <button key={emoji} onClick={() => onTriggerReaction(emoji)} className="hover:scale-125 hover:-translate-y-0.5 active:scale-95 transition-all p-1 text-sm select-none">
              {emoji}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <input
            type="text"
            placeholder="Type message..."
            value={miniChatInput}
            onChange={(e) => setMiniChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSendGameMessage()}
            className="flex-1 bg-white/[0.03] border border-white/[0.08] text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-white/20"
          />
          <button onClick={onSendGameMessage} className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md flex-shrink-0">
            <FiSend className="text-xs" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default GameMiniChat
