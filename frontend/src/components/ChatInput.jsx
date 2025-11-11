import React, { useState } from "react";
import { useChat } from "../context/ChatContext";
import { sendMessage } from "../api/messageApi";

const ChatInput = ({ onSend }) => {
  const [text, setText] = useState("");
  const { user, currentChat } = useChat();

  const handleSend = async () => {
    if (!text.trim()) return;
    const msg = {
      conversationId: currentChat.id,
      senderId: user.id,
      text,
      createdAt: new Date().toISOString(),
    };
    onSend(msg);
    await sendMessage(msg);
    setText("");
  };

  const handleKey = (e) => e.key === "Enter" && handleSend();

  return (
    <div className="bg-gray-900 p-3 flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Nhập tin nhắn..."
        className="flex-1 bg-gray-800 text-white p-2 rounded-lg focus:outline-none"
      />
      <button
        onClick={handleSend}
        className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 text-white font-medium"
      >
        Gửi
      </button>
    </div>
  );
};

export default ChatInput;
