import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useChat } from "./ChatContext";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const { receiveMessage } = useChat();
  const socket = useRef(null);

  useEffect(() => {
    if (!user?._id) return;
    socket.current = io("http://localhost:8080"); // server của bạn
    socket.current.emit("addUser", user._id);

    socket.current.on("getMessage", (msg) => {
      receiveMessage(msg);
    });

    return () => socket.current.disconnect();
  }, [user]);

  const sendMessage = (msg) => {
    socket.current?.emit("sendMessage", msg);
    receiveMessage(msg); // thêm luôn cho sender
  };

  const sendTyping = (conversationId, isTyping) => {
    socket.current?.emit("typing", { conversationId, userId: user._id, isTyping });
  };

  return (
    <SocketContext.Provider value={{ socket: socket.current, sendMessage, sendTyping }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
