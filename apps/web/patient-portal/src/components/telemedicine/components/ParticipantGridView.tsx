'use client';

import React, { useMemo, useState } from 'react';
import { ParticipantTile, useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { ArrowLeftRight, Maximize2, Minimize2 } from 'lucide-react';

type ParticipantEntry = {
  id: string;
  name: string;
  trackRef: unknown;
  isLocal: boolean;
};

/**
 * Forces LiveKit's internal tile + video elements to fill their container and
 * use object-cover so the video always fills without letterboxing.
 * Written as a full string constant so Tailwind JIT can detect every class.
 */
const TILE_CSS =
  '[&_.lk-participant-tile]:absolute [&_.lk-participant-tile]:inset-0 ' +
  '[&_.lk-participant-tile]:h-full [&_.lk-participant-tile]:w-full ' +
  '[&_.lk-participant-media-video]:absolute [&_.lk-participant-media-video]:inset-0 ' +
  '[&_.lk-participant-media-video]:h-full [&_.lk-participant-media-video]:w-full ' +
  '[&_.lk-participant-media-video]:object-cover ' +
  '[&_.lk-camera-off-note]:hidden';

export default function ParticipantGridView() {
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare]);

  const { remoteTracks, localTrack } = useMemo(() => {
    const seen = new Map<string, ParticipantEntry>();
    let local: ParticipantEntry | null = null;

    tracks.forEach((trackRef, index) => {
      const participant = (
        trackRef as { participant?: { name?: string; identity?: string; isLocal?: boolean } }
      ).participant;
      const identity = (participant?.identity || `participant-${index}`).trim();
      const name = (participant?.name || identity || `Participant ${index + 1}`).trim();
      const item: ParticipantEntry = {
        id: identity,
        name,
        trackRef,
        isLocal: Boolean(participant?.isLocal),
      };
      if (item.isLocal) {
        local = item;
        return;
      }
      if (!seen.has(identity)) seen.set(identity, item);
    });

    return { remoteTracks: Array.from(seen.values()), localTrack: local };
  }, [tracks]);

  const allParticipants: ParticipantEntry[] = [
    ...(localTrack ? [localTrack] : []),
    ...remoteTracks,
  ];

  /**
   * spotlightId = null  →  auto layout: remote is primary, local is PiP
   * spotlightId = id    →  that participant fills the full stage
   */
  const [spotlightId, setSpotlightId] = useState<string | null>(null);

  // Resolve which participant is on the "stage" (fills screen)
  const defaultPrimary = remoteTracks[0] ?? localTrack;
  const stageParticipant =
    (spotlightId ? allParticipants.find((p) => p.id === spotlightId) : null) ??
    defaultPrimary;

  // Everyone not on stage becomes a PiP thumbnail
  const pipParticipants = stageParticipant
    ? allParticipants.filter((p) => p.id !== stageParticipant.id)
    : [];

  const totalParticipants = allParticipants.length;

  // ── No tracks yet ────────────────────────────────────────────────────────
  if (!stageParticipant) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#081022]">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/50 px-6 py-4 text-sm text-slate-300">
          Waiting for participant video tracks…
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-[#081022]">
      {/* ── Stage tile (fills entire container) ───────────────────────── */}
      <div className={`absolute inset-0 ${TILE_CSS}`}>
        <ParticipantTile trackRef={stageParticipant.trackRef as never} />

        {/* Gradient overlay so controls are readable */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Stage participant name */}
        <div className="absolute left-4 top-4 z-20 rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-[11px] font-medium text-slate-100 backdrop-blur">
          {stageParticipant.isLocal ? 'You' : stageParticipant.name}
        </div>

        {/* Participant count */}
        <div className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-[11px] font-medium text-slate-100 backdrop-blur">
          {totalParticipants} participant{totalParticipants !== 1 ? 's' : ''}
        </div>

        {/* Exit spotlight button */}
        {spotlightId ? (
          <button
            type="button"
            onClick={() => setSpotlightId(null)}
            className="absolute right-4 top-14 z-30 flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-950/80 px-3 py-1.5 text-[11px] font-medium text-slate-100 backdrop-blur transition hover:bg-slate-800"
          >
            <Minimize2 className="h-3 w-3" />
            Exit spotlight
          </button>
        ) : null}

        {/* Spotlight button on stage tile (to lock this participant in spotlight) */}
        {!spotlightId && pipParticipants.length > 0 ? (
          <button
            type="button"
            onClick={() => setSpotlightId(stageParticipant.id)}
            className="absolute right-4 top-14 z-30 flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/60 px-3 py-1.5 text-[11px] font-medium text-slate-200 backdrop-blur opacity-0 transition hover:opacity-100 focus:opacity-100"
            style={{ opacity: undefined }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '')}
            title="Pin this view"
          >
            <Maximize2 className="h-3 w-3" />
            Spotlight
          </button>
        ) : null}

        {/* Live badge */}
        <div className="absolute bottom-4 right-4 z-20 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-200 backdrop-blur">
          ● Live
        </div>
      </div>

      {/* ── PiP thumbnail strip (bottom-left) ─────────────────────────── */}
      <div className="absolute bottom-20 left-4 z-30 flex flex-row gap-2 md:bottom-24 md:left-6">
        {pipParticipants.map((participant) => (
          <div
            key={participant.id}
            className="group relative overflow-hidden rounded-2xl border border-white/20 bg-slate-950 shadow-[0_8px_32px_rgba(0,0,0,0.55)]"
            style={{ width: '22vw', maxWidth: 220, minWidth: 140, height: '18vh', minHeight: 110 }}
          >
            {/* Video */}
            <div className={`absolute inset-0 ${TILE_CSS}`}>
              <ParticipantTile trackRef={participant.trackRef as never} />
            </div>

            {/* Gradient + controls overlay */}
            <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-1 bg-gradient-to-t from-black/80 to-transparent px-2.5 pb-2 pt-6">
              <span className="truncate text-[10px] font-medium text-slate-100">
                {participant.isLocal ? 'You' : participant.name}
              </span>
              <button
                type="button"
                onClick={() => setSpotlightId(participant.id)}
                title="Make this the full-screen view"
                className="flex shrink-0 items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold text-cyan-200 opacity-0 transition group-hover:opacity-100 hover:bg-cyan-500/30"
              >
                <ArrowLeftRight className="h-3 w-3" />
                Swap
              </button>
            </div>

            {/* Click anywhere on PiP to swap */}
            <button
              type="button"
              className="absolute inset-0 z-20 cursor-pointer"
              onClick={() => setSpotlightId(participant.id)}
              title="Click to make this the main view"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
