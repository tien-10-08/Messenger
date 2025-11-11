import { createContext, useState, useContext } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [currentChat, setCurrentChat] = useState(null); // conversation hiện tại
  const [messages, setMessages] = useState([]);         // danh sách tin nhắn (của currentChat)
  const [conversations, setConversations] = useState([]); // danh sách conversation
  const [pagination, setPagination] = useState(null);   // phân trang tin nhắn

  const addMessage = (msg) => {
    const msgConvId = typeof msg.conversationId === "object"
      ? (msg.conversationId._id || msg.conversationId.toString?.() || String(msg.conversationId))
      : msg.conversationId;
    const currentId = currentChat?._id;

    // Luôn cập nhật sidebar conversations theo tin nhắn mới
    setConversations(prev => {
      const exists = prev.some(c => c._id === msgConvId);
      if (exists) {
        return prev.map(c =>
          c._id === msgConvId
            ? { ...c, lastMessage: msg.text, updatedAt: msg.createdAt }
            : c
        ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      } else {
        return [
          { _id: msgConvId, members: [msg.senderId, msg.receiverId], lastMessage: msg.text, updatedAt: msg.createdAt },
          ...prev,
        ];
      }
    });

    // Chỉ thêm vào messages nếu thuộc cuộc trò chuyện hiện tại
    if (!currentId || msgConvId !== currentId) return;
    setMessages(prev => {
      const exists = prev.some(m => m._id && msg._id && m._id === msg._id);
      if (exists) return prev;
      return [...prev, msg];
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
