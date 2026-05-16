'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ArrowLeft, CheckCircle2, Clock, Loader2, PhoneOff, RefreshCw, Video, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import FullscreenRoomLayout from './components/FullscreenRoomLayout';

type BrowserSpeechRecognition = EventTarget & {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: { resultIndex: number; results: { isFinal: boolean; [key: number]: { transcript: string } }[] }) => void;
  onerror: (event: { error: string }) => void;
  onend: () => void;
};

export function useSpeechRecognition(
  onTranscript: (text: string) => void,
  onError: (error: string) => void
) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<BrowserSpeechRecognition | null>(null);
  const shouldListenRef = useRef(false);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  const onTranscriptRef = useRef(onTranscript);
  const onErrorRef = useRef(onError);

  // Keep refs updated
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
    onErrorRef.current = onError;
  }, [onTranscript, onError]);

  const start = useCallback(() => {
    shouldListenRef.current = true;
    const speechWindow = window as any;
    const SpeechRecognitionCtor =
      typeof window !== "undefined"
        ? speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition
        : undefined;

    if (!SpeechRecognitionCtor) {
      onErrorRef.current("Browser speech recognition is unavailable.");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const rec = new SpeechRecognitionCtor();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onresult = (event: any) => {
      for (let idx = event.resultIndex; idx < event.results.length; idx += 1) {
        const result = event.results[idx];
        if (!result?.isFinal) continue;
        const text = String(result[0]?.transcript || "").trim();
        if (!text) continue;
        onTranscriptRef.current(text);
      }
    };

    rec.onerror = (event: any) => {
      const err = event?.error;
      if (err === "not-allowed" || err === "audio-capture") {
        shouldListenRef.current = false; // Stop loop on fatal error
        onErrorRef.current(`Speech recognition access denied or unavailable: ${String(err)}`);
      } else if (err !== "aborted" && err !== "no-speech") {
        onErrorRef.current(`Speech recognition error: ${String(err || "unknown")}`);
      }
    };

    rec.onend = () => {
      if (shouldListenRef.current) {
        // Add a small delay on mobile to prevent rapid crash loops
        setTimeout(() => {
          if (shouldListenRef.current) {
            try {
              rec.start();
            } catch {
              setIsListening(false);
            }
          }
        }, 300);
      } else {
        setIsListening(false);
      }
    };

    try {
      rec.start();
      recognitionRef.current = rec;
      setRecognition(rec);
      setIsListening(true);
    } catch (e) {
      console.warn("Could not start speech recognition:", e);
    }
  }, []);

  const stop = useCallback(() => {
    shouldListenRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setRecognition(null);
    }
    setIsListening(false);
  }, []);

  return { isListening, start, stop };
}

// ── Types ──────────────────────────────────────────────────────────────────

type SessionStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'rejected' | 'expired';

type SessionInfo = {
  id: string;
  patient_id: string;
  doctor_id?: string;
  doctor_name: string;
  scheduled_at: string;
  preferred_mode: string;
  status: SessionStatus;
  connection_status: string;
  notes?: string;
};

type TelemedicineMessage = {
  id: string;
  sender: string;
  channel: string;
  content: string;
  created_at?: string;
};

export type TelemedicineRoomClientProps = {
  initialSessionId?: string;
  initialDoctorName?: string;
};

// ── Utilities ──────────────────────────────────────────────────────────────

const ACTIVE_STATUSES = new Set<SessionStatus>(['pending', 'accepted', 'in_progress']);

function isPrivateOrLoopbackHost(hostname: string): boolean {
  if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
  const match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) return false;
  const a = Number(match[1]);
  const b = Number(match[2]);
  if (a === 10) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return a === 127;
}

function normalizeLiveKitServerUrl(rawUrl: string): string {
  if (!rawUrl) return rawUrl;
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return rawUrl;
  }

  // Replace ANY local/private IP with the browser's actual hostname so the URL
  // stays correct even when the machine's IP changes between sessions.
  const isLocalOrPrivate =
    parsed.hostname === '127.0.0.1' ||
    parsed.hostname === 'localhost' ||
    isPrivateOrLoopbackHost(parsed.hostname);

  if (isLocalOrPrivate && typeof window !== 'undefined') {
    const isNgrok = window.location.hostname.includes('ngrok');
    parsed.hostname = window.location.hostname;
    
    if (isNgrok) {
      parsed.protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      parsed.port = window.location.port;
      let path = parsed.pathname === '/' ? '' : parsed.pathname;
      if (!path.startsWith('/livekit')) {
        path = '/livekit' + path;
      }
      if (!path.endsWith('/')) {
        path += '/';
      }
      parsed.pathname = path;
    } else if (window.location.protocol === 'https:') {
      parsed.protocol = 'wss:';
    }
    return parsed.toString();
  }

  return rawUrl;
}

// ── Waiting Room Screen ────────────────────────────────────────────────────

function WaitingRoom({
  session,
  onCancel,
  cancelling,
}: {
  session: SessionInfo;
  onCancel: () => void;
  cancelling: boolean;
}) {
  const statusLabel: Record<SessionStatus, string> = {
    pending:     'Waiting for a doctor to accept',
    accepted:    'Doctor is connecting…',
    in_progress: 'Doctor has joined — connecting you now…',
    completed:   'Session ended',
    cancelled:   'Session was cancelled',
    rejected:    'Session was rejected',
    expired:     'Session expired',
  };

  const statusColor: Record<SessionStatus, string> = {
    pending:     'bg-amber-500/15 border-amber-400/30 text-amber-200',
    accepted:    'bg-sky-500/15 border-sky-400/30 text-sky-200',
    in_progress: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-200',
    completed:   'bg-slate-500/15 border-slate-400/30 text-slate-300',
    cancelled:   'bg-rose-500/15 border-rose-400/30 text-rose-200',
    rejected:    'bg-rose-500/15 border-rose-400/30 text-rose-200',
    expired:     'bg-slate-500/15 border-slate-400/30 text-slate-300',
  };

  const isPulse = session.status === 'pending' || session.status === 'accepted' || session.status === 'in_progress';

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 py-12">
      {/* Animated pulse ring */}
      <div className="relative flex h-28 w-28 items-center justify-center">
        {isPulse && (
          <>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-10" />
            <span className="absolute inline-flex h-20 w-20 animate-ping rounded-full bg-sky-400 opacity-10 delay-150" style={{ animationDelay: '0.3s' }} />
          </>
        )}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur">
          {session.status === 'pending'     && <Clock  className="h-9 w-9 text-amber-300" />}
          {session.status === 'accepted'    && <Loader2 className="h-9 w-9 animate-spin text-sky-300" />}
          {session.status === 'in_progress' && <CheckCircle2 className="h-9 w-9 text-emerald-300" />}
          {!ACTIVE_STATUSES.has(session.status) && <PhoneOff className="h-9 w-9 text-slate-400" />}
        </div>
      </div>

      {/* Status badge */}
      <div className={`rounded-full border px-4 py-1.5 text-sm font-medium ${statusColor[session.status]}`}>
        {statusLabel[session.status]}
      </div>

      {/* Session card */}
      <div className="w-full rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Session details</p>
        <div className="space-y-2 text-sm text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-500">Doctor</span>
            <span className="font-medium text-slate-100">{session.doctor_name || 'Not yet assigned'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Mode</span>
            <span className="font-medium text-slate-100 capitalize">{session.preferred_mode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Requested</span>
            <span className="font-medium text-slate-100">
              {new Date(session.scheduled_at).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Status</span>
            <span className="font-medium text-slate-100 capitalize">{session.status.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex w-full flex-wrap gap-3">
        {session.status === 'pending' && (
          <button
            type="button"
            onClick={onCancel}
            disabled={cancelling}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20 disabled:opacity-60"
          >
            {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            {cancelling ? 'Cancelling…' : 'Cancel request'}
          </button>
        )}
        <Link
          href="/telemedicine"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white transition hover:bg-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to telemedicine
        </Link>
      </div>

      {isPulse && (
        <p className="text-center text-xs text-slate-500">
          This page refreshes automatically every few seconds.
        </p>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export function TelemedicineRoomClient({
  initialSessionId = '',
  initialDoctorName = '',
}: TelemedicineRoomClientProps) {
  const [sessionId]    = useState(initialSessionId);
  const [displayName]  = useState('Patient');
  const [doctorName]   = useState(initialDoctorName);

  // Session status (polled while waiting)
  const [sessionInfo, setSessionInfo]   = useState<SessionInfo | null>(null);
  const [sessionLoading, setSessionLoading] = useState(Boolean(sessionId));
  const [cancelling, setCancelling]     = useState(false);

  // LiveKit state (only populated once doctor accepts)
  const [serverUrl,  setServerUrl]  = useState('');
  const [token,      setToken]      = useState('');
  const [roomName,   setRoomName]   = useState('');
  const [lkReady,    setLkReady]    = useState(false);

  // Call UI state
  const [audioOnly,      setAudioOnly]      = useState(false);
  const [sessionElapsed, setSessionElapsed] = useState('00:00:00');
  const [micEnabled,     setMicEnabled]     = useState(true);
  const [camEnabled,     setCamEnabled]     = useState(true);
  const [screenSharing,  setScreenSharing]  = useState(false);
  const [activeOverlay,  setActiveOverlay]  = useState<'chat' | null>(null);
  const [messages,       setMessages]       = useState<TelemedicineMessage[]>([]);
  const [videoRuntimeIssue, setVideoRuntimeIssue] = useState('');

  const chatChannel    = useMemo(() => (sessionId ? `telemedicine:${sessionId}` : ''), [sessionId]);
  const roomInstanceKey = `${roomName || sessionId}:${audioOnly ? 'audio' : 'video'}:${token.slice(0, 16)}`;
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Speech recognition has been removed from the patient side per requirements.
  // It is now handled exclusively on the doctor's side.

  // ── Session polling ────────────────────────────────────────────────────

  const fetchSession = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/telemedicine/sessions/${encodeURIComponent(sessionId)}`, {
        cache: 'no-store',
      });
      if (!res.ok) return;
      const data = await res.json() as SessionInfo;
      setSessionInfo(data);
      return data;
    } catch {
      // ignore network blips
    } finally {
      setSessionLoading(false);
    }
  }, [sessionId]);

  // Initial load + polling while session is pending/accepted
  useEffect(() => {
    if (!sessionId) {
      setSessionLoading(false);
      return;
    }

    void fetchSession();

    // Poll every 4 seconds while waiting
    pollingRef.current = setInterval(() => {
      void fetchSession();
    }, 4000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [sessionId, fetchSession]);

  // Stop polling once session is in_progress (or terminal)
  useEffect(() => {
    if (!sessionInfo) return;
    const { status } = sessionInfo;

    if (status === 'in_progress' || status === 'accepted') {
      // Doctor has accepted — fetch LiveKit token if we don't have one yet
      if (!lkReady && !token) {
        void fetchLiveKitToken();
      }
    }

    // Stop polling if terminal
    if (!ACTIVE_STATUSES.has(status)) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionInfo?.status]);

  // ── LiveKit token ──────────────────────────────────────────────────────

  async function ensureMediaPermissions(wantVideo: boolean): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: wantVideo });
      stream.getTracks().forEach((t) => t.stop());
      return true;
    } catch {
      toast.error('Allow microphone and camera permissions to join the live call.');
      return false;
    }
  }

  async function fetchLiveKitToken() {
    if (!sessionId) return;
    const permissionsOk = await ensureMediaPermissions(!audioOnly);
    if (!permissionsOk) return;

    try {
      const nextRoomName = `telemedicine-${sessionId}`;
      const res = await fetch('/api/telemedicine/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          room_name:  nextRoomName,
          display_name: displayName,
          role: 'patient',
        }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null) as { error?: string } | null;
        throw new Error(payload?.error ?? 'Unable to fetch room token');
      }
      const data = await res.json() as {
        token: string;
        serverUrl?: string;
        url?: string;
        roomName?: string;
        room_name?: string;
      };
      if (!data.token) throw new Error('LiveKit token is missing');
      const resolvedUrl = normalizeLiveKitServerUrl(data.serverUrl ?? data.url ?? '');
      if (!resolvedUrl) throw new Error('LiveKit server URL is missing');

      setToken(data.token);
      setServerUrl(resolvedUrl);
      setRoomName(data.roomName ?? data.room_name ?? nextRoomName);
      setVideoRuntimeIssue('');
      setLkReady(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to join the room');
    }
  }

  // ── Cancel ─────────────────────────────────────────────────────────────

  async function handleCancel() {
    if (!sessionId) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/telemedicine/sessions/${encodeURIComponent(sessionId)}/cancel`, {
        method: 'PATCH',
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null) as { error?: string } | null;
        throw new Error(payload?.error ?? 'Unable to cancel session');
      }
      const updated = await res.json() as SessionInfo;
      setSessionInfo(updated);
      toast.success('Session request cancelled.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to cancel session');
    } finally {
      setCancelling(false);
    }
  }

  // ── End call ──────────────────────────────────────────────────────────

  function handleEndCall() {
    setLkReady(false);
    setToken('');
    setServerUrl('');
    // Re-fetch session to show completed status
    void fetchSession();
  }

  // ── Session elapsed timer ─────────────────────────────────────────────

  useEffect(() => {
    if (!lkReady) return;
    const start = Date.now();
    const timer = setInterval(() => {
      const diff = Date.now() - start;
      const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setSessionElapsed(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [lkReady]);

  // ── Chat history ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!chatChannel) { setMessages([]); return; }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/messages?limit=100&channel=${encodeURIComponent(chatChannel)}`,
          { cache: 'no-store' }
        );
        if (!res.ok) return;
        const data = await res.json() as TelemedicineMessage[];
        if (!cancelled) setMessages(Array.isArray(data) ? data : []);
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [chatChannel]);

  // ── Render ────────────────────────────────────────────────────────────

  // If room is live → show fullscreen video
  if (lkReady && token && serverUrl) {
    return (
      <FullscreenRoomLayout
        token={token}
        serverUrl={serverUrl}
        roomInstanceKey={roomInstanceKey}
        effectiveVideoOption={!audioOnly}
        effectiveAudioOption={true}
        sessionElapsed={sessionElapsed}
        micEnabled={micEnabled}
        camEnabled={camEnabled}
        toggleMic={() => setMicEnabled((v) => !v)}
        toggleCam={() => setCamEnabled((v) => !v)}
        onEndCall={handleEndCall}
        screenSharing={screenSharing}
        toggleScreenShare={() => setScreenSharing((v) => !v)}
        onOpenOverlay={(tab) => setActiveOverlay(tab === 'chat' ? 'chat' : null)}
        activeOverlay={activeOverlay}
        chatChannel={chatChannel}
        displayName={displayName}
        messages={messages}
        onMessagesUpdate={setMessages}
        sessionId={sessionId}
      />
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#04070f] text-white">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.16),transparent_28%),linear-gradient(180deg,rgba(3,7,18,0.92),rgba(3,7,18,1))]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 p-4 md:p-6">
        {/* Header */}
        <header className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-4 shadow-2xl backdrop-blur md:flex-row md:items-center md:justify-between md:px-6">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-200/70">Telemedicine room</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              {sessionLoading ? 'Loading session…' :
               !sessionInfo   ? 'Session not found' :
               lkReady        ? 'Live visit' :
               'Waiting room'}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              title="Refresh session status"
              onClick={() => void fetchSession()}
              className="rounded-full border border-white/10 bg-slate-950/70 p-2 text-white transition hover:bg-slate-900"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <Link
              href="/telemedicine"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white transition hover:bg-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>
        </header>

        {/* Body */}
        {sessionLoading ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
          </div>
        ) : !sessionId || !sessionInfo ? (
          // No session — manual join form (fallback)
          <div className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur">
            <p className="mb-4 text-sm text-slate-300">
              No session found. Go back and request a visit from the telemedicine page.
            </p>
            {videoRuntimeIssue && (
              <p className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
                <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />
                {videoRuntimeIssue}
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => void fetchLiveKitToken()}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
              >
                <Video className="h-4 w-4" />
                Join with session ID
              </button>
            </div>
          </div>
        ) : (
          // Waiting room — shown when session exists but doctor hasn't joined yet
          <WaitingRoom
            session={sessionInfo}
            onCancel={() => void handleCancel()}
            cancelling={cancelling}
          />
        )}
      </div>
    </div>
  );
}
