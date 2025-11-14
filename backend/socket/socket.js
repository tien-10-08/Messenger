import {
  handleUserConnect,
  handleUserDisconnect,
  handleSendMessage,
  handleTyping,
  handleJoinConversation,
  handleCallUser,
  handleAnswerCall,
  handleIceCandidate,
  handleEndCall,
} from "../controllers/socketController.js";

export const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    socket.on("addUser", (userId) => handleUserConnect(io, socket, userId));
    socket.on("sendMessage", (data) => handleSendMessage(io, socket, data));
    socket.on("typing", (data) => handleTyping(io, socket, data));
    socket.on("joinConversation", (data) => handleJoinConversation(io, socket, data));
    // WebRTC voice-call signaling
    socket.on("callUser", (data) => handleCallUser(io, socket, data));
    socket.on("answerCall", (data) => handleAnswerCall(io, socket, data));
    socket.on("iceCandidate", (data) => handleIceCandidate(io, socket, data));
    socket.on("endCall", (data) => handleEndCall(io, socket, data));
    socket.on("disconnect", () => handleUserDisconnect(io, socket));
  });
};
