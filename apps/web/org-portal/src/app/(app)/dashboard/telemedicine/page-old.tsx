"use client";

import { Component, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Activity, AlertTriangle, CalendarClock, MessageSquare, Mic, MicOff, PhoneOff, RefreshCw, ShieldCheck, Sparkles, Video, VideoOff } from "lucide-react";
import { ConnectionStateToast, LiveKitRoom, ParticipantTile, RoomAudioRenderer, useConnectionState, useLocalParticipant, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";
import Link from "next/link";
import { TelemedicineArtifactCard } from "@/components/telemedicine/TelemedicineArtifactCard";
import { TelemedicineFeatureModal } from "@/components/telemedicine/TelemedicineFeatureModal";
import { TelemedicinePractitionerCard } from "@/components/telemedicine/TelemedicinePractitionerCard";
import { TelemedicineQueuePreviewCard } from "@/components/telemedicine/TelemedicineQueuePreviewCard";
import { TelemedicineStatCard } from "@/components/telemedicine/TelemedicineStatCard";

type VideoConferenceBoundaryProps = {
  children: ReactNode;
  onError: () => void;
};

type VideoConferenceBoundaryState = {
  hasError: boolean;
};

class VideoConferenceBoundary extends Component<VideoConferenceBoundaryProps, VideoConferenceBoundaryState> {
  constructor(props: VideoConferenceBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): VideoConferenceBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(): void {
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
        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-200">
          <div className="space-y-2">
            <p className="font-medium">Video surface recovered.</p>
            <p className="text-slate-400">The call remains active. Reconnect to refresh participant tiles.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

type Doctor = {
  id: string;
  full_name: string;
  email: string;
  specialty: string;
  license_number: string;
  verified: boolean;
};

type OrgUser = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  organization_name?: string;
  active?: boolean;
  telemedicine_enabled?: boolean;
  telemedicine_modes?: string[];
};

type Practitioner = {
  id: string;
  full_name: string;
  email?: string;
  specialty?: string;
  role: string;
  active: boolean;
  source: "org_doctors" | "org_users";
  telemedicineEnabled: boolean;
  telemedicineModes: string[];
};

type QueueSession = {
  id: string;
  patient_id: string;
  doctor_id?: string;
  doctor_name: string;
  scheduled_at: string;
  preferred_mode?: "video" | "voice" | "chat";
  requested_amount?: number;
  requested_currency?: string;
  status: string;
  connection_status: string;
  notes?: string;
};

type Patient = {
  id: string;
  full_name: string;
  phone?: string;
};

type OrgMe = {
  id: string;
  role: string;
  email?: string;
};

type TelemedicineMessage = {
  id: string;
  sender: string;
  channel: string;
  content: string;
  created_at?: string;
};

type Artifact = {
  id: string;
  session_id: string;
  patient_id: string;
  summary: string;
  final_diagnosis: string;
  recording_url?: string;
  transcript_url?: string;
  follow_up_needed: boolean;
};

type TranscriptLine = {
  id: string;
  speaker: string;
  text: string;
  source: "voice" | "manual";
  createdAt: string;
};

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
  if (hostname === "localhost" || hostname === "127.0.0.1") return true;
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
  const isLoopback = parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost";
  if (!isLoopback) return rawUrl;

  const configuredOrigin = (process.env.NEXT_PUBLIC_LOCAL_NETWORK_ORIGIN || "").trim();
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

  if (typeof window !== "undefined" && isPrivateOrLoopbackHost(window.location.hostname)) {
    parsed.hostname = window.location.hostname;
    return parsed.toString();
  }

  return rawUrl;
}

function stripLiveKitProxyPath(rawUrl: string): string {
  if (!rawUrl) return rawUrl;
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return rawUrl;
  }
  if (!parsed.pathname.startsWith("/livekit")) {
    return rawUrl;
  }

  const configuredOrigin = (process.env.NEXT_PUBLIC_LOCAL_NETWORK_ORIGIN || "").trim();
  if (configuredOrigin) {
    try {
      const configuredUrl = new URL(configuredOrigin);
      if (isPrivateOrLoopbackHost(configuredUrl.hostname)) {
        return rawUrl;
      }
    } catch {
      // Ignore malformed local network overrides and continue with the public-host fallback.
    }
  }

  if (isPrivateOrLoopbackHost(parsed.hostname)) {
    return rawUrl;
  }

  parsed.pathname = parsed.pathname.replace(/^\/livekit(?=\/|$)/, "") || "/";
  return parsed.toString();
}

type ApiPayload = Record<string, unknown> | string | null;

async function readJsonResponse(response: Response): Promise<ApiPayload> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as ApiPayload;
  } catch {
    return text;
  }
}

function getErrorMessage(payload: ApiPayload, fallback: string): string {
  if (payload && typeof payload === "object" && "error" in payload) {
    const error = payload.error;
    if (typeof error === "string" && error.trim()) return error;
  }
  if (typeof payload === "string" && payload.trim()) return payload;
  return fallback;
}

export default function TelemedicinePage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [orgUsers, setOrgUsers] = useState<OrgUser[]>([]);
  const [queueSessions, setQueueSessions] = useState<QueueSession[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [messages, setMessages] = useState<TelemedicineMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState("");
  const [orgMe, setOrgMe] = useState<OrgMe | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [displayName, setDisplayName] = useState("Clinician");
  const [serverUrl, setServerUrl] = useState("");
  const [roomName, setRoomName] = useState("");
  const [token, setToken] = useState("");
  const [joinRequested, setJoinRequested] = useState(false);
  const [roomNotes, setRoomNotes] = useState("");
  const [roomMode, setRoomMode] = useState<"video" | "audio">("video");
  const [featureTab, setFeatureTab] = useState<"ai" | "chart" | "notes" | "chat">("ai");
  const [featurePanelOpen, setFeaturePanelOpen] = useState(true);
  const [roomStatus, setRoomStatus] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [roomArtifacts, setRoomArtifacts] = useState<Artifact[]>([]);
  const [isFetchingToken, setIsFetchingToken] = useState(false);
  const [isSavingSummary, setIsSavingSummary] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isAcceptingQueueId, setIsAcceptingQueueId] = useState("");
  const [symptomsInput, setSymptomsInput] = useState("");
  const [possibleSolutions, setPossibleSolutions] = useState("");
  const [speakerLabel, setSpeakerLabel] = useState("Clinician");
  const [transcriptLines, setTranscriptLines] = useState<TranscriptLine[]>([]);
  const [manualTranscript, setManualTranscript] = useState("");
  const [isScribeListening, setIsScribeListening] = useState(false);
  const [roomMountVersion, setRoomMountVersion] = useState(0);
  const [videoRuntimeIssue, setVideoRuntimeIssue] = useState("");
  const speechRecognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const autoJoinAttemptedRef = useRef(false);
  const resolvedRoomName = sessionId ? `telemedicine-${sessionId}` : "";
  const roomInstanceKey = `${resolvedRoomName}:${roomMode}:${roomMountVersion}:${token.slice(0, 16)}`;
  const localNetworkBaseUrl = useMemo(() => {
    const configured = (process.env.NEXT_PUBLIC_LOCAL_NETWORK_ORIGIN || "").trim();
    if (configured) {
      return configured.replace(/\/+$/, "");
    }
    if (typeof window === "undefined") {
      return "";
    }
    return isPrivateOrLoopbackHost(window.location.hostname) ? window.location.origin : "";
  }, []);
  const localNetworkRoomUrl = useMemo(() => {
    if (!localNetworkBaseUrl) return "";
    const suffix = sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : "";
    return `${localNetworkBaseUrl}/dashboard/telemedicine${suffix}`;
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
      facingMode: "user" as const,
    }),
    [],
  );
  const mediaCaptureSupported = useMemo(() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.isSecureContext && window.navigator?.mediaDevices?.getUserMedia);
  }, []);
  const effectiveAudioOption = mediaCaptureSupported ? audioCaptureOptions : false;
  const effectiveVideoOption = roomMode === "video" && mediaCaptureSupported ? videoCaptureOptions : false;

  async function loadTranscriptLines(nextSessionId: string) {
    const trimmed = nextSessionId.trim();
    if (!trimmed) {
      setTranscriptLines([]);
      return;
    }
    try {
      const response = await fetch(`/api/org/telemedicine/sessions/${encodeURIComponent(trimmed)}/transcript-lines?limit=500`, { cache: "no-store" });
      if (!response.ok) return;
      const payload = await response.json().catch(() => []);
      if (!Array.isArray(payload)) return;
      setTranscriptLines(payload.map((item) => {
        const source: "voice" | "manual" = item.source === "voice" ? "voice" : "manual";
        return {
          id: typeof item.id === "string" ? item.id : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          text: typeof item.content === "string" ? item.content : "",
          source,
          createdAt: typeof item.occurred_at === "string" ? item.occurred_at : new Date().toISOString(),
        };
      }).filter((item) => item.text.trim()));
    } catch {
      // Transcript persistence is optional and should not block call UX.
    }
  }

  async function persistTranscriptLine(sessionIdValue: string, line: TranscriptLine) {
    const trimmed = sessionIdValue.trim();
    if (!trimmed) return;
    try {
      await fetch(`/api/org/telemedicine/sessions/${encodeURIComponent(trimmed)}/transcript-lines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          speaker: line.speaker,
          source: line.source,
          content: line.text,
          occurred_at: line.createdAt,
        }),
      });
    } catch {
      // Keep local transcript lines even when persistence is unavailable.
    }
  }

  function addTranscriptLine(speaker: string, text: string, source: "voice" | "manual") {
    const content = text.trim();
    if (!content) return;
    const line: TranscriptLine = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      speaker: speaker.trim() || "Unknown speaker",
      text: content,
      source,
      createdAt: new Date().toISOString(),
    };
    setTranscriptLines((prev) => ([...prev, line]));
    void persistTranscriptLine(sessionId, line);
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
        .join("\n");
    }
    return roomNotes.trim();
  }

  function buildDoctorNotes(): string {
    const sections = [
      roomNotes.trim(),
      possibleSolutions.trim() ? `Possible solutions:\n${possibleSolutions.trim()}` : "",
    ].filter(Boolean);
    return sections.join("\n\n");
  }

  function safeReconfigureRoom(statusMessage: string) {
    setJoinRequested(false);
    setToken("");
    setServerUrl("");
    setRoomMountVersion((value) => value + 1);
    setVideoRuntimeIssue("");
    setRoomStatus(statusMessage);
  }

  function startScribe() {
    const speechWindow = window as Window & {
      SpeechRecognition?: new () => BrowserSpeechRecognition;
      webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
    };
    const SpeechRecognitionCtor = typeof window !== "undefined"
      ? (speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition)
      : undefined;
    if (!SpeechRecognitionCtor) {
      setRoomStatus("Browser speech recognition is unavailable. You can still add manual transcript lines.");
      return;
    }

    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      speechRecognitionRef.current = null;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      for (let idx = event.resultIndex; idx < event.results.length; idx += 1) {
        const result = event.results[idx];
        if (!result?.isFinal) continue;
        const text = String(result[0]?.transcript || "").trim();
        if (!text) continue;
        addTranscriptLine(speakerLabel, text, "voice");
      }
    };
    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      setRoomStatus(`AI scribe stopped: ${String(event?.error || "speech recognition error")}`);
      setIsScribeListening(false);
    };
    recognition.onend = () => {
      setIsScribeListening(false);
    };
    recognition.start();
    speechRecognitionRef.current = recognition;
    setIsScribeListening(true);
    setRoomStatus("AI scribe is listening.");
  }

  function stopScribe() {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      speechRecognitionRef.current = null;
    }
    setIsScribeListening(false);
  }

  async function ensureMediaPermissions(wantVideo: boolean): Promise<boolean> {
    if (!mediaCaptureSupported) {
      setVideoRuntimeIssue("Microphone/camera publishing is unavailable on insecure origins (LAN HTTP). Use localhost or HTTPS to enable media publishing.");
      return true;
    }
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      return true;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: wantVideo ? { facingMode: "user" } : false,
      });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch {
      setRoomStatus("Allow microphone and camera permissions to join the telemedicine room.");
      return false;
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const fromQuery = (params.get("session_id") || params.get("sessionId") || "").trim();
    if (!fromQuery) return;
    setSessionId(fromQuery);
    setRoomName(`telemedicine-${fromQuery}`);
  }, []);

  useEffect(() => {
    setRoomName(resolvedRoomName);
  }, [resolvedRoomName]);

  useEffect(() => {
    if (!sessionId.trim() || joinRequested || token || autoJoinAttemptedRef.current) {
      return;
    }
    autoJoinAttemptedRef.current = true;
    void fetchRoomToken().finally(() => {
      autoJoinAttemptedRef.current = false;
    });
  }, [fetchRoomToken, joinRequested, sessionId, token]);

  useEffect(() => {
    setSpeakerLabel(displayName || "Clinician");
  }, [displayName]);

  useEffect(() => () => {
    stopScribe();
  }, []);

  async function loadData() {
    setLoading(true);
    setLoadingError("");
    try {
      const meRes = await fetch("/api/org/me", { cache: "no-store" });
      const meData = await readJsonResponse(meRes);
      const role = meRes.ok && meData && typeof meData === "object" && typeof meData.role === "string"
        ? meData.role.toLowerCase()
        : "";

      if (meRes.ok && meData && typeof meData === "object" && typeof meData.id === "string" && typeof meData.role === "string") {
        setOrgMe({ id: meData.id, role: meData.role, email: typeof meData.email === "string" ? meData.email : undefined });
      } else {
        setOrgMe(null);
      }

      const canReadUsers = role === "superadmin";
      const canReadPatients = role === "superadmin" || role === "admin";

      const [docsRes, artifactsRes, queueRes, usersRes, patientsRes] = await Promise.all([
        fetch("/api/org/doctors", { cache: "no-store" }),
        fetch("/api/org/telemedicine/artifacts", { cache: "no-store" }),
        fetch("/api/org/telemedicine/queue", { cache: "no-store" }),
        canReadUsers ? fetch("/api/org/users", { cache: "no-store" }) : Promise.resolve(null),
        canReadPatients ? fetch("/api/org/patients?limit=300", { cache: "no-store" }) : Promise.resolve(null),
      ]);
      const docsData = await readJsonResponse(docsRes);
      const artifactsData = await readJsonResponse(artifactsRes);
      const queueData = await readJsonResponse(queueRes);
      const usersData = usersRes ? await readJsonResponse(usersRes) : null;
      const patientsData = patientsRes ? await readJsonResponse(patientsRes) : null;
      const errors: string[] = [];

      if (docsRes.ok) setDoctors(Array.isArray(docsData) ? docsData : []);
      else {
        setDoctors([]);
        errors.push(getErrorMessage(docsData, "Unable to load practitioners"));
      }

      if (usersRes && usersRes.ok) {
        setOrgUsers(Array.isArray(usersData) ? (usersData as OrgUser[]) : []);
      } else {
        setOrgUsers([]);
      }

      if (artifactsRes.ok) setArtifacts(Array.isArray(artifactsData) ? artifactsData : []);
      else {
        setArtifacts([]);
        errors.push(getErrorMessage(artifactsData, "Unable to load telemedicine artifacts"));
      }

      if (queueRes.ok) {
        setQueueSessions(Array.isArray(queueData) ? (queueData as QueueSession[]) : []);
      } else {
        setQueueSessions([]);
        errors.push(getErrorMessage(queueData, "Unable to load telemedicine queue"));
      }

      if (patientsRes && patientsRes.ok) {
        setPatients(Array.isArray(patientsData) ? (patientsData as Patient[]) : []);
      } else {
        setPatients([]);
      }

      setLoadingError(errors.join(" • "));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    setRoomArtifacts(artifacts.filter((artifact) => artifact.session_id === sessionId));
  }, [artifacts, sessionId]);

  useEffect(() => {
    void loadTranscriptLines(sessionId);
  }, [sessionId]);

  const chatChannel = sessionId.trim() ? `telemedicine:${sessionId.trim()}` : "";

  async function loadMessages(channel: string) {
    if (!channel) {
      setMessages([]);
      return;
    }
    const res = await fetch(`/api/org/messages?limit=100&channel=${encodeURIComponent(channel)}`, { cache: "no-store" });
    const payload = await readJsonResponse(res);
    if (!res.ok) {
      throw new Error(getErrorMessage(payload, "Unable to load chat"));
    }
    setMessages(Array.isArray(payload) ? (payload as TelemedicineMessage[]) : []);
  }

  useEffect(() => {
    if (!chatChannel) {
      setMessages([]);
      return;
    }
    void loadMessages(chatChannel).catch((error) => {
      setRoomStatus(error instanceof Error ? error.message : "Unable to load chat");
    });
  }, [chatChannel]);

  async function sendChatMessage() {
    const text = chatInput.trim();
    if (!text || !chatChannel) return;
    setIsSendingMessage(true);
    try {
      const res = await fetch("/api/org/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: displayName.trim() || orgMe?.email || "Practitioner",
          channel: chatChannel,
          content: text,
        }),
      });
      const payload = await readJsonResponse(res);
      if (!res.ok) {
        throw new Error(getErrorMessage(payload, "Unable to send message"));
      }
      setChatInput("");
      await loadMessages(chatChannel);
    } catch (error) {
      setRoomStatus(error instanceof Error ? error.message : "Unable to send message");
    } finally {
      setIsSendingMessage(false);
    }
  }

  async function fetchRoomToken(explicitSessionId?: string, explicitMode?: "video" | "audio") {
    const currentSessionId = (explicitSessionId || sessionId).trim();
    if (!currentSessionId) {
      setRoomStatus("A session id is required before joining telemedicine.");
      return;
    }
    const targetMode = explicitMode || roomMode;
    const permissionsOk = await ensureMediaPermissions(targetMode === "video");
    if (!permissionsOk) {
      return;
    }
    setIsFetchingToken(true);
    setRoomStatus("");
    setVideoRuntimeIssue("");
    try {
      const nextRoomName = `telemedicine-${currentSessionId}`;
      const res = await fetch("/api/org/telemedicine/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: currentSessionId,
          room_name: nextRoomName,
          display_name: displayName.trim() || "Clinician",
          role: "doctor",
        }),
      });
      const payload = await readJsonResponse(res);
      if (!res.ok) throw new Error(getErrorMessage(payload, "Unable to join telemedicine room"));
      if (payload && typeof payload === "object") {
        const nextToken = typeof payload.token === "string" ? payload.token : "";
        if (!nextToken) {
          throw new Error("LiveKit token is missing from token response");
        }
        const nextServerUrl = typeof payload.url === "string" ? payload.url : typeof payload.serverUrl === "string" ? payload.serverUrl : "";
        const nextResolvedRoomName = typeof payload.room_name === "string" ? payload.room_name : typeof payload.roomName === "string" ? payload.roomName : nextRoomName;
        const normalizedServerUrl = stripLiveKitProxyPath(normalizeLiveKitServerUrl(nextServerUrl));
        if (!normalizedServerUrl) {
          throw new Error("LiveKit server URL is missing from token response");
        }
        if (typeof window !== "undefined" && window.location.protocol === "https:" && normalizedServerUrl.startsWith("ws://")) {
          throw new Error("LiveKit requires a secure wss URL when the portal is opened over HTTPS. Set LIVEKIT_PUBLIC_URL to your LiveKit Cloud wss URL (or a secure tunnel URL).");
        }
        setToken(nextToken);
        setServerUrl(normalizedServerUrl);
        setRoomName(nextResolvedRoomName);
        if (explicitMode) {
          setRoomMode(explicitMode);
        }
        setFeatureTab("ai");
        setFeaturePanelOpen(true);
        setRoomMountVersion((value) => value + 1);
        setJoinRequested(true);
        setRoomStatus("Telemedicine room ready.");
      } else {
        throw new Error("Invalid LiveKit token response");
      }
    } catch (error) {
      setRoomStatus(error instanceof Error ? error.message : "Unable to join telemedicine room");
    } finally {
      setIsFetchingToken(false);
    }
  }

  async function acceptQueueSession(queueItem: QueueSession) {
    setIsAcceptingQueueId(queueItem.id);
    setRoomStatus("");
    try {
      const response = await fetch("/api/org/telemedicine/queue/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: queueItem.id }),
      });
      const payload = await readJsonResponse(response);
      if (!response.ok) {
        throw new Error(getErrorMessage(payload, "Unable to accept queue request"));
      }
      const preferredMode = queueItem.preferred_mode === "voice" ? "audio" : "video";
      setSessionId(queueItem.id);
      setRoomMode(preferredMode);
      await fetchRoomToken(queueItem.id, preferredMode);
      await loadData();
    } catch (error) {
      setRoomStatus(error instanceof Error ? error.message : "Unable to accept queue request");
    } finally {
      setIsAcceptingQueueId("");
    }
  }

  async function saveSessionSummary() {
    if (!sessionId.trim()) {
      setRoomStatus("A session id is required before saving a summary.");
      return;
    }
    setIsSavingSummary(true);
    setRoomStatus("");
    try {
      const transcript = buildTranscript();
      const symptoms = parseSymptoms(symptomsInput);
      const doctorNotes = buildDoctorNotes();
      const res = await fetch(`/api/org/telemedicine/sessions/${encodeURIComponent(sessionId.trim())}/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          doctor_notes: doctorNotes,
          symptoms,
          language: "en",
          recording_url: null,
          transcript_url: null,
          doctor_id: null,
          final_diagnosis: "",
          create_follow_up: true,
        }),
      });
      const payload = await readJsonResponse(res);
      if (!res.ok) throw new Error(getErrorMessage(payload, "Unable to save session summary"));
      setRoomStatus("Session summary saved.");
      await loadData();
    } catch (error) {
      setRoomStatus(error instanceof Error ? error.message : "Unable to save session summary");
    } finally {
      setIsSavingSummary(false);
    }
  }

  const patientLookup = useMemo(() => new Map(patients.map((patient) => [patient.id, patient])), [patients]);

  const practitioners = useMemo(() => {
    const out: Practitioner[] = [];
    const seen = new Set<string>();

    for (const doctor of doctors) {
      const key = `${doctor.email || doctor.full_name}`.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        id: doctor.id,
        full_name: doctor.full_name,
        email: doctor.email,
        specialty: doctor.specialty,
        role: "doctor",
        active: Boolean(doctor.verified),
        source: "org_doctors",
        telemedicineEnabled: true,
        telemedicineModes: ["video", "voice", "chat"],
      });
    }

    for (const user of orgUsers) {
      const role = (user.role || "").toLowerCase();
      if (role !== "doctor" && role !== "nurse") continue;
      const key = `${user.email || user.full_name}`.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        specialty: role === "nurse" ? "Nursing" : "Doctor",
        role,
        active: user.active !== false,
        source: "org_users",
        telemedicineEnabled: user.telemedicine_enabled !== false,
        telemedicineModes: user.telemedicine_modes || ["video", "voice"],
      });
    }

    return out;
  }, [doctors, orgUsers]);

  const telemedicineQueue = useMemo(
    () => queueSessions
      .filter((item) => item.status === "pending" || item.status === "accepted" || item.status === "in_progress")
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()),
    [queueSessions],
  );

  const selectedQueueSession = useMemo(() => telemedicineQueue.find((item) => item.id === sessionId) || null, [sessionId, telemedicineQueue]);
  const selectedPatientName = useMemo(() => {
    if (!selectedQueueSession?.patient_id) return "";
    return patientLookup.get(selectedQueueSession.patient_id)?.full_name || selectedQueueSession.patient_id;
  }, [patientLookup, selectedQueueSession]);

  const filteredPractitioners = useMemo(() => {
    const requiredMode = selectedQueueSession?.preferred_mode;
    const telemedicineEnabled = practitioners.filter((practitioner) => practitioner.active && practitioner.telemedicineEnabled);
    const compatible = telemedicineEnabled.filter((practitioner) => {
      if (!practitioner.active || !practitioner.telemedicineEnabled) return false;
      if (!requiredMode) return true;
      if (requiredMode === "voice") return practitioner.telemedicineModes.includes("voice") || practitioner.telemedicineModes.includes("audio");
      return practitioner.telemedicineModes.includes(requiredMode);
    });
    return compatible.length > 0 ? compatible : telemedicineEnabled;
  }, [practitioners, selectedQueueSession]);
  const humanRoomName = useMemo(() => {
    if (!sessionId.trim()) return "Telemedicine Room";
    const shortId = sessionId.trim().slice(0, 8).toUpperCase();
    return `Telemedicine Room ${shortId}`;
  }, [sessionId]);
  const aiDraftSummary = useMemo(() => {
    const segments = [roomNotes.trim(), symptomsInput.trim(), possibleSolutions.trim()].filter(Boolean);
    return segments.length > 0 ? segments.join("\n\n") : "Draft a concise encounter summary, confirm the plan, then save to the chart.";
  }, [possibleSolutions, roomNotes, symptomsInput]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#04070f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.16),transparent_28%),linear-gradient(180deg,rgba(3,7,18,0.92),rgba(3,7,18,1))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_50%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-400 flex-col gap-4 p-4 md:p-6">
        <header className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-4 shadow-2xl backdrop-blur md:flex-row md:items-center md:justify-between md:px-6">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-200/70">Telemedicine workspace</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Join a live session and save the encounter summary</h1>
            <p className="max-w-2xl text-sm text-slate-300">Use LiveKit for video or audio-only consults, keep notes beside the call, and persist the summary when the encounter is complete.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs text-slate-200">Mode {roomMode}</span>
            <Link href="/dashboard/telemedicine/queue" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white transition hover:bg-slate-900">Queue</Link>
            <Link href="/dashboard/telemedicine/profile" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white transition hover:bg-slate-900">Profile</Link>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <TelemedicineStatCard label="Connection" value={joinRequested ? "Room ready" : "Awaiting token"} tone="accent" />
          <TelemedicineStatCard label="Queue" value={`${queueSessions.length} sessions`} />
          <TelemedicineStatCard label="Artifacts" value={`${roomArtifacts.length} saved`} tone="success" />
        </div>

        {joinRequested && token && serverUrl ? (
          <div className="fixed inset-0 z-40 overflow-hidden bg-[#04070f]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.16),transparent_28%),linear-gradient(180deg,rgba(3,7,18,0.92),rgba(3,7,18,1))]" />
            <div className="relative flex h-full min-h-screen flex-col">
              <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-slate-950/80 px-4 py-3 text-white backdrop-blur">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-sky-200/70">
                    <span>Consult</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] tracking-[0.24em]">{roomMode}</span>
                  </div>
                  <h2 className="text-sm font-semibold md:text-base">{selectedPatientName || humanRoomName}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setFeaturePanelOpen((value) => !value)} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10">
                    {featurePanelOpen ? "Hide panel" : "Show panel"}
                  </button>
                  <button type="button" onClick={() => { setFeaturePanelOpen(true); setFeatureTab("chat"); }} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10">
                    Chat
                  </button>
                  <button type="button" onClick={() => { setFeaturePanelOpen(true); setFeatureTab("notes"); }} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10">
                    Notes
                  </button>
                  <button type="button" onClick={() => void fetchRoomToken()} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10">
                    Reconnect
                  </button>
                </div>
              </header>

              <div className="relative flex flex-1 overflow-hidden">
                <div className="relative flex-1 overflow-hidden">
                  <LiveKitRoom key={roomInstanceKey} token={token} serverUrl={serverUrl} connect video={effectiveVideoOption} audio={effectiveAudioOption} options={{ adaptiveStream: true, dynacast: true }} className="h-full w-full" data-lk-theme="default">
                    <CallStage roomMode={roomMode} onVideoRuntimeIssue={setVideoRuntimeIssue} />
                  </LiveKitRoom>

                  <div className="pointer-events-none absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-slate-950/80 px-3 py-2 text-white shadow-2xl backdrop-blur">
                    <button type="button" onClick={() => void fetchRoomToken()} className="pointer-events-auto rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10">
                      Refresh token
                    </button>
                    <button type="button" onClick={() => void saveSessionSummary()} className="pointer-events-auto rounded-full bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400" disabled={isSavingSummary}>
                      {isSavingSummary ? "Saving..." : "Save summary"}
                    </button>
                    <button type="button" onClick={() => { setJoinRequested(false); setToken(""); setServerUrl(""); setRoomMountVersion((value) => value + 1); }} className="pointer-events-auto rounded-full border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-xs font-medium text-rose-100 transition hover:bg-rose-500/20">
                      End
                    </button>
                  </div>

                  {videoRuntimeIssue ? <p className="absolute left-4 top-20 z-20 max-w-md rounded-2xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">{videoRuntimeIssue}</p> : null}
                  {roomStatus ? <p className="absolute left-4 top-20 z-20 max-w-md rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-xs text-slate-200 backdrop-blur">{roomStatus}</p> : null}
                </div>

                <TelemedicineFeatureModal
                  open={featurePanelOpen}
                  activeTab={featureTab}
                  onTabChange={setFeatureTab}
                  onClose={() => setFeaturePanelOpen(false)}
                  patientName={selectedPatientName || "Unknown"}
                  sessionId={sessionId || roomName}
                  roomMode={roomMode}
                  queueCount={queueSessions.length}
                  artifactCount={roomArtifacts.length}
                  roomStatus={roomStatus}
                  videoRuntimeIssue={videoRuntimeIssue}
                  roomNotes={roomNotes}
                  onRoomNotesChange={setRoomNotes}
                  symptomsInput={symptomsInput}
                  onSymptomsInputChange={setSymptomsInput}
                  possibleSolutions={possibleSolutions}
                  onPossibleSolutionsChange={setPossibleSolutions}
                  draftSummary={aiDraftSummary}
                  onEditSummary={() => setFeatureTab("notes")}
                  onAcceptSummary={() => void saveSessionSummary()}
                  onSaveSummary={() => void saveSessionSummary()}
                  onEndRoom={() => { setJoinRequested(false); setToken(""); setServerUrl(""); setRoomMountVersion((value) => value + 1); }}
                  messages={messages}
                  chatInput={chatInput}
                  onChatInputChange={setChatInput}
                  onRefreshChat={() => { if (!chatChannel) return; void loadMessages(chatChannel).catch(() => undefined); }}
                  onSendChatMessage={() => void sendChatMessage()}
                  isSendingMessage={isSendingMessage}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_400px]">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Telemedicine mode</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Prepare a clinician room</h2>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => {
                    setRoomMode("video");
                    if (joinRequested) setRoomMountVersion((value) => value + 1);
                  }} className={`rounded-full px-4 py-2 text-sm font-medium ${roomMode === "video" ? "bg-sky-500 text-slate-950" : "border border-white/10 bg-slate-950/70 text-white"}`}>
                    Video
                  </button>
                  <button type="button" onClick={() => {
                    setRoomMode("audio");
                    if (joinRequested) setRoomMountVersion((value) => value + 1);
                  }} className={`rounded-full px-4 py-2 text-sm font-medium ${roomMode === "audio" ? "bg-sky-500 text-slate-950" : "border border-white/10 bg-slate-950/70 text-white"}`}>
                    Audio
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/60 p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Session ID</label>
                      <input value={sessionId} onChange={(event) => setSessionId(event.target.value)} placeholder="Paste a telemedicine session id" className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none" />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Display name</label>
                      <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Clinician" className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none" />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Room name</label>
                      <input value={roomName || "Auto-generated from session id"} title="Auto-generated from session id" placeholder="Auto-generated from session id" readOnly className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-300 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-[0.2em] text-slate-400">Mode</label>
                      <p className="mt-2 rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-slate-300">{roomMode}</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">LiveKit server URL is provided automatically during token generation.</div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button type="button" onClick={() => void fetchRoomToken()} className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60" disabled={isFetchingToken}>
                      <Video className="h-4 w-4" />
                      {isFetchingToken ? "Joining..." : "Join room"}
                    </button>
                    <button type="button" onClick={() => void loadData()} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white">
                      <RefreshCw className="h-4 w-4" />
                      Refresh data
                    </button>
                  </div>
                </div>

                <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Queue preview</p>
                  <div className="space-y-2">
                    {queueSessions.slice(0, 4).map((queueItem, index) => {
                      const patient = patientLookup.get(queueItem.patient_id);
                      return (
                        <TelemedicineQueuePreviewCard
                          key={queueItem.id}
                          index={index}
                          patientName={patient?.full_name || ""}
                          patientId={queueItem.patient_id}
                          mode={queueItem.preferred_mode || "video"}
                        />
                      );
                    })}
                    {queueSessions.length === 0 ? <p className="text-sm text-slate-400">No telemedicine queue items yet.</p> : null}
                  </div>
                </div>
              </div>
            </section>

            <aside className="space-y-4">
              <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Practitioners</p>
                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  {filteredPractitioners.slice(0, 5).map((practitioner) => (
                    <TelemedicinePractitionerCard
                      key={practitioner.id}
                      fullName={practitioner.full_name}
                      specialty={practitioner.specialty}
                      role={practitioner.role}
                      active={practitioner.active}
                      email={practitioner.email}
                    />
                  ))}
                  {filteredPractitioners.length === 0 ? <p className="text-sm text-slate-400">No practitioners available for this mode.</p> : null}
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Artifacts</p>
                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  {artifacts.slice(0, 3).map((artifact) => (
                    <TelemedicineArtifactCard
                      key={artifact.id}
                      sessionId={artifact.session_id}
                      patientId={artifact.patient_id}
                      summary={artifact.summary}
                      diagnosis={artifact.final_diagnosis}
                      followUpNeeded={artifact.follow_up_needed}
                    />
                  ))}
                  {artifacts.length === 0 ? <p className="text-sm text-slate-400">No session artifacts yet.</p> : null}
                </div>
              </section>
            </aside>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative mx-auto max-w-screen-2xl space-y-6 overflow-hidden p-4 md:p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.14),transparent_40%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_36%)]" />

      <div className="relative rounded-3xl border border-border/70 bg-card/95 p-5 shadow-soft backdrop-blur md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Telemedicine workspace</p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">Join a live session and save the encounter summary</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">Use LiveKit for video or audio-only consults, keep notes beside the call, and persist the summary when the encounter is complete.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/telemedicine/queue" className="rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-medium transition hover:bg-muted/40">Queue</Link>
            <Link href="/dashboard/telemedicine/profile" className="rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-medium transition hover:bg-muted/40">My Telemedicine Profile</Link>
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-border/70 bg-card/95 p-5 shadow-soft backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Telemedicine mode</h2>
            <p className="mt-1 text-sm text-muted-foreground">Use LiveKit for video or audio-only consults and save the summary once the encounter is complete.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setRoomMode("video");
                if (joinRequested) setRoomMountVersion((value) => value + 1);
              }}
              className={"rounded-2xl px-4 py-2 text-sm font-medium transition " + (roomMode === "video" ? "bg-primary text-primary-foreground" : "border border-border bg-background hover:bg-muted/40")}
            >
              Video
            </button>
            <button
              type="button"
              onClick={() => {
                setRoomMode("audio");
                if (joinRequested) setRoomMountVersion((value) => value + 1);
              }}
              className={"rounded-2xl px-4 py-2 text-sm font-medium transition " + (roomMode === "audio" ? "bg-primary text-primary-foreground" : "border border-border bg-background hover:bg-muted/40")}
            >
              Audio
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[360px_1fr]">
          <div className="space-y-4 rounded-3xl border border-border/70 bg-background/85 p-4 shadow-sm backdrop-blur">
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Session ID</label>
              <input className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary/40" value={sessionId} onChange={(event) => { const value = event.target.value; setSessionId(value); setRoomName(value ? `telemedicine-${value}` : ""); }} placeholder="Paste a telemedicine session id" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2"><label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Display name</label><input className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary/40" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Clinician" /></div>
              <div className="space-y-2"><label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Room name</label><input className="w-full rounded-2xl border border-border bg-muted px-3 py-2 text-sm" value={roomName || "Auto-generated from session id"} title="Auto-generated room name" placeholder="Auto-generated from session id" readOnly /></div>
            </div>
            <p className="rounded-2xl border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">LiveKit server URL is provided automatically during token generation.</p>
            <div className="rounded-2xl border border-sky-300/40 bg-sky-50/70 p-3 text-xs text-slate-800">
              <p className="font-semibold">Session Connection Card</p>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <p className="rounded-2xl border border-sky-200 bg-white px-2 py-1">Human room: {humanRoomName}</p>
                <p className="rounded-2xl border border-sky-200 bg-white px-2 py-1">Session ID: {sessionId || "Not selected"}</p>
                <p className="rounded-2xl border border-sky-200 bg-white px-2 py-1">LiveKit room: {roomName || resolvedRoomName || "Not generated yet"}</p>
                <p className="truncate rounded-2xl border border-sky-200 bg-white px-2 py-1">Token: {token ? `${token.slice(0, 48)}...` : "Not generated yet"}</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Notes for summary</label>
              <textarea className="min-h-32 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary/40" value={roomNotes} onChange={(event) => setRoomNotes(event.target.value)} placeholder="Symptoms, findings, plan, and follow-up guidance" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Symptoms (comma or line separated)</label>
              <textarea className="min-h-20 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary/40" value={symptomsInput} onChange={(event) => setSymptomsInput(event.target.value)} placeholder="fever, fatigue, chest pain" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Possible solutions / plan</label>
              <textarea className="min-h-20 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary/40" value={possibleSolutions} onChange={(event) => setPossibleSolutions(event.target.value)} placeholder="Hydration plan, labs, medication adjustments, follow-up window" />
            </div>
            <div className="rounded-2xl border border-border bg-muted/40 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Speaker-aware AI scribe</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (isScribeListening) {
                        stopScribe();
                      } else {
                        startScribe();
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-2 py-1 text-xs"
                  >
                    {isScribeListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                    {isScribeListening ? "Stop" : "Start"}
                  </button>
                </div>
              </div>
              <div className="mb-2 grid gap-2 md:grid-cols-[1fr_auto]">
                <input
                  value={speakerLabel}
                  onChange={(event) => setSpeakerLabel(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none transition focus:border-primary/40"
                  placeholder="Current speaker label"
                />
                <button
                  type="button"
                  onClick={() => {
                    addTranscriptLine(speakerLabel, manualTranscript, "manual");
                    setManualTranscript("");
                  }}
                  disabled={!manualTranscript.trim()}
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-xs disabled:opacity-60"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Add line
                </button>
              </div>
              <textarea
                className="min-h-16 w-full rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none transition focus:border-primary/40"
                value={manualTranscript}
                onChange={(event) => setManualTranscript(event.target.value)}
                placeholder="Manual transcript line from active speaker"
              />
              <div className="mt-2 max-h-24 space-y-1 overflow-y-auto rounded-2xl border border-border bg-background p-2">
                {transcriptLines.length === 0 ? <p className="text-xs text-muted-foreground">No transcript lines yet.</p> : null}
                {transcriptLines.map((line) => (
                  <p key={line.id} className="text-xs">
                    <span className="font-medium">{line.speaker}</span>
                    <span className="text-muted-foreground"> ({line.source})</span>
                    {": "}
                    {line.text}
                  </p>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => void fetchRoomToken()} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60" disabled={isFetchingToken}><Video className="h-4 w-4" /> {isFetchingToken ? "Joining..." : "Join room"}</button>
              <button type="button" onClick={() => void saveSessionSummary()} className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 text-sm font-medium disabled:opacity-60" disabled={isSavingSummary}><CalendarClock className="h-4 w-4" /> Save summary</button>
              <button type="button" onClick={() => safeReconfigureRoom("Room closed.")} className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 text-sm font-medium"><PhoneOff className="h-4 w-4" /> End room</button>
            </div>
            {roomStatus ? <p className="rounded-2xl border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">{roomStatus}</p> : null}
            {localNetworkRoomUrl ? (
              <p className="rounded-2xl border border-sky-400/30 bg-sky-500/10 px-3 py-2 text-xs text-sky-900">
                Local network room link: <a href={localNetworkRoomUrl} className="underline underline-offset-2">{localNetworkRoomUrl}</a>
              </p>
            ) : null}
            {videoRuntimeIssue ? (
              <p className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                <AlertTriangle className="mr-1 inline h-3.5 w-3.5" /> {videoRuntimeIssue}
                {localNetworkRoomUrl ? (
                  <>
                    {" "}
                    <a href={localNetworkRoomUrl} className="underline underline-offset-2">Use local network link</a>
                  </>
                ) : null}
              </p>
            ) : null}
            {sessionId ? <p className="text-xs text-muted-foreground">Current session artifacts: {roomArtifacts.length}</p> : null}
          </div>

          <div className="space-y-4">
            {joinRequested && token && serverUrl ? (
              <div className="fixed inset-0 z-50 flex min-h-screen flex-col overflow-hidden bg-background">
                <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 shadow-soft">
                  <div>
                    <p className="text-sm font-medium">{roomName || "Telemedicine room"}</p>
                    <p className="text-xs text-muted-foreground">{roomMode === "video" ? "Video call" : "Audio call"} session</p>
                  </div>
                  <div className="hidden items-center gap-2 md:flex">
                    <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">Connection: Stable</span>
                    <span className="rounded-full border border-sky-300 bg-sky-50 px-2 py-0.5 text-[11px] text-sky-700">Latency: Good</span>
                    <span className="rounded-full border border-violet-300 bg-violet-50 px-2 py-0.5 text-[11px] text-violet-700">Audio: Live</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      safeReconfigureRoom("Reconnecting room...");
                      void fetchRoomToken();
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium"
                  >
                    <RefreshCw className="h-4 w-4" /> Reconnect
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 border-b border-border bg-muted/30 px-4 py-2">
                  <span className="rounded-full bg-background px-2 py-1 text-xs">Practitioner: {displayName || "Clinician"}</span>
                  {selectedQueueSession?.doctor_name ? <span className="rounded-full bg-background px-2 py-1 text-xs">Assigned doctor: {selectedQueueSession.doctor_name}</span> : null}
                  {selectedPatientName ? <span className="rounded-full bg-background px-2 py-1 text-xs">Patient: {selectedPatientName}</span> : null}
                  <span className="rounded-full bg-background px-2 py-1 text-xs">Artifacts: {roomArtifacts.length}</span>
                </div>
                <div className="min-h-[50vh] flex-1 bg-slate-950 md:min-h-[60vh]">
                  <LiveKitRoom
                    key={roomInstanceKey}
                    token={token}
                    serverUrl={serverUrl}
                    connect
                    video={effectiveVideoOption}
                    audio={effectiveAudioOption}
                    options={{ adaptiveStream: true, dynacast: true }}
                    className="h-full w-full"
                  >
                    <CallStage roomMode={roomMode} onVideoRuntimeIssue={setVideoRuntimeIssue} />
                  </LiveKitRoom>
                </div>
                <div className="absolute inset-x-3 bottom-3 z-20 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-border bg-background/95 px-3 py-2 shadow-lg backdrop-blur md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:flex-nowrap md:rounded-full">
                  <button type="button" onClick={() => void fetchRoomToken()} className="rounded-full border border-border px-3 py-1.5 text-xs">Refresh token</button>
                  <button type="button" onClick={() => void saveSessionSummary()} className="rounded-full bg-primary px-3 py-1.5 text-xs text-primary-foreground">Save summary</button>
                  <button type="button" onClick={() => safeReconfigureRoom("Room closed.")} className="rounded-full border border-border px-3 py-1.5 text-xs">End</button>
                </div>
                <aside className="border-t border-border bg-background/95 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Compact rail</p>
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    <div className="rounded-lg border border-border bg-card p-2">
                      <p className="text-xs font-medium">Latest chat</p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{messages[0]?.content || "No chat messages yet."}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-2">
                      <p className="text-xs font-medium">Latest artifact</p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{artifacts[0]?.summary || "No summary saved yet."}</p>
                    </div>
                  </div>
                </aside>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">Join a session to open the live room. The clinician roster and session artifacts remain visible below.</div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border/70 bg-card/95 p-5 shadow-soft backdrop-blur">
        <h2 className="font-semibold mb-3">Telemedicine Queue</h2>
        <div className="space-y-2">
          {telemedicineQueue.map((queueItem, index) => {
            const patient = patientLookup.get(queueItem.patient_id);
            return (
              <article key={queueItem.id} className="rounded-2xl border border-border/70 bg-background p-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{patient?.full_name || queueItem.patient_id}</p>
                    <p className="text-xs text-muted-foreground">{queueItem.preferred_mode || "video"} • {new Date(queueItem.scheduled_at).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{queueItem.requested_amount ? `${queueItem.requested_amount} ${queueItem.requested_currency || "ETB"}` : "Rate not set"}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">#{index + 1}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Reason: {queueItem.notes || "n/a"}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => void acceptQueueSession(queueItem)}
                    disabled={queueItem.status !== "pending" || isAcceptingQueueId === queueItem.id}
                    className="rounded-2xl bg-primary px-3 py-1 text-xs font-medium text-primary-foreground disabled:opacity-60"
                  >
                    {isAcceptingQueueId === queueItem.id ? "Accepting..." : queueItem.status === "pending" ? "Accept + Connect" : "Accepted"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSessionId(queueItem.id);
                      setRoomName(`telemedicine-${queueItem.id}`);
                    }}
                    className="rounded-2xl border border-border px-3 py-1 text-xs transition hover:bg-muted/40"
                  >
                    Open
                  </button>
                </div>
              </article>
            );
          })}
          {!loading && telemedicineQueue.length === 0 ? <p className="text-sm text-muted-foreground">No patients waiting for telemedicine.</p> : null}
        </div>
      </section>

      <section className="rounded-3xl border border-border/70 bg-card/95 p-5 shadow-soft backdrop-blur">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-semibold">Session Chat</h2>
          <button
            type="button"
            onClick={() => void loadMessages(chatChannel).catch(() => undefined)}
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 text-xs font-medium transition hover:bg-muted/40"
            disabled={!chatChannel}
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {!chatChannel ? (
          <p className="text-sm text-muted-foreground">Enter a session id to open chat for that telemedicine session.</p>
        ) : (
          <div className="space-y-3">
            <div className="max-h-64 space-y-2 overflow-y-auto rounded-2xl border border-border bg-background p-3">
              {messages.map((message) => (
                <article key={message.id} className="rounded-2xl border border-border bg-card px-3 py-2 shadow-sm">
                  <p className="text-xs text-muted-foreground">{message.sender || "Practitioner"} {message.created_at ? `• ${new Date(message.created_at).toLocaleString()}` : ""}</p>
                  <p className="text-sm">{message.content}</p>
                </article>
              ))}
              {messages.length === 0 ? <p className="text-sm text-muted-foreground">No messages yet for this session.</p> : null}
            </div>
            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Type a message for patient and team"
                className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary/40"
              />
              <button
                type="button"
                onClick={() => void sendChatMessage()}
                disabled={isSendingMessage || !chatInput.trim()}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
              >
                <MessageSquare className="h-4 w-4" /> {isSendingMessage ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-border/70 bg-card/95 p-5 shadow-soft backdrop-blur">
        <h2 className="font-semibold mb-3">Practitioner roster</h2>
        {selectedQueueSession ? (
          <p className="mb-3 text-xs text-muted-foreground">Showing telemedicine-capable practitioners for mode: {selectedQueueSession.preferred_mode || "video"}</p>
        ) : null}
        {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : null}
        <div className="space-y-2">
          {filteredPractitioners.map((practitioner) => (
            <article key={practitioner.id} className="rounded-2xl border border-border bg-background p-3 shadow-sm">
              <p className="font-medium">{practitioner.full_name}</p>
              <p className="text-xs text-muted-foreground">{practitioner.email || "no-email"} • {practitioner.specialty || "General"} • {practitioner.role}</p>
              <p className={"text-xs mt-1 " + (practitioner.active ? "text-success" : "text-muted-foreground")}>{practitioner.active ? "Active" : "Inactive"}</p>
            </article>
          ))}
          {!loading && filteredPractitioners.length === 0 ? <p className="text-sm text-muted-foreground">No telemedicine practitioners available for this session mode.</p> : null}
        </div>
      </section>

      <section className="rounded-3xl border border-border/70 bg-card/95 p-5 shadow-soft backdrop-blur">
        <h2 className="font-semibold mb-3">Telemedicine Artifacts</h2>
        {loadingError ? <p className="mb-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{loadingError}</p> : null}
        <div className="space-y-2">
          {artifacts.map((a) => (
            <article key={a.id} className="rounded-2xl border border-border bg-background p-3 shadow-sm">
              <p className="text-xs text-muted-foreground">Session: {a.session_id} • Patient: {a.patient_id}</p>
              <p className="text-sm mt-1"><span className="font-medium">Summary:</span> {a.summary || "--"}</p>
              <p className="text-sm mt-1"><span className="font-medium">Final diagnosis:</span> {a.final_diagnosis || "--"}</p>
              <p className="text-xs mt-1">Follow-up required: {a.follow_up_needed ? "Yes" : "No"}</p>
            </article>
          ))}
          {!loading && artifacts.length === 0 ? <p className="text-sm text-muted-foreground">No session artifacts yet.</p> : null}
        </div>
      </section>
    </div>
  );
}

function InRoomMediaControls() {
  const { localParticipant } = useLocalParticipant();
  const connectionState = useConnectionState();
  const isConnected = connectionState === "connected" || connectionState === "reconnecting" || connectionState === "signalReconnecting";
  const mediaCaptureSupported = typeof window !== "undefined" && Boolean(window.isSecureContext && window.navigator?.mediaDevices?.getUserMedia);
  const micEnabled = Boolean(localParticipant?.isMicrophoneEnabled);
  const cameraEnabled = Boolean(localParticipant?.isCameraEnabled);

  async function toggleMic() {
    if (!localParticipant) return;
    try {
      await localParticipant.setMicrophoneEnabled(!micEnabled);
    } catch {
      // Keep UI responsive even when local media toggling fails.
    }
  }

  async function toggleCamera() {
    if (!localParticipant) return;
    try {
      await localParticipant.setCameraEnabled(!cameraEnabled);
    } catch {
      // Keep UI responsive even when local media toggling fails.
    }
  }

  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-16 z-20 flex items-center justify-center gap-2 md:inset-x-auto md:bottom-4 md:left-4 md:justify-start">
      <button
        type="button"
        onClick={() => void toggleMic()}
        disabled={!isConnected || !mediaCaptureSupported}
        className="pointer-events-auto inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-background/95 px-4 py-2 text-sm font-medium backdrop-blur"
      >
        {micEnabled ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
        {micEnabled ? "Mic on" : "Mic off"}
      </button>
      <button
        type="button"
        onClick={() => void toggleCamera()}
        disabled={!isConnected || !mediaCaptureSupported}
        className="pointer-events-auto inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-background/95 px-4 py-2 text-sm font-medium backdrop-blur"
      >
        {cameraEnabled ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
        {cameraEnabled ? "Camera on" : "Camera off"}
      </button>
    </div>
  );
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
    <div className="relative h-full w-full p-0">
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
        <div className="flex h-full min-h-0 flex-col gap-2 md:flex-row">
          {participants.map((participant) => {
            const isFocused = activeFocusedId === participant.id;
            const hasFocused = Boolean(activeFocusedId);
            const cardClass = !hasFocused
              ? "md:flex-1"
              : isFocused
                ? "md:flex-[3]"
                : "md:flex-1 md:max-w-[34%]";

            return (
              <section key={participant.id} className={`flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 ${cardClass}`}>
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
                <div className="h-full w-full p-0.5">
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
  roomMode,
  onVideoRuntimeIssue,
}: {
  roomMode: "video" | "audio";
  onVideoRuntimeIssue: (message: string) => void;
}) {
  const connectionState = useConnectionState();
  const isConnected = connectionState === "connected" || connectionState === "reconnecting" || connectionState === "signalReconnecting";

  return (
    <div className="relative flex h-full min-h-88 w-full flex-col bg-slate-950">
      <div className="absolute left-3 top-3 z-20 flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-slate-950/80 px-3 py-2 text-[11px] text-slate-100 backdrop-blur">
        <span className="rounded-full bg-white/10 px-2 py-0.5 uppercase tracking-[0.2em] text-slate-200">{connectionState}</span>
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-slate-300">{roomMode === "video" ? "Video" : "Audio"}</span>
      </div>
      <div className="relative flex h-full min-h-0 flex-1 items-stretch justify-stretch">
        {roomMode === "audio" ? (
          <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-slate-200">
            Audio mode is active. Voice is connected and camera video is disabled.
          </div>
        ) : isConnected ? (
          <VideoConferenceBoundary onError={() => {
            onVideoRuntimeIssue("Video UI recovered from an internal layout error. Reconnect if tiles look stale.");
          }}>
            <ParticipantGridView />
          </VideoConferenceBoundary>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center text-slate-200">
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">{connectionState === "disconnected" ? "Waiting for room connection" : "Connecting to room..."}</div>
            <p className="max-w-md text-sm text-slate-400">The room will stay on its own page while the call connects.</p>
          </div>
        )}
      </div>
      <RoomAudioRenderer />
      <ConnectionStateToast />
      <InRoomMediaControls />
    </div>
  );
}