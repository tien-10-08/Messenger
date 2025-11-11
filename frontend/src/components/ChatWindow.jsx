import React, { useEffect, useRef } from "react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { formatTime } from "../utils/formatTime";
import { getConversationTitle } from "../utils/getConversationTitle";

const ChatWindow = () => {
  const { user } = useAuth();
  const { currentChat, messages } = useChat();
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!currentChat)
    return (
      <div className="flex-1 bg-gray-800 flex items-center justify-center text-gray-400">
        Chọn cuộc trò chuyện để bắt đầu
      </div>
    );

  return (
    <div className="flex-1 bg-gray-800 text-white flex flex-col p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-2 border-b border-gray-700 pb-2">
        {getConversationTitle(currentChat, user._id)}
      </h2>

      <div className="flex flex-col gap-3 mt-3">
        {messages.map((m) => (
          <div
            key={m._id}
            className={`flex ${
              m.senderId._id === user._id ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs p-3 rounded-2xl text-sm ${
                m.senderId._id === user._id
                  ? "bg-blue-600 rounded-br-none"
                  : "bg-gray-700 rounded-bl-none"
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
