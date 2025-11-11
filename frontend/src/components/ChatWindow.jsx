import React, { useEffect, useRef, useState } from "react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { formatTime } from "../utils/formatTime";
import ChatHeader from "./ChatHeader";
import ProfilePanel from "./ProfilePanel";
import ChatInput from "./ChatInput";
import { getMessagesByConversation } from "../api/messageApi";
import { getUserProfile } from "../api/userApi";

const ChatWindow = () => {
  const { user } = useAuth();
  const { currentChat, messages, setMessages } = useChat();
  const [showProfile, setShowProfile] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const bottomRef = useRef();

  // 🔹 Lấy danh sách tin nhắn khi currentChat thay đổi
  useEffect(() => {
  const fetchMessages = async () => {
    if (!currentChat?._id) {
      setMessages([]);
      return;
    }

    try {
      const { items } = await getMessagesByConversation(currentChat._id);
      setMessages(items);
    } catch (err) {
      console.error("❌ Lỗi tải tin nhắn:", err.response?.data || err.message);
      setMessages([]);
    }
  };

  fetchMessages();
}, [currentChat]);


  // 🔹 Xác định và load thông tin người còn lại
  useEffect(() => {
    const fetchOtherUser = async () => {
      if (!currentChat?.members || !user?._id) return;
      const otherId = currentChat.members.find((m) =>
        typeof m === "string" ? m !== user._id : m._id !== user._id
      );
      if (!otherId) return;

      if (typeof otherId === "object") {
        setOtherUser(otherId);
      } else {
        try {
          const res = await getUserProfile(otherId);
          setOtherUser(res.data);
        } catch (err) {
          console.error("❌ Lỗi load otherUser:", err.response?.data || err.message);
        }
      }
    };

    fetchOtherUser();
  }, [currentChat, user]);

  // 🔹 Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Nếu chưa chọn cuộc trò chuyện
  if (!currentChat || !currentChat._id) {
    return (
      <div className="flex-1 bg-gray-800 flex items-center justify-center text-gray-400">
        Chọn cuộc trò chuyện để bắt đầu
      </div>
    );
  }

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
          {Array.isArray(messages) && messages.length > 0 ? (
            messages.map((m) => (
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
            ))
          ) : (
            <p className="text-gray-500 italic text-sm text-center">
              Chưa có tin nhắn nào
            </p>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {showProfile && (
        <ProfilePanel user={otherUser} onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
};

export default ChatWindow;
