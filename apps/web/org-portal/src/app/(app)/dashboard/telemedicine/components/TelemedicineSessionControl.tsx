"use client";

import { Video } from "lucide-react";

type Props = {
  sessionId: string;
  onSessionIdChange: (val: string) => void;
  displayName: string;
  onDisplayNameChange: (val: string) => void;
  roomName: string;
  roomMode: "video" | "audio";
  onRoomModeChange: (val: "video" | "audio") => void;
  isFetchingToken: boolean;
  onJoinRoom: () => void;
  roomStatus: string;
  roomNotes: string;
  onRoomNotesChange: (val: string) => void;
  symptomsInput: string;
  onSymptomsInputChange: (val: string) => void;
  possibleSolutions: string;
  onPossibleSolutionsChange: (val: string) => void;
};

export function TelemedicineSessionControl({
  sessionId,
  onSessionIdChange,
  displayName,
  onDisplayNameChange,
  roomName,
  roomMode,
  onRoomModeChange,
  isFetchingToken,
  onJoinRoom,
  roomStatus,
  roomNotes,
  onRoomNotesChange,
  symptomsInput,
  onSymptomsInputChange,
  possibleSolutions,
  onPossibleSolutionsChange,
}: Props) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Join Session</h2>
          <p className="text-sm text-slate-300">Enter session ID to start</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onRoomModeChange("video")}
            className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
              roomMode === "video"
                ? "bg-cyan-500 text-slate-950"
                : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
            }`}
          >
            <Video className="mr-2 inline h-4 w-4" />
            Video
          </button>
          <button
            type="button"
            onClick={() => onRoomModeChange("audio")}
            className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
              roomMode === "audio"
                ? "bg-cyan-500 text-slate-950"
                : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
            }`}
          >
            Audio
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wide text-slate-300">
            Session ID
          </label>
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/40"
            value={sessionId}
            onChange={(e) => onSessionIdChange(e.target.value)}
            placeholder="Paste session ID"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-300">
              Your name
            </label>
            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/40"
              value={displayName}
              onChange={(e) => onDisplayNameChange(e.target.value)}
              placeholder="Clinician"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-300">
              Room
            </label>
            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-400"
              value={roomName || "Auto-generated"}
              placeholder="Auto-generated room name"
              readOnly
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onJoinRoom}
          disabled={isFetchingToken || !sessionId}
          className="w-full rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-60"
        >
          {isFetchingToken ? "Connecting..." : "Join Room"}
        </button>

        {roomStatus && (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
            {roomStatus}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wide text-slate-300">
            Notes
          </label>
          <textarea
            className="w-full min-h-24 resize-none rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/40"
            value={roomNotes}
            onChange={(e) => onRoomNotesChange(e.target.value)}
            placeholder="Session notes..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wide text-slate-300">
            Symptoms
          </label>
          <textarea
            className="w-full min-h-20 resize-none rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/40"
            value={symptomsInput}
            onChange={(e) => onSymptomsInputChange(e.target.value)}
            placeholder="Comma separated..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wide text-slate-300">
            Plan
          </label>
          <textarea
            className="w-full min-h-20 resize-none rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/40"
            value={possibleSolutions}
            onChange={(e) => onPossibleSolutionsChange(e.target.value)}
            placeholder="Treatment plan..."
          />
        </div>
      </div>
    </section>
  );
}
