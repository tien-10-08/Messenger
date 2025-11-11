export const getConversationTitle = (conversation, myId) => {
  const members = conversation?.members || [];
  if (members.length <= 1) return "Cuộc trò chuyện";
  if (members.length === 2) {
    const other = members.find((m) => String(m._id) !== String(myId));
    return other?.username || other?.email || "Người dùng";
  }
  return `Nhóm (${members.length})`;
};
