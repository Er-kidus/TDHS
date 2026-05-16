'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import {
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
} from '@livekit/components-react';
import {
  useLocalParticipant,
  useParticipants,
  useTracks,
} from '@livekit/components-react/hooks';
import { Track } from 'livekit-client';
import { useState, useMemo } from 'react';
import {
  ArrowLeftRight,
  Maximize2,
  Minimize2,
  Mic,
  MicOff,
  MessageSquare,
  PhoneOff,
  Video,
  VideoOff,
} from 'lucide-react';
import ChatPanel from './ChatPanel';

// ── Types ──────────────────────────────────────────────────────────────────

type Message = { id: string; sender: string; channel: string; content: string; created_at?: string };

type FullscreenRoomLayoutProps = {
  token: string;
  serverUrl: string;
  roomInstanceKey: string;
  effectiveVideoOption: boolean;
  effectiveAudioOption: boolean;
  sessionElapsed: string;
  onEndCall: () => void;
  onOpenOverlay: (tab: 'chat' | 'scribe' | 'details' | null) => void;
  chatChannel: string;
  displayName: string;
  messages: Message[];
  onMessagesUpdate: (msgs: Message[]) => void;
  activeOverlay: 'chat' | null;
  sessionId?: string;
  // Legacy props kept for compatibility but actual state managed inside via LiveKit hooks
  micEnabled?: boolean;
  camEnabled?: boolean;
  screenSharing?: boolean;
  toggleMic?: () => void;
  toggleCam?: () => void;
  toggleScreenShare?: () => void;
};

// ── Camera-off placeholder tile ─────────────────────────────────────────────

function CameraOffTile({ name, isLocal }: { name: string; isLocal: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-slate-800 text-2xl font-bold text-white">
        {(name || '?')[0]?.toUpperCase()}
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-sm font-medium text-slate-200">{isLocal ? 'You' : name}</p>
        <div className="flex items-center gap-1.5 rounded-full bg-slate-800/80 px-2.5 py-1 text-[11px] text-slate-400">
          <VideoOff className="h-3 w-3" />
          Camera off
        </div>
      </div>
    </div>
  );
}

// ── In-room participant grid (must be inside LiveKitRoom) ───────────────────

const TILE_CSS =
  '[&_.lk-participant-tile]:absolute [&_.lk-participant-tile]:inset-0 ' +
  '[&_.lk-participant-tile]:h-full [&_.lk-participant-tile]:w-full ' +
  '[&_.lk-participant-media-video]:absolute [&_.lk-participant-media-video]:inset-0 ' +
  '[&_.lk-participant-media-video]:h-full [&_.lk-participant-media-video]:w-full ' +
  '[&_.lk-participant-media-video]:object-cover ' +
  '[&_.lk-camera-off-note]:hidden';

function ParticipantGrid() {
  const participants = useParticipants();
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare]);

  const trackMap = useMemo(() => {
    const map = new Map<string, unknown>();
    tracks.forEach((t) => {
      const id = (t as { participant?: { identity?: string } }).participant?.identity;
      if (id && !map.has(id)) map.set(id, t);
    });
    return map;
  }, [tracks]);

  const enriched = useMemo(() =>
    participants.map((p) => ({
      identity: p.identity,
      name: p.name || p.identity,
      isLocal: p.isLocal,
      isCameraEnabled: p.isCameraEnabled,
      trackRef: trackMap.get(p.identity) ?? null,
    })),
    [participants, trackMap]
  );

  const [spotlightId, setSpotlightId] = useState<string | null>(null);

  if (enriched.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#081022]">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/50 px-6 py-4 text-sm text-slate-300">
          Waiting for participants to join…
        </div>
      </div>
    );
  }

  const validSpotlight = spotlightId && enriched.some((p) => p.identity === spotlightId) ? spotlightId : null;

  if (validSpotlight) {
    const stage = enriched.find((p) => p.identity === validSpotlight)!;
    const pips = enriched.filter((p) => p.identity !== validSpotlight);
    return (
      <div className="absolute inset-0 bg-[#081022]">
        <div className={`absolute inset-0 ${TILE_CSS}`}>
          {stage.isCameraEnabled && stage.trackRef
            ? <ParticipantTile trackRef={stage.trackRef as never} />
            : <CameraOffTile name={stage.name} isLocal={stage.isLocal} />}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute left-4 top-4 z-20 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">{stage.isLocal ? 'You' : stage.name}</div>
          <button type="button" onClick={() => setSpotlightId(null)} className="absolute right-4 top-4 z-30 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur hover:bg-black/80">
            <Minimize2 className="h-3 w-3" /> Exit spotlight
          </button>
          <div className="absolute bottom-20 right-4 z-20 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-200">● Live</div>
        </div>
        <div className="absolute bottom-20 left-4 z-30 flex gap-2">
          {pips.map((p) => (
            <div key={p.identity} className="group relative overflow-hidden rounded-2xl border border-white/20 bg-slate-950 shadow-2xl" style={{ width: '22vw', maxWidth: 220, minWidth: 140, height: '18vh', minHeight: 110 }}>
              <div className={`absolute inset-0 ${TILE_CSS}`}>
                {p.isCameraEnabled && p.trackRef ? <ParticipantTile trackRef={p.trackRef as never} /> : <CameraOffTile name={p.name} isLocal={p.isLocal} />}
              </div>
              <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-1 bg-gradient-to-t from-black/80 to-transparent px-2.5 pb-2 pt-6">
                <span className="truncate text-[10px] font-medium text-white">{p.isLocal ? 'You' : p.name}</span>
                <button type="button" onClick={() => setSpotlightId(p.identity)} className="flex items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold text-cyan-200 opacity-0 group-hover:opacity-100">
                  <ArrowLeftRight className="h-3 w-3" /> Swap
                </button>
              </div>
              <button type="button" className="absolute inset-0 z-20 cursor-pointer" onClick={() => setSpotlightId(p.identity)} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (enriched.length === 1) {
    const p = enriched[0]!;
    return (
      <div className="absolute inset-0 bg-[#081022]">
        <div className={`absolute inset-0 ${TILE_CSS}`}>
          {p.isCameraEnabled && p.trackRef ? <ParticipantTile trackRef={p.trackRef as never} /> : <CameraOffTile name={p.name} isLocal={p.isLocal} />}
          <div className="absolute left-4 top-4 z-20 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">{p.isLocal ? 'You' : p.name}</div>
          <div className="absolute bottom-20 right-4 z-20 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-200">● Live</div>
        </div>
      </div>
    );
  }

  const primary = enriched.find((p) => !p.isLocal) ?? enriched[0]!;
  const pip = enriched.find((p) => p.identity !== primary.identity);

  return (
    <div className="absolute inset-0 bg-[#081022]">
      <div className={`absolute inset-0 ${TILE_CSS}`}>
        {primary.isCameraEnabled && primary.trackRef ? <ParticipantTile trackRef={primary.trackRef as never} /> : <CameraOffTile name={primary.name} isLocal={primary.isLocal} />}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute left-4 top-4 z-20 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">{primary.isLocal ? 'You' : primary.name}</div>
        <div className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-black/60 px-2.5 py-1 text-[11px] text-white backdrop-blur">{enriched.length} participants</div>
        <div className="absolute bottom-20 right-4 z-20 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-200">● Live</div>
      </div>
      {pip && (
        <div className="group absolute bottom-20 left-4 z-30 overflow-hidden rounded-2xl border border-white/20 bg-slate-950 shadow-2xl" style={{ width: '22vw', maxWidth: 220, minWidth: 140, height: '18vh', minHeight: 110 }}>
          <div className={`absolute inset-0 ${TILE_CSS}`}>
            {pip.isCameraEnabled && pip.trackRef ? <ParticipantTile trackRef={pip.trackRef as never} /> : <CameraOffTile name={pip.name} isLocal={pip.isLocal} />}
          </div>
          <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-1 bg-gradient-to-t from-black/80 to-transparent px-2.5 pb-2 pt-6">
            <span className="truncate text-[10px] font-medium text-white">{pip.isLocal ? 'You' : pip.name}</span>
            <button type="button" onClick={() => setSpotlightId(pip.identity)} className="flex items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold text-cyan-200 opacity-0 group-hover:opacity-100">
              <ArrowLeftRight className="h-3 w-3" /> Swap
            </button>
          </div>
          <button type="button" className="absolute inset-0 z-20 cursor-pointer" onClick={() => setSpotlightId(pip.identity)} />
        </div>
      )}
    </div>
  );
}

// ── In-room control bar (must be inside LiveKitRoom context) ────────────────

function InRoomControlBar({
  sessionElapsed,
  onOpenOverlay,
  onEndCall,
}: {
  sessionElapsed: string;
  onOpenOverlay: (tab: 'chat' | null) => void;
  onEndCall: () => void;
}) {
  const { localParticipant } = useLocalParticipant();
  const micEnabled = Boolean(localParticipant?.isMicrophoneEnabled);
  const camEnabled = Boolean(localParticipant?.isCameraEnabled);

  async function toggleMic() {
    try { await localParticipant?.setMicrophoneEnabled(!micEnabled); } catch { /* ignore */ }
  }
  async function toggleCam() {
    try { await localParticipant?.setCameraEnabled(!camEnabled); } catch { /* ignore */ }
  }

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/80 px-3 py-2 shadow-2xl backdrop-blur">
      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-200">
        {sessionElapsed}
      </span>

      <button
        type="button"
        onClick={() => void toggleMic()}
        className={`rounded-full p-2.5 transition ${micEnabled ? 'bg-white/10 hover:bg-white/20' : 'bg-rose-600 hover:bg-rose-700'}`}
        title={micEnabled ? 'Mute' : 'Unmute'}
      >
        {micEnabled ? <Mic className="h-4 w-4 text-white" /> : <MicOff className="h-4 w-4 text-white" />}
      </button>

      <button
        type="button"
        onClick={() => void toggleCam()}
        className={`rounded-full p-2.5 transition ${camEnabled ? 'bg-white/10 hover:bg-white/20' : 'bg-rose-600 hover:bg-rose-700'}`}
        title={camEnabled ? 'Turn off camera' : 'Turn on camera'}
      >
        {camEnabled ? <Video className="h-4 w-4 text-white" /> : <VideoOff className="h-4 w-4 text-white" />}
      </button>

      <div className="h-6 w-px bg-white/10" />

      <button
        type="button"
        onClick={() => onOpenOverlay('chat')}
        className="rounded-full bg-white/10 p-2.5 hover:bg-white/20"
        title="Open chat"
      >
        <MessageSquare className="h-4 w-4 text-white" />
      </button>

      <div className="h-6 w-px bg-white/10" />

      <button
        type="button"
        onClick={onEndCall}
        className="rounded-full bg-rose-600 p-2.5 transition hover:bg-rose-700"
        title="End call"
      >
        <PhoneOff className="h-4 w-4 text-white" />
      </button>
    </div>
  );
}

// ── Main export ─────────────────────────────────────────────────────────────

export default function FullscreenRoomLayout({
  token,
  serverUrl,
  roomInstanceKey,
  effectiveVideoOption,
  effectiveAudioOption,
  sessionElapsed,
  onEndCall,
  onOpenOverlay,
  chatChannel,
  displayName,
  messages,
  onMessagesUpdate,
  activeOverlay,
  sessionId,
}: FullscreenRoomLayoutProps) {

  async function handleEndCall() {
    if (sessionId) {
      try {
        await fetch(`/api/telemedicine/sessions/${encodeURIComponent(sessionId)}/end`, {
          method: 'PATCH',
        });
      } catch { /* best-effort */ }
    }
    onEndCall();
  }

  return (
    <div className="fixed inset-0 z-50 flex h-[100dvh] w-[100dvw] overflow-hidden bg-[#04070f] text-white">
      <LiveKitRoom
        key={roomInstanceKey}
        token={token}
        serverUrl={serverUrl}
        connect
        video={effectiveVideoOption}
        audio={effectiveAudioOption}
        options={{ adaptiveStream: true, dynacast: true }}
        className="relative h-full w-full"
        data-lk-theme="default"
      >
        <RoomAudioRenderer />

        {/* Video grid */}
        <div className="absolute inset-0">
          <ParticipantGrid />
        </div>

        {/* Control bar */}
        <div className="absolute bottom-6 left-1/2 z-40 -translate-x-1/2">
          <InRoomControlBar
            sessionElapsed={sessionElapsed}
            onOpenOverlay={(tab) => onOpenOverlay(tab ?? null)}
            onEndCall={() => void handleEndCall()}
          />
        </div>

        {/* Chat overlay */}
        {activeOverlay === 'chat' && (
          <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm md:items-center md:p-6">
            <button
              type="button"
              aria-label="Close chat"
              onClick={() => onOpenOverlay(null)}
              className="absolute inset-0 cursor-default"
            />
            <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950 text-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <p className="text-sm font-semibold">Session Chat</p>
                <button
                  type="button"
                  onClick={() => onOpenOverlay(null)}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200 hover:bg-white/5"
                >
                  Close
                </button>
              </div>
              <div className="max-h-[78vh] overflow-y-auto p-4">
                <ChatPanel
                  chatChannel={chatChannel}
                  displayName={displayName}
                  messages={messages}
                  onMessagesUpdate={onMessagesUpdate}
                />
              </div>
            </div>
          </div>
        )}
      </LiveKitRoom>
    </div>
  );
}
