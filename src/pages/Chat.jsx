import { useEffect, useMemo, useRef, useState } from "react";
import ConversationList from "../components/chat/ConversationList";
import MessageThread from "../components/chat/MessageThread";
import { apiFetch } from "../lib/api";
import { getSocket, disconnectSocket } from "../lib/socket";
import { useNavigate } from "react-router-dom";

export default function Chat() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const activeIdRef = useRef(null);

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
  async function loadConversations() {
    const rows = await apiFetch("/conversations");
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
        unread: Number(r.unread_count) || 0,
      }))
    );
  }

  // Load conversation list once, connect the live socket once.
 useEffect(() => {
    loadConversations().finally(() => setLoading(false));


    const socket = getSocket();

           socket.on("new_message", (message) => {
      setMessages((prev) => ({
        ...prev,
        [message.conversation_id]: [...(prev[message.conversation_id] ?? []), message],
      }));

      const isActive = message.conversation_id === activeIdRef.current;
      if (isActive) {
        socket.emit("mark_read", { conversationId: message.conversation_id });
      }

      // Keep the sidebar preview and unread badge current
      setConversations((prev) =>
        prev.map((c) =>
          c.id === message.conversation_id
            ? {
                ...c,
                lastMessage: message.text,
                lastTime: new Date(message.created_at).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                }),
                unread:
                  isActive || message.sender_id === currentUser?.id
                    ? 0
                    : (c.unread || 0) + 1,
              }
            : c
        )
      );
    });

    // On reconnect, re-sync — we may have missed messages while offline
    socket.on("connect", () => {
      loadConversations();
      if (activeIdRef.current) {
        apiFetch(`/conversations/${activeIdRef.current}/messages`).then((history) => {
          setMessages((prev) => ({ ...prev, [activeIdRef.current]: history }));
        });
      }
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

    socket.on("messages_read", ({ conversationId, readerId }) => {
      setMessages((prev) => ({
        ...prev,
        [conversationId]: (prev[conversationId] ?? []).map((m) =>
          m.sender_id !== readerId ? { ...m, status: "read" } : m
        ),
      }));
    });

        return () => {
      socket.off("new_message");
      socket.off("presence_snapshot");
      socket.off("presence");
      socket.off("messages_read");
      socket.off("connect");
    };
  }, []);

      function handleSelect(id) {
    setActiveId(id);
    activeIdRef.current = id;
    const socket = getSocket();
    socket.emit("join_conversation", id);
    socket.emit("mark_read", { conversationId: id });
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
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

const conversationsWithPresence = useMemo(
  () =>
    conversations.map((c) => ({
      ...c,
      online: onlineUsers.has(c.otherUserId),
    })),
  [conversations, onlineUsers]
);
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
       currentUser={currentUser}
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