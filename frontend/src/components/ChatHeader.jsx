// src/components/ChatHeader.jsx
import React from "react";
import { Info, Phone, Video } from "lucide-react";
import { useCall } from "../context/CallContext";

const ChatHeader = ({ user, onProfileClick }) => {
  const { startVoiceCall, startVideoCall } = useCall();
  if (!user) {
    return (
      <div className="border-b border-white/10 px-6 py-4 text-gray-400 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <span>Loading user info...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4">
      <div
        className="flex items-center gap-4 cursor-pointer group"
        onClick={onProfileClick}
      >
        <div className="relative">
          <img
            src={user.avatar || "/default-avatar.png"}
            alt="avatar"
            className="w-11 h-11 rounded-full object-cover ring-2 ring-purple-500/50 group-hover:ring-purple-400 transition-all"
          />
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-slate-900"></div>
        </div>
        <div className="group-hover:opacity-80 transition-opacity">
          <p className="text-white font-semibold text-base">{user.username}</p>
          <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
            {user.status || "Active now"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => user && startVoiceCall(user)}
          className="p-2.5 rounded-lg bg-white/10 hover:bg-blue-600/30 text-blue-300 hover:text-blue-200 transition-all border border-white/10 hover:border-blue-500/50 group"
          title="Start Voice Call"
        >
          <Phone size={20} className="group-hover:scale-110 transition-transform" />
        </button>
        <button
          onClick={() => user && startVideoCall(user)}
          className="p-2.5 rounded-lg bg-white/10 hover:bg-green-600/30 text-green-300 hover:text-green-200 transition-all border border-white/10 hover:border-green-500/50 group"
          title="Start Video Call"
        >
          <Video size={20} className="group-hover:scale-110 transition-transform" />
        </button>
        <button
          onClick={onProfileClick}
          className="p-2.5 rounded-lg bg-white/10 hover:bg-purple-600/30 text-purple-300 hover:text-purple-200 transition-all border border-white/10 hover:border-purple-500/50 group"
          title="View Profile"
        >
          <Info size={20} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
