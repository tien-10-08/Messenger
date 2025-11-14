// src/components/ProfileForm.jsx
import React, { useState, useEffect } from "react";
import { updateProfile } from "../api/profileApi";
import toast from "react-hot-toast";
import { Edit, Save, X, Upload } from "lucide-react";

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
      toast.success("Profile updated successfully 🎉");
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed!");
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
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Avatar</p>
          <div className="flex items-end gap-4">
            <img
              src={user.avatar || "/default-avatar.png"}
              alt="avatar"
              className="w-20 h-20 rounded-full object-cover ring-4 ring-purple-500/50"
            />
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-all flex items-center gap-2 group"
            >
              <Edit size={16} className="group-hover:scale-110 transition-transform" />
              Edit Profile
            </button>
          </div>
        </div>

        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Username</p>
          <p className="text-white font-semibold">{user.username || "N/A"}</p>
        </div>

        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Status</p>
          <p className="text-white">{user.status || "No status set"}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Update Avatar</p>
        <div className="flex items-end gap-4">
          <div className="relative">
            <img
              src={preview || "/default-avatar.png"}
              alt="avatar"
              className="w-20 h-20 rounded-full object-cover ring-4 ring-purple-500/50"
            />
          </div>
          <label className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all flex items-center gap-2 cursor-pointer group border border-blue-500/50 hover:border-blue-400/50">
            <Upload size={16} className="group-hover:scale-110 transition-transform" />
            Choose Image
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
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-3">Username</label>
        <input
          type="text"
          name="username"
          value={form.username}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          placeholder="Enter username..."
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-3">Status</label>
        <textarea
          name="status"
          value={form.status}
          onChange={handleChange}
          rows="3"
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
          placeholder="What's on your mind?"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold transition-all flex items-center justify-center gap-2 group border border-purple-500/50 hover:border-purple-400/50"
        >
          <Save size={18} className="group-hover:scale-110 transition-transform" />
          {loading ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="flex-1 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white font-semibold transition-all flex items-center justify-center gap-2 border border-white/10 hover:border-white/20 group"
        >
          <X size={18} className="group-hover:scale-110 transition-transform" />
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
