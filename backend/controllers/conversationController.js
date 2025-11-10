import * as conversationService from "../services/conversationService.js";

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
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
