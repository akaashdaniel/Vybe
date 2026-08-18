import { motion } from "framer-motion";

function TickIcon({ double, color }) {
  return (
    <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
      <path
        d="M1 5.5L4.5 9L10.5 1"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {double && (
        <path
          d="M5.5 5.5L9 9L15 1"
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export default function MessageBubble({ message, currentUserId }) {
  const mine = message.sender_id === currentUserId;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex ${mine ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
          mine
            ? "rounded-br-sm bg-signal text-bone"
            : "rounded-bl-sm bg-ember-deep text-bone"
        }`}
      >
        <p className="font-body text-sm leading-relaxed">{message.text}</p>
                <div
          className={`mt-1 flex items-center justify-end gap-1 font-mono text-[10px] ${
            mine ? "text-bone/70" : "text-mauve"
          }`}
        >
          <span>{new Date(message.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
            {mine && (
            <TickIcon
              double={message.status === "delivered" || message.status === "read"}
              color={message.status === "read" ? "#5aa9ff" : "currentColor"}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
