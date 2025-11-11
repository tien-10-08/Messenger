import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useChat } from "./ChatContext";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const { currentChat, receiveMessage, setMessages, setPagination, setConversations } = useChat();
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

    socket.current.on("getMessage", onGetMessage);
    socket.current.on("conversationHistory", onConversationHistory);
    socket.current.on("conversationUpdated", onConversationUpdated);

    return () => {
      socket.current?.off("getMessage", onGetMessage);
      socket.current?.off("conversationHistory", onConversationHistory);
      socket.current?.off("conversationUpdated", onConversationUpdated);
      socket.current?.disconnect();
    };
  }, [user?._id]);

  const sendMessage = (msg) => {
    socket.current?.emit("sendMessage", msg);
    // Không thêm lạc quan để tránh trùng; chờ server broadcast theo room
  };

  const sendTyping = (conversationId, isTyping) => {
    socket.current?.emit("typing", { conversationId, userId: user._id, isTyping });
  };

  const joinConversation = (conversationId) => {
    if (!conversationId) return;
    socket.current?.emit("joinConversation", { conversationId });
  };

  return (
    <SocketContext.Provider value={{ socket: socket.current, sendMessage, sendTyping, joinConversation }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
