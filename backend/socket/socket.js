// socket/socket.js
import Message from "../models/messageModel.js";
import Conversation from "../models/conversationModel.js";

let users = [];

// ====== 🧩 User management ======
const addUser = (userId, socketId) => {
  if (!userId) return;
  if (!users.some((u) => u.userId === userId)) {
    users.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  users = users.filter((u) => u.socketId !== socketId);
};

const getUser = (userId) => users.find((u) => u.userId === userId);

// ====== 🚀 Socket initialization ======
export const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    // ✅ Khi user đăng nhập
    socket.on("addUser", (userId) => {
      if (!userId) return;
      addUser(userId, socket.id);
      io.emit("getUsers", users);
      console.log("👥 Online users:", users.map((u) => u.userId));
    });

    // ✅ Gửi tin nhắn text
    socket.on("sendMessage", async (data) => {
      try {
        if (!data || typeof data !== "object") {
          console.warn("⚠️ sendMessage: dữ liệu rỗng hoặc không hợp lệ:", data);
          return;
        }

        const { conversationId, senderId, receiverId, text } = data;

        if (!conversationId || !senderId || !text) {
          console.warn("⚠️ Thiếu dữ liệu cần thiết trong sendMessage:", data);
          return;
        }

        let convo = await Conversation.findById(conversationId);
        if (!convo) {
          convo = await Conversation.create({ members: [senderId, receiverId] });
        }

        const msg = await Message.create({
          conversationId: convo._id,
          senderId,
          text,
          type: "text",
        });

        convo.lastMessage = text || "";
        await convo.save();

        // Gửi lại cho người gửi (update UI)
        socket.emit("getMessage", msg);

        // Gửi cho người nhận nếu đang online
        const receiver = getUser(receiverId);
        if (receiver) io.to(receiver.socketId).emit("getMessage", msg);
      } catch (err) {
        console.error("❌ sendMessage error:", err.message);
        socket.emit("errorMessage", err.message);
      }
    });

    // ✅ Gửi tin nhắn media
    socket.on("sendMediaMessage", async (data) => {
      try {
        if (!data || typeof data !== "object") {
          console.warn("⚠️ sendMediaMessage: dữ liệu rỗng:", data);
          return;
        }

        const { conversationId, senderId, receiverId, mediaUrl, type } = data;

        if (!conversationId || !senderId || !mediaUrl || !type) {
          console.warn("⚠️ Thiếu dữ liệu trong sendMediaMessage:", data);
          return;
        }

        let convo = await Conversation.findById(conversationId);
        if (!convo) {
          convo = await Conversation.create({ members: [senderId, receiverId] });
        }

        const msg = await Message.create({
          conversationId: convo._id,
          senderId,
          mediaUrl,
          type,
        });

        convo.lastMessage = type === "image" ? "📷 Hình ảnh" : "🎤 Voice message";
        await convo.save();

        socket.emit("getMessage", msg);

        const receiver = getUser(receiverId);
        if (receiver) io.to(receiver.socketId).emit("getMessage", msg);
      } catch (err) {
        console.error("❌ sendMediaMessage error:", err.message);
      }
    });

    // ✅ Đánh dấu đã xem
    socket.on("seenMessage", async (data) => {
      try {
        if (!data) return;
        const { messageId, userId, receiverId } = data;
        if (!messageId || !userId) return;

        const msg = await Message.findById(messageId);
        if (!msg) return;

        if (!msg.isSeenBy.includes(userId)) {
          msg.isSeenBy.push(userId);
          await msg.save();
        }

        const receiver = getUser(receiverId);
        if (receiver) {
          io.to(receiver.socketId).emit("messageSeen", {
            messageId,
            seenBy: userId,
          });
        }
      } catch (err) {
        console.error("❌ seenMessage error:", err.message);
      }
    });

    // ✅ Trạng thái đang gõ
    socket.on("typing", (data) => {
      if (!data) return;
      const { senderId, receiverId } = data;
      const receiver = getUser(receiverId);
      if (receiver) io.to(receiver.socketId).emit("userTyping", { senderId });
    });

    // ✅ Dừng gõ
    socket.on("stopTyping", (data) => {
      if (!data) return;
      const { senderId, receiverId } = data;
      const receiver = getUser(receiverId);
      if (receiver) io.to(receiver.socketId).emit("userStopTyping", { senderId });
    });

    // ✅ Khi user ngắt kết nối
    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.id);
      removeUser(socket.id);
      io.emit("getUsers", users);
    });
  });
};
