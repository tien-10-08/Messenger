import React from "react";
import { useAuth } from "../context/AuthContext";

const ProfilePanel = ({ user, onClose }) => {
  const { user: currentUser } = useAuth();
  const isSelf = currentUser?._id === user?._id;

  if (!user) return null;

  return (
    <div className="w-80 bg-gray-800 text-white flex flex-col border-l border-gray-700 animate-slideIn">
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold">
          {isSelf ? "Hồ sơ của bạn" : "Thông tin người dùng"}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-200 text-xl"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-col items-center mt-6 space-y-3 px-4">
        <img
          src={user.avatar || "/default-avatar.png"}
          alt="avatar"
          className="w-24 h-24 rounded-full border-2 border-gray-600"
        />
        <h3 className="text-xl font-bold">{user.username}</h3>
        <p className="text-gray-400 text-sm">{user.status || "Không có trạng thái"}</p>
      </div>

      <div className="mt-6 px-6 text-sm space-y-2">
        <p>
          <span className="text-gray-400">Email: </span>
          {user.email || "Ẩn"}
        </p>
        <p>
          <span className="text-gray-400">Tham gia từ: </span>
          {new Date(user.createdAt).toLocaleDateString("vi-VN")}
        </p>
      </div>

      {isSelf && (
        <div className="mt-8 px-6">
          <button
            onClick={() => alert("Chức năng chỉnh sửa profile sắp ra mắt 🧩")}
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold text-sm"
          >
            Chỉnh sửa hồ sơ
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePanel;
