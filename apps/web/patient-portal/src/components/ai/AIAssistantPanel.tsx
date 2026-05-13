"use client";

import { useState } from "react";
import { Bot, Loader2, Send, Sparkles, X } from "lucide-react";
import { useAiContextStore } from "@/stores/aiContextStore";

export function AIAssistantPanel() {
  const [openMobile, setOpenMobile] = useState(false);
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [history, setHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    { role: "assistant", content: "Ask a care, telemedicine, medication, or appointment question and I’ll route it through Gemini when available." },
  ]);
  const [loading, setLoading] = useState(false);
  const context = useAiContextStore();

  async function sendMessage() {
    const text = message.trim();
    if (!text || loading) return;

    setLoading(true);
    setReply("");
    setHistory((current) => [...current, { role: "user", content: text }]);
    setMessage("");

    try {
      const res = await fetch("/api/ai/router", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: context.mode, message: text }),
      });
      const data = (await res.json().catch(() => ({}))) as { reply?: string; intent?: string; skills?: string[] };
      const nextReply = data.reply || "No response from AI router.";
      setReply(nextReply);
      setHistory((current) => [...current, { role: "assistant", content: nextReply }]);
    } catch {
      const fallback = "Failed to reach the AI router.";
      setReply(fallback);
      setHistory((current) => [...current, { role: "assistant", content: fallback }]);
    } finally {
      setLoading(false);
    }
  }

  const content = (
    <div className="h-full flex flex-col rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-sm font-semibold">
          <Bot className="h-4 w-4 text-primary" /> AI Assistant
        </div>
        <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5">
          <Sparkles className="h-3.5 w-3.5" /> mode: {context.mode}
        </span>
      </div>

      <div className="flex-1 p-3 space-y-2 overflow-auto">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">Session-aware</span>
          <span className="rounded-full border border-sky-300 bg-sky-50 px-2 py-0.5 text-[11px] text-sky-700">Quick actions</span>
        </div>
        <div className="rounded-lg border border-border bg-background p-2.5 text-xs text-muted-foreground">
          Context: {context.page} • {context.patientName || "patient"}
        </div>
        <div className="space-y-2">
          {history.map((entry, index) => (
            <div
              key={`${entry.role}-${index}`}
              className={entry.role === "assistant" ? "rounded-lg border border-border bg-background p-3 text-sm" : "rounded-lg bg-primary/10 p-3 text-sm"}
            >
              <p className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">{entry.role === "assistant" ? "Assistant" : "You"}</p>
              <p>{entry.content}</p>
            </div>
          ))}
        </div>
        {reply ? <div className="rounded-lg border border-border bg-background p-3 text-sm text-muted-foreground">Latest response: {reply}</div> : null}
      </div>

      <div className="p-3 border-t border-border flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask AI assistant"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void sendMessage();
            }
          }}
        />
        <button onClick={() => void sendMessage()} disabled={loading || !message.trim()} className="h-10 w-10 rounded-lg bg-primary text-primary-foreground inline-flex items-center justify-center hover:bg-primary/90 disabled:opacity-60" aria-label="Send to AI">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden 2xl:block w-[320px] shrink-0 p-4">{content}</aside>

      <button
        type="button"
        onClick={() => setOpenMobile(true)}
        className="2xl:hidden fixed right-4 bottom-24 z-40 h-11 w-11 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center shadow-elevated"
        title="Open AI assistant"
        aria-label="Open AI assistant"
      >
        <Bot className="h-5 w-5" />
      </button>

      {openMobile ? (
        <div className="2xl:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-sm p-3">
          <div className="h-full relative">
            <button
              type="button"
              onClick={() => setOpenMobile(false)}
              className="absolute right-2 top-2 z-10 h-8 w-8 rounded-md border border-border bg-background inline-flex items-center justify-center"
              aria-label="Close AI assistant"
            >
              <X className="h-4 w-4" />
            </button>
            {content}
          </div>
        </div>
      ) : null}
    </>
  );
}
