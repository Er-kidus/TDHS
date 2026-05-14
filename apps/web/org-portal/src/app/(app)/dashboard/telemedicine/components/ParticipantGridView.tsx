"use client";

import {
  ParticipantTile,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { useMemo, useState } from "react";

export function ParticipantGridView() {
  const tracks = useTracks([
    Track.Source.Camera,
    Track.Source.ScreenShare,
  ]);

  const participants = useMemo(() => {
    const byParticipant = new Map<
      string,
      { id: string; name: string; trackRef: unknown }
    >();

    tracks.forEach((trackRef, index) => {
      const participant = (
        trackRef as {
          participant?: {
            name?: string;
            identity?: string;
          };
        }
      ).participant;

      const identity = (
        participant?.identity ||
        `participant-${index}`
      ).trim();

      const name = (
        participant?.name ||
        identity ||
        `Participant ${index + 1}`
      ).trim();

      if (!byParticipant.has(identity)) {
        byParticipant.set(identity, {
          id: identity,
          name,
          trackRef,
        });
      }
    });

    return Array.from(byParticipant.values());
  }, [tracks]);

  const [focusedId, setFocusedId] = useState<
    string | null
  >(null);

  const activeFocusedId =
    focusedId &&
    participants.some((p) => p.id === focusedId)
      ? focusedId
      : null;

  return (
    <div className="relative h-full w-full p-0">
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-full border border-white/10 bg-slate-950/85 px-2 py-1 text-[11px] text-slate-100 backdrop-blur">
          Participants: {participants.length}
        </span>
        {activeFocusedId ? (
          <button
            type="button"
            onClick={() => setFocusedId(null)}
            className="rounded-full border border-white/10 bg-slate-950/85 px-2 py-1 text-[11px] text-slate-100 backdrop-blur hover:bg-slate-900"
          >
            Split view
          </button>
        ) : null}
      </div>

      {participants.length === 0 ? (
        <div className="flex h-full min-h-64 w-full items-center justify-center rounded-2xl border border-white/10 bg-slate-900/50 px-4 text-sm text-slate-300">
          Waiting for participant video tracks...
        </div>
      ) : (
        <div className="flex h-full min-h-0 flex-col gap-2 md:flex-row">
          {participants.map((participant) => {
            const isFocused =
              activeFocusedId === participant.id;
            const hasFocused = Boolean(activeFocusedId);
            const cardClass = !hasFocused
              ? "md:flex-1"
              : isFocused
                ? "md:flex-[3]"
                : "md:flex-1 md:max-w-[34%]";

            return (
              <section
                key={participant.id}
                className={`flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 ${cardClass}`}
              >
                <header className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2 text-xs text-slate-100">
                  <span className="truncate font-medium">
                    {participant.name}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFocusedId(
                        isFocused ? null : participant.id
                      )
                    }
                    className="rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-200 hover:bg-white/10"
                  >
                    {isFocused ? "Minimize" : "Focus"}
                  </button>
                </header>
                <div className="h-full w-full p-0.5">
                  <ParticipantTile
                    trackRef={participant.trackRef as never}
                  />
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
