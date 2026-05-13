"use client";

import { MessageSquare, NotebookPen, RefreshCw, Send, Sparkles, X } from "lucide-react";

type TelemedicineMessage = {
  id: string;
  sender: string;
  content: string;
  created_at?: string;
};

type FeatureTab = "ai" | "chart" | "notes" | "chat";

type TelemedicineFeatureModalProps = {
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
  roomNotes: string;
  onRoomNotesChange: (value: string) => void;
  symptomsInput: string;
  onSymptomsInputChange: (value: string) => void;
  possibleSolutions: string;
  onPossibleSolutionsChange: (value: string) => void;
  draftSummary: string;
  onEditSummary: () => void;
  onAcceptSummary: () => void;
  onSaveSummary: () => void;
  onEndRoom: () => void;
  messages: TelemedicineMessage[];
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onRefreshChat: () => void;
  onSendChatMessage: () => void;
  isSendingMessage: boolean;
};

const tabButtonClass = (active: boolean) =>
  `flex-1 rounded-2xl px-4 py-2 text-sm font-semibold transition ${active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"}`;

export function TelemedicineFeatureModal({
  open,
  activeTab,
  onTabChange,
  onClose,
  patientName,
  sessionId,
  roomMode,
  queueCount,
  artifactCount,
  roomStatus,
  videoRuntimeIssue,
  roomNotes,
  onRoomNotesChange,
  symptomsInput,
  onSymptomsInputChange,
  possibleSolutions,
  onPossibleSolutionsChange,
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
}: TelemedicineFeatureModalProps) {
  if (!open) return null;

  return (
    <aside className="fixed inset-x-4 top-20 z-40 mx-auto flex max-h-[calc(100vh-6rem)] w-[min(100vw-2rem,520px)] flex-col overflow-hidden rounded-[28px] border border-slate-200/70 bg-white text-slate-900 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur md:right-6 md:left-auto md:top-6 md:h-[calc(100vh-3rem)] md:max-h-none md:w-[520px]">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Consult features</p>
          <p className="mt-1 text-sm font-medium text-slate-700">{patientName || "Patient"} • {sessionId || "No session selected"}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100"
          aria-label="Close feature panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="border-b border-slate-100 bg-slate-50 px-3 py-3">
        <div className="flex gap-2 rounded-3xl bg-slate-100 p-1">
          <button type="button" onClick={() => onTabChange("ai")} className={tabButtonClass(activeTab === "ai")}>AI</button>
          <button type="button" onClick={() => onTabChange("chart")} className={tabButtonClass(activeTab === "chart")}>Chart</button>
          <button type="button" onClick={() => onTabChange("notes")} className={tabButtonClass(activeTab === "notes")}>Notes</button>
          <button type="button" onClick={() => onTabChange("chat")} className={tabButtonClass(activeTab === "chat")}>Chat</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-slate-900">
              <Sparkles className="h-4 w-4 text-cyan-600" />
              <h2 className="text-lg font-semibold">AI Co-pilot</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">Drafts only. Review before saving to the chart.</p>
          </div>
          <button type="button" onClick={onRefreshChat} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {activeTab === "ai" ? (
          <div className="space-y-4">
            <article className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-cyan-50 p-2 text-cyan-700">
                    <NotebookPen className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-semibold">Live summary</h3>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">92%</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{draftSummary || "No draft summary available yet."}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={onEditSummary} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Edit</button>
                <button type="button" onClick={onAcceptSummary} className="rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700">Accept</button>
              </div>
            </article>

            <article className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-slate-900">Suggested action items</h3>
                <span className="text-xs font-semibold text-amber-600">81%</span>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>Review symptoms, medication history, and recent exposures.</li>
                <li>Confirm follow-up window and warning signs with the patient.</li>
                <li>Persist final note once the consult closes.</li>
              </ul>
            </article>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Mode</p>
                <p className="mt-2 font-semibold text-slate-800">{roomMode}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Artifacts</p>
                <p className="mt-2 font-semibold text-slate-800">{artifactCount}</p>
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "chart" ? (
          <div className="space-y-3">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Session</p>
              <p className="mt-2 font-semibold text-slate-900">{sessionId || "Not selected"}</p>
              <p className="mt-1 text-slate-600">Patient: {patientName || "Unknown"}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Queue</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{queueCount}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Artifacts</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{artifactCount}</p>
              </div>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-white p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Connection</p>
              <p className="mt-2">{roomStatus || "Connected panel ready for documentation."}</p>
              {videoRuntimeIssue ? <p className="mt-2 text-amber-700">{videoRuntimeIssue}</p> : null}
            </div>
          </div>
        ) : null}

        {activeTab === "notes" ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Private notes</label>
              <textarea value={roomNotes} onChange={(event) => onRoomNotesChange(event.target.value)} className="mt-2 min-h-28 w-full rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" placeholder="Symptoms, questions, and instructions" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Symptoms</label>
              <textarea value={symptomsInput} onChange={(event) => onSymptomsInputChange(event.target.value)} className="mt-2 min-h-20 w-full rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" placeholder="fever, headache, fatigue" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Plan</label>
              <textarea value={possibleSolutions} onChange={(event) => onPossibleSolutionsChange(event.target.value)} className="mt-2 min-h-20 w-full rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" placeholder="Hydration, medication adjustment, diagnostic tests, follow-up" />
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={onSaveSummary} className="rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700">Save summary</button>
              <button type="button" onClick={onEndRoom} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">End room</button>
            </div>
          </div>
        ) : null}

        {activeTab === "chat" ? (
          <div className="space-y-3">
            <div className="max-h-72 space-y-2 overflow-y-auto rounded-[24px] border border-slate-200 bg-slate-50 p-3">
              {messages.map((message) => (
                <article key={message.id} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                  <p className="text-xs text-slate-500">{message.sender || "Practitioner"} {message.created_at ? `• ${new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}</p>
                  <p className="mt-1 text-sm text-slate-800">{message.content}</p>
                </article>
              ))}
              {messages.length === 0 ? <p className="text-sm text-slate-500">No chat messages yet.</p> : null}
            </div>
            <div className="flex gap-2">
              <input value={chatInput} onChange={(event) => onChatInputChange(event.target.value)} placeholder="Type a message" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              <button type="button" onClick={onSendChatMessage} disabled={isSendingMessage || !chatInput.trim()} className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
                <Send className="h-4 w-4" /> Send
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
        <p className="text-xs text-slate-500">Chat and audio/video use the same LiveKit session.</p>
        <button type="button" onClick={onClose} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100">Hide panel</button>
      </div>
    </aside>
  );
}
