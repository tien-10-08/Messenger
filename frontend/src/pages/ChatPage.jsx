// src/pages/ChatPage.jsx
import React, { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import {
  getMessagesByConversation,
  sendMessage as apiSendMessage,
} from "../api/messageApi";
import { useSocket } from "../hooks/useSocket";

const ChatPage = () => {
  const { currentChat, messages, setMessages } = useChat();
  const { user } = useAuth();

  const { sendMessage: socketSendMessage } = useSocket(user._id, (msg) => {
    if (msg.conversationId === currentChat?._id) {
      setMessages((prev) => [...prev, msg]);
    }
  });

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChat?._id) return;
      try {
        const res = await getMessagesByConversation(currentChat._id);
        const data = res.data?.items || res.data || [];
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Lỗi tải tin nhắn:", err.response?.data);
      }
    };
    fetchMessages();
  }, [currentChat, setMessages]);

  const handleSend = async (msgText = "") => {
    if (typeof msgText !== "string" || !msgText.trim() || !currentChat?._id) {
      console.warn("⚠️ handleSend: msgText không hợp lệ", msgText);
      return;
    }

    const newMsg = {
      conversationId: currentChat._id,
      senderId: user._id,
      text: msgText.trim(),
    };

    try {
      const res = await apiSendMessage(newMsg);
      const savedMsg = res.data?.data || res.data;
      setMessages((prev) => [...prev, savedMsg]);
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
