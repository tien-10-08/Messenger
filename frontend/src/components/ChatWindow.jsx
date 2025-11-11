import React, { useEffect, useRef, useState } from "react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { formatTime } from "../utils/formatTime";
import ChatHeader from "./ChatHeader";
import ProfilePanel from "./ProfilePanel";
import { getUserProfile } from "../api/userApi";
import ChatInput from "./ChatInput";

const ChatWindow = () => {
  const { user } = useAuth();
  const { currentChat, messages, setMessages } = useChat();
  const { sendMessage, sendTyping, joinConversation } = useSocket();

  const [showProfile, setShowProfile] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const bottomRef = useRef();

  // Join room và nhận lịch sử qua socket
  useEffect(() => {
    if (!currentChat?._id) {
      setMessages([]);
      return;
    }
    joinConversation(currentChat._id);
  }, [currentChat, joinConversation, setMessages]);

  // Lấy thông tin người chat còn lại
  useEffect(() => {
    if (!currentChat?.members || !user?._id) return;
    const otherId = currentChat.members.find(m => (typeof m === "string" ? m !== user._id : m._id !== user._id));
    if (!otherId) return;

    if (typeof otherId === "object") setOtherUser(otherId);
    else getUserProfile(otherId).then(res => setOtherUser(res.data)).catch(console.error);
  }, [currentChat, user]);

  // Scroll cuối
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!currentChat?._id)
    return <div className="flex-1 bg-gray-800 flex items-center justify-center text-gray-400">Chọn cuộc trò chuyện để bắt đầu</div>;

  return (
    <div className="flex flex-1 bg-gray-800 text-white">
      <div className={`flex flex-col flex-1 transition-all duration-300 ${showProfile ? "w-[calc(100%-20rem)]" : "w-full"}`}>
        <ChatHeader user={otherUser} onProfileClick={() => setShowProfile(true)} />
        <div className="flex flex-col gap-3 flex-1 overflow-y-auto p-4">
          {messages.length > 0 ? (
            messages.map(m => (
              <div key={m._id || m.createdAt} className={`flex ${(m.senderId?._id || m.senderId) === user._id ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs p-3 rounded-2xl text-sm shadow ${(m.senderId?._id || m.senderId) === user._id ? "bg-blue-600 rounded-br-none" : "bg-gray-700 rounded-bl-none"}`}>
                  <p>{m.text}</p>
                  <span className="text-xs text-gray-300 block mt-1 text-right">{formatTime(m.createdAt)}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic text-sm text-center">Chưa có tin nhắn nào</p>
          )}
          <div ref={bottomRef} />
        </div>
        <ChatInput onSend={(text) => sendMessage({ conversationId: currentChat._id, senderId: user._id, receiverId: otherUser?._id, text })} onTyping={(isTyping) => sendTyping(currentChat._id, isTyping)} />
      </div>

      {showProfile && <ProfilePanel user={otherUser} onClose={() => setShowProfile(false)} />}
    </div>
  );
};

export default ChatWindow;
