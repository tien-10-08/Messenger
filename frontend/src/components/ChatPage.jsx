import React, { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { getMessages } from "../api/messageApi";
import { useSocket } from "../hooks/useSocket";

const ChatPage = () => {
  const { currentChat, messages, setMessages } = useChat();
  const { user } = useAuth();

  // Socket luôn được gọi vì ProtectedRoute đảm bảo đã có user
  const { sendMessage } = useSocket(user._id, (msg) => {
    if (msg.conversationId === currentChat?._id) {
      setMessages((prev) => [...prev, msg]);
    }
  });

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChat) return;
      const res = await getMessages(currentChat._id);
      setMessages(res.data.items || []);
    };
    fetchMessages();
  }, [currentChat, setMessages]);

  const handleSend = (msg) => {
    sendMessage(msg);
    setMessages((prev) => [...prev, msg]);
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
