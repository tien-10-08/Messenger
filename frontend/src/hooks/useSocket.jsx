import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export const useSocket = (userId, onMessage) => {
  const socket = useRef();

  useEffect(() => {
    socket.current = io("http://localhost:5000");
    socket.current.emit("addUser", userId);

    socket.current.on("getMessage", (msg) => {
      onMessage(msg);
    });

    return () => socket.current.disconnect();
  }, [userId, onMessage]);

  const sendMessage = (msg) => {
    socket.current.emit("sendMessage", msg);
  };

  return { sendMessage };
};
