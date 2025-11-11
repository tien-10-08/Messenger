import React, { useEffect, useRef } from "react";
import { useChat } from "../context/ChatContext";
import { formatTime } from "../utils/formatTime";

const ChatWindow = () => {
  const { messages, user, currentChat } = useChat();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 bg-gray-800 text-white flex flex-col p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-2 border-b border-gray-700 pb-2">
        {currentChat?.name}
      </h2>

      <div className="flex flex-col gap-3 mt-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.senderId === user.id ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs p-3 rounded-2xl text-sm ${
                m.senderId === user.id
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-700 text-gray-100 rounded-bl-none"
              }`}
            >
              <p>{m.text}</p>
              <span className="text-xs text-gray-300 block mt-1 text-right">
                {formatTime(m.createdAt)}
              </span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ChatWindow;
