import React, { useMemo } from 'react';
import { ParticipantTile, useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';

export default function ParticipantGridView() {
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare]);
  const { remoteTracks, localTrack } = useMemo(() => {
    const seen = new Map<string, { id: string; name: string; trackRef: unknown; isLocal: boolean }>();
    let local: { id: string; name: string; trackRef: unknown; isLocal: boolean } | null = null;

    tracks.forEach((trackRef, index) => {
      const participant = (trackRef as { participant?: { name?: string; identity?: string; isLocal?: boolean } }).participant;
      const identity = (participant?.identity || `participant-${index}`).trim();
      const name = (participant?.name || identity || `Participant ${index + 1}`).trim();
      const item = { id: identity, name, trackRef, isLocal: Boolean(participant?.isLocal) };
      if (item.isLocal) {
        local = item;
        return;
      }
      if (!seen.has(identity)) {
        seen.set(identity, item);
      }
    });

    return {
      remoteTracks: Array.from(seen.values()),
      localTrack: local,
    };
  }, [tracks]);

  const primaryTrack = remoteTracks[0] || localTrack;
  const secondaryTrack = localTrack && primaryTrack?.id !== localTrack.id ? localTrack : remoteTracks[1] || null;

  return (
    <div className="relative h-full w-full bg-[#081022] p-3 md:p-4">
      <div className="absolute left-5 top-5 z-20 rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-[11px] font-medium text-slate-100 backdrop-blur">
        Participants: {remoteTracks.length + (localTrack ? 1 : 0)}
      </div>

      {!primaryTrack ? (
        <div className="flex h-full min-h-64 w-full items-center justify-center rounded-[28px] border border-white/10 bg-slate-900/50 px-4 text-sm text-slate-300">
          Waiting for participant video tracks...
        </div>
      ) : (
        <div className="relative h-full w-full overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/80 shadow-inner shadow-black/20">
          <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-black/30" />

          <div className="absolute inset-0 p-2 md:p-3">
            <div className="h-full w-full overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
              <ParticipantTile trackRef={primaryTrack.trackRef as never} />
            </div>
          </div>

          {secondaryTrack ? (
            <div className="absolute bottom-4 left-4 z-30 h-[26%] min-h-36 w-[24%] min-w-40 overflow-hidden rounded-[24px] border border-white/15 bg-slate-950/90 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur md:bottom-6 md:left-6">
              <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-[11px] text-slate-100">
                <span className="truncate">{secondaryTrack.name}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-slate-300">
                  PiP
                </span>
              </div>
              <div className="h-[calc(100%-2.25rem)] w-full">
                <ParticipantTile trackRef={secondaryTrack.trackRef as never} />
              </div>
            </div>
          ) : null}

          <div className="absolute bottom-4 right-4 z-20 rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-[11px] font-medium text-slate-100 backdrop-blur md:bottom-6 md:right-6">
            Live visit
          </div>
        </div>
      )}
    </div>
  );
}
