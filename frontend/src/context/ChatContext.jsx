import { createContext, useState, useContext } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [user] = useState({ id: "u123", name: "Tiến Đỗ" });
  const [currentChat, setCurrentChat] = useState({
    id: "conv1",
    name: "SEP Team",
  });
  const [messages, setMessages] = useState([]);

  return (
    <ChatContext.Provider
      value={{ user, currentChat, setCurrentChat, messages, setMessages }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
