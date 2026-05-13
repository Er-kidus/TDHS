'use client';

import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { AlertTriangle, ArrowLeft, CalendarClock, MessageSquare, PhoneOff, RefreshCw, Video } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import FullscreenRoomLayout from './components/FullscreenRoomLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export type TelemedicineRoomClientProps = {
  initialSessionId?: string;
  initialDoctorName?: string;
};

type TelemedicineMessage = {
  id: string;
  sender: string;
  channel: string;
  content: string;
  created_at?: string;
};

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
  const isLoopback = parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost';
  if (!isLoopback) return rawUrl;

  const configuredOrigin = (process.env.NEXT_PUBLIC_LOCAL_NETWORK_ORIGIN || '').trim();
  if (configuredOrigin) {
    try {
      const configuredUrl = new URL(configuredOrigin);
      if (isPrivateOrLoopbackHost(configuredUrl.hostname)) {
        parsed.hostname = configuredUrl.hostname;
        return parsed.toString();
      }
    } catch {
      // Ignore invalid overrides.
    }
  }

  if (typeof window !== 'undefined' && isPrivateOrLoopbackHost(window.location.hostname)) {
    parsed.hostname = window.location.hostname;
    return parsed.toString();
  }

  return rawUrl;
}

export function TelemedicineRoomClient({ initialSessionId = '', initialDoctorName = '' }: TelemedicineRoomClientProps) {
  const [sessionId, setSessionId] = useState(initialSessionId);
  const [displayName, setDisplayName] = useState('Patient');
  const [doctorName] = useState(initialDoctorName);
  const [serverUrl, setServerUrl] = useState('');
  const [token, setToken] = useState('');
  const [roomName, setRoomName] = useState('');
  const [joinRequested, setJoinRequested] = useState(false);
  const [audioOnly, setAudioOnly] = useState(false);
  const [sessionElapsed, setSessionElapsed] = useState('00:00:00');
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState<'chat' | null>(null);
  const [messages, setMessages] = useState<TelemedicineMessage[]>([]);
  const [videoRuntimeIssue, setVideoRuntimeIssue] = useState('');

  const chatChannel = useMemo(() => (sessionId ? `telemedicine:${sessionId}` : ''), [sessionId]);
  const roomReady = Boolean(serverUrl && token && joinRequested && sessionId);
  const roomInstanceKey = `${roomName || sessionId}:${audioOnly ? 'audio' : 'video'}:${token.slice(0, 16)}`;
  const effectiveAudioOption = true;
  const effectiveVideoOption = !audioOnly;

  const localNetworkBaseUrl = useMemo(() => {
    const configured = (process.env.NEXT_PUBLIC_LOCAL_NETWORK_ORIGIN || '').trim();
    if (configured) return configured.replace(/\/+$/, '');
    if (typeof window === 'undefined') return '';
    return isPrivateOrLoopbackHost(window.location.hostname) ? window.location.origin : '';
  }, []);

  const localNetworkRoomUrl = useMemo(() => {
    if (!localNetworkBaseUrl || !sessionId) return '';
    return `${localNetworkBaseUrl}/telemedicine?session_id=${encodeURIComponent(sessionId)}`;
  }, [localNetworkBaseUrl, sessionId]);

  useEffect(() => {
    let timer: number | undefined;
    if (roomReady) {
      const start = Date.now();
      timer = window.setInterval(() => {
        const diff = Date.now() - start;
        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        setSessionElapsed(`${h}:${m}:${s}`);
      }, 1000);
    }
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [roomReady]);

  useEffect(() => {
    if (!chatChannel) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    async function loadMessages() {
      try {
        const response = await fetch(`/api/messages?limit=100&channel=${encodeURIComponent(chatChannel)}`, { cache: 'no-store' });
        if (!response.ok) throw new Error('Unable to load chat history');
        const data = await response.json() as TelemedicineMessage[];
        if (!cancelled) setMessages(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : 'Unable to load chat history');
        }
      }
    }

    void loadMessages();
    return () => {
      cancelled = true;
    };
  }, [chatChannel]);

  useEffect(() => {
    if (!sessionId || !initialSessionId) return;
    if (joinRequested || token) return;
    void fetchToken();
  }, [fetchToken, initialSessionId, joinRequested, sessionId, token]);

  async function ensureMediaPermissions(wantVideo: boolean): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: wantVideo,
      });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch {
      toast.error('Allow microphone and camera permissions to join the live call.');
      return false;
    }
  }

  async function fetchToken() {
    if (!sessionId) {
      toast.error('Select a session first');
      return;
    }
    const permissionsOk = await ensureMediaPermissions(!audioOnly);
    if (!permissionsOk) return;

    try {
      const nextRoomName = `telemedicine-${sessionId}`;
      const response = await fetch('/api/telemedicine/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          room_name: nextRoomName,
          display_name: displayName,
          role: 'patient',
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(payload?.error || 'Unable to fetch room token');
      }
      const data = await response.json() as { token: string; serverUrl?: string; url?: string; roomName?: string; room_name?: string };
      if (!data.token) throw new Error('LiveKit token is missing from token response');
      setToken(data.token);
      const resolvedServerUrl = normalizeLiveKitServerUrl(data.serverUrl || data.url || '');
      if (!resolvedServerUrl) throw new Error('LiveKit server URL is missing from token response');
      setServerUrl(resolvedServerUrl);
      setRoomName(data.roomName || data.room_name || nextRoomName);
      setVideoRuntimeIssue('');
      setJoinRequested(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to join the room');
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#04070f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.16),transparent_28%),linear-gradient(180deg,rgba(3,7,18,0.92),rgba(3,7,18,1))]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 p-4 md:p-6">
        <header className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-4 shadow-2xl backdrop-blur md:flex-row md:items-center md:justify-between md:px-6">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-200/70">Telemedicine room</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Join the live visit in-browser</h1>
            <p className="max-w-2xl text-sm text-slate-300">Connect to the LiveKit session, keep chat beside the call, and share notes with the care team.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs text-slate-200">Elapsed {sessionElapsed}</span>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">{audioOnly ? 'Audio mode' : 'Video mode'}</span>
            <Link href="/telemedicine" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white transition hover:bg-slate-900">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>
        </header>

        {!roomReady ? (
          <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
            <Card className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <CardTitle className="text-white">Join session</CardTitle>
                <CardDescription className="text-slate-300">Pick a session ID and enter the room. The call will open full screen.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-300">Session ID</Label>
                  <Input value={sessionId} onChange={(event: ChangeEvent<HTMLInputElement>) => setSessionId(event.target.value)} placeholder="session UUID" className="mt-2 border-white/10 bg-slate-950 text-white placeholder:text-slate-500" />
                </div>
                <div>
                  <Label className="text-slate-300">Display name</Label>
                  <Input value={displayName} onChange={(event: ChangeEvent<HTMLInputElement>) => setDisplayName(event.target.value)} placeholder="Patient name" className="mt-2 border-white/10 bg-slate-950 text-white placeholder:text-slate-500" />
                </div>
                <div>
                  <Label className="text-slate-300">Doctor name</Label>
                  <Input value={doctorName} readOnly className="mt-2 border-white/10 bg-slate-950 text-white/70" />
                </div>
                <button type="button" onClick={() => {
                  setAudioOnly((value) => !value);
                }} className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm ${audioOnly ? 'border-sky-400/30 bg-sky-500/10 text-sky-100' : 'border-white/10 bg-slate-950 text-white'}`}>
                  <Video className="h-4 w-4" />
                  {audioOnly ? 'Audio mode enabled' : 'Video mode enabled'}
                </button>
                <div className="flex gap-2">
                  <button type="button" onClick={() => void fetchToken()} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950">
                    <CalendarClock className="h-4 w-4" />
                    Join room
                  </button>
                  <button type="button" title="Reload page" onClick={() => window.location.reload()} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white">
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
                {localNetworkRoomUrl ? (
                  <p className="rounded-2xl border border-sky-400/30 bg-sky-500/10 px-3 py-2 text-xs text-sky-100">
                    Local network room link: <a href={localNetworkRoomUrl} className="underline underline-offset-2">{localNetworkRoomUrl}</a>
                  </p>
                ) : null}
                {videoRuntimeIssue ? (
                  <p className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
                    <AlertTriangle className="mr-1 inline h-3.5 w-3.5" /> {videoRuntimeIssue}
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <CardTitle className="text-white">Session card</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">Session ID: {sessionId || 'Not selected'}</div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">Doctor: {doctorName || 'Not assigned'}</div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">Room: {roomName || 'Not generated yet'}</div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <FullscreenRoomLayout
            token={token}
            serverUrl={serverUrl}
            roomInstanceKey={roomInstanceKey}
            effectiveVideoOption={effectiveVideoOption}
            effectiveAudioOption={effectiveAudioOption}
            sessionElapsed={sessionElapsed}
            micEnabled={micEnabled}
            camEnabled={camEnabled}
            toggleMic={() => setMicEnabled((value) => !value)}
            toggleCam={() => setCamEnabled((value) => !value)}
            onEndCall={() => {
              setJoinRequested(false);
              setToken('');
              setServerUrl('');
            }}
            screenSharing={screenSharing}
            toggleScreenShare={() => setScreenSharing((value) => !value)}
            onOpenOverlay={setActiveOverlay}
            activeOverlay={activeOverlay}
            chatChannel={chatChannel}
            displayName={displayName}
            messages={messages}
            onMessagesUpdate={setMessages}
          />
        )}
      </div>
    </div>
  );
}
