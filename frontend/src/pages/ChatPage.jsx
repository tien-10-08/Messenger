// src/pages/ChatPage.jsx
import React from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

const ChatPage = () => {
  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <ChatWindow />
      </div>
    </div>
  );
};

export default ChatPage;
