"use client";

import {
  useConnectionState,
  useLocalParticipant,
} from "@livekit/components-react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
} from "lucide-react";

export function InRoomMediaControls() {
  const { localParticipant } = useLocalParticipant();
  const connectionState = useConnectionState();
  const isConnected =
    connectionState === "connected" ||
    connectionState === "reconnecting" ||
    connectionState === "signalReconnecting";

  const mediaCaptureSupported =
    typeof window !== "undefined" &&
    Boolean(
      window.isSecureContext &&
      window.navigator?.mediaDevices?.getUserMedia
    );
  const micEnabled = Boolean(
    localParticipant?.isMicrophoneEnabled
  );
  const cameraEnabled = Boolean(
    localParticipant?.isCameraEnabled
  );

  async function toggleMic() {
    if (!localParticipant) return;

    try {
      await localParticipant.setMicrophoneEnabled(
        !micEnabled
      );
    } catch {
      // Keep UI responsive even when local media
      // toggling fails.
    }
  }

  async function toggleCamera() {
    if (!localParticipant) return;

    try {
      await localParticipant.setCameraEnabled(
        !cameraEnabled
      );
    } catch {
      // Keep UI responsive even when local media
      // toggling fails.
    }
  }

  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-16 z-20 flex items-center justify-center gap-2 md:inset-x-auto md:bottom-4 md:left-4 md:justify-start">
      <button
        type="button"
        onClick={() => void toggleMic()}
        disabled={!isConnected || !mediaCaptureSupported}
        className="pointer-events-auto inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-background/95 px-4 py-2 text-sm font-medium backdrop-blur"
      >
        {micEnabled ? (
          <Mic className="h-3.5 w-3.5" />
        ) : (
          <MicOff className="h-3.5 w-3.5" />
        )}
        {micEnabled ? "Mic on" : "Mic off"}
      </button>
      <button
        type="button"
        onClick={() => void toggleCamera()}
        disabled={!isConnected || !mediaCaptureSupported}
        className="pointer-events-auto inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-background/95 px-4 py-2 text-sm font-medium backdrop-blur"
      >
        {cameraEnabled ? (
          <Video className="h-3.5 w-3.5" />
        ) : (
          <VideoOff className="h-3.5 w-3.5" />
        )}
        {cameraEnabled ? "Camera on" : "Camera off"}
      </button>
    </div>
  );
}
