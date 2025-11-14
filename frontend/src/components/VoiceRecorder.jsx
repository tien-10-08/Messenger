import React, { useEffect, useRef, useState } from "react";

const VoiceRecorder = ({ onFinish, onCancel }) => {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  useEffect(() => {
    const setup = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const mr = new MediaRecorder(stream);
        mr.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
        };
        mr.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          chunksRef.current = [];
          if (blob.size > 0 && onFinish) onFinish(blob);
        };
        mediaRecorderRef.current = mr;
      } catch (err) {
        console.error("getUserMedia error", err);
        setError("Không truy cập được microphone");
      }
    };
    setup();

    return () => {
      try {
        mediaRecorderRef.current?.stop?.();
      } catch {}
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [onFinish]);

  const handleStart = () => {
    if (!mediaRecorderRef.current) return;
    chunksRef.current = [];
    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const handleStop = () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  const handleCancel = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    } catch {}
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    chunksRef.current = [];
    onCancel?.();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-4 w-80 shadow-lg flex flex-col items-center gap-4">
        <h3 className="text-white font-semibold text-sm">Ghi âm voice</h3>
        {error && <p className="text-xs text-red-400 text-center">{error}</p>}
        {!error && (
          <p className="text-xs text-gray-300 text-center">
            {recording ? "Đang ghi... bấm Dừng để gửi" : "Bấm Bắt đầu để ghi âm"}
          </p>
        )}
        <div className="flex gap-2 w-full justify-center mt-2">
          {!recording ? (
            <button
              type="button"
              onClick={handleStart}
              disabled={!!error}
              className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-xs text-white"
            >
              Bắt đầu
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStop}
              className="px-3 py-1 rounded bg-yellow-500 hover:bg-yellow-600 text-xs text-white"
            >
              Dừng
            </button>
          )}
          <button
            type="button"
            onClick={handleCancel}
            className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-xs text-white"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceRecorder;
