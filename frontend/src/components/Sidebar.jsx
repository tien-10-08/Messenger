import React, { useEffect, useState } from "react";
import {
  getMyConversations,
  createOrGetConversation,
} from "../api/conversationApi";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { useUsers } from "../context/UserContext"; // ✅ dùng context mới
import { getConversationTitle } from "../utils/getConversationTitle";
import { formatTime } from "../utils/formatTime";

const Sidebar = () => {
  const { user } = useAuth();
  const { currentChat, setCurrentChat } = useChat();
  const { users, loading: searching, fetchUsers, setUsers } = useUsers();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // 🧩 Lấy danh sách hội thoại
  useEffect(() => {
    const fetchConvos = async () => {
      try {
        const data = await getMyConversations();
        setConversations(data);
      } catch (err) {
        console.error("❌ Lỗi lấy conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConvos();
  }, []);

  // 🔍 Gọi UserContext để tìm user (debounce 400ms)
  useEffect(() => {
    const delay = setTimeout(() => {
      if (search.trim()) fetchUsers(search);
      else setUsers([]); // clear kết quả khi xoá search
    }, 400);
    return () => clearTimeout(delay);
  }, [search]);

  // ➕ Tạo hoặc lấy conversation
  const handleSelectUser = async (targetUser) => {
    try {
      const convo = await createOrGetConversation(targetUser._id);

      const exists = conversations.some((c) => c._id === convo._id);
      if (!exists) setConversations((prev) => [convo, ...prev]);

      setCurrentChat(convo);
      setSearch("");
      setUsers([]);
    } catch (err) {
      console.error(
        "❌ Lỗi tạo hoặc lấy conversation:",
        err.response?.data || err
      );
    }
  };

  if (loading) {
    return (
      <div className="w-1/4 bg-gray-900 text-white flex items-center justify-center">
        <p>Đang tải danh sách...</p>
      </div>
    );
  }

  return (
    <div className="w-1/4 bg-gray-900 text-white p-4 flex flex-col border-r border-gray-800">
      <h2 className="text-xl font-bold">Danh sách chat</h2>

      <img
        src={user.avatar || "/default-avatar.png"}
        alt="me"
        title="Xem hồ sơ của bạn"
        className="w-10 h-10 rounded-full cursor-pointer border-2 border-blue-500"
        onClick={() => {
          setCurrentChat(null);
          window.dispatchEvent(
            new CustomEvent("openProfile", { detail: user })
          );
        }}
      />
      <div className="mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Tìm người để nhắn..."
          className="w-full px-3 py-2 bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
        />

        {search.trim() && (
          <div className="bg-gray-800 mt-2 rounded-lg max-h-48 overflow-y-auto shadow-lg border border-gray-700">
            {searching && (
              <div className="p-2 text-sm text-gray-400">Đang tìm kiếm...</div>
            )}

            {!searching && users.length === 0 && (
              <div className="p-2 text-sm text-gray-400">
                Không tìm thấy ai.
              </div>
            )}

            {!searching &&
              users.map((u) => (
                <div
                  key={u._id}
                  onClick={() => handleSelectUser(u)}
                  className="flex items-center gap-3 p-2 hover:bg-gray-700 cursor-pointer rounded transition"
                >
                  <img
                    src={u.avatar || "/default-avatar.png"}
                    alt=""
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="font-semibold">{u.username}</p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Danh sách hội thoại */}
      {Array.isArray(conversations) && conversations.length > 0 ? (
        <div className="flex-1 overflow-y-auto space-y-2">
          {conversations.map((c) => (
            <button
              key={c._id}
              onClick={() => setCurrentChat(c)}
              className={`w-full text-left px-3 py-2 rounded-lg flex flex-col transition ${
                currentChat?._id === c._id ? "bg-blue-600" : "hover:bg-gray-800"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="truncate font-medium">
                  {getConversationTitle(c, user._id)}
                </span>
                {c.updatedAt && (
                  <span className="text-xs text-gray-400 ml-2">
                    {formatTime(c.updatedAt)}
                  </span>
                )}
              </div>

              {c.lastMessage && (
                <p className="text-xs text-gray-400 truncate mt-1">
                  {c.lastMessage}
                </p>
              )}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 italic text-sm mt-2">
          Chưa có cuộc trò chuyện nào. Hãy tìm người để bắt đầu.
        </p>
      )}
    </div>
  );
};

export default Sidebar;
