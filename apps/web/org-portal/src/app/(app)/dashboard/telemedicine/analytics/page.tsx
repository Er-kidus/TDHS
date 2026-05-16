"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Brain,
  CheckCircle2,
  Clock,
  RefreshCw,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

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
};

type Artifact = {
  id: string;
  session_id: string;
  summary?: string;
  final_diagnosis?: string;
};

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-emerald-500",
  ended: "bg-emerald-500",
  pending: "bg-amber-400",
  accepted: "bg-blue-400",
  in_progress: "bg-cyan-400",
  cancelled: "bg-slate-500",
  rejected: "bg-rose-500",
};

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color = "text-cyan-400",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

export default function TelemedicineAnalyticsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [sRes, aRes] = await Promise.all([
        fetch("/api/org/telemedicine/queue?limit=200"),
        fetch("/api/org/telemedicine/artifacts?limit=200"),
      ]);
      if (sRes.ok) {
        const d = (await sRes.json()) as Session[];
        setSessions(Array.isArray(d) ? d : []);
      }
      if (aRes.ok) {
        const d = (await aRes.json()) as Artifact[];
        setArtifacts(Array.isArray(d) ? d : []);
      }
    } catch { /* silent */ }
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const stats = useMemo(() => {
    const total = sessions.length;
    const completed = sessions.filter((s) =>
      ["completed", "ended"].includes(s.status)
    ).length;
    const pending = sessions.filter((s) => s.status === "pending").length;
    const inProgress = sessions.filter((s) => s.status === "in_progress").length;

    const urgencyBreakdown: Record<string, number> = {};
    let totalScore = 0, scoredCount = 0;
    const specialtyMap: Record<string, number> = {};
    const modeMap: Record<string, number> = {};

    for (const s of sessions) {
      const lvl = s.ai_urgency_level ?? "low";
      urgencyBreakdown[lvl] = (urgencyBreakdown[lvl] ?? 0) + 1;
      if (s.ai_triage_score !== undefined) {
        totalScore += s.ai_triage_score;
        scoredCount++;
      }
      const spec = s.ai_specialty ?? "Unknown";
      specialtyMap[spec] = (specialtyMap[spec] ?? 0) + 1;
      const mode = s.preferred_mode ?? "video";
      modeMap[mode] = (modeMap[mode] ?? 0) + 1;
    }

    const avgScore = scoredCount > 0 ? Math.round(totalScore / scoredCount) : 0;
    const topSpecialties = Object.entries(specialtyMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const topModes = Object.entries(modeMap).sort((a, b) => b[1] - a[1]);

    return {
      total, completed, pending, inProgress,
      urgencyBreakdown, avgScore,
      topSpecialties, topModes,
      artifactCount: artifacts.length,
    };
  }, [sessions, artifacts]);

  const URGENCY_ORDER = ["emergent", "urgent", "moderate", "low"];
  const URGENCY_COLORS: Record<string, string> = {
    emergent: "bg-rose-500",
    urgent: "bg-amber-400",
    moderate: "bg-blue-400",
    low: "bg-emerald-500",
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#04070f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.14),transparent_34%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_28%)]" />

      <div className="relative mx-auto max-w-7xl space-y-6 p-4 md:p-6">
        {/* Header */}
        <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 px-5 py-5 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-cyan-400" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-200/70">
                Telemedicine Analytics
              </p>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Session & AI Triage Insights
            </h1>
            <p className="text-sm text-slate-300">
              Overview of session activity, urgency distribution, and AI performance.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load(true)}
            disabled={refreshing}
            className="flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </header>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-32 text-slate-400">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Loading analytics…</span>
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <StatCard label="Total Sessions" value={stats.total} icon={Activity} />
              <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} color="text-emerald-400" />
              <StatCard label="Pending" value={stats.pending} icon={Clock} color="text-amber-400" />
              <StatCard label="In Progress" value={stats.inProgress} icon={TrendingUp} color="text-cyan-400" />
              <StatCard label="Artifacts" value={stats.artifactCount} icon={Users} color="text-violet-400" sub="Clinical summaries saved" />
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {/* Urgency breakdown */}
              <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="mb-4 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <h2 className="font-semibold text-white">AI Urgency Distribution</h2>
                </div>
                <div className="space-y-3">
                  {URGENCY_ORDER.map((lvl) => {
                    const count = stats.urgencyBreakdown[lvl] ?? 0;
                    const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    return (
                      <div key={lvl}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="capitalize text-slate-300">{lvl}</span>
                          <span className="font-semibold text-white">{count}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full transition-all ${URGENCY_COLORS[lvl]}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="text-xs text-slate-400">
                    Avg AI triage score:{" "}
                    <span className="font-bold text-cyan-300">{stats.avgScore}</span>
                    /100
                  </p>
                </div>
              </section>

              {/* Top specialties */}
              <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="mb-4 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-violet-400" />
                  <h2 className="font-semibold text-white">Top AI-Matched Specialties</h2>
                </div>
                {stats.topSpecialties.length === 0 ? (
                  <p className="text-sm text-slate-500">No specialty data yet</p>
                ) : (
                  <div className="space-y-3">
                    {stats.topSpecialties.map(([spec, count]) => {
                      const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                      return (
                        <div key={spec}>
                          <div className="mb-1 flex justify-between text-xs">
                            <span className="truncate text-slate-300">{spec}</span>
                            <span className="font-semibold text-white">{count}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-violet-500 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Consultation modes */}
              <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="mb-4 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  <h2 className="font-semibold text-white">Consultation Modes</h2>
                </div>
                {stats.topModes.length === 0 ? (
                  <p className="text-sm text-slate-500">No session data yet</p>
                ) : (
                  <div className="space-y-3">
                    {stats.topModes.map(([mode, count]) => {
                      const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                      const modeColor: Record<string, string> = {
                        video: "bg-cyan-500",
                        voice: "bg-blue-500",
                        chat: "bg-emerald-500",
                      };
                      return (
                        <div key={mode}>
                          <div className="mb-1 flex justify-between text-xs">
                            <span className="capitalize text-slate-300">{mode}</span>
                            <span className="font-semibold text-white">{count} ({Math.round(pct)}%)</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div
                              className={`h-full rounded-full transition-all ${modeColor[mode] ?? "bg-slate-500"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Status breakdown */}
                <div className="mt-5 border-t border-white/10 pt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Session Status</p>
                  {Object.entries(
                    sessions.reduce<Record<string, number>>((acc, s) => {
                      acc[s.status] = (acc[s.status] ?? 0) + 1;
                      return acc;
                    }, {})
                  )
                    .sort((a, b) => b[1] - a[1])
                    .map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${STATUS_COLORS[status] ?? "bg-slate-500"}`} />
                          <span className="capitalize text-slate-300">{status.replace("_", " ")}</span>
                        </div>
                        <span className="font-semibold text-white">{count}</span>
                      </div>
                    ))}
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
