"use client";

import { useState } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { useAiContextStore } from "@/stores/aiContextStore";

export function AIAssistantPanel() {
  const [openMobile, setOpenMobile] = useState(false);
  const [message, setMessage] = useState("");
  const context = useAiContextStore();

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
        <div className="rounded-lg border border-border bg-background p-3 text-sm">
          I can help with symptoms, medication, appointments, and recommendations.
        </div>
        <div className="rounded-lg bg-primary/10 p-3 text-sm">
          Try: &quot;Reschedule my next appointment&quot; or &quot;Check medication interaction&quot;.
        </div>
      </div>

      <div className="p-3 border-t border-border flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask AI assistant"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <button className="h-10 w-10 rounded-lg bg-primary text-primary-foreground inline-flex items-center justify-center hover:bg-primary/90" aria-label="Send to AI">
          <Send className="h-4 w-4" />
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
