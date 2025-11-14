import React from "react";

const ProfilePanel = ({ user, onClose }) => {
  const safeUser = user || {};
  return (
    <div className="w-80 bg-gray-900 text-white flex flex-col border-l border-gray-700 p-4">
      <button onClick={onClose} className="text-right text-gray-400 hover:text-white mb-4">✕</button>
      <div className="flex flex-col items-center">
        <img src={safeUser.avatar || "/default-avatar.png"} alt="avatar" className="w-24 h-24 rounded-full object-cover mb-3 border border-gray-700" />
        <h3 className="text-lg font-bold">{safeUser.username || "Người dùng"}</h3>
        {safeUser.email && <p className="text-sm text-gray-400">{safeUser.email}</p>}
        <div className="w-full mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Tên</span>
            <span className="text-gray-200 truncate max-w-[12rem]">{safeUser.username || ""}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Trạng thái</span>
            <span className="text-gray-200 truncate max-w-[12rem]">{safeUser.status ? safeUser.status?.trim() : "Hello, I'm " + `${safeUser.username}`}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Ngày tạo</span>
            <span className="text-gray-200 truncate max-w-[12rem]">{safeUser.createdAt ? new Date(safeUser.createdAt).toLocaleString("vi-VN") : ""}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;
