import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { useUsers } from "../context/UserContext";
import { getMyConversations, createOrGetConversation } from "../api/conversationApi";
import { getConversationTitle } from "../utils/getConversationTitle";
import { formatTime } from "../utils/formatTime";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { currentChat, setCurrentChat, conversations, setConversations } = useChat();
  const { users, loading: searching, fetchUsers, setUsers } = useUsers();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConvos = async () => {
      try {
        const data = await getMyConversations();
        setConversations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConvos();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (search.trim()) fetchUsers(search);
      else setUsers([]);
    }, 400);
    return () => clearTimeout(delay);
  }, [search]);

  const handleSelectUser = async (targetUser) => {
    try {
      const convo = await createOrGetConversation(targetUser._id);
      const exists = conversations.some(c => c._id === convo._id);
      if (!exists) setConversations(prev => [convo, ...prev]);
      setCurrentChat(convo);
      setSearch("");
      setUsers([]);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="w-80 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-white/10 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400">Loading conversations...</p>
        </div>
      </div>
    );

  return (
    <div className="w-80 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-white/10 flex flex-col h-screen">
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">Messages</h1>
          <button
            onClick={() => { setCurrentChat(null); navigate("/profile"); }}
            className="relative"
          >
            <img 
              src={user.avatar || "/default-avatar.png"} 
              alt="Profile" 
              title="View Profile"
              className="w-10 h-10 rounded-full border-2 border-purple-500 hover:border-purple-400 transition-all cursor-pointer"
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
          </button>
        </div>

        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {search.trim() && (
        <div className="bg-white/5 mx-3 mt-3 rounded-xl border border-white/10 max-h-48 overflow-y-auto">
          {searching && (
            <div className="p-4 text-center text-gray-400 text-sm">
              <div className="inline-block w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
          )}
          {!searching && users.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">No users found</div>
          )}
          {!searching && users.map((u) => (
            <button
              key={u._id}
              onClick={() => handleSelectUser(u)}
              className="w-full flex items-center gap-3 p-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0"
            >
              <img src={u.avatar || "/default-avatar.png"} alt="" className="w-10 h-10 rounded-full" />
              <div className="flex-1 text-left">
                <p className="font-semibold text-white text-sm">{u.username}</p>
                <p className="text-xs text-gray-400">{u.email}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {conversations.length > 0 ? (
          conversations.map((c) => {
            const members = Array.isArray(c.members) ? c.members : [];
            const other = members.find((m) => String(m?._id || m) !== String(user._id));
            const otherAvatar = other?.avatar || "/default-avatar.png";
            const title = getConversationTitle(c, user._id);

            return (
              <button
                key={c._id}
                onClick={() => setCurrentChat(c)}
                className={`w-full text-left p-3 rounded-xl transition-all duration-200 group ${
                  currentChat?._id === c._id
                    ? "bg-gradient-to-r from-purple-600/30 to-blue-600/30 border border-purple-500/50"
                    : "hover:bg-white/10 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <img
                      src={otherAvatar}
                      alt="avatar"
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-slate-900"></div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="truncate font-semibold text-white">{title}</span>
                      {c.updatedAt && (
                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                          {formatTime(c.updatedAt)}
                        </span>
                      )}
                    </div>
                    {c.lastMessage && (
                      <p className="text-xs text-gray-400 truncate group-hover:text-gray-300 h-4 leading-4">
                        {c.lastMessage}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg className="w-16 h-16 text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-gray-500 text-sm">No conversations yet</p>
            <p className="text-gray-600 text-xs mt-2">Search and start a new chat</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-medium transition-all text-sm border border-red-500/30 hover:border-red-500/50"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
