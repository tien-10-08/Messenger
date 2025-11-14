// src/pages/ChatPage.jsx
import React from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import CallOverlay from "../components/CallOverlay";

const ChatPage = () => {
  return (
    <div className="flex h-screen bg-gray-900 relative">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <ChatWindow />
      </div>
      <CallOverlay />
    </div>
  );
};

export default ChatPage;
