"use client";

import {
  RoomAudioRenderer,
  useConnectionState,
} from "@livekit/components-react";
import { InRoomMediaControls } from "./InRoomMediaControls";
import { ParticipantGridView } from "./ParticipantGridView";
import { VideoConferenceBoundary } from "./VideoConferenceBoundary";
import { ConnectionStateToast } from "./ConnectionStateToast";

type CallStageProps = {
  roomMode: "video" | "audio";
  onVideoRuntimeIssue: (message: string) => void;
};

export function CallStage({
  roomMode,
  onVideoRuntimeIssue,
}: CallStageProps) {
  const connectionState = useConnectionState();
  const isConnected =
    connectionState === "connected" ||
    connectionState === "reconnecting" ||
    connectionState === "signalReconnecting";

  return (
    <div className="relative flex h-full min-h-88 w-full flex-col bg-slate-950">
      <div className="absolute left-3 top-3 z-20 flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-slate-950/80 px-3 py-2 text-[11px] text-slate-100 backdrop-blur">
        <span className="rounded-full bg-white/10 px-2 py-0.5 uppercase tracking-[0.2em] text-slate-200">
          {connectionState}
        </span>
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-slate-300">
          {roomMode === "video" ? "Video" : "Audio"}
        </span>
      </div>

      <div className="relative flex h-full min-h-0 flex-1 items-stretch justify-stretch">
        {roomMode === "audio" ? (
          <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-slate-200">
            <div className="space-y-3">
              <p className="font-medium text-base">
                Audio mode is active
              </p>
              <p className="text-slate-400">
                Voice is connected and camera
                video is disabled.
              </p>
            </div>
          </div>
        ) : isConnected ? (
          <VideoConferenceBoundary
            onError={() => {
              onVideoRuntimeIssue(
                "Video UI recovered from an internal layout error. Reconnect if tiles look stale."
              );
            }}
          >
            <ParticipantGridView />
          </VideoConferenceBoundary>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center text-slate-200">
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">
              Connecting to telemedicine room...
            </div>
            <p className="max-w-md text-sm text-slate-400">
              The room will stay on its own page
              while the call connects.
            </p>
          </div>
        )}
      </div>

      <RoomAudioRenderer />
      <ConnectionStateToast />
      <InRoomMediaControls />
    </div>
  );
}
