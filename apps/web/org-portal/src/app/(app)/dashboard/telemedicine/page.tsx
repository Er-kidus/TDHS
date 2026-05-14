"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Video } from "lucide-react";
import { LiveKitRoom } from "@livekit/components-react";
import Link from "next/link";
import {
  Artifact,
  TelemedicineMessage,
} from "./types";
import {
  buildAiDraftSummary,
  buildDoctorNotes,
  buildTranscript,
  normalizeLiveKitServerUrl,
  parseSymptoms,
  stripLiveKitProxyPath,
} from "./utils";
import {
  readJsonResponse,
  getErrorMessage,
} from "./api";
import {
  useTelemedicineData,
  useTranscript,
  useSpeechRecognition,
} from "./hooks";
import { CallStage } from "./components";
import { TelemedicineArtifactCard } from "@/components/telemedicine/TelemedicineArtifactCard";
import { TelemedicineFeatureModal } from "@/components/telemedicine/TelemedicineFeatureModal";
import { TelemedicineQueuePreviewCard } from "@/components/telemedicine/TelemedicineQueuePreviewCard";
import { TelemedicineStatCard } from "@/components/telemedicine/TelemedicineStatCard";

export default function TelemedicinePage() {
  // =============================================
  // DATA HOOKS
  // =============================================
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { doctors, orgUsers, queueSessions, patients, artifacts, messages, orgMe, loadData, setMessages } = useTelemedicineData();

  const { transcriptLines, addTranscriptLine, setTranscriptLines } =
    useTranscript();

  const { stop: stopScribe } =
    useSpeechRecognition(
      (text) => addTranscriptLine("Clinician", text, "voice"),
      () => {}
    );

  // =============================================
  // STATE VARIABLES (in logical groups)
  // =============================================
  
  // Session & Room Control
  const [sessionId, setSessionId] = useState("");
  const [displayName, setDisplayName] = useState("Clinician");
  const [serverUrl, setServerUrl] = useState("");
  const [roomName, setRoomName] = useState("");
  const [token, setToken] = useState("");
  const [joinRequested, setJoinRequested] = useState(false);
  const [roomMode, setRoomMode] = useState<"video" | "audio">("video");
  const [roomMountVersion, setRoomMountVersion] = useState(0);

  // Session Content
  const [roomNotes, setRoomNotes] = useState("");
  const [symptomsInput, setSymptomsInput] = useState("");
  const [possibleSolutions, setPossibleSolutions] = useState("");

  // UI State
  const [featureTab, setFeatureTab] = useState<"ai" | "chart" | "notes" | "chat">("ai");
  const [featurePanelOpen, setFeaturePanelOpen] = useState(true);

  // Status & Loading
  const [roomStatus, setRoomStatus] = useState("");
  const [videoRuntimeIssue, setVideoRuntimeIssue] = useState("");
  const [isFetchingToken, setIsFetchingToken] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Chat
  const [chatInput, setChatInput] = useState("");
  const [roomArtifacts, setRoomArtifacts] = useState<Artifact[]>([]);

  // =============================================
  // DERIVED VALUES (useMemo - must be before callbacks)
  // =============================================

  const resolvedRoomName = sessionId
    ? `telemedicine-${sessionId}`
    : "";

  const roomInstanceKey = `${resolvedRoomName}:${roomMode}:${roomMountVersion}:${token.slice(
    0,
    16
  )}`;

  const chatChannel = sessionId.trim()
    ? `telemedicine:${sessionId.trim()}`
    : "";

  const patientLookup = useMemo(
    () => new Map(patients.map((p) => [p.id, p])),
    [patients]
  );

  // Practitioners list available for future use
  // const practitioners = useMemo(() => {
  //   const out: Practitioner[] = [];
  //   const seen = new Set<string>();
  //   // ... practitioner building logic
  //   return out;
  // }, [doctors, orgUsers]);

  const telemedicineQueue = useMemo(
    () =>
      queueSessions
        .filter(
          (item) =>
            item.status === "pending" ||
            item.status === "accepted" ||
            item.status === "in_progress"
        )
        .sort(
          (a, b) =>
            new Date(a.scheduled_at).getTime() -
            new Date(b.scheduled_at).getTime()
        ),
    [queueSessions]
  );

  const selectedQueueSession = useMemo(
    () =>
      telemedicineQueue.find((item) => item.id === sessionId) || null,
    [sessionId, telemedicineQueue]
  );

  const selectedPatientName = useMemo(() => {
    if (!selectedQueueSession?.patient_id) return "";
    return (
      patientLookup.get(selectedQueueSession.patient_id)
        ?.full_name || selectedQueueSession.patient_id
    );
  }, [patientLookup, selectedQueueSession]);

  const humanRoomName = useMemo(() => {
    if (!sessionId.trim()) return "Telemedicine Room";
    const shortId = sessionId.trim().slice(0, 8).toUpperCase();
    return `Telemedicine Room ${shortId}`;
  }, [sessionId]);

  const aiDraftSummary = useMemo(
    () =>
      buildAiDraftSummary(roomNotes, symptomsInput, possibleSolutions),
    [roomNotes, symptomsInput, possibleSolutions]
  );

  // =============================================
  // CALLBACKS (must be after all state & memo)
  // =============================================

  const fetchRoomToken = useCallback(
    async (
      explicitSessionId?: string,
      explicitMode?: "video" | "audio"
    ) => {
      const currentSessionId = (
        explicitSessionId || sessionId
      ).trim();

      if (!currentSessionId) {
        setRoomStatus(
          "A session id is required before joining telemedicine."
        );
        return;
      }

      setIsFetchingToken(true);
      setRoomStatus("");
      setVideoRuntimeIssue("");

      try {
        const nextRoomName = `telemedicine-${currentSessionId}`;

        const res = await fetch(
          "/api/org/telemedicine/livekit/token",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              session_id: currentSessionId,
              room_name: nextRoomName,
              display_name: displayName.trim() || "Clinician",
              role: "doctor",
            }),
          }
        );

        const payload = await readJsonResponse(res);

        if (!res.ok)
          throw new Error(
            getErrorMessage(payload, "Unable to join telemedicine room")
          );

        if (payload && typeof payload === "object") {
          const nextToken =
            typeof payload.token === "string" ? payload.token : "";

          if (!nextToken) {
            throw new Error("LiveKit token is missing from token response");
          }

          const nextServerUrl =
            typeof payload.url === "string"
              ? payload.url
              : typeof payload.serverUrl === "string"
                ? payload.serverUrl
                : "";

          const nextResolvedRoomName =
            typeof payload.room_name === "string"
              ? payload.room_name
              : typeof payload.roomName === "string"
                ? payload.roomName
                : nextRoomName;

          const normalizedServerUrl = stripLiveKitProxyPath(
            normalizeLiveKitServerUrl(nextServerUrl)
          );

          if (!normalizedServerUrl) {
            throw new Error("LiveKit server URL is missing from token response");
          }

          if (
            typeof window !== "undefined" &&
            window.location.protocol === "https:" &&
            normalizedServerUrl.startsWith("ws://")
          ) {
            throw new Error(
              "LiveKit requires a secure wss URL when the portal is opened over HTTPS."
            );
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
        setRoomStatus(
          error instanceof Error
            ? error.message
            : "Unable to join telemedicine room"
        );
      } finally {
        setIsFetchingToken(false);
      }
    },
    [sessionId, displayName]
  );

  // =============================================
  // EFFECTS (must be after all hooks)
  // =============================================

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const fromQuery = (
      params.get("session_id") || params.get("sessionId") || ""
    ).trim();
    if (!fromQuery) return;
    setSessionId(fromQuery);
    setRoomName(`telemedicine-${fromQuery}`);
  }, []);

  useEffect(() => {
    setRoomName(resolvedRoomName);
  }, [resolvedRoomName]);

  useEffect(() => {
    void loadData();
  }, [loadData]);



  useEffect(() => {
    setRoomArtifacts(
      artifacts.filter(
        (artifact) => artifact.session_id === sessionId
      )
    );
  }, [artifacts, sessionId]);

  useEffect(() => {
    void loadTranscriptLines(sessionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  useEffect(() => {
    if (!chatChannel) {
      setMessages([]);
      return;
    }
    void loadMessages(chatChannel).catch((error) => {
      setRoomStatus(
        error instanceof Error
          ? error.message
          : "Unable to load chat"
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatChannel]);

  useEffect(() => {
    return () => {
      stopScribe();
    };
  }, [stopScribe]);

  // =============================================
  // HELPER FUNCTIONS
  // =============================================

  async function loadTranscriptLines(nextSessionId: string) {
    const trimmed = nextSessionId.trim();
    if (!trimmed) {
      setTranscriptLines([]);
      return;
    }

    try {
      const response = await fetch(
        `/api/org/telemedicine/sessions/${encodeURIComponent(
          trimmed
        )}/transcript-lines?limit=500`,
        { cache: "no-store" }
      );

      if (!response.ok) return;

      const payload = await response.json().catch(() => []);
      if (!Array.isArray(payload)) return;

      setTranscriptLines(
        payload
          .map((item) => {
            const source: "voice" | "manual" =
              item.source === "voice" ? "voice" : "manual";
            return {
              id:
                typeof item.id === "string"
                  ? item.id
                  : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
              speaker: "Unknown",
              text:
                typeof item.content === "string"
                  ? item.content
                  : "",
              source,
              createdAt:
                typeof item.occurred_at === "string"
                  ? item.occurred_at
                  : new Date().toISOString(),
            };
          })
          .filter((item) => item.text.trim())
      );
    } catch {
      // Transcript persistence is optional
    }
  }

  function safeReconfigureRoom(statusMessage: string) {
    setJoinRequested(false);
    setToken("");
    setServerUrl("");
    setRoomMountVersion((value) => value + 1);
    setVideoRuntimeIssue("");
    setRoomStatus(statusMessage);
  }

  async function loadMessages(channel: string) {
    if (!channel) {
      setMessages([]);
      return;
    }

    const res = await fetch(
      `/api/org/messages?limit=100&channel=${encodeURIComponent(channel)}`,
      { cache: "no-store" }
    );

    const payload = await readJsonResponse(res);

    if (!res.ok) {
      throw new Error(
        getErrorMessage(payload, "Unable to load chat")
      );
    }

    setMessages(
      Array.isArray(payload)
        ? (payload as TelemedicineMessage[])
        : []
    );
  }

  async function sendChatMessage() {
    const text = chatInput.trim();
    if (!text || !chatChannel) return;

    setIsSendingMessage(true);

    try {
      const res = await fetch("/api/org/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender:
            displayName.trim() || orgMe?.email || "Practitioner",
          channel: chatChannel,
          content: text,
        }),
      });

      const payload = await readJsonResponse(res);

      if (!res.ok) {
        throw new Error(
          getErrorMessage(payload, "Unable to send message")
        );
      }

      setChatInput("");
      await loadMessages(chatChannel);
    } catch (error) {
      setRoomStatus(
        error instanceof Error
          ? error.message
          : "Unable to send message"
      );
    } finally {
      setIsSendingMessage(false);
    }
  }

  async function saveSessionSummary() {
    if (!sessionId.trim()) {
      setRoomStatus(
        "A session id is required before saving a summary."
      );
      return;
    }

    // setIsSavingSummary(true);
    setRoomStatus("");

    try {
      const transcript = buildTranscript(transcriptLines, roomNotes);
      const symptoms = parseSymptoms(symptomsInput);
      const doctorNotes = buildDoctorNotes(roomNotes, possibleSolutions);

      const res = await fetch(
        `/api/org/telemedicine/sessions/${encodeURIComponent(
          sessionId.trim()
        )}/summary`,
        {
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
        }
      );

      const payload = await readJsonResponse(res);

      if (!res.ok)
        throw new Error(
          getErrorMessage(payload, "Unable to save session summary")
        );

      setRoomStatus("Session summary saved.");
      await loadData();
    } catch (error) {
      setRoomStatus(
        error instanceof Error
          ? error.message
          : "Unable to save session summary"
      );
    } finally {
      // setIsSavingSummary(false);
    }
  }

  // =============================================
  // RENDER
  // =============================================

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#04070f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.16),transparent_28%),linear-gradient(180deg,rgba(3,7,18,0.92),rgba(3,7,18,1))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_50%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-4 p-4 md:p-6">
        <header className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-4 shadow-2xl backdrop-blur md:flex-row md:items-center md:justify-between md:px-6">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-200/70">
              Telemedicine workspace
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Join a live session and save the encounter summary
            </h1>
            <p className="max-w-2xl text-sm text-slate-300">
              Use LiveKit for video or audio-only consults, keep notes beside
              the call, and persist the summary when complete.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs text-slate-200">
              {roomMode}
            </span>
            <Link
              href="/dashboard/telemedicine/queue"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white transition hover:bg-slate-900"
            >
              Queue
            </Link>
            <Link
              href="/dashboard/telemedicine/profile"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-white transition hover:bg-slate-900"
            >
              Profile
            </Link>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <TelemedicineStatCard
            label="Connection"
            value={joinRequested ? "Ready" : "Standby"}
            tone="accent"
          />
          <TelemedicineStatCard
            label="Queue"
            value={`${telemedicineQueue.length}`}
          />
          <TelemedicineStatCard
            label="Artifacts"
            value={`${roomArtifacts.length}`}
            tone="success"
          />
        </div>

        {joinRequested && token && serverUrl ? (
          <div className="fixed inset-0 z-40 overflow-hidden bg-[#04070f]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.16),transparent_28%),linear-gradient(180deg,rgba(3,7,18,0.92),rgba(3,7,18,1))]" />
            <div className="relative flex h-full min-h-screen flex-col">
              <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-slate-950/80 px-4 py-3 text-white backdrop-blur">
                <h2 className="text-sm font-semibold">{humanRoomName}</h2>
                <button
                  type="button"
                  onClick={() =>
                    safeReconfigureRoom("Session ended")
                  }
                  className="rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-100 hover:bg-rose-500/20"
                >
                  End
                </button>
              </header>

              <div className="relative flex flex-1 overflow-hidden">
                {roomName && token && serverUrl ? (
                  <LiveKitRoom
                    key={roomInstanceKey}
                    serverUrl={serverUrl}
                    token={token}
                    connect={true}
                    audio={true}
                    video={roomMode === "video"}
                  >
                    <CallStage
                      roomMode={roomMode}
                      onVideoRuntimeIssue={setVideoRuntimeIssue}
                    />
                  </LiveKitRoom>
                ) : null}
              </div>

              <TelemedicineFeatureModal
                open={featurePanelOpen}
                activeTab={featureTab}
                onTabChange={setFeatureTab}
                onClose={() => setFeaturePanelOpen(false)}
                patientName={selectedPatientName || "Unknown"}
                sessionId={sessionId || roomName}
                roomMode={roomMode}
                queueCount={telemedicineQueue.length}
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
                onEndRoom={() => safeReconfigureRoom("Session ended")}
                messages={messages}
                chatInput={chatInput}
                onChatInputChange={setChatInput}
                onRefreshChat={() => void loadMessages(chatChannel)}
                onSendChatMessage={() => void sendChatMessage()}
                isSendingMessage={isSendingMessage}
              />
            </div>
          </div>
        ) : (
          <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_400px]">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Join Session
                  </h2>
                  <p className="text-sm text-slate-300">
                    Enter session ID to start
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRoomMode("video")}
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
                    onClick={() => setRoomMode("audio")}
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
                    onChange={(e) => {
                      setSessionId(e.target.value);
                      setRoomName(
                        e.target.value
                          ? `telemedicine-${e.target.value}`
                          : ""
                      );
                    }}
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
                      onChange={(e) =>
                        setDisplayName(e.target.value)
                      }
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
                  onClick={() => void fetchRoomToken()}
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
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/40 resize-none min-h-24"
                    value={roomNotes}
                    onChange={(e) =>
                      setRoomNotes(e.target.value)
                    }
                    placeholder="Session notes..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-300">
                    Symptoms
                  </label>
                  <textarea
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/40 resize-none min-h-20"
                    value={symptomsInput}
                    onChange={(e) =>
                      setSymptomsInput(e.target.value)
                    }
                    placeholder="Comma separated..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-300">
                    Plan
                  </label>
                  <textarea
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/40 resize-none min-h-20"
                    value={possibleSolutions}
                    onChange={(e) =>
                      setPossibleSolutions(e.target.value)
                    }
                    placeholder="Treatment plan..."
                  />
                </div>
              </div>
            </section>

            <aside className="space-y-4">
              <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur">
                <h3 className="font-semibold text-white mb-3">
                  Queue ({telemedicineQueue.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {telemedicineQueue.map((item, i) => (
                    <TelemedicineQueuePreviewCard
                      key={item.id}
                      index={i}
                      patientName={
                        patientLookup.get(item.patient_id)
                          ?.full_name || item.patient_id
                      }
                      patientId={item.patient_id}
                      mode={item.preferred_mode || "video"}
                    />
                  ))}
                  {telemedicineQueue.length === 0 && (
                    <p className="text-sm text-slate-400">
                      No patients in queue
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur">
                <h3 className="font-semibold text-white mb-3">
                  Artifacts ({roomArtifacts.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {roomArtifacts.slice(0, 3).map((a) => (
                    <TelemedicineArtifactCard
                      key={a.id}
                      sessionId={a.session_id}
                      patientId={a.patient_id}
                      summary={a.summary}
                      diagnosis={a.final_diagnosis}
                      followUpNeeded={a.follow_up_needed}
                    />
                  ))}
                  {roomArtifacts.length === 0 && (
                    <p className="text-sm text-slate-400">
                      No artifacts yet
                    </p>
                  )}
                </div>
              </section>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
