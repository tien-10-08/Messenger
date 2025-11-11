import React, { useState } from "react";
import { updateUserProfile } from "../api/userApi";
import { uploadImage } from "../utils/uploadImage";
import { useAuth } from "../context/AuthContext";

const ProfilePanel = ({ user, onClose }) => {
  const { user: currentUser, login } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    username: user?.username || "",
    status: user?.status || "",
    avatar: user?.avatar || "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isSelf = currentUser._id === user._id;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, avatar: url }));
    } catch {
      alert("Tải ảnh thất bại!");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const updated = await updateUserProfile(currentUser._id, form);
      login(updated, localStorage.getItem("token"));
      setEditMode(false);
      alert("Cập nhật hồ sơ thành công!");
    } catch (err) {
      alert(err.response?.data?.error || "Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-80 bg-gray-900 text-white flex flex-col border-l border-gray-700 p-4">
      <button onClick={onClose} className="text-right text-gray-400 hover:text-white mb-4">
        ✕
      </button>

      <div className="flex flex-col items-center">
        <img
          src={form.avatar || "/default-avatar.png"}
          alt="avatar"
          className="w-24 h-24 rounded-full object-cover mb-3 border border-gray-700"
        />

        {isSelf && editMode && (
          <>
            <input type="file" accept="image/*" onChange={handleUpload} className="text-sm mb-2" />
            {uploading && <p className="text-xs text-gray-400 mb-2">Đang tải ảnh...</p>}
          </>
        )}

        {editMode ? (
          <>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full text-center bg-gray-800 p-2 rounded mb-2"
            />
            <textarea
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full text-sm bg-gray-800 p-2 rounded resize-none"
            />
            <button
              onClick={handleSave}
              disabled={loading}
              className="mt-3 bg-blue-600 px-3 py-1 rounded hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </>
        ) : (
          <>
            <h3 className="text-lg font-bold">{user.username}</h3>
            <p className="text-sm text-gray-400">{user.email}</p>
            <p className="mt-3 text-gray-300 italic">{user.status || "Chưa có trạng thái"}</p>
            {isSelf && (
              <button
                onClick={() => setEditMode(true)}
                className="mt-3 bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
              >
                Chỉnh sửa hồ sơ
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePanel;
