'use client';

import { Component, useEffect, useMemo, useRef, useState, type ChangeEvent, type ComponentType, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, ArrowLeft, CalendarClock, FileUp, MessageSquare, Mic, MicOff, PhoneOff, RefreshCw, Sparkles, Video, VideoOff } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ConnectionStateToast, LiveKitRoom, ParticipantTile, RoomAudioRenderer, useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

type TelemedicineRoomClientProps = {
  initialSessionId?: string;
  initialDoctorName?: string;
};

type TelemedicineSession = {
  id: string;
  doctor_id?: string | null;
  doctor_name: string;
  scheduled_at: string;
  preferred_mode?: string;
  requested_amount?: number;
  requested_currency?: string;
  status: string;
  connection_status: string;
  notes?: string | null;
};

type TelemedicineMessage = {
  id: string;
  sender: string;
  channel: string;
  content: string;
  created_at?: string;
};

type TelemedicineArtifact = {
  id: string;
  session_id: string;
  summary: string;
  final_diagnosis: string;
  recording_url?: string | null;
  transcript_url?: string | null;
};

type Doctor = {
  id: string;
  full_name: string;
  specialty: string;
  location: string;
  rating: number;
  years_experience: number;
  available: boolean;
  online?: boolean;
  telemedicine_enabled?: boolean;
  consultation_rate?: number;
  consultation_currency?: string;
  telemedicine_modes?: string[];
};

type TranscriptLine = {
  id: string;
  speaker: string;
  text: string;
  source: 'voice' | 'manual';
  createdAt: string;
};

type VideoConferenceBoundaryProps = {
  children: ReactNode;
  onError: () => void;
};

type VideoConferenceBoundaryState = {
  hasError: boolean;
};

type CallOverlayTab = 'chat' | 'scribe' | 'details' | null;

type SpeechRecognitionAlternativeLike = {
  transcript?: string;
};

type SpeechRecognitionResultLike = {
  isFinal?: boolean;
  [index: number]: SpeechRecognitionAlternativeLike;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: SpeechRecognitionResultLike[];
};

type SpeechRecognitionErrorEventLike = {
  error?: string;
};

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
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
  if (a === 127) return true;
  return false;
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
      // Ignore malformed env value and fallback below.
    }
  }

  if (typeof window !== 'undefined' && isPrivateOrLoopbackHost(window.location.hostname)) {
    parsed.hostname = window.location.hostname;
    return parsed.toString();
  }

  return rawUrl;
}

class VideoConferenceBoundary extends Component<VideoConferenceBoundaryProps, VideoConferenceBoundaryState> {
  constructor(props: VideoConferenceBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): VideoConferenceBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    this.props.onError();
  }

  componentDidUpdate(prevProps: VideoConferenceBoundaryProps): void {
    if (prevProps.children !== this.props.children && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-300">
          <div>
            <p className="font-medium text-white">Video surface recovered.</p>
            <p className="mt-1 text-slate-400">Reconnect if participant tiles look stale.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ParticipantGridView() {
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare]);
  const participants = useMemo(() => {
    const byParticipant = new Map<string, { id: string; name: string; trackRef: unknown }>();
    tracks.forEach((trackRef, index) => {
      const participant = (trackRef as { participant?: { name?: string; identity?: string } }).participant;
      const identity = (participant?.identity || `participant-${index}`).trim();
      const name = (participant?.name || identity || `Participant ${index + 1}`).trim();
      if (!byParticipant.has(identity)) {
        byParticipant.set(identity, { id: identity, name, trackRef });
      }
    });
    return Array.from(byParticipant.values());
  }, [tracks]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const activeFocusedId = focusedId && participants.some((participant) => participant.id === focusedId)
    ? focusedId
    : null;

  return (
    <div className="relative h-full w-full p-2">
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-full border border-white/10 bg-slate-950/85 px-2 py-1 text-[11px] text-slate-100 backdrop-blur">Participants: {participants.length}</span>
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
        <div className="flex h-full min-h-64 flex-col gap-2 md:flex-row">
          {participants.map((participant) => {
            const isFocused = activeFocusedId === participant.id;
            const hasFocused = Boolean(activeFocusedId);
            const cardClass = !hasFocused
              ? "md:flex-1"
              : isFocused
                ? "md:flex-[3]"
                : "md:flex-1 md:max-w-[34%]";

            return (
              <section key={participant.id} className={`flex min-h-56 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 ${cardClass}`}>
                <header className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2 text-xs text-slate-100">
                  <span className="truncate">{participant.name}</span>
                  <button
                    type="button"
                    onClick={() => setFocusedId(isFocused ? null : participant.id)}
                    className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-[11px] hover:bg-white/10"
                  >
                    {isFocused ? "Normal" : "Focus"}
                  </button>
                </header>
                <div className="h-full w-full p-1">
                  <ParticipantTile trackRef={participant.trackRef as never} />
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CallStage({
  audioOnly,
  onVideoRuntimeIssue,
  onOpenOverlay,
}: {
  audioOnly: boolean;
  onVideoRuntimeIssue: (message: string) => void;
  onOpenOverlay: (tab: Exclude<CallOverlayTab, null>) => void;
}) {
  return (
    <div className="relative flex h-full min-h-88 w-full flex-col bg-slate-950">
      <div className="absolute left-3 top-3 z-20 flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-slate-950/80 px-3 py-2 text-[11px] text-slate-100 backdrop-blur">
        <button type="button" onClick={() => onOpenOverlay('chat')} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10">Chat</button>
        <button type="button" onClick={() => onOpenOverlay('scribe')} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10">AI scribe</button>
        <button type="button" onClick={() => onOpenOverlay('details')} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10">Session</button>
      </div>
      <div className="absolute right-3 top-3 z-20 hidden rounded-full border border-white/10 bg-slate-950/80 px-3 py-2 text-[11px] text-slate-100 backdrop-blur md:block">
        Zoom-like room
      </div>
      <div className="relative flex h-full flex-1 items-stretch justify-stretch">
        {audioOnly ? (
          <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-slate-300">
            Audio mode is active. Voice is connected and camera video is disabled.
          </div>
        ) : (
          <VideoConferenceBoundary onError={() => {
            onVideoRuntimeIssue('Video UI recovered from an internal layout error. Reconnect if tiles look stale.');
          }}>
            <ParticipantGridView />
          </VideoConferenceBoundary>
        )}
      </div>
      <RoomAudioRenderer />
      <ConnectionStateToast />
    </div>
  );
}

function ToolModal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm md:items-center md:p-6">
      <button type="button" aria-label="Close overlay" className="absolute inset-0 cursor-default" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <p className="text-sm font-semibold">{title}</p>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200 hover:bg-white/5">Close</button>
        </div>
        <div className="max-h-[78vh] overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
export function TelemedicineRoomClient({ initialSessionId = '', initialDoctorName = '' }: TelemedicineRoomClientProps) {
  const [serverUrl, setServerUrl] = useState('');
  const [token, setToken] = useState('');
  const [sessionId, setSessionId] = useState(initialSessionId);
  const [displayName, setDisplayName] = useState('Patient');
  const [roomName, setRoomName] = useState('');
  const [joinRequested, setJoinRequested] = useState(false);
  const [notes, setNotes] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [sessions, setSessions] = useState<TelemedicineSession[]>([]);
  const [messages, setMessages] = useState<TelemedicineMessage[]>([]);
  const [artifacts, setArtifacts] = useState<TelemedicineArtifact[]>([]);
  const [sharedFiles, setSharedFiles] = useState<{ id: string; name: string; sizeLabel: string }[]>([]);
  const [scheduledAt, setScheduledAt] = useState(() => new Date(Date.now() + 15 * 60 * 1000).toISOString().slice(0, 16));
  const [newDoctorName, setNewDoctorName] = useState(initialDoctorName);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isSavingSummary, setIsSavingSummary] = useState(false);
  const [audioOnly, setAudioOnly] = useState(false);
  const [symptomsInput, setSymptomsInput] = useState('');
  const [possibleSolutions, setPossibleSolutions] = useState('');
  const [speakerLabel, setSpeakerLabel] = useState('Patient');
  const [manualTranscript, setManualTranscript] = useState('');
  const [transcriptLines, setTranscriptLines] = useState<TranscriptLine[]>([]);
  const [isScribeListening, setIsScribeListening] = useState(false);
  const [roomMountVersion, setRoomMountVersion] = useState(0);
  const [videoRuntimeIssue, setVideoRuntimeIssue] = useState('');
  const [activeOverlay, setActiveOverlay] = useState<CallOverlayTab>(null);
  const speechRecognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  const resolvedRoomName = sessionId ? `telemedicine-${sessionId}` : '';
  const roomInstanceKey = `${resolvedRoomName}:${audioOnly ? 'audio' : 'video'}:${roomMountVersion}:${token.slice(0, 16)}`;

  const roomReady = Boolean(serverUrl && token && joinRequested);
  const localNetworkBaseUrl = useMemo(() => {
    const configured = (process.env.NEXT_PUBLIC_LOCAL_NETWORK_ORIGIN || '').trim();
    if (configured) {
      return configured.replace(/\/+$/, '');
    }
    if (typeof window === 'undefined') {
      return '';
    }
    return isPrivateOrLoopbackHost(window.location.hostname) ? window.location.origin : '';
  }, []);
  const localNetworkRoomUrl = useMemo(() => {
    if (!localNetworkBaseUrl) return '';
    const suffix = sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : '';
    return `${localNetworkBaseUrl}/telemedicine${suffix}`;
  }, [localNetworkBaseUrl, sessionId]);
  const audioCaptureOptions = useMemo(
    () => ({
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    }),
    [],
  );
  const videoCaptureOptions = useMemo(
    () => ({
      facingMode: 'user' as const,
    }),
    [],
  );
  const mediaCaptureSupported = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(window.isSecureContext && window.navigator?.mediaDevices?.getUserMedia);
  }, []);
  const effectiveAudioOption = mediaCaptureSupported ? audioCaptureOptions : false;
  const effectiveVideoOption = !audioOnly && mediaCaptureSupported ? videoCaptureOptions : false;
  const selectedSession = useMemo(() => sessions.find((item) => item.id === sessionId), [sessions, sessionId]);
  const chatChannel = useMemo(() => (sessionId ? `telemedicine:${sessionId}` : ''), [sessionId]);
  const telemedicineMessages = useMemo(() => messages.filter((message) => !chatChannel || message.channel === chatChannel), [messages, chatChannel]);
  const sessionArtifacts = useMemo(() => artifacts.filter((artifact) => artifact.session_id === sessionId), [artifacts, sessionId]);
  const humanRoomName = useMemo(() => {
    if (!sessionId.trim()) return 'Telemedicine Room';
    const shortId = sessionId.trim().slice(0, 8).toUpperCase();
    return `Telemedicine Room ${shortId}`;
  }, [sessionId]);

  const stats = useMemo(() => [
    { label: 'Privacy', value: 'Encrypted media' },
    { label: 'Artifacts', value: 'Chat, files, summary' },
    { label: 'Assistant', value: 'Session summaries' },
  ], []);

  useEffect(() => {
    void loadSessions();
    void loadDoctors();
    void loadArtifacts();
    const timer = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return;
      }
      void loadSessions({ silent: true });
    }, 15000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!chatChannel) {
      setMessages([]);
      return;
    }
    void loadMessages(chatChannel);
  }, [chatChannel]);

  useEffect(() => {
    void loadTranscriptLines(sessionId);
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId && sessions.length > 0) {
      setSessionId(sessions[0].id);
    }
  }, [sessionId, sessions]);

  useEffect(() => {
    setRoomName(resolvedRoomName);
  }, [resolvedRoomName]);

  useEffect(() => {
    if (selectedSession?.notes !== undefined) {
      setNotes(selectedSession.notes || '');
    }
  }, [selectedSession?.id, selectedSession?.notes]);

  useEffect(() => {
    setSpeakerLabel(displayName || 'Patient');
  }, [displayName]);

  useEffect(() => () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      speechRecognitionRef.current = null;
    }
  }, []);

  function addTranscriptLine(speaker: string, text: string, source: 'voice' | 'manual') {
    const content = text.trim();
    if (!content) return;
    const line: TranscriptLine = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      speaker: speaker.trim() || 'Unknown speaker',
      text: content,
      source,
      createdAt: new Date().toISOString(),
    };
    setTranscriptLines((prev) => [...prev, line]);
    void persistTranscriptLine(sessionId, line);
  }

  async function loadTranscriptLines(nextSessionId: string) {
    const trimmed = nextSessionId.trim();
    if (!trimmed) {
      setTranscriptLines([]);
      return;
    }
    try {
      const response = await fetch(`/api/telemedicine/sessions/${encodeURIComponent(trimmed)}/transcript-lines?limit=500`, { cache: 'no-store' });
      if (!response.ok) return;
      const payload = await response.json().catch(() => []);
      if (!Array.isArray(payload)) return;
      setTranscriptLines(payload.map((item) => ({
        id: typeof item.id === 'string' ? item.id : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        speaker: typeof item.speaker === 'string' ? item.speaker : 'Unknown speaker',
        text: typeof item.content === 'string' ? item.content : '',
        source: (item.source === 'voice' ? 'voice' : 'manual') as 'voice' | 'manual',
        createdAt: typeof item.occurred_at === 'string' ? item.occurred_at : new Date().toISOString(),
      })).filter((item) => item.text.trim()));
    } catch {
      // Optional persistence should not block room functionality.
    }
  }

  async function persistTranscriptLine(sessionIdValue: string, line: TranscriptLine) {
    const trimmed = sessionIdValue.trim();
    if (!trimmed) return;
    try {
      await fetch(`/api/telemedicine/sessions/${encodeURIComponent(trimmed)}/transcript-lines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          speaker: line.speaker,
          source: line.source,
          content: line.text,
          occurred_at: line.createdAt,
        }),
      });
    } catch {
      // Keep local transcript line even if persistence fails.
    }
  }

  function parseSymptoms(raw: string): string[] {
    return raw
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function buildTranscript(): string {
    if (transcriptLines.length > 0) {
      return transcriptLines
        .map((line) => `${new Date(line.createdAt).toLocaleTimeString()} ${line.speaker}: ${line.text}`)
        .join('\n');
    }
    return telemedicineMessages.map((message) => `${message.sender}: ${message.content}`).join('\n');
  }

  function buildDoctorNotes(): string {
    const sections = [
      notes.trim(),
      possibleSolutions.trim() ? `Possible solutions:\n${possibleSolutions.trim()}` : '',
    ].filter(Boolean);
    return sections.join('\n\n');
  }

  function startScribe() {
    const speechWindow = window as Window & {
      SpeechRecognition?: new () => BrowserSpeechRecognition;
      webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
    };
    const SpeechRecognitionCtor = typeof window !== 'undefined'
      ? (speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition)
      : undefined;
    if (!SpeechRecognitionCtor) {
      toast.error('Browser speech recognition is unavailable on this device.');
      return;
    }

    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      speechRecognitionRef.current = null;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      for (let idx = event.resultIndex; idx < event.results.length; idx += 1) {
        const result = event.results[idx];
        if (!result?.isFinal) continue;
        const text = String(result[0]?.transcript || '').trim();
        if (!text) continue;
        addTranscriptLine(speakerLabel, text, 'voice');
      }
    };
    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      toast.error(`AI scribe stopped: ${String(event?.error || 'speech recognition error')}`);
      setIsScribeListening(false);
    };
    recognition.onend = () => {
      setIsScribeListening(false);
    };
    recognition.start();
    speechRecognitionRef.current = recognition;
    setIsScribeListening(true);
  }

  function stopScribe() {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      speechRecognitionRef.current = null;
    }
    setIsScribeListening(false);
  }

  async function loadSessions(options?: { silent?: boolean }) {
    const silent = Boolean(options?.silent);
    if (!silent) {
      setIsLoadingSessions(true);
    }
    try {
      const response = await fetch('/api/telemedicine/sessions?limit=50', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Unable to load telemedicine sessions');
      }
      const data = await response.json() as TelemedicineSession[];
      const nextSessions = Array.isArray(data) ? data : [];
      setSessions(nextSessions);
      if (!sessionId && nextSessions.length > 0) {
        setSessionId(nextSessions[0].id);
      }
    } catch (error) {
      if (!silent) {
        toast.error(error instanceof Error ? error.message : 'Unable to load sessions');
      }
    } finally {
      if (!silent) {
        setIsLoadingSessions(false);
      }
    }
  }

  async function loadDoctors() {
    setIsLoadingDoctors(true);
    try {
      const response = await fetch('/api/doctors?limit=50', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Unable to load practitioners');
      }
      const data = await response.json() as Doctor[];
      setDoctors(Array.isArray(data) ? data : []);
      if (!initialDoctorName && !newDoctorName.trim() && Array.isArray(data) && data.length > 0) {
        setNewDoctorName(data[0].full_name);
        setSelectedDoctorId(data[0].id);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load practitioners');
    } finally {
      setIsLoadingDoctors(false);
    }
  }

  async function loadMessages(channel: string) {
    try {
      const response = await fetch(`/api/messages?limit=100&channel=${encodeURIComponent(channel)}`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Unable to load chat history');
      }
      const data = await response.json() as TelemedicineMessage[];
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load chat history');
    }
  }

  async function loadArtifacts() {
    try {
      const response = await fetch('/api/telemedicine/artifacts?limit=50', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Unable to load telemedicine artifacts');
      }
      const data = await response.json() as TelemedicineArtifact[];
      setArtifacts(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load artifacts');
    }
  }

  async function createSession() {
    if (!newDoctorName.trim()) {
      toast.error('Doctor name is required');
      return;
    }
    const selectedDoctor = doctors.find((doctor) => doctor.id === selectedDoctorId) || doctors.find((doctor) => doctor.full_name === newDoctorName.trim());
    const preferredMode = audioOnly ? 'voice' : 'video';
    setIsCreatingSession(true);
    try {
      const response = await fetch('/api/telemedicine/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor_id: selectedDoctor?.id,
          doctor_name: newDoctorName.trim(),
          scheduled_at: new Date(scheduledAt).toISOString(),
          preferred_mode: preferredMode,
          requested_amount: selectedDoctor?.consultation_rate || 0,
          requested_currency: selectedDoctor?.consultation_currency || 'ETB',
          notes: notes.trim() || undefined,
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(payload?.error || 'Unable to create session');
      }
      const item = await response.json() as TelemedicineSession;
      toast.success('Telemedicine session created');
      await loadSessions();
      setSessionId(item.id);
      setJoinRequested(false);
      setToken('');
      setServerUrl('');
      setRoomName(`telemedicine-${item.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to create session');
    } finally {
      setIsCreatingSession(false);
    }
  }

  async function ensureMediaPermissions(wantVideo: boolean): Promise<boolean> {
    if (!mediaCaptureSupported) {
      setVideoRuntimeIssue('Microphone/camera publishing is unavailable on insecure origins (LAN HTTP). Use localhost or HTTPS to enable media publishing.');
      return true;
    }
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return true;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: wantVideo ? { facingMode: 'user' } : false,
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
      toast.error('Select or create a session first');
      return;
    }
    const permissionsOk = await ensureMediaPermissions(!audioOnly);
    if (!permissionsOk) {
      return;
    }
    try {
      const nextRoomName = `telemedicine-${sessionId}`;
      const response = await fetch('/api/telemedicine/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, room_name: nextRoomName, display_name: displayName, role: 'patient' }),
      });
      if (!response.ok) {
        throw new Error('Unable to fetch room token');
      }
      const data = await response.json() as { token: string; serverUrl?: string; url?: string; roomName?: string; room_name?: string };
      if (!data.token) {
        throw new Error('LiveKit token is missing from token response');
      }
      setVideoRuntimeIssue('');
      setToken(data.token);
      const resolvedServerUrl = normalizeLiveKitServerUrl(data.serverUrl || data.url || '');
      if (resolvedServerUrl) {
        if (typeof window !== 'undefined' && window.location.protocol === 'https:' && resolvedServerUrl.startsWith('ws://')) {
          const message = 'LiveKit requires a secure wss URL when the portal is opened over HTTPS. Set LIVEKIT_PUBLIC_URL to your LiveKit Cloud wss URL (or a secure tunnel URL).';
          setVideoRuntimeIssue(message);
          throw new Error(message);
        }
        setServerUrl(resolvedServerUrl);
      }
      const resolvedRoomName = data.roomName || data.room_name;
      if (resolvedRoomName) {
        setRoomName(resolvedRoomName);
      } else {
        setRoomName(nextRoomName);
      }
      if (!resolvedServerUrl) {
        throw new Error('LiveKit server URL is missing from token response');
      }
      setRoomMountVersion((value) => value + 1);
      setJoinRequested(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to join the room');
    }
  }

  async function sendChatMessage() {
    const text = chatInput.trim();
    if (!text || !chatChannel) return;
    setIsSendingMessage(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: displayName || 'Patient',
          channel: chatChannel,
          content: text,
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(payload?.error || 'Unable to send message');
      }
      await response.json();
      setChatInput('');
      await loadMessages(chatChannel);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to send message');
    } finally {
      setIsSendingMessage(false);
    }
  }

  async function saveSessionSummary() {
    if (!sessionId) {
      toast.error('Select a session first');
      return;
    }
    setIsSavingSummary(true);
    try {
      const transcript = buildTranscript();
      const symptoms = parseSymptoms(symptomsInput);
      const response = await fetch(`/api/telemedicine/sessions/${encodeURIComponent(sessionId)}/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          doctor_notes: buildDoctorNotes(),
          symptoms,
          language: 'en',
          recording_url: null,
          transcript_url: null,
          doctor_id: null,
          final_diagnosis: '',
          create_follow_up: false,
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(payload?.error || 'Unable to save session summary');
      }
      await response.json();
      await loadArtifacts();
      setJoinRequested(false);
      setToken('');
      setServerUrl('');
      setRoomMountVersion((value) => value + 1);
      toast.success('Session summary saved');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save session summary');
    } finally {
      setIsSavingSummary(false);
    }
  }

  function handleShareFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const sizeLabel = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`;
    setSharedFiles((prev) => [...prev, { id: `${Date.now()}`, name: file.name, sizeLabel }]);
    toast.success(`Queued ${file.name} for secure sharing`);
    event.target.value = '';
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary/80">Telemedicine room</p>
          <h1 className="mt-2 text-3xl font-semibold">Join the live visit in-browser</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Connect to the LiveKit session, keep chat and files beside the call, and share notes with the care team.</p>
        </div>
        <Link href="/telemedicine" className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-xl">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {!roomReady ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="border-border bg-card text-foreground">
            <CardHeader>
              <CardTitle className="text-foreground">Session details</CardTitle>
              <CardDescription className="text-muted-foreground">Select an existing visit or create a new one before requesting a room token.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2 grid gap-4 md:grid-cols-3">
                <div>
                  <Label className="text-muted-foreground">Existing session</Label>
                  <div className="mt-2 flex gap-2">
                    <select aria-label="Select telemedicine session" title="Select telemedicine session" value={sessionId} onChange={(event) => setSessionId(event.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none">
                      <option value="">Select a session</option>
                      {sessions.map((session) => (
                        <option key={session.id} value={session.id}>
                          {session.doctor_name} · {new Date(session.scheduled_at).toLocaleString()}
                        </option>
                      ))}
                    </select>
                    <button aria-label="Refresh telemedicine sessions" title="Refresh telemedicine sessions" onClick={() => void loadSessions()} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-foreground hover:bg-muted/40" disabled={isLoadingSessions}>
                      <RefreshCw className={`h-3.5 w-3.5 ${isLoadingSessions ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
                <Field label="Display name" value={displayName} onChange={setDisplayName} placeholder="Patient name" />
                <div>
                  <Label className="text-muted-foreground">Audio only</Label>
                  <button onClick={() => {
                    setAudioOnly((value) => !value);
                    if (joinRequested) setRoomMountVersion((value) => value + 1);
                  }} className={`mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm ${audioOnly ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border bg-background text-foreground hover:bg-muted/40'}`}>
                    <Video className="h-4 w-4" /> {audioOnly ? 'Audio mode enabled' : 'Video mode enabled'}
                  </button>
                </div>
              </div>
              <div className="md:col-span-2 rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                LiveKit server URL and room name are generated automatically when you tap Join room.
              </div>
              <div className="md:col-span-2 rounded-xl border border-primary/30 bg-primary/5 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Session Connection Card</p>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <p className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground">Human room: {humanRoomName}</p>
                  <p className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground">Session ID: {sessionId || 'Not selected'}</p>
                  <p className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground">LiveKit room: {roomName || resolvedRoomName || 'Not generated yet'}</p>
                  <p className="truncate rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground">Token: {token ? `${token.slice(0, 32)}...` : 'Not generated yet'}</p>
                </div>
              </div>
              {localNetworkRoomUrl ? (
                <div className="md:col-span-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-primary">
                  Local network room link: <a href={localNetworkRoomUrl} className="underline underline-offset-2">{localNetworkRoomUrl}</a>
                </div>
              ) : null}
              <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Practitioner</Label>
                  <select
                    aria-label="Choose practitioner"
                    title="Choose practitioner"
                    value={selectedDoctorId || newDoctorName}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      const selectedDoctor = doctors.find((doctor) => doctor.id === nextValue) || doctors.find((doctor) => doctor.full_name === nextValue);
                      if (selectedDoctor) {
                        setSelectedDoctorId(selectedDoctor.id);
                        setNewDoctorName(selectedDoctor.full_name);
                        return;
                      }
                      setSelectedDoctorId('');
                      setNewDoctorName(nextValue);
                    }}
                    className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
                  >
                    <option value="">Select practitioner</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.full_name} • {doctor.specialty} {doctor.consultation_rate ? `• ${doctor.consultation_rate} ${doctor.consultation_currency || 'ETB'}` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-muted-foreground">{isLoadingDoctors ? 'Loading practitioners...' : `${doctors.length} registered practitioner(s)`}</p>
                </div>
                <Field label="Practitioner name" value={newDoctorName} onChange={setNewDoctorName} placeholder="Select or type a practitioner name" />
                <Field label="Scheduled time" value={scheduledAt} onChange={setScheduledAt} placeholder="2026-01-01T10:30" type="datetime-local" />
              </div>
              <div className="md:col-span-2 flex flex-wrap gap-3">
                <button onClick={() => void fetchToken()} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                  <Video className="h-4 w-4" /> Join room
                </button>
                <button onClick={() => void createSession()} className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-5 py-3 text-sm text-foreground hover:bg-muted/40" disabled={isCreatingSession}>
                  <CalendarClock className={`h-4 w-4 ${isCreatingSession ? 'animate-pulse' : ''}`} /> Create session
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card text-foreground">
            <CardHeader>
              <CardTitle className="text-foreground">Practitioners</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {doctors.length === 0 ? <p className="text-xs text-muted-foreground">No practitioners registered yet.</p> : null}
              {doctors.map((doctor) => (
                <button
                  key={doctor.id}
                  type="button"
                  onClick={() => {
                    setSelectedDoctorId(doctor.id);
                    setNewDoctorName(doctor.full_name);
                  }}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${selectedDoctorId === doctor.id || newDoctorName === doctor.full_name ? 'border-primary/40 bg-primary/10 text-foreground' : 'border-border bg-background text-foreground hover:bg-muted/40'}`}
                >
                  <p className="font-medium">{doctor.full_name}</p>
                  <p className="text-xs text-muted-foreground">{doctor.specialty} • {doctor.location}</p>
                  <p className={"text-[11px] " + ((doctor.online ?? doctor.available) ? "text-primary" : "text-muted-foreground")}>{(doctor.online ?? doctor.available) ? 'Online now' : 'Offline'}</p>
                  <p className="text-[11px] text-muted-foreground">Rate: {doctor.consultation_rate ? `${doctor.consultation_rate} ${doctor.consultation_currency || 'ETB'}` : 'Not set'} • Modes: {(doctor.telemedicine_modes || ['video', 'voice', 'chat']).join(', ')}</p>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="overflow-hidden border-border bg-card">
            <CardHeader className="border-b border-border">
              <CardTitle>{roomName || 'Live visit room'}</CardTitle>
              <CardDescription>Camera and microphone controls are available inside the room toolbar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">Connection: Stable</span>
                <span className="rounded-full border border-sky-300 bg-sky-50 px-2 py-0.5 text-[11px] text-sky-700">Latency: Good</span>
                <span className="rounded-full border border-violet-300 bg-violet-50 px-2 py-0.5 text-[11px] text-violet-700">Audio: Live</span>
              </div>
              <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-muted/40 p-2">
                <span className="rounded-full bg-background px-2 py-1 text-xs">You: {displayName || 'Patient'}</span>
                <span className="rounded-full bg-background px-2 py-1 text-xs">Doctor: {selectedSession?.doctor_name || newDoctorName || 'Not assigned'}</span>
                <span className="rounded-full bg-background px-2 py-1 text-xs">Artifacts: {sessionArtifacts.length}</span>
              </div>
              <div className="rounded-xl border border-sky-300/40 bg-sky-50/80 p-3 text-xs text-slate-800">
                <p className="font-semibold">Session Connection Card</p>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <p className="rounded-lg border border-sky-200 bg-white px-2 py-1">Human room: {humanRoomName}</p>
                  <p className="rounded-lg border border-sky-200 bg-white px-2 py-1">Session ID: {sessionId || 'Not selected'}</p>
                  <p className="rounded-lg border border-sky-200 bg-white px-2 py-1">LiveKit room: {roomName || resolvedRoomName || 'Not generated yet'}</p>
                  <p className="truncate rounded-lg border border-sky-200 bg-white px-2 py-1">Token: {token ? `${token.slice(0, 48)}...` : 'Not generated yet'}</p>
                </div>
              </div>
              <div className="h-[60vh] min-h-88 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/90 md:h-[68vh]">
                <LiveKitRoom
                  key={roomInstanceKey}
                  token={token}
                  serverUrl={serverUrl}
                  connect
                  video={effectiveVideoOption}
                  audio={effectiveAudioOption}
                  options={{ adaptiveStream: true, dynacast: true }}
                  className="h-full w-full"
                  data-lk-theme="default"
                >
                  <CallStage audioOnly={audioOnly} onVideoRuntimeIssue={setVideoRuntimeIssue} onOpenOverlay={setActiveOverlay} />
                </LiveKitRoom>
              </div>
              <div className="sticky bottom-2 z-10 flex flex-col gap-2 rounded-2xl border border-border bg-background/95 px-3 py-3 text-[11px] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:rounded-full sm:py-2">
                <span className="truncate text-muted-foreground">Token: {token.slice(0, 24)}...</span>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => {
                    setJoinRequested(false);
                    setToken('');
                    setServerUrl('');
                    setRoomMountVersion((value) => value + 1);
                  }} className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-muted">
                    Reconfigure room
                  </button>
                  <button onClick={() => void saveSessionSummary()} className="rounded-full bg-primary px-3 py-1.5 text-xs text-primary-foreground" disabled={isSavingSummary}>
                    Save summary
                  </button>
                  <button
                    aria-label="End room"
                    title="End room"
                    onClick={() => {
                    setJoinRequested(false);
                    setToken('');
                    setServerUrl('');
                    setRoomMountVersion((value) => value + 1);
                  }} className="rounded-full border border-border px-3 py-1.5 text-xs">
                    <PhoneOff className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="rounded-lg border border-border bg-background p-2">
                  <p className="text-xs font-medium">Compact chat rail</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{telemedicineMessages[0]?.content || 'No messages yet.'}</p>
                </div>
                <div className="rounded-lg border border-border bg-background p-2">
                  <p className="text-xs font-medium">Compact artifact rail</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{sessionArtifacts[0]?.summary || 'No summary artifact yet.'}</p>
                </div>
              </div>
              {videoRuntimeIssue ? (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                  <AlertTriangle className="mr-1 inline h-3.5 w-3.5" /> {videoRuntimeIssue}
                  {localNetworkRoomUrl ? (
                    <>
                      {' '}
                      <a href={localNetworkRoomUrl} className="underline underline-offset-2">Use local network link</a>
                    </>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <CardTitle className="text-white">Call notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Label className="text-slate-300">Private notes</Label>
                <Textarea value={notes} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setNotes(event.target.value)} className="min-h-36 border-white/10 bg-slate-950 text-white" placeholder="Symptoms, questions, and instructions" />
                <Label className="text-slate-300">Symptoms (comma or line separated)</Label>
                <Textarea value={symptomsInput} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setSymptomsInput(event.target.value)} className="min-h-20 border-white/10 bg-slate-950 text-white" placeholder="fever, headache, fatigue" />
                <Label className="text-slate-300">Possible solutions / plan</Label>
                <Textarea value={possibleSolutions} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setPossibleSolutions(event.target.value)} className="min-h-20 border-white/10 bg-slate-950 text-white" placeholder="Hydration, medication adjustment, diagnostic tests, follow-up" />
                {selectedSession ? <p className="text-xs text-slate-500">Active session: {selectedSession.doctor_name} on {new Date(selectedSession.scheduled_at).toLocaleString()}</p> : null}
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <CardTitle className="text-white">AI Scribe (speaker-aware)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="flex gap-2">
                  <Input value={speakerLabel} onChange={(event: ChangeEvent<HTMLInputElement>) => setSpeakerLabel(event.target.value)} placeholder="Current speaker" className="border-white/10 bg-slate-950 text-white placeholder:text-slate-500" />
                  <button
                    type="button"
                    onClick={() => {
                      if (isScribeListening) stopScribe(); else startScribe();
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-xs text-white hover:bg-slate-950"
                  >
                    {isScribeListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    {isScribeListening ? 'Stop' : 'Start'}
                  </button>
                </div>
                <div className="flex gap-2">
                  <Textarea value={manualTranscript} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setManualTranscript(event.target.value)} className="min-h-16 border-white/10 bg-slate-950 text-white" placeholder="Manual transcript line" />
                  <button
                    type="button"
                    onClick={() => {
                      addTranscriptLine(speakerLabel, manualTranscript, 'manual');
                      setManualTranscript('');
                    }}
                    disabled={!manualTranscript.trim()}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-xs text-white hover:bg-slate-950 disabled:opacity-60"
                  >
                    <Sparkles className="h-4 w-4" /> Add
                  </button>
                </div>
                <div className="max-h-36 space-y-2 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                  {transcriptLines.length === 0 ? <p className="text-xs text-slate-500">No transcript lines yet.</p> : null}
                  {transcriptLines.map((line) => (
                    <p key={line.id} className="text-xs text-slate-100">
                      <span className="font-semibold">{line.speaker}</span>
                      <span className="text-slate-400"> ({line.source})</span>
                      {': '}
                      {line.text}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <CardTitle className="text-white">Chat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <div className="max-h-36 space-y-2 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                  {telemedicineMessages.length === 0 ? <p className="text-xs text-slate-500">No messages yet.</p> : null}
                  {telemedicineMessages.map((msg) => (
                    <div key={msg.id} className="rounded-lg bg-slate-900 px-3 py-2">
                      <p className="text-[11px] text-slate-400">{msg.sender}</p>
                      <p className="text-xs text-slate-100">{msg.content}</p>
                    </div>
                  ))}
                </div>
                <Textarea value={chatInput} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setChatInput(event.target.value)} className="min-h-20 border-white/10 bg-slate-950 text-white" placeholder="Message your clinician during the visit" />
                <button onClick={() => void sendChatMessage()} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white hover:bg-slate-950" disabled={isSendingMessage}>
                  <MessageSquare className="h-4 w-4" /> Send message
                </button>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/5 text-white">
              <CardHeader>
                <CardTitle className="text-white">Files</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <Label htmlFor="telemed-file" className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white hover:bg-slate-950">
                  <FileUp className="h-4 w-4" /> Share file
                </Label>
                <Input id="telemed-file" type="file" onChange={handleShareFile} className="hidden" />
                <div className="space-y-2 rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                  {sharedFiles.length === 0 ? <p className="text-xs text-slate-500">No files shared yet.</p> : null}
                  {sharedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2 text-xs">
                      <span className="truncate pr-2 text-slate-200">{file.name}</span>
                      <span className="text-slate-400">{file.sizeLabel}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-xs text-slate-400">
                  Session summaries and shared files can be attached to the visit record after the call.
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-xs text-slate-400">
                  {sessionArtifacts.length === 0 ? 'No artifacts have been saved for this session yet.' : `${sessionArtifacts.length} artifact(s) saved for this visit.`}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      <ToolModal
        open={activeOverlay !== null}
        title={activeOverlay === 'chat' ? 'Session Chat' : activeOverlay === 'scribe' ? 'AI Scribe' : 'Session Details'}
        onClose={() => setActiveOverlay(null)}
      >
        {activeOverlay === 'chat' ? (
          <div className="space-y-3">
            <div className="max-h-80 space-y-2 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-3">
              {telemedicineMessages.map((message) => (
                <article key={message.id} className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2">
                  <p className="text-xs text-slate-400">{message.sender || 'Practitioner'} {message.created_at ? `• ${new Date(message.created_at).toLocaleString()}` : ''}</p>
                  <p className="text-sm text-white">{message.content}</p>
                </article>
              ))}
              {telemedicineMessages.length === 0 ? <p className="text-sm text-slate-400">No messages yet for this session.</p> : null}
            </div>
            <div className="flex gap-2">
              <Textarea value={chatInput} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setChatInput(event.target.value)} className="min-h-20 border-white/10 bg-slate-950 text-white" placeholder="Type a message for patient and team" />
              <button type="button" onClick={() => void sendChatMessage()} disabled={isSendingMessage || !chatInput.trim()} className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60">{isSendingMessage ? 'Sending...' : 'Send'}</button>
            </div>
          </div>
        ) : activeOverlay === 'scribe' ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Input value={speakerLabel} onChange={(event: ChangeEvent<HTMLInputElement>) => setSpeakerLabel(event.target.value)} className="min-w-0 flex-1 border-white/10 bg-slate-950 text-white" placeholder="Current speaker" />
              <button type="button" onClick={() => { if (isScribeListening) stopScribe(); else startScribe(); }} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10">{isScribeListening ? 'Stop scribe' : 'Start scribe'}</button>
            </div>
            <div className="flex gap-2">
              <Textarea value={manualTranscript} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setManualTranscript(event.target.value)} className="min-h-20 border-white/10 bg-slate-950 text-white" placeholder="Manual transcript line" />
              <button type="button" onClick={() => { addTranscriptLine(speakerLabel, manualTranscript, 'manual'); setManualTranscript(''); }} disabled={!manualTranscript.trim()} className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60">Add</button>
            </div>
            <div className="max-h-80 space-y-2 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white">
              {transcriptLines.length === 0 ? <p className="text-slate-400">No transcript lines yet.</p> : null}
              {transcriptLines.map((line) => <p key={line.id}><span className="font-semibold">{line.speaker}</span> <span className="text-slate-400">({line.source})</span>: {line.text}</p>)}
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-sm text-slate-300">
            <p className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">{roomName || 'Live visit room'} • {selectedSession?.doctor_name || newDoctorName || 'Not assigned'}</p>
            <Label className="text-slate-300">Private notes</Label>
            <Textarea value={notes} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setNotes(event.target.value)} className="min-h-28 border-white/10 bg-slate-950 text-white" placeholder="Symptoms, questions, and instructions" />
            <Label className="text-slate-300">Symptoms</Label>
            <Textarea value={symptomsInput} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setSymptomsInput(event.target.value)} className="min-h-20 border-white/10 bg-slate-950 text-white" placeholder="fever, headache, fatigue" />
            <Label className="text-slate-300">Possible solutions / plan</Label>
            <Textarea value={possibleSolutions} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setPossibleSolutions(event.target.value)} className="min-h-20 border-white/10 bg-slate-950 text-white" placeholder="Hydration, medication adjustment, diagnostic tests, follow-up" />
            <p className="text-xs text-slate-500">Current session artifacts: {sessionId ? sessionArtifacts.length : 0}</p>
          </div>
        )}
      </ToolModal>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <Label className="text-slate-300">{label}</Label>
      <Input value={value} type={type} onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 border-white/10 bg-slate-950 text-white placeholder:text-slate-500" />
    </div>
  );
}

function ToolRow({ icon: Icon, text }: { icon: ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
      <Icon className="h-4 w-4 text-sky-300" />
      <span>{text}</span>
    </div>
  );
}