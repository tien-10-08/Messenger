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
import { SOCKET_EVENTS } from "../config/constants.js";

export const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`🟢 Socket connected: ${socket.id}`);

    // User management
    socket.on(SOCKET_EVENTS.ADD_USER, (userId) =>
      handleUserConnect(io, socket, userId)
    );

    // Messaging
    socket.on(SOCKET_EVENTS.SEND_MESSAGE, (data) =>
      handleSendMessage(io, socket, data)
    );

    // Typing indicator
    socket.on(SOCKET_EVENTS.TYPING, (data) => handleTyping(io, socket, data));

    // Rooms
    socket.on(SOCKET_EVENTS.JOIN_CONVERSATION, (data) =>
      handleJoinConversation(io, socket, data)
    );

    // WebRTC call signaling
    socket.on(SOCKET_EVENTS.CALL_USER, (data) =>
      handleCallUser(io, socket, data)
    );
    socket.on(SOCKET_EVENTS.ANSWER_CALL, (data) =>
      handleAnswerCall(io, socket, data)
    );
    socket.on(SOCKET_EVENTS.ICE_CANDIDATE, (data) =>
      handleIceCandidate(io, socket, data)
    );
    socket.on(SOCKET_EVENTS.END_CALL, (data) =>
      handleEndCall(io, socket, data)
    );

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`🔴 Socket disconnected: ${socket.id}`);
      handleUserDisconnect(io, socket);
    });
  });
};

