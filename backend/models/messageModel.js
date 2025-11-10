import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  conversationId: { type: String },
  senderId: { type: String },
  text: { type: String },
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);
