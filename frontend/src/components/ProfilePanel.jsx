import React from "react";
import { X } from "lucide-react";

const ProfilePanel = ({ user, onClose }) => {
  const safeUser = user || {};
  
  return (
    <div className="w-80 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col border-l border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <h2 className="text-xl font-bold">Profile</h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      {/* Profile Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <img
              src={safeUser.avatar || "/default-avatar.png"}
              alt="avatar"
              className="w-28 h-28 rounded-full object-cover ring-4 ring-purple-500/50"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-slate-800"></div>
          </div>
          <h3 className="text-2xl font-bold text-white text-center">{safeUser.username || "User"}</h3>
          {safeUser.email && (
            <p className="text-sm text-gray-400 text-center mt-1">{safeUser.email}</p>
          )}
        </div>

        {/* User Info */}
        <div className="space-y-4 mb-6">
          {/* Username */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Username</p>
            <p className="text-white font-semibold truncate">{safeUser.username || "N/A"}</p>
          </div>

          {/* Status */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Status</p>
            <p className="text-white text-sm">
              {safeUser.status && safeUser.status.trim()
                ? safeUser.status
                : `Hello, I'm ${safeUser.username || "there"}`}
            </p>
          </div>

          {/* Member Since */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Member Since</p>
            <p className="text-white text-sm">
              {safeUser.createdAt
                ? new Date(safeUser.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "N/A"}
            </p>
          </div>

          {/* Join Time */}
          {safeUser.createdAt && (
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Join Time</p>
              <p className="text-white text-sm">
                {new Date(safeUser.createdAt).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="p-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-300">Active Now</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;
