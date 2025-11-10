import { Server } from "socket.io";
import chatHandler from "./chatSocket.js";

export default function initSocket(server) {
  const io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log("🟢 user connected:", socket.id);

    chatHandler(io, socket);

    socket.on("disconnect", () => {
      console.log("🔴 user disconnected:", socket.id);
    });
  });

  return io;
}
