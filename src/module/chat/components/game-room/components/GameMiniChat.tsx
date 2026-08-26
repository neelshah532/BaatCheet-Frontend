import { RefObject } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
    <div className="w-full lg:w-80 bg-slate-900/60 border border-white/10 rounded-3xl p-3.5 flex flex-col justify-between flex-shrink-0 backdrop-blur-2xl h-full relative overflow-hidden shadow-2xl">
      {/* Floating Emojis Particle Animation Layer */}
      <AnimatePresence>
        {floatingEmojis.map((item) => (
          <motion.span
            key={item.id}
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ opacity: 0, y: -200, scale: 1.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.2, ease: 'easeOut' }}
            className="absolute bottom-20 text-3xl pointer-events-none z-50 select-none drop-shadow-lg"
            style={{ left: `${item.x}%` }}
          >
            {item.emoji}
          </motion.span>
        ))}
      </AnimatePresence>

      <div className="border-b border-white/[0.08] pb-2.5 mb-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-[11px] text-indigo-300 font-bold tracking-wider uppercase">Live Chat & Reactions</span>
        </div>
        <span className="text-[10px] text-slate-500 font-medium">{gameMessages.length} msgs</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2.5 my-1 min-h-[140px]">
        {gameMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-6 px-4">
            <span className="text-2xl mb-1 opacity-50">💬</span>
            <span className="text-xs text-slate-400 font-medium">No messages yet</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Send a reaction or cheer during the match!</span>
          </div>
        ) : (
          gameMessages.map((msg) => {
            const isMe = msg.senderId === myId || msg.senderId === 'self'
            const isSystem = msg.senderId === 'system'
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-3 py-2 rounded-2xl max-w-[88%] text-xs break-words leading-relaxed shadow-sm ${
                    isSystem
                      ? 'bg-white/5 text-slate-400 text-center italic border border-white/5 text-[10px] mx-auto'
                      : isMe
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none shadow-indigo-600/20'
                        : 'bg-white/10 text-slate-100 rounded-bl-none border border-white/10'
                  }`}
                >
                  {msg.text}
                </div>
                {/* Reaction badge for game_event messages */}
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
                          className="flex items-center gap-0.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full px-1.5 py-0.5 text-[9px] transition-all cursor-pointer"
                        >
                          {emoji} {count > 1 && <span className="text-slate-400">{count}</span>}
                        </button>
                      ))}
                    <button
                      onClick={() => setActiveGameReactionPicker(activeGameReactionPicker === msg.eventMessageId ? null : msg.eventMessageId!)}
                      className="p-0.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      <FiSmile className="text-[10px]" />
                    </button>
                    {activeGameReactionPicker === msg.eventMessageId && (
                      <div className="flex gap-1 bg-slate-900/95 border border-white/15 rounded-xl px-2 py-1 shadow-2xl z-50">
                        {['❤️', '😂', '😮', '🔥', '🎉', '👏'].map((em) => (
                          <button key={em} onClick={() => onGameEventReaction(msg.eventMessageId!, em)} className="hover:scale-125 transition-transform text-sm cursor-pointer">
                            {em}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <span className="text-[9px] text-slate-500 mt-0.5 px-1">{msg.time}</span>
              </div>
            )
          })
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="space-y-2 mt-2 pt-2 border-t border-white/[0.06]">
        {/* Emoji reaction bar */}
        <div className="flex items-center justify-around bg-white/[0.03] border border-white/[0.06] rounded-2xl py-1.5 px-2 shadow-inner">
          {['❤️', '😂', '😮', '😢', '🎉', '🔥'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => onTriggerReaction(emoji)}
              className="hover:scale-125 hover:-translate-y-0.5 active:scale-95 transition-all p-1 text-base select-none cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            placeholder="Send quick chat..."
            value={miniChatInput}
            onChange={(e) => setMiniChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSendGameMessage()}
            className="flex-1 bg-white/[0.04] border border-white/[0.1] text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.06] transition-all placeholder:text-slate-500"
          />
          <button
            onClick={onSendGameMessage}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/30 flex-shrink-0 active:scale-95 cursor-pointer"
          >
            <FiSend className="text-xs" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default GameMiniChat
