import React, { useEffect, useState } from "react";
import { getProfile } from "../api/profileApi";
import { useAuth } from "../context/AuthContext";
import ProfileForm from "../components/ProfileForm";

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile(user._id, true);
        setProfile(res.data);
      } catch (err) {
        console.error("Lỗi lấy thông tin profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

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
        <h1 className="text-2xl font-bold mb-4 text-center">Thông tin cá nhân</h1>

        <div className="bg-gray-800 p-4 rounded-xl shadow-md">
          <p className="text-sm text-gray-400">Email: {profile.email}</p>
          <p className="text-sm text-gray-400">
            Ngày tạo: {new Date(profile.createdAt).toLocaleDateString("vi-VN")}
          </p>
        </div>

        <ProfileForm user={profile} onUpdated={(newData) => setProfile(newData)} />
      </div>
    </div>
  );
};

export default Profile;
