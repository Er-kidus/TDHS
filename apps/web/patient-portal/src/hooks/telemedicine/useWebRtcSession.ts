"use client";

import { useMemo } from "react";

export function useWebRtcSession() {
  const supported = useMemo(() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.RTCPeerConnection);
  }, []);

  const canScreenShare = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return Boolean(navigator.mediaDevices?.getDisplayMedia);
  }, []);

  return {
    supported,
    canScreenShare,
    transport: supported ? "webrtc" : "fallback-chat",
  } as const;
}
