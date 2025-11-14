import { createContext, useContext, useEffect, useRef, useCallback, useMemo } from "react";
import { io } from "socket.io-client";
import { useChat } from "./ChatContext";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const { receiveMessage, setMessages, setPagination, setConversations } = useChat();
  const socket = useRef(null);

  // Refs để luôn trỏ tới handler mới nhất mà không cần re-subscribe socket
  const receiveMessageRef = useRef(receiveMessage);
  const setMessagesRef = useRef(setMessages);
  const setPaginationRef = useRef(setPagination);
  const setConversationsRef = useRef(setConversations);

  useEffect(() => { receiveMessageRef.current = receiveMessage; }, [receiveMessage]);
  useEffect(() => { setMessagesRef.current = setMessages; }, [setMessages]);
  useEffect(() => { setPaginationRef.current = setPagination; }, [setPagination]);
  useEffect(() => { setConversationsRef.current = setConversations; }, [setConversations]);

  useEffect(() => {
    if (!user?._id) return;
    socket.current = io("http://localhost:8080");
    socket.current.emit("addUser", user._id);

    const onGetMessage = (msg) => {
      console.debug("[socket] getMessage", msg);
      receiveMessageRef.current(msg);
    };
    const onConversationHistory = ({ items, pagination }) => {
      console.debug("[socket] conversationHistory", { count: items?.length, pagination });
      setMessagesRef.current(Array.isArray(items) ? items : []);
      setPaginationRef.current(pagination || null);
    };
    const onConversationUpdated = ({ conversationId, lastMessage, updatedAt }) => {
      console.debug("[socket] conversationUpdated", { conversationId, lastMessage });
      setConversationsRef.current(prev => {
        const exists = prev.some(c => c._id === conversationId);
        if (exists) {
          return prev
            .map(c => c._id === conversationId ? { ...c, lastMessage, updatedAt } : c)
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        }
        return [{ _id: conversationId, lastMessage, updatedAt }, ...prev];
      });
    };
    const onUserUpdated = ({ user: updatedUser }) => {
      if (!updatedUser?._id) return;
      console.debug("[socket] userUpdated", updatedUser._id);
      setConversationsRef.current(prev => prev.map(c => {
        if (!Array.isArray(c.members)) return c;
        const members = c.members.map(m => {
          const id = String(m?._id || m);
          if (id === String(updatedUser._id)) {
            if (typeof m === 'object') return { ...m, username: updatedUser.username, avatar: updatedUser.avatar, status: updatedUser.status };
            return updatedUser; // fallback
          }
          return m;
        });
        return { ...c, members };
      }));
    };

    const onConversationCreated = ({ conversation }) => {
      if (!conversation?._id) return;
      console.debug("[socket] conversationCreated", conversation._id);
      setConversationsRef.current(prev => {
        const exists = prev.some(c => c._id === conversation._id);
        if (exists) return prev;
        return [conversation, ...prev];
      });
    };

    const onPresenceUpdated = ({ userId, online }) => {
      if (!userId) return;
      console.debug("[socket] presenceUpdated", userId, online);
      setConversationsRef.current(prev => prev.map(c => {
        if (!Array.isArray(c.members)) return c;
        const members = c.members.map(m => {
          const id = String(m?._id || m);
          if (id === String(userId)) {
            if (typeof m === 'object') return { ...m, status: online ? 'Đang hoạt động' : (m.status || '') };
          }
          return m;
        });
        return { ...c, members };
      }));
    };

    const onMessageSeen = ({ conversationId, messageId, seenBy }) => {
      if (!messageId || !seenBy) return;
      console.debug("[socket] messageSeen", { messageId, seenBy });
      setMessagesRef.current(prev => prev.map(m => {
        if ((m._id || '').toString() !== (messageId || '').toString()) return m;
        const existed = (m.isSeenBy || []).map(String);
        if (existed.includes(String(seenBy))) return m;
        return { ...m, isSeenBy: [...existed, String(seenBy)] };
      }));
    };

    socket.current.on("getMessage", onGetMessage);
    socket.current.on("conversationHistory", onConversationHistory);
    socket.current.on("conversationUpdated", onConversationUpdated);
    socket.current.on("userUpdated", onUserUpdated);
    socket.current.on("conversationCreated", onConversationCreated);
    socket.current.on("presenceUpdated", onPresenceUpdated);
    socket.current.on("messageSeen", onMessageSeen);

    return () => {
      socket.current?.off("getMessage", onGetMessage);
      socket.current?.off("conversationHistory", onConversationHistory);
      socket.current?.off("conversationUpdated", onConversationUpdated);
      socket.current?.off("userUpdated", onUserUpdated);
      socket.current?.off("conversationCreated", onConversationCreated);
      socket.current?.off("presenceUpdated", onPresenceUpdated);
      socket.current?.off("messageSeen", onMessageSeen);
      socket.current?.disconnect();
    };
  }, [user?._id]);

  const sendMessage = useCallback((msg) => {
    socket.current?.emit("sendMessage", msg);
    // Không thêm lạc quan để tránh trùng; chờ server broadcast theo room
  }, []);

  const sendTyping = useCallback((conversationId, isTyping) => {
    socket.current?.emit("typing", { conversationId, userId: user._id, isTyping });
  }, [user?._id]);

  const joinConversation = useCallback((conversationId) => {
    if (!conversationId) return;
    socket.current?.emit("joinConversation", { conversationId });
  }, []);

  const on = useCallback((event, handler) => {
    socket.current?.on(event, handler);
  }, []);

  const off = useCallback((event, handler) => {
    socket.current?.off(event, handler);
  }, []);

  const value = useMemo(() => ({
    socket: socket.current,
    sendMessage,
    sendTyping,
    joinConversation,
    on,
    off,
  }), [sendMessage, sendTyping, joinConversation, on, off]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
