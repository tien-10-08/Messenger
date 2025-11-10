// src/components/ChatWindow.jsx
import { useEffect, useState } from "react";
import { getMessages, sendMessage } from "../api/chatService";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { useAuth } from "../context/AuthContext";

const ChatWindow = ({ activeConvo }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!activeConvo) return;
    const fetchMessages = async () => {
      try {
        const res = await getMessages(activeConvo.conversationId);
        setMessages(res.data);
      } catch (err) {
        console.error("Error loading messages:", err);
      }
    };
    fetchMessages();
  }, [activeConvo]);

  const handleSend = async (text) => {
    try {
      const newMsg = await sendMessage(activeConvo.conversationId, user._id, text);
      setMessages((prev) => [...prev, newMsg.data]);
    } catch (err) {
      console.error("Send message failed:", err);
    }
  };

  if (!activeConvo) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Chọn một cuộc trò chuyện để bắt đầu 💬
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="h-16 border-b border-gray-200 flex items-center px-4 bg-white shadow-sm">
        <h2 className="font-semibold text-gray-700">Đang chat với {activeConvo.friendId}</h2>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
        {messages.map((msg) => (
          <MessageBubble key={msg._id} msg={msg} meId={user._id} />
        ))}
      </div>

      <ChatInput onSend={handleSend} />
    </div>
  );
};

export default ChatWindow;
