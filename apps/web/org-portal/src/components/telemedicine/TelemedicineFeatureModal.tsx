"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Loader2,
  MessageSquare,
  Mic,
  MicOff,
  NotebookPen,
  RefreshCw,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

type TelemedicineMessage = {
  id: string;
  sender: string;
  content: string;
  created_at?: string;
};

type FeatureTab = "ai" | "notes" | "chat";

type SpeechStatus = "unknown" | "checking" | "available" | "unavailable";

export type TelemedicineFeatureModalProps = {
  open: boolean;
  activeTab: FeatureTab;
  onTabChange: (tab: FeatureTab) => void;
  onClose: () => void;
  patientName: string;
  sessionId: string;
  roomMode: "video" | "audio";
  queueCount: number;
  artifactCount: number;
  roomStatus: string;
  videoRuntimeIssue: string;
  // Structured notes fields
  roomNotes: string;
  onRoomNotesChange: (v: string) => void;
  chiefComplaint: string;
  onChiefComplaintChange: (v: string) => void;
  symptomsInput: string;
  onSymptomsInputChange: (v: string) => void;
  currentMedications: string;
  onCurrentMedicationsChange: (v: string) => void;
  previousDiseases: string;
  onPreviousDiseasesChange: (v: string) => void;
  allergies: string;
  onAllergiesChange: (v: string) => void;
  clinicalImpressions: string;
  onClinicalImpressionsChange: (v: string) => void;
  possibleSolutions: string;
  onPossibleSolutionsChange: (v: string) => void;
  followUpRequired: boolean;
  onFollowUpRequiredChange: (v: boolean) => void;
  // AI
  draftSummary: string;
  onEditSummary: () => void;
  onAcceptSummary: () => void;
  onSaveSummary: () => void;
  // Session
  onEndRoom: () => void;
  // Chat
  messages: TelemedicineMessage[];
  chatInput: string;
  onChatInputChange: (v: string) => void;
  onRefreshChat: () => void;
  onSendChatMessage: () => void;
  isSendingMessage: boolean;
  // Speech
  speechAvailable?: boolean;
  isListening?: boolean;
  onStartScribe?: () => void;
  onStopScribe?: () => void;
};

// ── Helpers ────────────────────────────────────────────────────────────────

const tabCls = (active: boolean) =>
  `flex-1 rounded-2xl px-3 py-2 text-xs font-semibold transition whitespace-nowrap ${
    active
      ? "bg-slate-900 text-white shadow-sm"
      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
  }`;

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </label>
      {children}
    </div>
  );
}

const textareaCls =
  "w-full rounded-[16px] border border-white/10 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 resize-none";

const inputCls =
  "w-full rounded-[16px] border border-white/10 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20";

// ── Main Component ─────────────────────────────────────────────────────────

export function TelemedicineFeatureModal({
  open,
  activeTab,
  onTabChange,
  onClose,
  patientName,
  sessionId,
  roomMode,
  artifactCount,
  roomStatus,
  videoRuntimeIssue,
  roomNotes,
  onRoomNotesChange,
  chiefComplaint,
  onChiefComplaintChange,
  symptomsInput,
  onSymptomsInputChange,
  currentMedications,
  onCurrentMedicationsChange,
  previousDiseases,
  onPreviousDiseasesChange,
  allergies,
  onAllergiesChange,
  clinicalImpressions,
  onClinicalImpressionsChange,
  possibleSolutions,
  onPossibleSolutionsChange,
  followUpRequired,
  onFollowUpRequiredChange,
  draftSummary,
  onEditSummary,
  onAcceptSummary,
  onSaveSummary,
  onEndRoom,
  messages,
  chatInput,
  onChatInputChange,
  onRefreshChat,
  onSendChatMessage,
  isSendingMessage,
  speechAvailable = true,
  isListening = false,
  onStartScribe,
  onStopScribe,
}: TelemedicineFeatureModalProps) {
  // Gemini AI Summary state
  const [aiSummary, setAiSummary] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState("");

  // Chat auto-polling
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!open || activeTab !== "chat") return;
    pollingRef.current = setInterval(() => onRefreshChat(), 5000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [open, activeTab, onRefreshChat]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // ── Gemini AI Summary ──────────────────────────────────────────────────

  const generateAiSummary = useCallback(async () => {
    if (!sessionId.trim()) {
      setAiError("A session ID is required to generate a summary.");
      return;
    }
    setAiGenerating(true);
    setAiError("");
    try {
      const res = await fetch(
        `/api/org/telemedicine/sessions/${encodeURIComponent(sessionId)}/ai-summary`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patient_name: patientName,
            chief_complaint: chiefComplaint,
            symptoms: symptomsInput,
            current_medications: currentMedications,
            previous_diseases: previousDiseases,
            allergies,
            clinical_impressions: clinicalImpressions,
            treatment_plan: possibleSolutions,
            follow_up: followUpRequired,
            transcript: roomNotes,
          }),
        }
      );
      const payload = await res.json() as { summary?: string; error?: string };
      if (!res.ok) throw new Error(payload.error ?? "Unable to generate summary");
      setAiSummary(payload.summary ?? "");
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Unable to generate summary");
    } finally {
      setAiGenerating(false);
    }
  }, [
    sessionId, patientName, chiefComplaint, symptomsInput,
    currentMedications, previousDiseases, allergies,
    clinicalImpressions, possibleSolutions, followUpRequired, roomNotes,
  ]);

  if (!open) return null;

  const shortId = sessionId ? sessionId.slice(0, 8).toUpperCase() : "—";

  return (
    <aside className="fixed inset-x-3 bottom-3 top-20 z-40 mx-auto flex max-h-[calc(100vh-5.5rem)] w-[min(100vw-1.5rem,480px)] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[#0d1424] text-white shadow-[0_40px_120px_rgba(0,0,0,0.7)] backdrop-blur-xl md:bottom-6 md:right-6 md:left-auto md:top-6 md:h-[calc(100vh-3rem)] md:max-h-none md:w-[460px]">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-white/5 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-400">
            Consult Panel
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold text-white">
            {patientName || "Patient"} <span className="text-slate-400">· #{shortId}</span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {/* Speech status pill */}
          <div
            className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold sm:flex ${
              speechAvailable
                ? "bg-emerald-500/15 text-emerald-300"
                : "bg-amber-500/15 text-amber-300"
            }`}
          >
            {speechAvailable ? (
              <><Mic className="h-3 w-3" /> Voice active</>
            ) : (
              <><MicOff className="h-3 w-3" /> Voice off</>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Connection/status bar ────────────────────────────────────── */}
      {(roomStatus || videoRuntimeIssue) && (
        <div className={`flex-shrink-0 px-4 py-2 text-xs ${videoRuntimeIssue ? "bg-amber-500/10 text-amber-200" : "bg-sky-500/10 text-sky-200"}`}>
          {videoRuntimeIssue ? (
            <span className="flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" />{videoRuntimeIssue}</span>
          ) : roomStatus}
        </div>
      )}

      {/* ── Tab bar ─────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-b border-white/10 bg-white/[0.03] px-3 py-2.5">
        <div className="flex gap-1 rounded-2xl bg-white/5 p-1">
          <button type="button" onClick={() => onTabChange("ai")} className={tabCls(activeTab === "ai")}>
            <Sparkles className="mr-1 inline h-3.5 w-3.5" />AI
          </button>
          <button type="button" onClick={() => onTabChange("notes")} className={tabCls(activeTab === "notes")}>
            <NotebookPen className="mr-1 inline h-3.5 w-3.5" />Notes
          </button>
          <button type="button" onClick={() => onTabChange("chat")} className={tabCls(activeTab === "chat")}>
            <MessageSquare className="mr-1 inline h-3.5 w-3.5" />
            Chat
            {messages.length > 0 && (
              <span className="ml-1.5 rounded-full bg-cyan-500/20 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300">
                {messages.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Scrollable body ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {/* ─── AI Tab ──────────────────────────────────────────────── */}
        {activeTab === "ai" && (
          <div className="space-y-4 p-4">
            {/* Scribe toggle */}
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
              <div>
                <p className="text-sm font-semibold text-white">Voice Scribe</p>
                <p className="text-xs text-slate-400">
                  {speechAvailable
                    ? isListening ? "Recording…" : "Click to start recording"
                    : "Browser doesn't support voice recognition"}
                </p>
              </div>
              {speechAvailable ? (
                <button
                  type="button"
                  onClick={isListening ? onStopScribe : onStartScribe}
                  className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition ${
                    isListening
                      ? "bg-rose-600 text-white hover:bg-rose-700"
                      : "bg-cyan-600 text-white hover:bg-cyan-700"
                  }`}
                >
                  {isListening ? <><MicOff className="h-3.5 w-3.5" /> Stop</> : <><Mic className="h-3.5 w-3.5" /> Start</>}
                </button>
              ) : (
                <span className="rounded-full bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-300">
                  Unavailable
                </span>
              )}
            </div>

            {/* Transcript / notes used for summary */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Session Transcript / Notes</p>
              <textarea
                value={roomNotes}
                onChange={(e) => onRoomNotesChange(e.target.value)}
                className={`${textareaCls} min-h-24`}
                placeholder="Transcript will appear here as voice is recognized. You can also type manually…"
              />
            </div>

            {/* Generate AI Summary button */}
            <button
              type="button"
              onClick={() => void generateAiSummary()}
              disabled={aiGenerating}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-cyan-500 hover:to-blue-500 disabled:opacity-60"
            >
              {aiGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating with Gemini AI…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4" /> Generate SOAP Summary
                </span>
              )}
            </button>

            {aiError && (
              <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                {aiError}
              </p>
            )}

            {/* AI Summary output */}
            {aiSummary && (
              <div className="rounded-[20px] border border-cyan-500/20 bg-cyan-500/5 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="rounded-full bg-cyan-500/20 p-1.5 text-cyan-400">
                    <NotebookPen className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-sm font-semibold text-cyan-300">AI-Generated SOAP Summary</p>
                  <span className="ml-auto rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                    <CheckCircle2 className="mr-1 inline h-3 w-3" />Ready
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-200">{aiSummary}</p>
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={onEditSummary} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10">Edit in Notes</button>
                  <button type="button" onClick={onAcceptSummary} className="rounded-2xl bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-700">Save to Chart</button>
                </div>
              </div>
            )}

            {/* Fallback draft if no AI summary yet */}
            {!aiSummary && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Quick Draft</p>
                <p className="text-sm leading-relaxed text-slate-300">
                  {draftSummary || "Fill in the Notes form and click Generate to create an AI summary."}
                </p>
              </div>
            )}

            {/* Session metadata */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-slate-500">Mode</p>
                <p className="mt-1 font-semibold capitalize text-white">{roomMode}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-slate-500">Artifacts</p>
                <p className="mt-1 font-semibold text-white">{artifactCount}</p>
              </div>
            </div>
          </div>
        )}

        {/* ─── Notes Tab ───────────────────────────────────────────── */}
        {activeTab === "notes" && (
          <div className="space-y-4 p-4">
            {!speechAvailable && (
              <div className="flex items-start gap-2 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-200">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Voice transcription is unavailable. Use this form to collect patient information for the AI summary.
              </div>
            )}

            <Field label="Chief Complaint">
              <textarea
                value={chiefComplaint}
                onChange={(e) => onChiefComplaintChange(e.target.value)}
                className={`${textareaCls} min-h-16`}
                placeholder="What brings the patient in today?"
              />
            </Field>

            <Field label="Current Symptoms">
              <textarea
                value={symptomsInput}
                onChange={(e) => onSymptomsInputChange(e.target.value)}
                className={`${textareaCls} min-h-16`}
                placeholder="fever, headache, fatigue, shortness of breath…"
              />
            </Field>

            <Field label="Current Medications">
              <textarea
                value={currentMedications}
                onChange={(e) => onCurrentMedicationsChange(e.target.value)}
                className={`${textareaCls} min-h-16`}
                placeholder="Medications taken this week or regularly…"
              />
            </Field>

            <Field label="Previous / Chronic Diseases">
              <textarea
                value={previousDiseases}
                onChange={(e) => onPreviousDiseasesChange(e.target.value)}
                className={`${textareaCls} min-h-16`}
                placeholder="Diabetes, hypertension, asthma…"
              />
            </Field>

            <Field label="Allergies">
              <input
                type="text"
                value={allergies}
                onChange={(e) => onAllergiesChange(e.target.value)}
                className={inputCls}
                placeholder="Penicillin, sulfa drugs, latex…"
              />
            </Field>

            <Field label="Clinical Impressions">
              <textarea
                value={clinicalImpressions}
                onChange={(e) => onClinicalImpressionsChange(e.target.value)}
                className={`${textareaCls} min-h-16`}
                placeholder="Clinical findings and observations…"
              />
            </Field>

            <Field label="Treatment Plan">
              <textarea
                value={possibleSolutions}
                onChange={(e) => onPossibleSolutionsChange(e.target.value)}
                className={`${textareaCls} min-h-16`}
                placeholder="Medications prescribed, referrals, follow-up instructions…"
              />
            </Field>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <input
                type="checkbox"
                id="follow-up"
                checked={followUpRequired}
                onChange={(e) => onFollowUpRequiredChange(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-cyan-500"
              />
              <label htmlFor="follow-up" className="text-sm font-medium text-slate-200">
                Follow-up required
              </label>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => { onTabChange("ai"); void generateAiSummary(); }}
                className="flex-1 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 py-3 text-sm font-semibold text-white hover:from-cyan-500 hover:to-blue-500"
              >
                <Sparkles className="mr-1.5 inline h-4 w-4" />Generate AI Summary
              </button>
              <button
                type="button"
                onClick={onSaveSummary}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10"
              >
                Save
              </button>
            </div>

            <button
              type="button"
              onClick={onEndRoom}
              className="w-full rounded-2xl border border-rose-500/30 bg-rose-500/10 py-3 text-sm font-semibold text-rose-300 hover:bg-rose-500/20"
            >
              End session
            </button>
          </div>
        )}

        {/* ─── Chat Tab ────────────────────────────────────────────── */}
        {activeTab === "chat" && (
          <div className="flex h-full flex-col p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-300">
                {messages.length} message{messages.length !== 1 ? "s" : ""}
                <span className="ml-2 text-xs text-slate-600">· auto-refreshes</span>
              </p>
              <button
                type="button"
                onClick={onRefreshChat}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/60 p-3">
              {messages.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-600">No messages yet.</p>
              ) : (
                messages.map((msg) => (
                  <article
                    key={msg.id}
                    className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-300">{msg.sender || "Practitioner"}</p>
                      {msg.created_at && (
                        <p className="text-[10px] text-slate-600">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-100">{msg.content}</p>
                  </article>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => onChatInputChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSendChatMessage(); } }}
                placeholder="Type a message…"
                className={inputCls}
                disabled={isSendingMessage}
              />
              <button
                type="button"
                onClick={onSendChatMessage}
                disabled={isSendingMessage || !chatInput.trim()}
                className="inline-flex items-center justify-center rounded-2xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-50"
              >
                {isSendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center justify-between border-t border-white/10 bg-white/[0.03] px-4 py-2.5">
        <p className="text-[10px] text-slate-600">
          {roomMode === "video" ? "Video" : "Audio"} · Session #{shortId}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          Hide panel
        </button>
      </div>
    </aside>
  );
}
