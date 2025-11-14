import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";

const CallContext = createContext();

export const CallProvider = ({ children }) => {
  const { emit, on, off } = useSocket();
  const { user } = useAuth();

  const [inCall, setInCall] = useState(false);
  const [calling, setCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null); 
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callType, setCallType] = useState("audio"); 
  const [callConversationInfo, setCallConversationInfo] = useState(null); 

  const pcRef = useRef(null);
  const remoteSocketIdRef = useRef(null);

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (e) => {
      if (e.candidate && remoteSocketIdRef.current) {
        emit("iceCandidate", {
          toSocketId: remoteSocketIdRef.current,
          candidate: e.candidate,
        });
      }
    };

    pc.ontrack = (e) => {
      setRemoteStream(e.streams[0]);
    };

    pcRef.current = pc;
  };

  const cleanupCall = (shouldSendMessage = true) => {
    if (shouldSendMessage && callConversationInfo && callConversationInfo.conversationId) {
      const callTypeText = callType === "video" ? "cuộc gọi video" : "cuộc gọi thoại";
      const autoMessage = `📞 ${callTypeText} đã kết thúc`;
      
      emit("sendMessage", {
        conversationId: callConversationInfo.conversationId,
        senderId: user._id,
        receiverId: callConversationInfo.recipientId,
        text: autoMessage,
      });
    }

    try {
      pcRef.current?.close();
    } catch {}
    pcRef.current = null;

    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks?.().forEach((t) => t.stop());
    }

    setLocalStream(null);
    setRemoteStream(null);
    setIncomingCall(null);
    setCallType("audio");
    setCalling(false);
    setInCall(false);
    setCallConversationInfo(null);
    remoteSocketIdRef.current = null;
  };

  const startVoiceCall = async (targetUser, conversationInfo = null) => {
    if (!user?._id || !targetUser?._id) return;

    setCallType("audio");
    createPeerConnection();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    stream.getTracks().forEach((track) => pcRef.current.addTrack(track, stream));
    setLocalStream(stream);

    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);

    setCalling(true);
    
    if (conversationInfo) {
      setCallConversationInfo(conversationInfo);
    }
    
    emit("callUser", {
      toUserId: targetUser._id,
      fromUser: { _id: user._id, username: user.username, avatar: user.avatar },
      offer,
      callType: "audio",
    });
  };

  const startVideoCall = async (targetUser, conversationInfo = null) => {
    if (!user?._id || !targetUser?._id) return;

    setCallType("video");
    createPeerConnection();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    stream.getTracks().forEach((track) => pcRef.current.addTrack(track, stream));
    setLocalStream(stream);

    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);

    setCalling(true);
    
    if (conversationInfo) {
      setCallConversationInfo(conversationInfo);
    }
    
    emit("callUser", {
      toUserId: targetUser._id,
      fromUser: { _id: user._id, username: user.username, avatar: user.avatar },
      offer,
      callType: "video",
    });
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    
    const { fromSocketId, offer, callType: incomingType } = incomingCall;

    setCallType(incomingType || "audio");
    createPeerConnection();
    remoteSocketIdRef.current = fromSocketId;

    const isVideo = (incomingType || "audio") === "video";
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideo });
    stream.getTracks().forEach((track) => pcRef.current.addTrack(track, stream));
    setLocalStream(stream);

    await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pcRef.current.createAnswer();
    await pcRef.current.setLocalDescription(answer);

    emit("answerCall", { toSocketId: fromSocketId, answer });
    setInCall(true);
    setIncomingCall(null);
  };

  const rejectCall = () => {
    if (incomingCall?.fromSocketId) {
      emit("endCall", { toSocketId: incomingCall.fromSocketId });
    }
    cleanupCall(false); 
  };

  const endCall = () => {
    if (remoteSocketIdRef.current) {
      emit("endCall", { toSocketId: remoteSocketIdRef.current });
    }
    cleanupCall(true);
  };

  useEffect(() => {
    const onIncomingCall = ({ fromUser, fromSocketId, offer, callType: ct }) => {
      setIncomingCall({ fromUser, fromSocketId, offer, callType: ct || "audio" });
    };

    const onCallAnswered = async ({ answer }) => {
      if (!pcRef.current) return;
      
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      setInCall(true);
      setCalling(false);
    };

    const onIceCandidate = async ({ candidate }) => {
      if (!pcRef.current || !candidate) return;
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("addIceCandidate error", e);
      }
    };

    const onCallEnded = () => {
      cleanupCall(true); 
    };

    on("incomingCall", onIncomingCall);
    on("callAnswered", onCallAnswered);
    on("iceCandidate", onIceCandidate);
    on("callEnded", onCallEnded);

    return () => {
      off("incomingCall", onIncomingCall);
      off("callAnswered", onCallAnswered);
      off("iceCandidate", onIceCandidate);
      off("callEnded", onCallEnded);
    };
  }, [on, off, emit]);

  return (
    <CallContext.Provider
      value={{
        inCall,
        calling,
        incomingCall,
        localStream,
        remoteStream,
        callType,
        startVoiceCall,
        startVideoCall,
        acceptCall,
        rejectCall,
        endCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);
