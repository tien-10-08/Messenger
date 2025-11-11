import React, { useState } from "react";
import { useChat } from "../context/ChatContext";

const ChatInput = ({ onSend }) => {
  const [text, setText] = useState("");
  const { addMessage } = useChat(); // ✅ lấy addMessage từ ChatContext

  const handleSend = () => {
    if (!text.trim()) return;

    // Gửi lên server
    const msg = text.trim();
    onSend?.(msg);

    // Thêm vào message local
    addMessage({
      _id: Date.now().toString(), // fake id tạm thời
      senderId: { _id: "me" }, // tạm thời, bạn có thể lấy user._id từ AuthContext
      text: msg,
      createdAt: new Date().toISOString(),
    });

    setText("");
  };

  return (
    <div className="bg-gray-900 p-3 flex gap-2 border-t border-gray-800">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Nhập tin nhắn..."
        className="flex-1 bg-gray-800 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleSend}
        className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 text-white font-medium transition"
      >
        Gửi
      </button>
    </div>
  );
};

export default ChatInput;
