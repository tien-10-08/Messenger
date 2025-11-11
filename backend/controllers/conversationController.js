import * as conversationService from "../services/conversationService.js";
import * as socketService from "../services/socketService.js";

export const myConversations = async (req, res) => {
  try {
    const convos = await conversationService.getMyConversations(req.user.id);
    res.status(200).json({ data: convos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createOrGet = async (req, res) => {
  try {
    const { partnerId } = req.body;
    if (!partnerId) return res.status(400).json({ error: "Thiếu partnerId" });

    const convo = await conversationService.createOrGetConversation(
      req.user.id,
      partnerId
    );

    res.status(201).json({ data: convo });

    const io = socketService.getIO();
    if (io) {
      const me = socketService.getUser(req.user.id);
      const partner = socketService.getUser(partnerId);
      if (me?.socketId) io.to(me.socketId).emit("conversationCreated", { conversation: convo });
      if (partner?.socketId) io.to(partner.socketId).emit("conversationCreated", { conversation: convo });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
