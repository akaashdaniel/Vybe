import { useState } from "react";
import ConversationList from "../components/chat/ConversationList";
import MessageThread from "../components/chat/MessageThread";
import { conversations as initialConversations, messagesByConversation } from "../date/mockChats";

export default function Chat() {
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState(messagesByConversation);

  const activeConversation = initialConversations.find((c) => c.id === activeId) ?? null;

  function handleSend(text) {
    if (!activeId) return;
    const newMessage = {
      id: `m${Date.now()}`,
      from: "me",
      text,
      date: new Date().toISOString(),
      time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      status: "sent",
    };
    setMessages((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] ?? []), newMessage],
    }));
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-void">
      <div className={`h-full w-full md:block ${activeId ? "hidden" : "block"} md:w-[360px]`}>
        <ConversationList
          conversations={initialConversations}
          activeId={activeId}
          onSelect={setActiveId}
        />
      </div>
      <div className={`h-full w-full flex-1 md:block ${activeId ? "block" : "hidden"}`}>
        <MessageThread
          conversation={activeConversation}
          messages={messages[activeId] ?? []}
          onSend={handleSend}
          onBack={() => setActiveId(null)}
        />
      </div>
    </div>
  );
}
