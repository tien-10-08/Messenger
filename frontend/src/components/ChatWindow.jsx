import React, { useEffect, useRef, useState } from "react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { formatTime } from "../utils/formatTime";
import ChatHeader from "./ChatHeader";
import ProfilePanel from "./ProfilePanel";

const ChatWindow = () => {
  const { user } = useAuth();
  const { currentChat, messages } = useChat();
  const bottomRef = useRef();
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!currentChat)
    return (
      <div className="flex-1 bg-gray-800 flex items-center justify-center text-gray-400">
        Chọn cuộc trò chuyện để bắt đầu
      </div>
    );

  // Lấy user còn lại trong cuộc trò chuyện
  const otherUser = currentChat.members?.find((m) => m._id !== user._id);

  return (
    <div className="flex flex-1 bg-gray-800 text-white">
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          showProfile ? "w-[calc(100%-20rem)]" : "w-full"
        }`}
      >
        {/* ✅ Thêm ChatHeader */}
        <ChatHeader user={otherUser} onProfileClick={() => setShowProfile(true)} />

        {/* Danh sách tin nhắn */}
        <div className="flex flex-col gap-3 flex-1 overflow-y-auto p-4">
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

      {/* Panel hồ sơ bên phải */}
      {showProfile && (
        <ProfilePanel user={otherUser} onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
};

export default ChatWindow;
