import { createContext, useState, useContext } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [currentChat, setCurrentChat] = useState(null); // object conversation
  const [messages, setMessages] = useState([]);         // array message
  const [pagination, setPagination] = useState(null);   // lưu phân trang tin nhắn
  const addMessage = (msg) => setMessages(prev => [...prev, msg]);

  return (
    <ChatContext.Provider
      value={{
        currentChat,
        setCurrentChat,
        messages,
        setMessages,
        pagination,
        setPagination,
        addMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
