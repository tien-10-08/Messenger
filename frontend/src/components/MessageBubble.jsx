// src/components/MessageBubble.jsx
const MessageBubble = ({ msg }) => {
  const isMine = msg.sender === "me";
  return (
    <div
      className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2`}
    >
      <div
        className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
          isMine
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-white border border-gray-200 rounded-bl-none"
        }`}
      >
        <p>{msg.text}</p>
        <span className="text-[10px] opacity-70 block mt-1 text-right">
          {msg.time}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
