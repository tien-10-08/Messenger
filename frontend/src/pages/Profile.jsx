import React, { useEffect, useState, useCallback } from "react";
import { getMyProfile } from "../api/profileApi";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ProfileForm from "../components/ProfileForm";
import { useChat } from "../context/ChatContext";
import { getMyConversations } from "../api/conversationApi";

const Profile = () => {
  const { user, logout, token, login } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { setConversations } = useChat();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const me = await getMyProfile();
        setProfile(me);
      } catch (err) {
        console.error("Lỗi lấy thông tin profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleUpdated = useCallback((newData) => {
    setProfile(newData);
    if (newData) login(newData, token);
    // Refetch conversations to refresh avatars in Sidebar immediately
    getMyConversations().then(setConversations).catch(() => {});
  }, [login, token]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p>Đang tải thông tin...</p>
      </div>
    );

  if (!profile)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p>Không tìm thấy thông tin người dùng.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex justify-center items-start p-8">
      <div className="max-w-lg w-full space-y-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm">← Quay lại</button>
          <h1 className="text-2xl font-bold text-center flex-1">Thông tin cá nhân</h1>
          <span className="w-[84px]" />
        </div>

        <div className="bg-gray-800 p-4 rounded-xl shadow-md">
          <p className="text-sm text-gray-400">Email: {profile.email}</p>
          <p className="text-sm text-gray-400">
            Ngày tạo: {new Date(profile.createdAt).toLocaleDateString("vi-VN")}
          </p>
        </div>

        <ProfileForm user={profile} onUpdated={handleUpdated} />
      </div>
    </div>
  );
};

export default Profile;
