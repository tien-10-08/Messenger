import * as conversationService from "../services/conversationService.js";
import * as socketService from "../services/socketService.js";
import { asyncHandler } from "../utils/errorHandler.js";
import { SOCKET_EVENTS, HTTP_STATUS } from "../config/constants.js";

export const myConversations = asyncHandler(async (req, res) => {
  const convos = await conversationService.getMyConversations(req.user.id);

  res.status(HTTP_STATUS.OK).json({ data: convos });
});

export const createOrGet = asyncHandler(async (req, res) => {
  const { partnerId } = req.body;

  const convo = await conversationService.createOrGetConversation(
    req.user.id,
    partnerId
  );

  res.status(HTTP_STATUS.CREATED).json({ data: convo });

  // Emit socket events
  const io = socketService.getIO();
  if (io) {
    const me = socketService.getUser(req.user.id);
    const partner = socketService.getUser(partnerId);

    if (me?.socketId) {
      io.to(me.socketId).emit(SOCKET_EVENTS.CONVERSATION_CREATED, {
        conversation: convo,
      });
    }
    if (partner?.socketId) {
      io.to(partner.socketId).emit(SOCKET_EVENTS.CONVERSATION_CREATED, {
        conversation: convo,
      });
    }
  }
});
