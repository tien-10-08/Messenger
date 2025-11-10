// src/pages/Chat.jsx
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

const Chat = () => {
  const [activeConvo, setActiveConvo] = useState(null);

  const handleSelectConversation = (conversationId, friendId) => {
    setActiveConvo({ conversationId, friendId });
  };

  return (
    <div className="h-screen flex">
      <Sidebar onSelectConversation={handleSelectConversation} />
      <ChatWindow activeConvo={activeConvo} />
    </div>
  );
};

export default Chat;
