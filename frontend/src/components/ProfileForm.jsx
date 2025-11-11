// src/components/ProfileForm.jsx
import React, { useState, useEffect } from "react";
import { updateProfile } from "../api/profileApi";
import toast from "react-hot-toast";

const ProfileForm = ({ user, onUpdated }) => {
  const [form, setForm] = useState({
    username: user.username || "",
    status: user.status || "",
    avatar: user.avatar || "",
  });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(user.avatar || "");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let payload;
      if (avatarFile) {
        const fd = new FormData();
        fd.append("username", form.username || "");
        fd.append("status", form.status || "");
        fd.append("avatar", avatarFile);
        payload = fd;
      } else {
        payload = { username: form.username || "", status: form.status || "", avatar: form.avatar || "" };
      }
      const updated = await updateProfile(null, payload);
      onUpdated(updated);
      toast.success("Cập nhật thành công 🎉");
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.error || "Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const next = {
      username: user.username || "",
      status: user.status || "",
      avatar: user.avatar || "",
    };
    setForm((prev) => {
      if (
        prev.username === next.username &&
        prev.status === next.status &&
        prev.avatar === next.avatar
      ) {
        return prev;
      }
      return next;
    });
    setPreview(user.avatar || "");
    setAvatarFile(null);
  }, [user]);

  if (!editing) {
    return (
      <div className="text-sm space-y-2 mt-4">
        <p>
          <span className="text-gray-400">Tên hiển thị:</span> {user.username}
        </p>
        <p>
          <span className="text-gray-400">Trạng thái:</span> {user.status || "Không có"}
        </p>
        <div className="mt-2 flex items-center gap-3">
          <img src={user.avatar || "/default-avatar.png"} alt="avatar" className="w-16 h-16 rounded-full object-cover border border-gray-700" />
        </div>
        <button
          onClick={() => setEditing(true)}
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-1 px-4 rounded-lg text-sm"
        >
          Chỉnh sửa
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-4">
      <div className="flex items-center gap-3">
        <img src={preview || "/default-avatar.png"} alt="avatar" className="w-16 h-16 rounded-full object-cover border border-gray-700" />
        <label className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 cursor-pointer text-sm">
          Chọn ảnh
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setAvatarFile(file);
              setPreview(URL.createObjectURL(file));
            }}
          />
        </label>
      </div>
      <div>
        <label className="text-xs text-gray-400">Tên hiển thị</label>
        <input
          type="text"
          name="username"
          value={form.username}
          onChange={handleChange}
          className="w-full p-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="text-xs text-gray-400">Trạng thái</label>
        <input
          type="text"
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full p-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className={`flex-1 py-2 rounded-lg font-semibold text-white ${
            loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Đang lưu..." : "Lưu"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="flex-1 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white"
        >
          Hủy
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
