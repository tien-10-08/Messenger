import {
  handleUserConnect,
  handleUserDisconnect,
  handleSendMessage,
  handleTyping,
  handleJoinConversation,
} from "../controllers/socketController.js";

export const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    socket.on("addUser", (userId) => handleUserConnect(io, socket, userId));
    socket.on("sendMessage", (data) => handleSendMessage(io, socket, data));
    socket.on("typing", (data) => handleTyping(io, socket, data));
    socket.on("joinConversation", (data) => handleJoinConversation(io, socket, data));
    socket.on("disconnect", () => handleUserDisconnect(io, socket));
  });
};
