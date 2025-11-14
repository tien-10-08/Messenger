import React, { useEffect, useRef, useState } from "react";
import VoiceRecorder from "./VoiceRecorder";

const ChatInput = ({ onSend, onTyping, onSendMedia }) => {
  const [text, setText] = useState("");
  const stopTimer = useRef(null);
  const imageInputRef = useRef(null);
  const [showRecorder, setShowRecorder] = useState(false);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend?.(text.trim());
    setText("");
    onTyping?.(false);
  };

  useEffect(() => () => { if (stopTimer.current) clearTimeout(stopTimer.current); }, []);

  return (
    <div className="bg-gray-900 p-3 flex gap-2 border-t border-gray-800 items-center">
      <button
        type="button"
        onClick={() => imageInputRef.current?.click()}
        className="px-2 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm"
      >
        Ảnh
      </button>
      <button
        type="button"
        onClick={() => setShowRecorder(true)}
        className="px-2 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm"
      >
        Voice
      </button>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && onSendMedia) onSendMedia("image", file);
          e.target.value = "";
        }}
      />
      {showRecorder && (
        <VoiceRecorder
          onFinish={(blob) => {
            try {
              if (blob && onSendMedia) {
                const file = new File([blob], `voice-${Date.now()}.webm`, { type: blob.type || "audio/webm" });
                onSendMedia("voice", file);
              }
            } catch (e) {
              console.error("voice blob to file error", e);
            }
            setShowRecorder(false);
          }}
          onCancel={() => setShowRecorder(false)}
        />
      )}
      <input
        value={text}
        onChange={(e) => {
          const val = e.target.value;
          setText(val);
          if (stopTimer.current) clearTimeout(stopTimer.current);
          const hasContent = val.trim().length > 0;
          onTyping?.(hasContent);
          if (hasContent) {
            stopTimer.current = setTimeout(() => onTyping?.(false), 1500);
          }
        }}
        onBlur={() => onTyping?.(false)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Nhập tin nhắn..."
        className="flex-1 bg-gray-800 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button onClick={handleSend} className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 text-white font-medium transition">
        Gửi
      </button>
    </div>
  );
};

export default ChatInput;
