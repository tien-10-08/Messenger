import React, { useState } from "react";

const ChatInput = ({ onSend, onTyping }) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend?.(text.trim());
    setText("");
    onTyping?.(false);
  };

  return (
    <div className="bg-gray-900 p-3 flex gap-2 border-t border-gray-800">
      <input
        value={text}
        onChange={(e) => { setText(e.target.value); onTyping?.(true); }}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Nhập tin nhắn..."
        className="flex-1 bg-gray-800 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button onClick={handleSend} className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 text-white font-medium transition">
        Gửi
      </button>
    </div>
  );
};

export default ChatInput;
