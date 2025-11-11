import { createContext, useState, useContext } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [currentChat, setCurrentChat] = useState(null); // conversation hiện tại
  const [messages, setMessages] = useState([]);         // danh sách tin nhắn
  const [conversations, setConversations] = useState([]); // danh sách conversation
  const [pagination, setPagination] = useState(null);   // phân trang tin nhắn

  const addMessage = (msg) => {
    setMessages(prev => [...prev, msg]);

    setConversations(prev => {
      const exists = prev.some(c => c._id === msg.conversationId);
      if (exists) {
        return prev.map(c =>
          c._id === msg.conversationId
            ? { ...c, lastMessage: msg.text, updatedAt: msg.createdAt }
            : c
        ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      } else {
        return [
          { _id: msg.conversationId, members: [msg.senderId, msg.receiverId], lastMessage: msg.text, updatedAt: msg.createdAt },
          ...prev,
        ];
      }
    });
  };

  const receiveMessage = (msg) => {
    addMessage(msg); // realtime cũng update messages + sidebar
  };

  return (
    <ChatContext.Provider
      value={{
        currentChat,
        setCurrentChat,
        messages,
        setMessages,
        conversations,
        setConversations,
        pagination,
        setPagination,
        addMessage,
        receiveMessage
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
