import React, { useEffect, useState, useCallback } from "react";
import { getMyProfile } from "../api/profileApi";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ProfileForm from "../components/ProfileForm";
import { useChat } from "../context/ChatContext";
import { getMyConversations } from "../api/conversationApi";
import { ArrowLeft } from "lucide-react";

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
        console.error("Error fetching profile:", err);
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
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );

  if (!profile)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-400">Profile not found</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/10"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold">My Profile</h1>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Email</p>
              <p className="text-white font-semibold break-all">{profile.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Member Since</p>
              <p className="text-white font-semibold">
                {new Date(profile.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-300">Active</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-6">Edit Profile</h2>
          <ProfileForm user={profile} onUpdated={handleUpdated} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
