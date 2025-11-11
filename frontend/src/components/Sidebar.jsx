import React, { useEffect, useState } from "react";
import { getMyConversations, createOrGetConversation } from "../api/conversationApi";
import { searchUsers } from "../api/userApi";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { getConversationTitle } from "../utils/getConversationTitle";
import { formatTime } from "../utils/formatTime";

const Sidebar = () => {
  const { user } = useAuth();
  const { currentChat, setCurrentChat } = useChat();

  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // 📥 Load conversations
  useEffect(() => {
    const fetchConvos = async () => {
      try {
        const res = await getMyConversations();
        setConversations(res.data || []);
      } catch (err) {
        console.error("Lỗi lấy conversations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConvos();
  }, []);

  // 🔍 Search user
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (search.trim()) {
        try {
          const res = await searchUsers(search);
          setResults(res.data?.items || []);
        } catch (err) {
          console.error("Lỗi search:", err);
        }
      } else setResults([]);
    }, 400);
    return () => clearTimeout(delay);
  }, [search]);

  // ➕ Chọn user → tạo hoặc lấy conversation
  const handleSelectUser = async (target) => {
    try {
      const res = await createOrGetConversation({
        userA: user._id,
        userB: target._id,
      });
      const convo = res.data;
      const exists = conversations.some((c) => c._id === convo._id);
      if (!exists) setConversations((prev) => [convo, ...prev]);
      setCurrentChat(convo);
      setSearch("");
      setResults([]);
    } catch (err) {
      console.error("Lỗi tạo/mở conversation:", err);
    }
  };

  return (
    <div className="w-1/4 bg-gray-900 text-white p-4 flex flex-col">
      <h2 className="text-xl font-bold mb-3">Danh sách chat</h2>

      {/* Search user */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="🔍 Tìm người để nhắn..."
        className="w-full px-3 py-2 bg-gray-800 rounded-lg mb-3 focus:ring-2 focus:ring-blue-600 outline-none"
      />
      {results.length > 0 && (
        <div className="bg-gray-800 rounded-lg mb-3 max-h-48 overflow-y-auto">
          {results.map((u) => (
            <div
              key={u._id}
              onClick={() => handleSelectUser(u)}
              className="p-2 hover:bg-gray-700 cursor-pointer rounded"
            >
              <p className="font-semibold">{u.username}</p>
              <p className="text-xs text-gray-400">{u.email}</p>
            </div>
          ))}
        </div>
      )}

      {/* Conversation list */}
      {loading ? (
        <p className="text-gray-400">Đang tải...</p>
      ) : conversations.length === 0 ? (
        <p className="text-gray-400 italic">Chưa có cuộc trò chuyện nào.</p>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {conversations.map((c) => (
            <button
              key={c._id}
              onClick={() => setCurrentChat(c)}
              className={`w-full text-left px-3 py-2 rounded-lg mb-2 ${
                currentChat?._id === c._id ? "bg-blue-600" : "hover:bg-gray-700"
              }`}
            >
              <div className="flex justify-between items-center">
                <span>{getConversationTitle(c, user._id)}</span>
                <span className="text-xs text-gray-400">
                  {formatTime(c.updatedAt)}
                </span>
              </div>
              {c.lastMessage && (
                <p className="text-xs text-gray-400 truncate mt-1">
                  {c.lastMessage}
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
