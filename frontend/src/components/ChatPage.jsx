import React, { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import { useChat } from "../context/ChatContext";
import { useSocket } from "../hooks/useSocket";
import { getMessages } from "../api/messageApi";

const ChatPage = () => {
  const { user, currentChat, messages, setMessages } = useChat();

  const { sendMessage } = useSocket(user.id, (msg) => {
    if (msg.conversationId === currentChat.id) {
      setMessages((prev) => [...prev, msg]);
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      const res = await getMessages(currentChat.id);
      setMessages(res.data);
    };
    fetchData();
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
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
};

export default ChatPage;
