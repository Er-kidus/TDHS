"use client";

import {
  useConnectionState,
  useLocalParticipant,
} from "@livekit/components-react";
import {
  Mic,
  MicOff,
  PhoneOff,
  Video,
  VideoOff,
} from "lucide-react";

export function InRoomMediaControls({ onEndSession }: { onEndSession?: () => void } = {}) {
  const { localParticipant } = useLocalParticipant();
  const connectionState = useConnectionState();
  const isConnected =
    connectionState === "connected" ||
    connectionState === "reconnecting" ||
    connectionState === "signalReconnecting";

  const micEnabled = Boolean(localParticipant?.isMicrophoneEnabled);
  const cameraEnabled = Boolean(localParticipant?.isCameraEnabled);

  async function toggleMic() {
    if (!localParticipant) return;
    try {
      await localParticipant.setMicrophoneEnabled(!micEnabled);
    } catch {
      // Keep UI responsive even when media toggling fails
    }
  }

  async function toggleCamera() {
    if (!localParticipant) return;
    try {
      await localParticipant.setCameraEnabled(!cameraEnabled);
    } catch {
      // Keep UI responsive even when media toggling fails
    }
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-center justify-center gap-2 pb-4 md:pb-5">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/90 px-3 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur">
        {/* Mic toggle */}
        <button
          type="button"
          onClick={() => void toggleMic()}
          disabled={!isConnected}
          title={micEnabled ? "Mute microphone" : "Unmute microphone"}
          className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${
            micEnabled
              ? "bg-white/10 text-white hover:bg-white/20"
              : "bg-rose-600 text-white hover:bg-rose-700"
          }`}
        >
          {micEnabled ? (
            <Mic className="h-4 w-4" />
          ) : (
            <MicOff className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">{micEnabled ? "Mic on" : "Mic off"}</span>
        </button>

        {/* Camera toggle */}
        <button
          type="button"
          onClick={() => void toggleCamera()}
          disabled={!isConnected}
          title={cameraEnabled ? "Turn off camera" : "Turn on camera"}
          className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${
            cameraEnabled
              ? "bg-white/10 text-white hover:bg-white/20"
              : "bg-rose-600 text-white hover:bg-rose-700"
          }`}
        >
          {cameraEnabled ? (
            <Video className="h-4 w-4" />
          ) : (
            <VideoOff className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">{cameraEnabled ? "Camera on" : "Camera off"}</span>
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-white/10" />

        {/* End session */}
        {onEndSession && (
          <button
            type="button"
            onClick={onEndSession}
            title="End session"
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            <PhoneOff className="h-4 w-4" />
            <span className="hidden sm:inline">End</span>
          </button>
        )}
      </div>
    </div>
  );
}
