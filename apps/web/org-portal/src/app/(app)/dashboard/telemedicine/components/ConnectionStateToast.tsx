"use client";

import { useConnectionState } from "@livekit/components-react";

export function ConnectionStateToast() {
  const connectionState = useConnectionState();

  const showToast =
    connectionState === "disconnected" ||
    connectionState === "failed" ||
    connectionState === "lost";

  if (!showToast) return null;

  return (
    <div className="absolute bottom-20 left-1/2 z-30 -translate-x-1/2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200 backdrop-blur">
      Connection {connectionState}. Attempting to
      reconnect...
    </div>
  );
}
