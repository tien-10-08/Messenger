import Message from "../models/messageModel.js";
import Conversation from "../models/conversationModel.js";

let users = [];

const addUser = (userId, socketId) => {
  if (!users.some((u) => u.userId === userId)) {
    users.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  users = users.filter((u) => u.socketId !== socketId);
};

const getUser = (userId) => users.find((u) => u.userId === userId);

export const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    socket.on("addUser", (userId) => {
      addUser(userId, socket.id);
      io.emit("getUsers", users); 
      console.log("👥 Online users:", users.map((u) => u.userId));
    });

    socket.on("sendMessage", async ({ conversationId, senderId, receiverId, text }) => {
      try {
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

        socket.emit("getMessage", msg);

        const receiver = getUser(receiverId);
        if (receiver) io.to(receiver.socketId).emit("getMessage", msg);
      } catch (err) {
        console.error("sendMessage error:", err.message);
        socket.emit("errorMessage", err.message);
      }
    });

    socket.on(
      "sendMediaMessage",
      async ({ conversationId, senderId, receiverId, mediaUrl, type }) => {
        try {
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
          console.error("sendMediaMessage error:", err.message);
          socket.emit("errorMessage", err.message);
        }
      }
    );

    /** 👀 Đánh dấu tin nhắn đã xem */
    socket.on("seenMessage", async ({ messageId, userId, receiverId }) => {
      try {
        const msg = await Message.findById(messageId);
        if (!msg) return;

        if (!msg.isSeenBy.includes(userId)) {
          msg.isSeenBy.push(userId);
          await msg.save();
        }

        // Gửi realtime về cho người gửi biết tin đã xem
        const receiver = getUser(receiverId);
        if (receiver) {
          io.to(receiver.socketId).emit("messageSeen", {
            messageId,
            seenBy: userId,
          });
        }
      } catch (err) {
        console.error("seenMessage error:", err.message);
      }
    });

    /** ⌨️ Thông báo đang gõ */
    socket.on("typing", ({ senderId, receiverId }) => {
      const receiver = getUser(receiverId);
      if (receiver) {
        io.to(receiver.socketId).emit("userTyping", { senderId });
      }
    });

    /** ⏹️ Khi user dừng gõ */
    socket.on("stopTyping", ({ senderId, receiverId }) => {
      const receiver = getUser(receiverId);
      if (receiver) {
        io.to(receiver.socketId).emit("userStopTyping", { senderId });
      }
    });

    /** 🔴 Khi user ngắt kết nối */
    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.id);
      removeUser(socket.id);
      io.emit("getUsers", users);
    });
  });
};
