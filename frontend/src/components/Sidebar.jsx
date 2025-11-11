import React from "react";
import { useChat } from "../context/ChatContext";

const Sidebar = () => {
  const { currentChat, setCurrentChat } = useChat();
  const conversations = [
    { id: "conv1", name: "SEP Team" },
    { id: "conv2", name: "Frontend Group" },
    { id: "conv3", name: "Backend Team" },
  ];

  return (
    <div className="w-1/4 bg-gray-900 text-white p-4 flex flex-col">
      <h2 className="text-xl font-bold mb-4">Chats</h2>
      {conversations.map((c) => (
        <button
          key={c.id}
          onClick={() => setCurrentChat(c)}
          className={`text-left px-3 py-2 rounded-lg mb-2 ${
            currentChat?.id === c.id ? "bg-blue-600" : "hover:bg-gray-700"
          }`}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
};

export default Sidebar;
