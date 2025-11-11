import React, { useEffect, useRef, useState } from "react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { formatTime } from "../utils/formatTime";
import ChatHeader from "./ChatHeader";
import ProfilePanel from "./ProfilePanel";
import ChatInput from "./ChatInput";
import { getMessagesByConversation } from "../api/messageApi";

const ChatWindow = () => {
  const { user } = useAuth();
  const { currentChat, messages, setMessages } = useChat();
  const [showProfile, setShowProfile] = useState(false);
  const bottomRef = useRef();

  // 🔹 Lấy danh sách tin nhắn khi currentChat thay đổi
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!currentChat?._id) return;
        console.log("🧾 Fetching messages for:", currentChat._id);

        const res = await getMessagesByConversation(currentChat._id);
        const data = res.data?.items || res.data || [];
        setMessages(data);
      } catch (err) {
        console.error(
          "❌ Lỗi tải tin nhắn:",
          err.response?.status,
          err.response?.data
        );
      }
    };

    fetchMessages();
  }, [currentChat, setMessages]);

  // 🔹 Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!currentChat || !currentChat._id) {
    return (
      <div className="flex-1 bg-gray-800 flex items-center justify-center text-gray-400">
        Chọn cuộc trò chuyện để bắt đầu
      </div>
    );
  }

  // 🔹 Xác định người còn lại trong cuộc trò chuyện
  const otherUser = currentChat.members?.find((m) => m._id !== user._id);

  return (
    <div className="flex flex-1 bg-gray-800 text-white">
      {/* Phần khung chat chính */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          showProfile ? "w-[calc(100%-20rem)]" : "w-full"
        }`}
      >
        {/* Header hiển thị tên + avatar */}
        <ChatHeader
          user={otherUser}
          onProfileClick={() => setShowProfile(true)}
        />

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
                className={`max-w-xs p-3 rounded-2xl text-sm shadow ${
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

        {/* Ô nhập tin nhắn */}
        <ChatInput />
      </div>

      {/* Panel hồ sơ bên phải */}
      {showProfile && (
        <ProfilePanel user={otherUser} onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
};

export default ChatWindow;
