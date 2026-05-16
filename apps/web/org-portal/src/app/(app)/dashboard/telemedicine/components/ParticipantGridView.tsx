"use client";

import { useParticipants, useTracks, ParticipantTile } from "@livekit/components-react";
import { Track } from "livekit-client";
import { useMemo, useState } from "react";
import { ArrowLeftRight, Maximize2, Minimize2, VideoOff } from "lucide-react";

type ParticipantInfo = {
  identity: string;
  name: string;
  isLocal: boolean;
  isCameraEnabled: boolean;
  trackRef: unknown | null;
};

const TILE_CSS =
  "[&_.lk-participant-tile]:absolute [&_.lk-participant-tile]:inset-0 " +
  "[&_.lk-participant-tile]:h-full [&_.lk-participant-tile]:w-full " +
  "[&_.lk-participant-media-video]:absolute [&_.lk-participant-media-video]:inset-0 " +
  "[&_.lk-participant-media-video]:h-full [&_.lk-participant-media-video]:w-full " +
  "[&_.lk-participant-media-video]:object-cover " +
  "[&_.lk-camera-off-note]:hidden";

/** Placeholder shown when a participant's camera is off */
function CameraOffTile({ name, isLocal }: { name: string; isLocal: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-slate-800 text-2xl font-bold text-white">
        {(name || "?")[0]?.toUpperCase()}
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-sm font-medium text-slate-200">{isLocal ? "You" : name}</p>
        <div className="flex items-center gap-1.5 rounded-full bg-slate-800/80 px-2.5 py-1 text-[11px] text-slate-400">
          <VideoOff className="h-3 w-3" />
          Camera off
        </div>
      </div>
    </div>
  );
}

export function ParticipantGridView() {
  const participants = useParticipants();
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare]);

  // Build identity → trackRef map from track subscriptions
  const trackMap = useMemo(() => {
    const map = new Map<string, unknown>();
    tracks.forEach((trackRef) => {
      const identity = (trackRef as { participant?: { identity?: string } }).participant?.identity;
      if (identity && !map.has(identity)) {
        map.set(identity, trackRef);
      }
    });
    return map;
  }, [tracks]);

  // Merge participants with their track refs
  const enriched = useMemo<ParticipantInfo[]>(() => {
    return participants.map((p) => ({
      identity: p.identity,
      name: p.name || p.identity,
      isLocal: p.isLocal,
      isCameraEnabled: p.isCameraEnabled,
      trackRef: trackMap.get(p.identity) ?? null,
    }));
  }, [participants, trackMap]);

  const [spotlightId, setSpotlightId] = useState<string | null>(null);

  // ── Empty state ──────────────────────────────────────────────────────────
  if (enriched.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 px-6 py-4 text-sm text-slate-300">
          Waiting for participants to join…
        </div>
      </div>
    );
  }

  const validSpotlight =
    spotlightId && enriched.some((p) => p.identity === spotlightId)
      ? spotlightId
      : null;

  // ── Spotlight mode ───────────────────────────────────────────────────────
  if (validSpotlight) {
    const stageP = enriched.find((p) => p.identity === validSpotlight)!;
    const pipPs = enriched.filter((p) => p.identity !== validSpotlight);

    return (
      <div className="absolute inset-0 bg-slate-950">
        <div className={`absolute inset-0 ${TILE_CSS}`}>
          {stageP.isCameraEnabled && stageP.trackRef ? (
            <ParticipantTile trackRef={stageP.trackRef as never} />
          ) : (
            <CameraOffTile name={stageP.name} isLocal={stageP.isLocal} />
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute left-3 top-3 z-20 rounded-full border border-white/10 bg-slate-950/80 px-2.5 py-1 text-[11px] font-medium text-slate-100 backdrop-blur">
            {stageP.isLocal ? "You" : stageP.name}
          </div>
          <div className="absolute right-3 top-3 z-20 rounded-full border border-white/10 bg-slate-950/80 px-2.5 py-1 text-[11px] text-slate-100 backdrop-blur">
            {enriched.length} participant{enriched.length !== 1 ? "s" : ""}
          </div>
          <button
            type="button"
            onClick={() => setSpotlightId(null)}
            className="absolute right-3 top-12 z-30 flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-950/80 px-3 py-1.5 text-[11px] font-medium text-slate-100 backdrop-blur transition hover:bg-slate-800"
          >
            <Minimize2 className="h-3 w-3" />
            Exit spotlight
          </button>
          <div className="absolute bottom-16 right-3 z-20 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-200 backdrop-blur">
            ● Live
          </div>
        </div>
        <div className="absolute bottom-16 left-3 z-30 flex flex-row gap-2">
          {pipPs.map((p) => (
            <div
              key={p.identity}
              className="group relative overflow-hidden rounded-xl border border-white/20 bg-slate-950 shadow-[0_8px_32px_rgba(0,0,0,0.55)]"
              style={{ width: "20vw", maxWidth: 200, minWidth: 130, height: "16vh", minHeight: 100 }}
            >
              <div className={`absolute inset-0 ${TILE_CSS}`}>
                {p.isCameraEnabled && p.trackRef ? (
                  <ParticipantTile trackRef={p.trackRef as never} />
                ) : (
                  <CameraOffTile name={p.name} isLocal={p.isLocal} />
                )}
              </div>
              <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-1 bg-gradient-to-t from-black/80 to-transparent px-2 pb-1.5 pt-5">
                <span className="truncate text-[10px] font-medium text-slate-100">{p.isLocal ? "You" : p.name}</span>
                <button
                  type="button"
                  onClick={() => setSpotlightId(p.identity)}
                  className="flex shrink-0 items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold text-cyan-200 opacity-0 transition group-hover:opacity-100 hover:bg-cyan-500/30"
                >
                  <ArrowLeftRight className="h-3 w-3" />
                  Swap
                </button>
              </div>
              <button
                type="button"
                className="absolute inset-0 z-20 cursor-pointer"
                onClick={() => setSpotlightId(p.identity)}
                title="Make this the main view"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Auto layout: 1 participant ───────────────────────────────────────────
  if (enriched.length === 1) {
    const p = enriched[0]!;
    return (
      <div className="absolute inset-0 bg-slate-950">
        <div className={`absolute inset-0 ${TILE_CSS}`}>
          {p.isCameraEnabled && p.trackRef ? (
            <ParticipantTile trackRef={p.trackRef as never} />
          ) : (
            <CameraOffTile name={p.name} isLocal={p.isLocal} />
          )}
          <div className="absolute left-3 top-3 z-20 rounded-full border border-white/10 bg-slate-950/80 px-2.5 py-1 text-[11px] font-medium text-slate-100 backdrop-blur">
            {p.isLocal ? "You" : p.name}
          </div>
          <div className="absolute bottom-16 right-3 z-20 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-200 backdrop-blur">
            ● Live
          </div>
        </div>
      </div>
    );
  }

  // ── Auto layout: 2 participants ─ primary + PiP ──────────────────────────
  if (enriched.length === 2) {
    // Prefer remote as primary
    const primary = enriched.find((p) => !p.isLocal) ?? enriched[0]!;
    const pip = enriched.find((p) => p.identity !== primary.identity)!;

    return (
      <div className="absolute inset-0 bg-slate-950">
        <div className={`absolute inset-0 ${TILE_CSS}`}>
          {primary.isCameraEnabled && primary.trackRef ? (
            <ParticipantTile trackRef={primary.trackRef as never} />
          ) : (
            <CameraOffTile name={primary.name} isLocal={primary.isLocal} />
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute left-3 top-3 z-20 rounded-full border border-white/10 bg-slate-950/80 px-2.5 py-1 text-[11px] font-medium text-slate-100 backdrop-blur">
            {primary.isLocal ? "You" : primary.name}
          </div>
          <div className="absolute right-3 top-3 z-20 rounded-full border border-white/10 bg-slate-950/80 px-2.5 py-1 text-[11px] text-slate-100 backdrop-blur">
            2 participants
          </div>
          <button
            type="button"
            onClick={() => setSpotlightId(primary.identity)}
            className="absolute right-3 top-12 z-30 flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/60 px-3 py-1.5 text-[11px] font-medium text-slate-200 backdrop-blur opacity-0 transition hover:opacity-100 focus:opacity-100"
            title="Spotlight this view"
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "")}
          >
            <Maximize2 className="h-3 w-3" />
            Spotlight
          </button>
          <div className="absolute bottom-16 right-3 z-20 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-200 backdrop-blur">
            ● Live
          </div>
        </div>
        <div
          className="group absolute bottom-16 left-3 z-30 overflow-hidden rounded-xl border border-white/20 bg-slate-950 shadow-[0_8px_32px_rgba(0,0,0,0.55)]"
          style={{ width: "22vw", maxWidth: 220, minWidth: 140, height: "18vh", minHeight: 110 }}
        >
          <div className={`absolute inset-0 ${TILE_CSS}`}>
            {pip.isCameraEnabled && pip.trackRef ? (
              <ParticipantTile trackRef={pip.trackRef as never} />
            ) : (
              <CameraOffTile name={pip.name} isLocal={pip.isLocal} />
            )}
          </div>
          <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-1 bg-gradient-to-t from-black/80 to-transparent px-2.5 pb-2 pt-6">
            <span className="truncate text-[10px] font-medium text-slate-100">{pip.isLocal ? "You" : pip.name}</span>
            <button
              type="button"
              onClick={() => setSpotlightId(pip.identity)}
              className="flex shrink-0 items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold text-cyan-200 opacity-0 transition group-hover:opacity-100 hover:bg-cyan-500/30"
            >
              <ArrowLeftRight className="h-3 w-3" />
              Swap
            </button>
          </div>
          <button
            type="button"
            className="absolute inset-0 z-20 cursor-pointer"
            onClick={() => setSpotlightId(pip.identity)}
            title="Click to make this the main view"
          />
        </div>
      </div>
    );
  }

  // ── Auto layout: 3+ participants ─ grid ──────────────────────────────────
  return (
    <div className="absolute inset-0 overflow-auto bg-slate-950 p-2">
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-full border border-white/10 bg-slate-950/85 px-2 py-1 text-[11px] text-slate-100 backdrop-blur">
          {enriched.length} participants
        </span>
      </div>
      <div
        className="grid h-[calc(100%-2rem)] gap-2"
        style={{
          gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(enriched.length))}, minmax(0, 1fr))`,
        }}
      >
        {enriched.map((p) => (
          <div
            key={p.identity}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70"
          >
            <div className={`absolute inset-0 ${TILE_CSS}`}>
              {p.isCameraEnabled && p.trackRef ? (
                <ParticipantTile trackRef={p.trackRef as never} />
              ) : (
                <CameraOffTile name={p.name} isLocal={p.isLocal} />
              )}
            </div>
            <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-1 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-8">
              <span className="truncate text-xs font-medium text-slate-100">
                {p.isLocal ? "You" : p.name}
              </span>
              <button
                type="button"
                onClick={() => setSpotlightId(p.identity)}
                className="flex shrink-0 items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold text-cyan-200 opacity-0 transition group-hover:opacity-100 hover:bg-cyan-500/30"
              >
                <Maximize2 className="h-3 w-3" />
                Spotlight
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
