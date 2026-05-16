"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Search,
  Star,
  Clock,
  Globe,
  HeartHandshake,
  Zap,
  CheckCircle2,
  Video,
  Mic,
  MessageCircle,
} from "lucide-react";
import type { TriageResult } from "./AITriageWidget";

type Doctor = {
  id: string;
  full_name: string;
  specialty: string;
  location: string;
  rating: number;
  years_experience: number;
  available: boolean;
  online?: boolean;
  sub_specialty?: string;
  languages?: string[];
  consultation_modes?: string[];
  emergency_support?: boolean;
  current_sessions?: number;
  session_capacity?: number;
};

const MODE_ICONS: Record<string, React.ReactNode> = {
  video: <Video className="h-3.5 w-3.5" />,
  voice: <Mic className="h-3.5 w-3.5" />,
  chat:  <MessageCircle className="h-3.5 w-3.5" />,
};

const URGENCY_COLORS = {
  low:      "bg-emerald-50 text-emerald-700 border-emerald-200",
  moderate: "bg-blue-50 text-blue-700 border-blue-200",
  urgent:   "bg-amber-50 text-amber-700 border-amber-200",
  emergent: "bg-red-50 text-red-700 border-red-200",
};

async function readJson(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text) as Record<string, unknown> | null; }
  catch { return text; }
}

interface Props {
  doctors: Doctor[];
  triageResult?: TriageResult | null;
  className?: string;
}

function scoreDoctor(doctor: Doctor, triage: TriageResult | null): number {
  if (!triage) return doctor.available ? 1 : 0;
  let score = 0;
  // Specialty match
  const spec = triage.specialty.toLowerCase();
  if (doctor.specialty.toLowerCase().includes(spec) || spec.includes(doctor.specialty.toLowerCase().split(" ")[0])) score += 40;
  // Availability
  if (doctor.available || doctor.online) score += 30;
  // Emergency support for urgent cases
  if ((triage.urgency === "urgent" || triage.urgency === "emergent") && doctor.emergency_support) score += 20;
  // Capacity
  if ((doctor.current_sessions ?? 0) < (doctor.session_capacity ?? 1)) score += 10;
  // Rating
  score += (doctor.rating || 5) * 2;
  return score;
}

export default function AIMatchedDoctors({ doctors, triageResult, className }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [requestingId, setRequestingId] = useState("");
  const [showAll, setShowAll] = useState(false);

  const scored = useMemo(() => {
    return [...doctors]
      .map(d => ({ ...d, _score: scoreDoctor(d, triageResult ?? null) }))
      .sort((a, b) => b._score - a._score);
  }, [doctors, triageResult]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return scored;
    return scored.filter(d =>
      [d.full_name, d.specialty, d.location, d.sub_specialty].join(" ").toLowerCase().includes(needle)
    );
  }, [scored, query]);

  const displayed = showAll ? filtered : filtered.slice(0, 6);
  const topMatches = triageResult ? filtered.filter(d => d._score > 40).slice(0, 3) : [];

  async function requestDoctor(doctor: Doctor) {
    setRequestingId(doctor.id);
    try {
      const res = await fetch("/api/telemedicine/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_id: doctor.id,
          doctor_name: doctor.full_name,
          scheduled_at: new Date().toISOString(),
          preferred_mode: doctor.consultation_modes?.[0] ?? "video",
          requested_amount: 0,
          requested_currency: "ETB",
          notes: triageResult
            ? `AI-matched. Urgency: ${triageResult.urgency}. Specialty: ${triageResult.specialty}. Symptoms: ${triageResult.reasons.join("; ")}`
            : `Patient requested ${doctor.full_name}.`,
          ai_urgency_level: triageResult?.urgency ?? "low",
          ai_triage_score: triageResult?.score ?? 0,
          ai_specialty: triageResult?.specialty ?? "",
        }),
      });
      const payload = await readJson(res);
      if (!res.ok) {
        const msg = payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
          ? payload.error : "Unable to request visit";
        throw new Error(msg);
      }
      const sessionId = payload && typeof payload === "object" && "id" in payload ? String(payload.id || "") : "";
      router.push(`/telemedicine/room?session_id=${encodeURIComponent(sessionId)}&doctor_name=${encodeURIComponent(doctor.full_name)}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unable to request visit");
    } finally {
      setRequestingId("");
    }
  }

  return (
    <section className={`rounded-2xl border border-border bg-card shadow-soft overflow-hidden ${className ?? ""}`}>
      {/* Header */}
      <div className="border-b border-border bg-muted/30 px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {triageResult ? (
              <>
                <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold mb-1.5 ${URGENCY_COLORS[triageResult.urgency]}`}>
                  <Zap className="h-3 w-3" />
                  {triageResult.urgency.charAt(0).toUpperCase() + triageResult.urgency.slice(1)} — {triageResult.specialty}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{topMatches.length}</span> AI-matched doctors for your condition
                  {doctors.length - topMatches.length > 0 && ` • ${doctors.length - topMatches.length} more available`}
                </p>
              </>
            ) : (
              <p className="text-sm font-medium text-foreground">Browse available doctors</p>
            )}
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 min-w-0 sm:min-w-[220px]">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search name, specialty..."
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      {/* AI top matches banner */}
      {triageResult && topMatches.length > 0 && !query && (
        <div className="border-b border-primary/10 bg-primary/5 px-5 py-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-primary">
            <CheckCircle2 className="h-3.5 w-3.5" /> Best matches for your symptoms
          </p>
          <div className="flex flex-wrap gap-2">
            {topMatches.map(d => (
              <div key={d.id} className="flex items-center gap-2 rounded-lg border border-primary/20 bg-background px-3 py-2">
                <div className={`h-2 w-2 rounded-full ${d.available ? "bg-emerald-500" : "bg-slate-400"}`} />
                <span className="text-xs font-medium text-foreground">{d.full_name}</span>
                <span className="text-xs text-muted-foreground">{d.specialty}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Doctor grid */}
      <div className="p-5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <HeartHandshake className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">No doctors match that search</p>
            <button type="button" onClick={() => setQuery("")} className="text-sm text-primary hover:underline">Clear search</button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {displayed.map((doctor, i) => {
                const isTopMatch = triageResult && doctor._score > 40 && i < 3;
                const isBusy = (doctor.current_sessions ?? 0) >= (doctor.session_capacity ?? 1);
                return (
                  <article
                    key={doctor.id}
                    className={`relative flex flex-col rounded-2xl border bg-background p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                      isTopMatch ? "border-primary/30 ring-1 ring-primary/20" : "border-border/70"
                    }`}
                  >
                    {isTopMatch && (
                      <div className="absolute -top-2 left-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                        Best Match
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{doctor.full_name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{doctor.specialty}</p>
                        {doctor.sub_specialty && (
                          <p className="text-xs text-muted-foreground/70">{doctor.sub_specialty}</p>
                        )}
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        doctor.available && !isBusy
                          ? "bg-emerald-100 text-emerald-700"
                          : isBusy
                          ? "bg-amber-100 text-amber-700"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {doctor.available && !isBusy ? "Available" : isBusy ? "Busy" : "Offline"}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                      {doctor.years_experience > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Star className="h-3.5 w-3.5 text-amber-400" />
                          {doctor.rating.toFixed(1)} rating • {doctor.years_experience} yrs experience
                        </div>
                      )}
                      {doctor.location && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {doctor.location}
                        </div>
                      )}
                      {doctor.languages && doctor.languages.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Globe className="h-3.5 w-3.5" />
                          {doctor.languages.slice(0, 3).join(", ")}
                        </div>
                      )}
                    </div>

                    {/* Consultation modes */}
                    {doctor.consultation_modes && doctor.consultation_modes.length > 0 && (
                      <div className="mt-3 flex gap-1.5">
                        {doctor.consultation_modes.map(m => (
                          <span key={m} className="flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs text-muted-foreground">
                            {MODE_ICONS[m]} <span className="capitalize">{m}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => void requestDoctor(doctor)}
                      disabled={requestingId === doctor.id}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
                    >
                      {requestingId === doctor.id ? (
                        <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> Requesting...</>
                      ) : (
                        <><HeartHandshake className="h-4 w-4" /> Request Visit <ArrowRight className="h-3.5 w-3.5" /></>
                      )}
                    </button>
                  </article>
                );
              })}
            </div>

            {filtered.length > 6 && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setShowAll(v => !v)}
                  className="rounded-xl border border-border px-5 py-2 text-sm font-medium text-foreground transition hover:bg-muted/40"
                >
                  {showAll ? "Show fewer" : `Show all ${filtered.length} doctors`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
