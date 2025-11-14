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
    const list = (messages || []).filter((m) => {
      const senderId = m?.senderId?._id || m?.senderId;
      if (!m?._id || String(senderId) !== String(otherUser._id)) return false;
      const seenBy = (m.isSeenBy || []).map(String);
      if (seenBy.includes(String(user._id))) return false;
      if (seenInFlightRef.current.has(String(m._id))) return false;
      return true;
    });
    list.forEach((m) => {
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
    const otherId = currentChat.members.find((m) => {
      const mid = typeof m === "string" ? m : m?._id || m?.id || m;
      return String(mid) !== String(user._id);
    });
    if (!otherId) return;

    if (typeof otherId === "object") setOtherUser(otherId);
    else
      getUserProfile(otherId)
        .then((userObj) => setOtherUser(userObj))
        .catch(console.error);
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!currentChat?._id || !otherUser?._id || !user?._id) return;
    const toMark = (messages || []).filter((m) => {
      const senderId = m?.senderId?._id || m?.senderId;
      if (!m?._id || String(senderId) !== String(otherUser._id)) return false;
      const seenBy = (m.isSeenBy || []).map(String);
      if (seenBy.includes(String(user._id))) return false;
      if (seenInFlightRef.current.has(String(m._id))) return false;
      return true;
    });
    toMark.forEach((m) => {
      seenInFlightRef.current.add(String(m._id));
      markMessageSeen(m._id).catch(() => {
        seenInFlightRef.current.delete(String(m._id));
      });
    });
  }, [messages, currentChat?._id, otherUser?._id, user?._id]);

  if (!currentChat?._id)
    return (
      <div className="flex-1 bg-gray-800 flex items-center justify-center text-gray-400">
        Chọn cuộc trò chuyện để bắt đầu
      </div>
    );

  const handleSendMedia = async (type, file) => {
    if (!file || !currentChat?._id) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("conversationId", currentChat._id);
      formData.append("type", type);
      await uploadMediaMessage(formData);
    } catch (err) {
      console.error("uploadMediaMessage error", err);
    }
  };

  return (
    <div className="flex flex-1 h-full bg-gradient-to-b from-slate-800 to-slate-900 text-white relative">
      <div
        className={`flex flex-col h-full transition-all duration-300 ${
          showProfile ? "w-[calc(100%-20rem)]" : "w-full"
        }`}
        onClick={markAllFromOtherAsSeen}
        onKeyDown={markAllFromOtherAsSeen}
        tabIndex={0}
      >
        <div className="flex-shrink-0 z-20 bg-gradient-to-b from-slate-800 to-slate-900 border-b border-white/10">
          <ChatHeader
            user={otherUser}
            onProfileClick={() => setShowProfile(true)}
            conversationInfo={
              currentChat?._id && otherUser?._id
                ? {
                    conversationId: currentChat._id,
                    recipientId: otherUser._id,
                    recipientName: otherUser.username,
                  }
                : null
            }
          />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="px-6 py-4">
            <div className="flex flex-col gap-4">
              {messages.length > 0 ? (
                (() => {
                  const lastSeenId = [...messages]
                    .filter(
                      (m) =>
                        String(m?.senderId?._id || m?.senderId) ===
                        String(user._id)
                    )
                    .filter((m) =>
                      (m.isSeenBy || [])
                        .map(String)
                        .includes(String(otherUser?._id))
                    )
                    .map((m) => String(m._id))
                    .pop();
                  return messages.map((m) => {
                    const mine =
                      String(m?.senderId?._id || m?.senderId) ===
                      String(user._id);
                    const isLastSeen =
                      mine && String(m?._id) === String(lastSeenId);
                    const isImage = m.type === "image";
                    const isVoice = m.type === "voice";
                    return (
                      <div
                        key={m._id || m.createdAt}
                        className={`flex items-end gap-2 ${
                          mine ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!mine && (
                          <img
                            src={otherUser?.avatar || "/default-avatar.png"}
                            alt="avatar"
                            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                          />
                        )}

                        <div
                          className={`flex flex-col ${
                            mine ? "items-end" : "items-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs px-4 py-3 rounded-2xl shadow-lg transition-all ${
                              mine
                                ? "bg-gradient-to-r from-purple-600 to-blue-600 rounded-br-none"
                                : "bg-white/10 border border-white/20 rounded-bl-none"
                            }`}
                          >
                            {isImage && m.mediaUrl && (
                              <img
                                src={m.mediaUrl || "/placeholder.svg"}
                                alt="media"
                                className="max-w-full rounded-lg mb-2 max-h-64 object-cover"
                              />
                            )}
                            {isVoice && m.mediaUrl && (
                              <audio
                                controls
                                className="w-full mb-2 bg-white/5 rounded"
                              >
                                <source src={m.mediaUrl} />
                                Browser does not support audio.
                              </audio>
                            )}
                            {!isImage && !isVoice && (
                              <p className="text-sm break-words">{m.text}</p>
                            )}
                            <span
                              className={`text-xs block mt-2 text-right ${
                                mine ? "text-blue-100" : "text-gray-400"
                              }`}
                            >
                              {formatTime(m.createdAt)}
                            </span>
                          </div>

                          {isLastSeen && (
                            <div className="flex items-center gap-1 mt-1">
                              <img
                                src={otherUser?.avatar || "/default-avatar.png"}
                                alt="seen"
                                className="w-5 h-5 rounded-full object-cover border border-green-500"
                                title={`Seen by ${
                                  otherUser?.username || "recipient"
                                }`}
                              />
                              <span className="text-xs text-green-400">
                                Seen
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()
              ) : (
                <div className="flex flex-col items-center justify-center h-96">
                  <svg
                    className="w-16 h-16 text-gray-600 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p className="text-gray-400 text-center">No messages yet</p>
                  <p className="text-gray-500 text-sm text-center mt-1">
                    Start the conversation!
                  </p>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>
        </div>

        {otherTyping && (
          <div className="flex-shrink-0 px-6 py-2 border-t border-white/10 bg-gradient-to-b from-slate-800 to-slate-900">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">
                {otherUser?.username || "User"} is typing
              </span>
              <div className="flex gap-1">
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-shrink-0 bg-gradient-to-t from-slate-900 to-transparent border-t border-white/10">
          <ChatInput
            onSend={(text) =>
              sendMessage({
                conversationId: currentChat._id,
                senderId: user._id,
                receiverId: otherUser?._id,
                text,
              })
            }
            onTyping={(isTyping) => sendTyping(currentChat._id, isTyping)}
            onSendMedia={handleSendMedia}
          />
        </div>
      </div>

      {showProfile && (
        <ProfilePanel user={otherUser} onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
};

export default ChatWindow;
