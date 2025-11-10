// src/components/Sidebar.jsx
import { useEffect, useState } from "react";
import { getConversations } from "../api/chatService";
import UserAvatar from "./UserAvatar";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ onSelectConversation }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (!user?._id) return;
    const fetchData = async () => {
      try {
        const data = await getConversations(user._id);
        setConversations(data);
      } catch (err) {
        console.error("Error loading conversations:", err);
      }
    };
    fetchData();
  }, [user]);

  return (
    <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="font-bold text-xl text-blue-600">Messenger</h2>
      </div>

      <div className="overflow-y-auto flex-1">
        {conversations.map((c) => {
          const friendId = c.members.find((m) => m !== user._id);
          return (
            <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-bold text-xl text-blue-600">Messenger</h2>
              </div>

              {!user ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Đang tải dữ liệu người dùng...
                </div>
              ) : (
                <div className="overflow-y-auto flex-1">
                  {conversations.length === 0 ? (
                    <p className="text-center text-gray-400 mt-4">
                      Chưa có cuộc trò chuyện nào
                    </p>
                  ) : (
                    conversations.map((c) => {
                      const friendId = c.members.find((m) => m !== user._id);
                      return (
                        <div
                          key={c._id}
                          onClick={() => onSelectConversation(c._id, friendId)}
                          className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer transition"
                        >
                          <UserAvatar online={false} />
                          <div>
                            <p className="font-semibold">{friendId}</p>
                            <p className="text-sm text-gray-500 truncate">
                              {c.lastMessage}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
