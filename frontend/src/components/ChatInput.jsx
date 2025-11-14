import React, { useEffect, useRef, useState } from "react";
import { Send, Image, Mic } from "lucide-react";
import VoiceRecorder from "./VoiceRecorder";

const ChatInput = ({ onSend, onTyping, onSendMedia }) => {
  const [text, setText] = useState("");
  const stopTimer = useRef(null);
  const imageInputRef = useRef(null);
  const [showRecorder, setShowRecorder] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSend = () => {
    if (!text.trim() || isSending) return;
    setIsSending(true);
    onSend?.(text.trim());
    setText("");
    onTyping?.(false);
    setIsSending(false);
  };

  useEffect(() => () => { if (stopTimer.current) clearTimeout(stopTimer.current); }, []);

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 flex gap-3 border-t border-white/10 items-end">
      <button
        type="button"
        onClick={() => imageInputRef.current?.click()}
        className="p-3 rounded-xl bg-white/10 hover:bg-blue-600/30 text-blue-300 hover:text-blue-200 transition-all border border-white/10 hover:border-blue-500/50 group"
        title="Send Image"
      >
        <Image size={20} className="group-hover:scale-110 transition-transform" />
      </button>

      <button
        type="button"
        onClick={() => setShowRecorder(true)}
        className="p-3 rounded-xl bg-white/10 hover:bg-red-600/30 text-red-300 hover:text-red-200 transition-all border border-white/10 hover:border-red-500/50 group"
        title="Record Voice"
      >
        <Mic size={20} className="group-hover:scale-110 transition-transform" />
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
        placeholder="Type a message..."
        className="flex-1 bg-white/10 text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent border border-white/20 transition-all placeholder-gray-500"
      />

      <button
        onClick={handleSend}
        disabled={!text.trim() || isSending}
        className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium transition-all group disabled:opacity-50 disabled:cursor-not-allowed border border-purple-500/50 hover:border-purple-400/50"
      >
        <Send size={20} className="group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
};

export default ChatInput;
