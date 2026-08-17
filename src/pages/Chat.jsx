import { useEffect, useState } from "react";
import ConversationList from "../components/chat/ConversationList";
import MessageThread from "../components/chat/MessageThread";
import { apiFetch } from "../lib/api";
import { getSocket, disconnectSocket } from "../lib/socket";
import { useNavigate } from "react-router-dom";

export default function Chat() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  function handleSignOut() {
    disconnectSocket();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true);

  // Load conversation list once, connect the live socket once.
 useEffect(() => {
    apiFetch("/conversations")
      .then((rows) => {
        setConversations(
          rows.map((r) => ({
            id: r.id,
            name: r.other_user_name || "Unknown",
            avatarColor: "#7a0e14",
            otherUserId: r.other_user_id,
            lastMessage: r.last_message || "Say hi!",
            lastTime: r.last_message_at
              ? new Date(r.last_message_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
              : "",
            unread: 0,
          }))
        );
      })
      .finally(() => setLoading(false));

    const socket = getSocket();

    socket.on("new_message", (message) => {
      setMessages((prev) => ({
        ...prev,
        [message.conversation_id]: [...(prev[message.conversation_id] ?? []), message],
      }));
    });

    socket.on("presence_snapshot", (userIds) => {
      setOnlineUsers(new Set(userIds));
    });

    socket.on("presence", ({ userId, online }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (online) next.add(userId);
        else next.delete(userId);
        return next;
      });
    });

    return () => {
      socket.off("new_message");
      socket.off("presence_snapshot");
      socket.off("presence");
    };
  }, []);

  function handleSelect(id) {
    setActiveId(id);
    getSocket().emit("join_conversation", id);
    if (!messages[id]) {
      apiFetch(`/conversations/${id}/messages`).then((history) => {
        setMessages((prev) => ({ ...prev, [id]: history }));
      });
    }
  }

  function handleSend(text) {
    if (!activeId) return;
    getSocket().emit("send_message", { conversationId: activeId, text });
  }

  async function handleStartChat(identifier) {
    try {
      const { id } = await apiFetch("/conversations", {
        method: "POST",
        body: JSON.stringify({ identifier }),
      });
      const fresh = await apiFetch("/conversations");
      setConversations(
        fresh.map((r) => ({
          id: r.id,
          name: r.other_user_name || "Unknown",
          avatarColor: "#7a0e14",
          otherUserId: r.other_user_id,
          lastMessage: r.last_message || "Say hi!",
          lastTime: r.last_message_at
            ? new Date(r.last_message_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
            : "",
          unread: 0,
        }))
      );
      handleSelect(id);
    } catch (err) {
      alert(err.message); // simple for now — swap for inline UI error later
    }
  }

const conversationsWithPresence = conversations.map((c) => ({
    ...c,
    online: onlineUsers.has(c.otherUserId),
  }));
  const activeConversation = conversationsWithPresence.find((c) => c.id === activeId) ?? null;

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-void">
        <p className="font-body text-sm text-mauve">Loading conversations…</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-void">
      <div className={`h-full w-full md:block ${activeId ? "hidden" : "block"} md:w-[360px]`}>
       <ConversationList
       conversations={conversationsWithPresence}
       activeId={activeId}
       onSelect={handleSelect}
       onStartChat={handleStartChat}
       onSignOut={handleSignOut}
       />
       </div>
      <div className={`h-full w-full flex-1 md:block ${activeId ? "block" : "hidden"}`}>
        <MessageThread
          conversation={activeConversation}
          messages={messages[activeId] ?? []}
          onSend={handleSend}
          onBack={() => setActiveId(null)}
          currentUserId={currentUser?.id}
        />
      </div>
    </div>
  );
}