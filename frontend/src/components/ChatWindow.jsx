import React, { useEffect, useRef, useState } from "react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { formatTime } from "../utils/formatTime";
import ChatHeader from "./ChatHeader";
import ProfilePanel from "./ProfilePanel";
import { getUserProfile } from "../api/userApi";
import ChatInput from "./ChatInput";
import { markMessageSeen, uploadMediaMessage } from "../api/messageApi";

const ChatWindow = () => {
  const { user } = useAuth();
  const { currentChat, messages, setMessages } = useChat();
  const { sendMessage, sendTyping, joinConversation, on, off } = useSocket();

  const [showProfile, setShowProfile] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const [otherTyping, setOtherTyping] = useState(false);
  const bottomRef = useRef();
  const seenInFlightRef = useRef(new Set());
  const lastBulkSeenAtRef = useRef(0);

  const markAllFromOtherAsSeen = () => {
    if (!currentChat?._id || !otherUser?._id || !user?._id) return;
    const now = Date.now();
    if (now - lastBulkSeenAtRef.current < 800) return;
    lastBulkSeenAtRef.current = now;
    const list = (messages || []).filter(m => {
      const senderId = m?.senderId?._id || m?.senderId;
      if (!m?._id || String(senderId) !== String(otherUser._id)) return false;
      const seenBy = (m.isSeenBy || []).map(String);
      if (seenBy.includes(String(user._id))) return false;
      if (seenInFlightRef.current.has(String(m._id))) return false;
      return true;
    });
    list.forEach(m => {
      seenInFlightRef.current.add(String(m._id));
      markMessageSeen(m._id).catch(() => {
        seenInFlightRef.current.delete(String(m._id));
      });
    });
  };

  // Join room và nhận lịch sử qua socket
  useEffect(() => {
    if (!currentChat?._id) {
      setMessages([]);
      return;
    }
    joinConversation(currentChat._id);
    setOtherTyping(false);
  }, [currentChat, joinConversation, setMessages]);

  // Lấy thông tin người chat còn lại
  useEffect(() => {
    if (!currentChat?.members || !user?._id) return;
    const otherId = currentChat.members.find(m => {
      const mid = typeof m === "string" ? m : (m?._id || m?.id || m);
      return String(mid) !== String(user._id);
    });
    if (!otherId) return;

    if (typeof otherId === "object") setOtherUser(otherId);
    else getUserProfile(otherId).then(userObj => setOtherUser(userObj)).catch(console.error);
  }, [currentChat, user]);

  // Lắng nghe typing của đối phương
  useEffect(() => {
    if (!currentChat?._id || !otherUser?._id) return;
    const handler = ({ conversationId, userId, isTyping }) => {
      if (conversationId === currentChat._id && userId === otherUser._id) {
        setOtherTyping(!!isTyping);
      }
    };
    on?.("userTyping", handler);
    return () => off?.("userTyping", handler);
  }, [currentChat?._id, otherUser?._id, on, off]);

  // Scroll cuối
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto mark messages from other user as seen when viewing
  useEffect(() => {
    if (!currentChat?._id || !otherUser?._id || !user?._id) return;
    const toMark = (messages || []).filter(m => {
      const senderId = m?.senderId?._id || m?.senderId;
      if (!m?._id || String(senderId) !== String(otherUser._id)) return false;
      const seenBy = (m.isSeenBy || []).map(String);
      if (seenBy.includes(String(user._id))) return false;
      if (seenInFlightRef.current.has(String(m._id))) return false;
      return true;
    });
    toMark.forEach(m => {
      seenInFlightRef.current.add(String(m._id));
      markMessageSeen(m._id).catch(() => {
        // allow retry later if failed
        seenInFlightRef.current.delete(String(m._id));
      });
    });
  }, [messages, currentChat?._id, otherUser?._id, user?._id]);

  if (!currentChat?._id)
    return <div className="flex-1 bg-gray-800 flex items-center justify-center text-gray-400">Chọn cuộc trò chuyện để bắt đầu</div>;

  const handleSendMedia = async (type, file) => {
    if (!file || !currentChat?._id) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("conversationId", currentChat._id);
      formData.append("type", type);
      await uploadMediaMessage(formData);
      // message media sẽ được nhận qua socket getMessage
    } catch (err) {
      console.error("uploadMediaMessage error", err);
    }
  };

  return (
    <div className="flex flex-1 bg-gray-800 text-white">
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${showProfile ? "w-[calc(100%-20rem)]" : "w-full"}`}
        onClick={markAllFromOtherAsSeen}
        onKeyDown={markAllFromOtherAsSeen}
        tabIndex={0}
      >
        <ChatHeader user={otherUser} onProfileClick={() => setShowProfile(true)} />
        <div className="flex flex-col gap-3 flex-1 overflow-y-auto p-4">
          {messages.length > 0 ? (
            (() => {
              // Xác định tin nhắn mới nhất của tôi đã được đối phương xem
              const lastSeenId = [...messages]
                .filter(m => String(m?.senderId?._id || m?.senderId) === String(user._id))
                .filter(m => (m.isSeenBy || []).map(String).includes(String(otherUser?._id)))
                .map(m => String(m._id))
                .pop();
              return messages.map(m => {
                const mine = String(m?.senderId?._id || m?.senderId) === String(user._id);
                const isLastSeen = mine && String(m?._id) === String(lastSeenId);
                const isImage = m.type === "image";
                const isVoice = m.type === "voice";
                return (
                  <div key={m._id || m.createdAt} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs p-3 rounded-2xl text-sm shadow ${mine ? "bg-blue-600 rounded-br-none" : "bg-gray-700 rounded-bl-none"}`}>
                      {isImage && m.mediaUrl && (
                        <img src={m.mediaUrl} alt="media" className="max-w-full rounded mb-1" />
                      )}
                      {isVoice && m.mediaUrl && (
                        <audio controls className="w-full mb-1">
                          <source src={m.mediaUrl} />
                          Trình duyệt không hỗ trợ audio.
                        </audio>
                      )}
                      {!isImage && !isVoice && <p>{m.text}</p>}
                      <span className="text-xs text-gray-300 block mt-1 text-right">{formatTime(m.createdAt)}</span>
                    </div>
                    {isLastSeen && (
                      <img
                        src={otherUser?.avatar || "/default-avatar.png"}
                        alt="seen by"
                        className="w-4 h-4 rounded-full ml-2 self-end mb-1 border border-gray-600"
                        title={`Đã xem bởi ${otherUser?.username || "người nhận"}`}
                      />
                    )}
                  </div>
                );
              });
            })()
          ) : (
            <p className="text-gray-500 italic text-sm text-center">Chưa có tin nhắn nào</p>
          )}
          <div ref={bottomRef} />
        </div>
        {otherTyping && (
          <div className="px-4 py-1 text-xs text-gray-300">{otherUser?.username || "Đối phương"} đang soạn...</div>
        )}
        <ChatInput
          onSend={(text) => sendMessage({ conversationId: currentChat._id, senderId: user._id, receiverId: otherUser?._id, text })}
          onTyping={(isTyping) => sendTyping(currentChat._id, isTyping)}
          onSendMedia={handleSendMedia}
        />
      </div>

      {showProfile && <ProfilePanel user={otherUser} onClose={() => setShowProfile(false)} />}
    </div>
  );
};

export default ChatWindow;
