import React, { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const socket = useRef();

  useEffect(() => {
    // Nếu không dùng Vite thì hardcode URL server
    socket.current = io("http://localhost:8080");

    return () => {
      socket.current.disconnect();
    };
  }, []);

  const sendMessage = (msg) => {
    socket.current.emit("sendMessage", msg);
  };

  return (
    <SocketContext.Provider value={{ socket: socket.current, sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
