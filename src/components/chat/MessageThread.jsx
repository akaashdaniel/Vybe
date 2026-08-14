import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Avatar from "../Avatar";
import MessageBubble from "./MessageBubble";
import Orb from "../ParticleOrb";
import { formatDayLabel } from "../../lib/dateGroups";

export default function MessageThread({ conversation, messages, onSend, onBack }) {
  const [draft, setDraft] = useState("");
  const [showTyping, setShowTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showTyping]);

  if (!conversation) {
    return (
      <div className="hidden h-full flex-1 flex-col items-center justify-center gap-3 bg-void md:flex">
        <Orb size={64} pulse={false} />
        <p className="font-body text-sm text-mauve">
            Pick a conversation to start chatting
            </p>
            </div>
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");

    setShowTyping(true);
    setTimeout(() => setShowTyping(false), 1600);
  }

  return (
    <div className="flex h-full flex-1 flex-col bg-void">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-hairline px-4 py-3">
        <button
          onClick={onBack}
          className="mr-1 rounded-full p-1 text-mauve hover:text-bone md:hidden"
          aria-label="Back to conversations"
        >
          ←
        </button>
        <Avatar name={conversation.name} color={conversation.avatarColor} online={conversation.online} size={38} />
        <div className="min-w-0">
          <p className="truncate font-body text-sm font-medium text-bone">
            {conversation.name}
          </p>
          <p className="font-mono text-[11px] text-mauve">
            {conversation.online ? "online" : "last seen recently"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="font-display text-base text-bone">
                    Say hi to {conversation.name.split(" ")[0]}
                    </p>
                    <p className="mt-1 font-body text-sm text-mauve">
                        No messages yet — send the first one.
                        </p>
                        </div>
                    )}
                    {messages.map((m, i) => {
                      const prev = messages[i - 1];
                      const showDivider = !prev || formatDayLabel(prev.date) !== formatDayLabel(m.date);
                      return (
                      <div key={m.id}>
                        {showDivider && (
                          <div className="my-4 flex justify-center">
                            <span className="rounded-full bg-ember-deep px-3 py-1 font-mono text-[11px] text-mauve">
                              {formatDayLabel(m.date)}
                              </span>
                              </div>
                            )}
                            <MessageBubble message={m} />
                            </div>
                            );
                            })}

        <AnimatePresence>
          {showTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-ember-deep px-4 py-3">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-mauve"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-hairline px-4 py-3">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Message"
          aria-label="Type a message"
          className="flex-1 rounded-full border border-hairline bg-ember-deep px-4 py-2.5 font-body text-sm text-bone placeholder-mauve outline-none transition focus:border-signal"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-signal text-bone transition hover:bg-signal-bright disabled:opacity-40"
          aria-label="Send message"
        >
          →
        </button>
      </form>
    </div>
  );
}
