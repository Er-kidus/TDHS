"use client";

import { useState } from "react";

export default function HealthAssistantPage() {
  const [message, setMessage] = useState("I missed two medication doses this week.");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function askAssistant() {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/ai/router", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "pharmacy", message }),
      });
      const data = (await res.json()) as { reply?: string };
      setResult(data.reply || "No response.");
    } catch {
      setResult("Failed to reach assistant.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight">Health Assistant</h1>
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-3">
        <textarea
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe your health concern or question..."
        />
        <button onClick={askAssistant} disabled={loading} className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-60">
          {loading ? "Processing..." : "Get Recommendation"}
        </button>
        {result ? <div className="rounded-lg border border-border bg-background p-3 text-sm">{result}</div> : null}
      </section>
    </div>
  );
}
