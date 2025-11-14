import React, { useEffect, useRef } from "react";
import { useCall } from "../context/CallContext";

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

  // Không có call state thì không render gì
  if (!incomingCall && !inCall && !calling) return null;

  const renderContent = () => {
    if (incomingCall) {
      const { fromUser } = incomingCall;
      return (
        <div className="bg-gray-900 rounded-lg p-4 w-72 shadow-lg flex flex-col items-center gap-3">
          <p className="text-white font-semibold text-sm mb-1">
            Cuộc gọi {incomingCall.callType === "video" ? "video" : "thoại"} đến
          </p>
          <p className="text-gray-200 text-sm">
            {fromUser?.username || "Người gọi"}
          </p>
          <div className="flex gap-3 mt-2">
            <button
              onClick={acceptCall}
              className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-xs text-white"
            >
              Chấp nhận
            </button>
            <button
              onClick={rejectCall}
              className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-xs text-white"
            >
              Từ chối
            </button>
          </div>
        </div>
      );
    }

    if (calling) {
      return (
        <div className="bg-gray-900 rounded-lg p-4 w-72 shadow-lg flex flex-col items-center gap-3">
          <p className="text-white text-sm">
            Đang gọi {callType === "video" ? "video" : "thoại"}...
          </p>
          <button
            onClick={endCall}
            className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-xs text-white"
          >
            Huỷ
          </button>
        </div>
      );
    }

    if (inCall) {
      const isVideo = callType === "video";
      return (
        <div className="bg-gray-900 rounded-lg p-4 w-[22rem] shadow-lg flex flex-col items-center gap-3">
          <p className="text-white text-sm mb-1">
            Đang trong cuộc gọi {isVideo ? "video" : "thoại"}
          </p>
          {isVideo ? (
            <div className="w-full flex flex-col items-center gap-3">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full rounded bg-black max-h-56 object-contain"
              />
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-24 h-24 rounded bg-black object-cover self-end"
              />
            </div>
          ) : (
            <>
              <audio ref={remoteAudioRef} autoPlay className="hidden" />
              <audio ref={localAudioRef} autoPlay muted className="hidden" />
            </>
          )}
          <button
            onClick={endCall}
            className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-xs text-white mt-2"
          >
            Kết thúc
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      {renderContent()}
    </div>
  );
};

export default CallOverlay;
