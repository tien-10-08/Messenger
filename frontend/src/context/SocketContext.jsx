import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../api/apiConfig";
import { useChat } from "./ChatContext";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

// Socket event constants
const SOCKET_EVENTS = {
  ADD_USER: "addUser",
  GET_MESSAGE: "getMessage",
  CONVERSATION_HISTORY: "conversationHistory",
  CONVERSATION_UPDATED: "conversationUpdated",
  USER_UPDATED: "userUpdated",
  CONVERSATION_CREATED: "conversationCreated",
  PRESENCE_UPDATED: "presenceUpdated",
  MESSAGE_SEEN: "messageSeen",
  USER_TYPING: "userTyping",
  SEND_MESSAGE: "sendMessage",
  TYPING: "typing",
  JOIN_CONVERSATION: "joinConversation",
  CALL_USER: "callUser",
  ANSWER_CALL: "answerCall",
  ICE_CANDIDATE: "iceCandidate",
  END_CALL: "endCall",
  INCOMING_CALL: "incomingCall",
  CALL_ANSWERED: "callAnswered",
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const { receiveMessage, setMessages, setPagination, setConversations } =
    useChat();

  const socket = useRef(null);

  // Refs để luôn trỏ tới handler mới nhất
  const receiveMessageRef = useRef(receiveMessage);
  const setMessagesRef = useRef(setMessages);
  const setPaginationRef = useRef(setPagination);
  const setConversationsRef = useRef(setConversations);

  useEffect(() => {
    receiveMessageRef.current = receiveMessage;
  }, [receiveMessage]);
  useEffect(() => {
    setMessagesRef.current = setMessages;
  }, [setMessages]);
  useEffect(() => {
    setPaginationRef.current = setPagination;
  }, [setPagination]);
  useEffect(() => {
    setConversationsRef.current = setConversations;
  }, [setConversations]);

  // Initialize socket connection
  useEffect(() => {
    if (!user?._id) return;

    socket.current = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socket.current.emit(SOCKET_EVENTS.ADD_USER, user._id);

    // Message handlers
    const onGetMessage = (msg) => {
      receiveMessageRef.current(msg);
    };

    const onConversationHistory = ({ items, pagination }) => {
      setMessagesRef.current(Array.isArray(items) ? items : []);
      setPaginationRef.current(pagination || null);
    };

    const onConversationUpdated = ({ conversationId, lastMessage, updatedAt }) => {
      setConversationsRef.current((prev) => {
        const exists = prev.some((c) => c._id === conversationId);
        if (exists) {
          return prev
            .map((c) =>
              c._id === conversationId
                ? { ...c, lastMessage, updatedAt }
                : c
            )
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        }
        return [
          { _id: conversationId, lastMessage, updatedAt },
          ...prev,
        ];
      });
    };

    const onUserUpdated = ({ user: updatedUser }) => {
      if (!updatedUser?._id) return;
      setConversationsRef.current((prev) =>
        prev.map((c) => {
          if (!Array.isArray(c.members)) return c;
          const members = c.members.map((m) => {
            const id = String(m?._id || m);
            if (id === String(updatedUser._id)) {
              if (typeof m === "object") {
                return {
                  ...m,
                  username: updatedUser.username,
                  avatar: updatedUser.avatar,
                  status: updatedUser.status,
                };
              }
              return updatedUser;
            }
            return m;
          });
          return { ...c, members };
        })
      );
    };

    const onConversationCreated = ({ conversation }) => {
      if (!conversation?._id) return;
      setConversationsRef.current((prev) => {
        const exists = prev.some((c) => c._id === conversation._id);
        if (exists) return prev;
        return [conversation, ...prev];
      });
    };

    const onPresenceUpdated = ({ userId, online }) => {
      if (!userId) return;
      setConversationsRef.current((prev) =>
        prev.map((c) => {
          if (!Array.isArray(c.members)) return c;
          const members = c.members.map((m) => {
            const id = String(m?._id || m);
            if (id === String(userId)) {
              if (typeof m === "object") {
                return {
                  ...m,
                  status: online ? "Đang hoạt động" : m.status || "",
                };
              }
            }
            return m;
          });
          return { ...c, members };
        })
      );
    };

    const onMessageSeen = ({ conversationId, messageId, seenBy }) => {
      if (!messageId || !seenBy) return;
      setMessagesRef.current((prev) =>
        prev.map((m) => {
          if ((m._id || "").toString() !== (messageId || "").toString())
            return m;
          const existed = (m.isSeenBy || []).map(String);
          if (existed.includes(String(seenBy))) return m;
          return { ...m, isSeenBy: [...existed, String(seenBy)] };
        })
      );
    };

    // Register event listeners
    socket.current.on(SOCKET_EVENTS.GET_MESSAGE, onGetMessage);
    socket.current.on(SOCKET_EVENTS.CONVERSATION_HISTORY, onConversationHistory);
    socket.current.on(
      SOCKET_EVENTS.CONVERSATION_UPDATED,
      onConversationUpdated
    );
    socket.current.on(SOCKET_EVENTS.USER_UPDATED, onUserUpdated);
    socket.current.on(SOCKET_EVENTS.CONVERSATION_CREATED, onConversationCreated);
    socket.current.on(SOCKET_EVENTS.PRESENCE_UPDATED, onPresenceUpdated);
    socket.current.on(SOCKET_EVENTS.MESSAGE_SEEN, onMessageSeen);

    return () => {
      socket.current?.off(SOCKET_EVENTS.GET_MESSAGE, onGetMessage);
      socket.current?.off(
        SOCKET_EVENTS.CONVERSATION_HISTORY,
        onConversationHistory
      );
      socket.current?.off(
        SOCKET_EVENTS.CONVERSATION_UPDATED,
        onConversationUpdated
      );
      socket.current?.off(SOCKET_EVENTS.USER_UPDATED, onUserUpdated);
      socket.current?.off(
        SOCKET_EVENTS.CONVERSATION_CREATED,
        onConversationCreated
      );
      socket.current?.off(SOCKET_EVENTS.PRESENCE_UPDATED, onPresenceUpdated);
      socket.current?.off(SOCKET_EVENTS.MESSAGE_SEEN, onMessageSeen);
      socket.current?.disconnect();
    };
  }, [user?._id]);

  // Helper functions
  const sendMessage = useCallback((msg) => {
    socket.current?.emit(SOCKET_EVENTS.SEND_MESSAGE, msg);
  }, []);

  const sendTyping = useCallback(
    (conversationId, isTyping) => {
      socket.current?.emit(SOCKET_EVENTS.TYPING, {
        conversationId,
        userId: user._id,
        isTyping,
      });
    },
    [user?._id]
  );

  const joinConversation = useCallback((conversationId) => {
    if (!conversationId) return;
    socket.current?.emit(SOCKET_EVENTS.JOIN_CONVERSATION, {
      conversationId,
    });
  }, []);

  const on = useCallback((event, handler) => {
    socket.current?.on(event, handler);
  }, []);

  const off = useCallback((event, handler) => {
    socket.current?.off(event, handler);
  }, []);

  const emit = useCallback((event, payload) => {
    socket.current?.emit(event, payload);
  }, []);

  const value = useMemo(
    () => ({
      sendMessage,
      sendTyping,
      joinConversation,
      on,
      off,
      emit,
    }),
    [sendMessage, sendTyping, joinConversation, on, off, emit]
  );

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};

