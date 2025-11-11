import React, { useState } from "react";
import { sendMessage } from "../api/messageApi";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";

const ChatInput = ({ onSend }) => {
  const [text, setText] = useState("");
  const { currentChat } = useChat();
  const { user } = useAuth();

  const handleSend = async () => {
    if (!text.trim() || !currentChat) return;

    const payload = {
      conversationId: currentChat._id,
      senderId: user._id,
      text,
    };

    try {
      const res = await sendMessage(payload);
      onSend(res.data); // cập nhật tin nhắn mới lên UI
      setText("");
    } catch (err) {
      console.error("❌ Lỗi gửi tin nhắn:", err.response?.data || err.message);
    }
  };

  return (
    <div className="bg-gray-900 p-3 flex gap-2 border-t border-gray-800">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
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
