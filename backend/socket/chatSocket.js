export default function chatHandler(io, socket) {
  socket.on("sendMessage", (data) => {
    io.to(data.receiverId).emit("getMessage", data);
  });
}
