import React, { useEffect, useRef, useState } from "react";
import { Mic, Square, X } from "lucide-react";

const VoiceRecorder = ({ onFinish, onCancel }) => {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

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
        setError("Microphone access denied");
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
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [onFinish]);

  const handleStart = () => {
    if (!mediaRecorderRef.current) return;
    chunksRef.current = [];
    mediaRecorderRef.current.start();
    setRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime((t) => t + 1);
    }, 1000);
  };

  const handleStop = () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
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
    if (timerRef.current) clearInterval(timerRef.current);
    chunksRef.current = [];
    onCancel?.();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-3xl p-8 w-80 shadow-2xl flex flex-col items-center gap-6 border border-white/20">
        <h3 className="text-white font-bold text-lg">Record Voice Message</h3>

        {error ? (
          <div className="w-full p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-center">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        ) : (
          <div className="text-center">
            {recording && (
              <div className="mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-700 mx-auto flex items-center justify-center animate-pulse">
                  <Mic size={32} className="text-white" />
                </div>
              </div>
            )}
            {!recording && (
              <div className="mb-4">
                <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-purple-500/50 mx-auto flex items-center justify-center">
                  <Mic size={32} className="text-purple-400" />
                </div>
              </div>
            )}
            <p className="text-sm text-gray-300 mb-2">
              {recording ? (
                <>
                  <span className="text-red-400 font-semibold">Recording...</span>
                  <span className="block text-lg font-mono text-white mt-1">{formatTime(recordingTime)}</span>
                </>
              ) : (
                "Click Start to begin recording"
              )}
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-3 w-full">
          {!recording ? (
            <button
              type="button"
              onClick={handleStart}
              disabled={!!error}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold transition-all flex items-center justify-center gap-2 group border border-green-500/50 disabled:opacity-50"
            >
              <Mic size={18} className="group-hover:scale-110 transition-transform" />
              Start
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStop}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-semibold transition-all flex items-center justify-center gap-2 group border border-yellow-500/50"
            >
              <Square size={18} className="group-hover:scale-110 transition-transform" />
              Stop
            </button>
          )}
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-4 py-3 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-300 hover:text-red-200 font-semibold transition-all flex items-center justify-center gap-2 group border border-red-500/50"
          >
            <X size={18} className="group-hover:scale-110 transition-transform" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceRecorder;
