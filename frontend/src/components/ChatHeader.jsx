// src/components/ChatHeader.jsx
import React from "react";
import { Info, Phone, Video } from "lucide-react";
import { useCall } from "../context/CallContext";

const ChatHeader = ({ user, onProfileClick }) => {
  const { startVoiceCall, startVideoCall } = useCall();
  if (!user) {
    return (
      <div className="border-b border-gray-700 px-4 py-3 text-gray-400">
        Đang tải thông tin người dùng...
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between border-b border-gray-700 bg-gray-900 px-4 py-3">
      {/* Thông tin người đang chat */}
      <div
        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
        onClick={onProfileClick}
      >
        <img
          src={user.avatar || "/default-avatar.png"}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="text-white font-semibold">{user.username}</p>
          <p className="text-xs text-gray-400">
            {user.status || "Đang hoạt động"}
          </p>
        </div>
      </div>

      {/* Nút hành động */}
      <div className="flex items-center gap-3 text-gray-300">
        <button
          className="hover:text-white"
          onClick={() => user && startVoiceCall(user)}
        >
          <Phone size={20} />
        </button>
        <button
          className="hover:text-white"
          onClick={() => user && startVideoCall(user)}
        >
          <Video size={20} />
        </button>
        <button className="hover:text-white" onClick={onProfileClick}>
          <Info size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
