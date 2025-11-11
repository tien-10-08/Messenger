import * as socketService from "./socketService.js";

export const handleUserConnect = (io, socket, userId) => {
  socketService.addUser(userId, socket.id);
  io.emit("getUsers", socketService.getAllUsers());
};

export const handleUserDisconnect = (io, socket) => {
  socketService.removeUser(socket.id);
  io.emit("getUsers", socketService.getAllUsers());
};

export const handleSendMessage = async (io, socket, data) => {
  try {
    const msg = await socketService.createAndSendMessage(io, data);
    // Trả về cho sender
    io.to(socket.id).emit("getMessage", msg);
  } catch (err) {
    console.error("sendMessage error:", err.message);
    socket.emit("errorMessage", err.message);
  }
};

export const handleTyping = (io, socket, { receiverId, senderId }) => {
  const receiver = socketService.getUser(receiverId);
  if (receiver) io.to(receiver.socketId).emit("userTyping", { senderId });
};
