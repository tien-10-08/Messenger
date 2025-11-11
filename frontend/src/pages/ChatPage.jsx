// src/pages/ChatPage.jsx
import React, { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { getMessagesByConversation, sendMessage as apiSendMessage } from "../api/messageApi";
import { useSocket } from "../hooks/useSocket";

const ChatPage = () => {
  const { currentChat, messages, setMessages } = useChat();
  const { user } = useAuth();

  // 🧩 Đổi tên socketSend để không trùng với apiSendMessage
  const { sendMessage: socketSendMessage } = useSocket(user._id, (msg) => {
    if (msg.conversationId === currentChat?._id) {
      setMessages((prev) => [...prev, msg]);
    }
  });

  // 🔹 Lấy tin nhắn mỗi khi đổi conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChat?._id) return;
      try {
        const res = await getMessagesByConversation(currentChat._id);
        setMessages(res.data?.items || res.data || []);
      } catch (err) {
        console.error("❌ Lỗi tải tin nhắn:", err.response?.data);
      }
    };
    fetchMessages();
  }, [currentChat, setMessages]);

  // 📨 Gửi tin nhắn
  const handleSend = async (msgText) => {
    if (!msgText.trim() || !currentChat?._id) return;

    const newMsg = {
      conversationId: currentChat._id,
      senderId: user._id,
      text: msgText,
    };

    try {
      // Gửi tin nhắn tới backend (lưu vào DB)
      const res = await apiSendMessage(newMsg);
      const savedMsg = res.data;

      // Cập nhật tin nhắn mới lên UI
      setMessages((prev) => [...prev, savedMsg]);

      // Gửi qua socket cho người nhận
      socketSendMessage(savedMsg);
    } catch (err) {
      console.error("❌ Lỗi gửi tin nhắn:", err.response?.data);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <ChatWindow />
        {currentChat && <ChatInput onSend={handleSend} />}
      </div>
    </div>
  );
};

export default ChatPage;
