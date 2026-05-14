"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Video } from "lucide-react";
import { LiveKitRoom } from "@livekit/components-react";
import Link from "next/link";
import {
  QueueSession,
  Artifact,
  TelemedicineMessage,
  Practitioner,
} from "./types";
import {
  buildAiDraftSummary,
  buildDoctorNotes,
  buildTranscript,
  isPrivateOrLoopbackHost,
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
  const {
    doctors,
    orgUsers,
    queueSessions,
    patients,
    artifacts,
    messages,
    loading,
    orgMe,
    loadData,
    setMessages,
  } = useTelemedicineData();

  const { transcriptLines, addTranscriptLine, setTranscriptLines } =
    useTranscript();

  const [sessionId, setSessionId] = useState("");
  const [displayName, setDisplayName] = useState(
    "Clinician"
  );
  const [serverUrl, setServerUrl] = useState("");
  const [roomName, setRoomName] = useState("");
  const [token, setToken] = useState("");
  const [joinRequested, setJoinRequested] = useState(
    false
  );
  const [roomNotes, setRoomNotes] = useState("");
  const [roomMode, setRoomMode] = useState<
    "video" | "audio"
  >("video");
  const [featureTab, setFeatureTab] = useState<
    "ai" | "chart" | "notes" | "chat"
  >("ai");
  const [featurePanelOpen, setFeaturePanelOpen] =
    useState(true);
  const [roomStatus, setRoomStatus] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [roomArtifacts, setRoomArtifacts] = useState<
    Artifact[]
  >([]);
  const [isFetchingToken, setIsFetchingToken] =
    useState(false);
  const [isSavingSummary, setIsSavingSummary] =
    useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _isSavingSummaryMemo = isSavingSummary;
  const [isSendingMessage, setIsSendingMessage] =
    useState(false);
  const [symptomsInput, setSymptomsInput] = useState(
    ""
  );
  const [possibleSolutions, setPossibleSolutions] =
    useState("");
  const [speakerLabel, setSpeakerLabel] = useState(
    "Clinician"
  );
  // Unused values kept for future features
  const _manualTranscript = manualTranscript;
  const [roomMountVersion, setRoomMountVersion] =
    useState(0);
  const [videoRuntimeIssue, setVideoRuntimeIssue] =
    useState("");

  const autoJoinAttemptedRef = useRef(false);

  // Speech recognition hook
  const { stop: stopScribe } =
    useSpeechRecognition(
      (text) => addTranscriptLine(speakerLabel, text, "voice"),
      setRoomStatus
    );

  // Computed values
  const resolvedRoomName = sessionId
    ? `telemedicine-${sessionId}`
    : "";

  const roomInstanceKey = `${resolvedRoomName}:${roomMode}:${roomMountVersion}:${token.slice(
    0,
    16
  )}`;

  // Local network base URL for future expansion
  // const localNetworkBaseUrl = useMemo(() => {
    const configured = (
      process.env.NEXT_PUBLIC_LOCAL_NETWORK_ORIGIN ||
      ""
    ).trim();

    if (configured) {
      return configured.replace(/\/+$/, "");
    }

    if (typeof window === "undefined") {
      return "";
    }

  // }, []);
  // Placeholder for future local network support
  const localNetworkBaseUrl = "";

  // Local network room URL for future use
  // const localNetworkRoomUrl = useMemo(() => {
  //   if (!localNetworkBaseUrl) return "";
  //   const suffix = sessionId
  //     ? `?session_id=${encodeURIComponent(sessionId)}`
  //     : "";
  //   return `${localNetworkBaseUrl}/dashboard/telemedicine${suffix}`;
  // }, [localNetworkBaseUrl, sessionId]);

  const chatChannel = sessionId.trim()
    ? `telemedicine:${sessionId.trim()}`
    : "";

  const patientLookup = useMemo(
    () => new Map(patients.map((p) => [p.id, p])),
    [patients]
  );

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
        telemedicineModes: [
          "video",
          "voice",
          "chat",
        ],
      });
    }

    for (const user of orgUsers) {
      const role = (user.role || "").toLowerCase();

      if (role !== "doctor" && role !== "nurse")
        continue;

      const key = `${user.email || user.full_name}`.toLowerCase();

      if (seen.has(key)) continue;

      seen.add(key);
      out.push({
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        specialty:
          role === "nurse"
            ? "Nursing"
            : "Doctor",
        role,
        active: user.active !== false,
        source: "org_users",
        telemedicineEnabled:
          user.telemedicine_enabled !== false,
        telemedicineModes:
          user.telemedicine_modes ||
          ["video", "voice"],
      });
    }

    return out;
  }, [doctors, orgUsers]);

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
      telemedicineQueue.find(
        (item) => item.id === sessionId
      ) || null,
    [sessionId, telemedicineQueue]
  );

  const selectedPatientName = useMemo(() => {
    if (!selectedQueueSession?.patient_id) return "";

    return (
      patientLookup.get(selectedQueueSession.patient_id)
        ?.full_name ||
      selectedQueueSession.patient_id
    );
  }, [patientLookup, selectedQueueSession]);

  // Filtered practitioners for future feature display
  // Currently using simplified practitioner list
  useMemo(() => {
    const requiredMode =
      selectedQueueSession?.preferred_mode;
    const telemedicineEnabled = practitioners.filter(
      (p) => p.active && p.telemedicineEnabled
    );
    const compatible = telemedicineEnabled.filter(
      (p) => {
        if (!p.active || !p.telemedicineEnabled)
          return false;

        if (!requiredMode) return true;

        if (requiredMode === "voice")
          return (
            p.telemedicineModes.includes("voice") ||
            p.telemedicineModes.includes("audio")
          );

        return p.telemedicineModes.includes(
          requiredMode
        );
      }
    );

    return compatible.length > 0
      ? compatible
      : telemedicineEnabled;
  }, [
    practitioners,
    selectedQueueSession,
  ]);

  const humanRoomName = useMemo(() => {
    if (!sessionId.trim())
      return "Telemedicine Room";

    const shortId = sessionId
      .trim()
      .slice(0, 8)
      .toUpperCase();

    return `Telemedicine Room ${shortId}`;
  }, [sessionId]);

  const aiDraftSummary = useMemo(
    () =>
      buildAiDraftSummary(
        roomNotes,
        symptomsInput,
        possibleSolutions
      ),
    [roomNotes, symptomsInput, possibleSolutions]
  );

  // Effects
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(
      window.location.search
    );
    const fromQuery = (
      params.get("session_id") ||
      params.get("sessionId") ||
      ""
    ).trim();

    if (!fromQuery) return;

    setSessionId(fromQuery);
    setRoomName(`telemedicine-${fromQuery}`);
  }, []);

  useEffect(() => {
    setRoomName(resolvedRoomName);
  }, [resolvedRoomName]);

  useEffect(() => {
    if (
      !sessionId.trim() ||
      joinRequested ||
      token
    ) {
      return;
    }

    void fetchRoomToken();
  }, [sessionId, token, joinRequested, fetchRoomToken]);

  useEffect(() => {
    setSpeakerLabel(displayName || "Clinician");
  }, [displayName]);

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

  // Handlers
  async function loadTranscriptLines(
    nextSessionId: string
  ) {
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

      const payload = await response
        .json()
        .catch(() => []);

      if (!Array.isArray(payload)) return;

      setTranscriptLines(
        payload
          .map((item) => {
            const source: "voice" | "manual" =
              item.source === "voice"
                ? "voice"
                : "manual";

            return {
              id:
                typeof item.id === "string"
                  ? item.id
                  : `${Date.now()}-${Math.random()
                      .toString(36)
                      .slice(2)}`,
              speaker: "Unknown",
              text:
                typeof item.content === "string"
                  ? item.content
                  : "",
              source,
              createdAt:
                typeof item.occurred_at ===
                "string"
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function persistTranscriptLine(
    sessionIdValue: string,
    line: {
      id: string;
      speaker: string;
      text: string;
      source: "voice" | "manual";
      createdAt: string;
    }
  ) {
    const trimmed = sessionIdValue.trim();

    if (!trimmed) return;

    try {
      await fetch(
        `/api/org/telemedicine/sessions/${encodeURIComponent(
          trimmed
        )}/transcript-lines`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            speaker: line.speaker,
            source: line.source,
            content: line.text,
            occurred_at: line.createdAt,
          }),
        }
      );
    } catch {
      // Keep local transcript lines
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
      `/api/org/messages?limit=100&channel=${encodeURIComponent(
        channel
      )}`,
      { cache: "no-store" }
    );

    const payload = await readJsonResponse(res);

    if (!res.ok) {
      throw new Error(
        getErrorMessage(
          payload,
          "Unable to load chat"
        )
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender:
            displayName.trim() ||
            orgMe?.email ||
            "Practitioner",
          channel: chatChannel,
          content: text,
        }),
      });

      const payload =
        await readJsonResponse(res);

      if (!res.ok) {
        throw new Error(
          getErrorMessage(
            payload,
            "Unable to send message"
          )
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

      // Mode is handled via setRoomMode if explicit, otherwise uses roomMode

      setIsFetchingToken(true);
      setRoomStatus("");
      setVideoRuntimeIssue("");

      try {
        const nextRoomName = `telemedicine-${currentSessionId}`;

        const res = await fetch(
          "/api/org/telemedicine/livekit/token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              session_id: currentSessionId,
              room_name: nextRoomName,
              display_name:
                displayName.trim() || "Clinician",
              role: "doctor",
            }),
          }
        );

        const payload =
          await readJsonResponse(res);

        if (!res.ok)
          throw new Error(
            getErrorMessage(
              payload,
              "Unable to join telemedicine room"
            )
          );

        if (
          payload &&
          typeof payload === "object"
        ) {
          const nextToken =
            typeof payload.token === "string"
              ? payload.token
              : "";

          if (!nextToken) {
            throw new Error(
              "LiveKit token is missing from token response"
            );
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

          const normalizedServerUrl =
            stripLiveKitProxyPath(
              normalizeLiveKitServerUrl(nextServerUrl)
            );

          if (!normalizedServerUrl) {
            throw new Error(
              "LiveKit server URL is missing from token response"
            );
          }

          if (
            typeof window !== "undefined" &&
            window.location.protocol === "https:" &&
            normalizedServerUrl.startsWith("ws://")
          ) {
            throw new Error(
              "LiveKit requires a secure wss URL when the portal is opened over HTTPS. Set LIVEKIT_PUBLIC_URL to your LiveKit Cloud wss URL (or a secure tunnel URL)."
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
          throw new Error(
            "Invalid LiveKit token response"
          );
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function acceptQueueSession(
    queueItem: QueueSession
  ) {
    setRoomStatus("");

    try {
      const response = await fetch(
        "/api/org/telemedicine/queue/accept",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: queueItem.id,
          }),
        }
      );

      const payload =
        await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            payload,
            "Unable to accept queue request"
          )
        );
      }

      const preferredMode =
        queueItem.preferred_mode === "voice"
          ? "audio"
          : "video";

      setSessionId(queueItem.id);
      setRoomMode(preferredMode);

      await fetchRoomToken(
        queueItem.id,
        preferredMode
      );
      await loadData();
    } catch (error) {
      setRoomStatus(
        error instanceof Error
          ? error.message
          : "Unable to accept queue request"
      );
    }
  }

  async function saveSessionSummary() {
    if (!sessionId.trim()) {
      setRoomStatus(
        "A session id is required before saving a summary."
      );
      return;
    }

    setIsSavingSummary(true);
    setRoomStatus("");

    try {
      const transcript = buildTranscript(
        transcriptLines,
        roomNotes
      );
      const symptoms = parseSymptoms(symptomsInput);
      const doctorNotes = buildDoctorNotes(
        roomNotes,
        possibleSolutions
      );

      const res = await fetch(
        `/api/org/telemedicine/sessions/${encodeURIComponent(
          sessionId.trim()
        )}/summary`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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

      const payload =
        await readJsonResponse(res);

      if (!res.ok)
        throw new Error(
          getErrorMessage(
            payload,
            "Unable to save session summary"
          )
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
      setIsSavingSummary(false);
    }
  }

  // Render
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
              Join a live session and save the
              encounter summary
            </h1>
            <p className="max-w-2xl text-sm text-slate-300">
              Use LiveKit for video or
              audio-only consults, keep notes
              beside the call, and persist the
              summary when the encounter is
              complete.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs text-slate-200">
              Mode {roomMode}
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
            value={joinRequested ? "Room ready" : "Awaiting token"}
            tone="accent"
          />
          <TelemedicineStatCard
            label="Queue"
            value={`${queueSessions.length} sessions`}
          />
          <TelemedicineStatCard
            label="Artifacts"
            value={`${roomArtifacts.length} saved`}
            tone="success"
          />
        </div>

        {joinRequested && token && serverUrl ? (
          <div className="fixed inset-0 z-40 overflow-hidden bg-[#04070f]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.16),transparent_28%),linear-gradient(180deg,rgba(3,7,18,0.92),rgba(3,7,18,1))]" />
            <div className="relative flex h-full min-h-screen flex-col">
              <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-slate-950/80 px-4 py-3 text-white backdrop-blur">
                <h2 className="text-sm font-semibold">
                  {humanRoomName}
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    safeReconfigureRoom("Room closed.")
                  }
                  className="rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-100 transition hover:bg-rose-500/20"
                >
                  End session
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
                      onVideoRuntimeIssue={
                        setVideoRuntimeIssue
                      }
                    />
                  </LiveKitRoom>
                ) : null}
              </div>

              <TelemedicineFeatureModal
                open={featurePanelOpen}
                activeTab={featureTab}
                onTabChange={setFeatureTab}
                onClose={() =>
                  setFeaturePanelOpen(false)
                }
                patientName={
                  selectedPatientName || "Unknown"
                }
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
                onPossibleSolutionsChange={
                  setPossibleSolutions
                }
                draftSummary={aiDraftSummary}
                onEditSummary={() =>
                  setFeatureTab("notes")
                }
                onAcceptSummary={() =>
                  void saveSessionSummary()
                }
                onSaveSummary={() =>
                  void saveSessionSummary()
                }
                onEndRoom={() =>
                  safeReconfigureRoom("Room closed.")
                }
                messages={messages}
                chatInput={chatInput}
                onChatInputChange={setChatInput}
                onRefreshChat={() =>
                  void loadMessages(chatChannel)
                }
                onSendChatMessage={() =>
                  void sendChatMessage()
                }
                isSendingMessage={isSendingMessage}
              />
            </div>
          </div>
        ) : (
          <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_400px]">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-white">
                    Ready to join?
                  </h2>
                  <p className="text-sm text-slate-300">
                    Select mode and enter session
                    ID to start
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRoomMode("video");

                      if (joinRequested)
                        setRoomMountVersion(
                          (value) => value + 1
                        );
                    }}
                    className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                      roomMode === "video"
                        ? "bg-cyan-500 text-slate-950"
                        : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    <Video className="mr-2 inline-block h-4 w-4" />
                    Video
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRoomMode("audio");

                      if (joinRequested)
                        setRoomMountVersion(
                          (value) => value + 1
                        );
                    }}
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

              <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-300">
                      Session ID
                    </label>
                    <input
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-500/40 placeholder:text-slate-500"
                      value={sessionId}
                      onChange={(event) => {
                        const value =
                          event.target.value;

                        setSessionId(value);
                        setRoomName(
                          value
                            ? `telemedicine-${value}`
                            : ""
                        );
                      }}
                      placeholder="Paste a telemedicine session id"
                    />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase tracking-wide text-slate-300">
                        Display name
                      </label>
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-500/40 placeholder:text-slate-500"
                        value={displayName}
                        onChange={(event) =>
                          setDisplayName(
                            event.target.value
                          )
                        }
                        placeholder="Clinician"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase tracking-wide text-slate-300">
                        Room name
                      </label>
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-400"
                        value={
                          roomName ||
                          "Auto-generated from session id"
                        }
                        title="Auto-generated room name"
                        placeholder="Auto-generated from session id"
                        readOnly
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      void fetchRoomToken()
                    }
                    disabled={isFetchingToken}
                    className="w-full rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
                  >
                    {isFetchingToken
                      ? "Fetching token..."
                      : "Join room"}
                  </button>

                  {roomStatus && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                      {roomStatus}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-300">
                      Session notes
                    </label>
                    <textarea
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-500/40 placeholder:text-slate-500 resize-none min-h-20"
                      value={roomNotes}
                      onChange={(event) =>
                        setRoomNotes(
                          event.target.value
                        )
                      }
                      placeholder="Symptoms, findings, plan..."
                    />
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-300">
                      Symptoms (comma separated)
                    </label>
                    <textarea
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-500/40 placeholder:text-slate-500 resize-none min-h-16"
                      value={symptomsInput}
                      onChange={(event) =>
                        setSymptomsInput(
                          event.target.value
                        )
                      }
                      placeholder="fever, fatigue, pain"
                    />
                  </div>
                </div>
              </div>
            </section>

            <aside className="space-y-4">
              <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur">
                <h3 className="font-semibold text-white mb-3">
                  Telemedicine Queue
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {telemedicineQueue.map(
                    (item, index) => (
                      <TelemedicineQueuePreviewCard
                        key={item.id}
                        index={index}
                        patientName={
                          patientLookup.get(
                            item.patient_id
                          )?.full_name || item.patient_id
                        }
                        patientId={item.patient_id}
                        mode={item.preferred_mode || "video"}
                      />
                    )
                  )}
                  {!loading &&
                    telemedicineQueue.length ===
                      0 && (
                      <p className="text-sm text-slate-400">
                        No patients waiting.
                      </p>
                    )}
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur">
                <h3 className="font-semibold text-white mb-3">
                  Recent Artifacts
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {roomArtifacts.length > 0
                    ? roomArtifacts
                        .slice(0, 3)
                        .map((artifact) => (
                          <TelemedicineArtifactCard
                            key={artifact.id}
                            sessionId={artifact.session_id}
                            patientId={artifact.patient_id}
                            summary={artifact.summary}
                            diagnosis={artifact.final_diagnosis}
                            followUpNeeded={artifact.follow_up_needed}
                          />
                        ))
                    : !loading && (
                        <p className="text-sm text-slate-400">
                          No artifacts yet.
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
