"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Brain,
  CheckCircle2,
  Clock,
  RefreshCw,
  Zap,
} from "lucide-react";
import Link from "next/link";

type Session = {
  id: string;
  patient_id: string;
  doctor_name: string;
  preferred_mode?: string;
  status: string;
  scheduled_at: string;
  ai_urgency_level?: string;
  ai_triage_score?: number;
  ai_specialty?: string;
  notes?: string;
};

const URGENCY_CONFIG = {
  emergent: {
    label: "Emergent",
    dot: "bg-rose-500",
    badge: "bg-rose-500/10 text-rose-400 border-rose-500/25",
    bar: "bg-rose-500",
    priority: 0,
  },
  urgent: {
    label: "Urgent",
    dot: "bg-amber-400",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/25",
    bar: "bg-amber-400",
    priority: 1,
  },
  moderate: {
    label: "Moderate",
    dot: "bg-blue-400",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/25",
    bar: "bg-blue-400",
    priority: 2,
  },
  low: {
    label: "Low",
    dot: "bg-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    bar: "bg-emerald-500",
    priority: 3,
  },
};

function getUrgencyCfg(level?: string) {
  return URGENCY_CONFIG[(level ?? "low") as keyof typeof URGENCY_CONFIG] ?? URGENCY_CONFIG.low;
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AITriageOverviewPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch("/api/org/telemedicine/queue?limit=100");
      if (res.ok) {
        const data = (await res.json()) as Session[];
        setSessions(Array.isArray(data) ? data : []);
        setLastUpdated(new Date());
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const sorted = useMemo(
    () =>
      [...sessions].sort((a, b) => {
        const pa = getUrgencyCfg(a.ai_urgency_level).priority;
        const pb = getUrgencyCfg(b.ai_urgency_level).priority;
        if (pa !== pb) return pa - pb;
        return (b.ai_triage_score ?? 0) - (a.ai_triage_score ?? 0);
      }),
    [sessions]
  );

  const stats = useMemo(() => {
    const counts = { emergent: 0, urgent: 0, moderate: 0, low: 0, total: sessions.length };
    for (const s of sessions) {
      const lvl = (s.ai_urgency_level ?? "low") as keyof typeof URGENCY_CONFIG;
      if (lvl in counts) counts[lvl]++;
    }
    return counts;
  }, [sessions]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#04070f] text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.14),transparent_34%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_28%)]" />

      <div className="relative mx-auto max-w-7xl space-y-6 p-4 md:p-6">
        {/* Header */}
        <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 px-5 py-5 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-cyan-400" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-200/70">
                AI Triage Overview
              </p>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Patient Queue — AI Priority View
            </h1>
            <p className="text-sm text-slate-300">
              Incoming sessions ranked by AI urgency score. Auto-refreshes every 30 s.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-slate-400">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              type="button"
              onClick={() => void load(true)}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Link
              href="/dashboard/telemedicine"
              className="flex items-center gap-2 rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Workspace <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(["emergent", "urgent", "moderate", "low"] as const).map((lvl) => {
            const cfg = URGENCY_CONFIG[lvl];
            const count = stats[lvl];
            return (
              <div
                key={lvl}
                className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
              >
                <div className="flex items-center justify-between">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                  <div className={`h-2.5 w-2.5 rounded-full ${cfg.dot} ${count > 0 && lvl !== "low" ? "animate-pulse" : ""}`} />
                </div>
                <p className="text-3xl font-bold text-white">{count}</p>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all ${cfg.bar}`}
                    style={{ width: stats.total > 0 ? `${(count / stats.total) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Queue table */}
        <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
          <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
            <Activity className="h-4 w-4 text-cyan-400" />
            <h2 className="font-semibold text-white">Active Queue</h2>
            <span className="ml-auto rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-slate-300">
              {sorted.length} sessions
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading queue...</span>
            </div>
          ) : sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500/50" />
              <p className="font-semibold text-white">Queue is clear</p>
              <p className="text-sm text-slate-400">No active or pending sessions right now.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {sorted.map((session, idx) => {
                const cfg = getUrgencyCfg(session.ai_urgency_level);
                return (
                  <div
                    key={session.id}
                    className="flex flex-col gap-3 px-5 py-4 transition hover:bg-white/5 sm:flex-row sm:items-center sm:gap-4"
                  >
                    {/* Priority rank */}
                    <span className="shrink-0 w-7 text-center text-xs font-bold text-slate-500">
                      #{idx + 1}
                    </span>

                    {/* Urgency dot */}
                    <div className="shrink-0">
                      <div className={`h-3 w-3 rounded-full ${cfg.dot} ${["emergent", "urgent"].includes(session.ai_urgency_level ?? "") ? "animate-pulse" : ""}`} />
                    </div>

                    {/* Patient + specialty */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-white">
                          Patient {session.patient_id.slice(0, 8)}…
                        </p>
                        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cfg.badge}`}>
                          {session.ai_urgency_level ?? "low"}
                        </span>
                        {session.ai_specialty && (
                          <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-300">
                            {session.ai_specialty}
                          </span>
                        )}
                      </div>
                      {session.ai_triage_score !== undefined && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <Zap className="h-3 w-3 text-cyan-400" />
                          <span className="text-xs text-slate-400">
                            AI Score: <span className="font-semibold text-cyan-300">{session.ai_triage_score}</span>
                          </span>
                          <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-cyan-500 transition-all"
                              style={{ width: `${Math.min((session.ai_triage_score / 100) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Mode + time */}
                    <div className="flex shrink-0 flex-col items-end gap-1 text-right">
                      <span className="text-xs font-medium capitalize text-slate-300">
                        {session.preferred_mode ?? "video"}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        {relativeTime(session.scheduled_at)}
                      </div>
                    </div>

                    {/* Action */}
                    <Link
                      href={`/dashboard/telemedicine?session_id=${encodeURIComponent(session.id)}`}
                      className="shrink-0 flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
                    >
                      Join <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-xs text-slate-400">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
          <span>
            <strong className="text-white">AI Urgency</strong> is estimated by the AI triage engine based on patient-reported symptoms, severity score, and specialty match. Always exercise clinical judgment.
          </span>
        </div>
      </div>
    </div>
  );
}
