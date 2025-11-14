import React, { useEffect, useRef } from "react";
import { useCall } from "../context/CallContext";
import { Phone, PhoneOff, Video, Mic, MicOff, VideoOff } from "lucide-react";
import { useState } from "react";

const CallOverlay = () => {
  const {
    incomingCall,
    inCall,
    calling,
    localStream,
    remoteStream,
    callType,
    acceptCall,
    rejectCall,
    endCall,
  } = useCall();

  const remoteAudioRef = useRef(null);
  const localAudioRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (localAudioRef.current && localStream) {
      localAudioRef.current.srcObject = localStream;
    }
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  if (!incomingCall && !inCall && !calling) return null;

  const renderContent = () => {
    if (incomingCall) {
      const { fromUser } = incomingCall;
      return (
        <div className="bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-3xl p-8 w-80 shadow-2xl flex flex-col items-center gap-6 border border-white/20">
          <div className="text-center">
            <p className="text-purple-300 text-sm uppercase tracking-wider mb-3">
              Incoming {incomingCall.callType === "video" ? "Video" : "Voice"} Call
            </p>
            <p className="text-white text-2xl font-bold">
              {fromUser?.username || "Caller"}
            </p>
            {fromUser?.avatar && (
              <img
                src={fromUser.avatar}
                alt="avatar"
                className="w-20 h-20 rounded-full mx-auto mt-4 ring-4 ring-purple-500/50"
              />
            )}
          </div>

          <div className="flex gap-4 w-full">
            <button
              onClick={acceptCall}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold transition-all flex items-center justify-center gap-2 group border border-green-500/50"
            >
              <Phone size={20} className="group-hover:scale-110 transition-transform" />
              Accept
            </button>
            <button
              onClick={rejectCall}
              className="flex-1 px-4 py-3 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-300 hover:text-red-200 font-semibold transition-all flex items-center justify-center gap-2 group border border-red-500/50"
            >
              <PhoneOff size={20} className="group-hover:scale-110 transition-transform" />
              Reject
            </button>
          </div>
        </div>
      );
    }

    if (calling) {
      return (
        <div className="bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-3xl p-8 w-80 shadow-2xl flex flex-col items-center gap-6 border border-white/20">
          <div className="text-center">
            <p className="text-purple-300 text-sm uppercase tracking-wider mb-2">Calling</p>
            <p className="text-white text-lg font-semibold animate-pulse">
              {callType === "video" ? "Video Call" : "Voice Call"}
            </p>
            <div className="mt-4 flex justify-center">
              <div className="inline-flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-300 text-sm">Connecting...</span>
              </div>
            </div>
          </div>
          <button
            onClick={endCall}
            className="w-full px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold transition-all flex items-center justify-center gap-2 group border border-red-500/50"
          >
            <PhoneOff size={20} className="group-hover:scale-110 transition-transform" />
            End Call
          </button>
        </div>
      );
    }

    if (inCall) {
      const isVideo = callType === "video";
      return (
        <div className="bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-3xl p-6 w-96 shadow-2xl flex flex-col items-center gap-4 border border-white/20">
          <p className="text-purple-300 text-sm uppercase tracking-wider">
            {isVideo ? "Video Call" : "Voice Call"} In Progress
          </p>

          {isVideo ? (
            <div className="w-full flex flex-col items-center gap-3">
              {/* Remote Video */}
              <div className="relative w-full rounded-2xl overflow-hidden bg-black">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 object-cover"
                />
              </div>

              {/* Local Video - Picture in Picture */}
              <div className="absolute bottom-20 right-6 w-24 h-24 rounded-full overflow-hidden border-4 border-purple-500/50 bg-black shadow-lg">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : (
            <>
              <audio ref={remoteAudioRef} autoPlay className="hidden" />
              <audio ref={localAudioRef} autoPlay muted className="hidden" />
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 mx-auto mb-4 flex items-center justify-center">
                  <Mic size={32} className="text-white" />
                </div>
                <p className="text-gray-300">Voice call in progress...</p>
              </div>
            </>
          )}

          {/* Controls */}
          <div className="flex gap-3 mt-4 w-full">
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`flex-1 px-3 py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold border ${
                audioEnabled
                  ? "bg-white/10 hover:bg-white/20 text-white border-white/20"
                  : "bg-red-600/30 hover:bg-red-600/50 text-red-300 border-red-500/50"
              }`}
            >
              {audioEnabled ? (
                <Mic size={18} />
              ) : (
                <MicOff size={18} />
              )}
              Mute
            </button>

            {isVideo && (
              <button
                onClick={() => setVideoEnabled(!videoEnabled)}
                className={`flex-1 px-3 py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold border ${
                  videoEnabled
                    ? "bg-white/10 hover:bg-white/20 text-white border-white/20"
                    : "bg-red-600/30 hover:bg-red-600/50 text-red-300 border-red-500/50"
                }`}
              >
                {videoEnabled ? (
                  <Video size={18} />
                ) : (
                  <VideoOff size={18} />
                )}
                Video
              </button>
            )}

            <button
              onClick={endCall}
              className="flex-1 px-3 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold transition-all flex items-center justify-center gap-2 group border border-red-500/50"
            >
              <PhoneOff size={18} className="group-hover:scale-110 transition-transform" />
              End
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      {renderContent()}
    </div>
  );
};

export default CallOverlay;
