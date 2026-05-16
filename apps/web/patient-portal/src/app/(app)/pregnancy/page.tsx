"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Baby, Calendar, AlertTriangle, CheckCircle, Clock,
  Heart, Activity, FileText, User, ChevronRight, Info
} from "lucide-react";

type PregnancyRecord = {
  id: string;
  patient_id: string;
  organization_id: string;
  assigned_provider_id?: string;
  lmp?: string;
  expected_delivery_date?: string;
  gestational_age_weeks?: number;
  trimester: number;
  gravidity: number;
  parity: number;
  high_risk: boolean;
  risk_factors: string[];
  existing_conditions: string[];
  notes: string;
  severity_level: "green" | "yellow" | "red" | "critical";
  status: "active" | "closed" | "postpartum";
  closed_at?: string;
  created_at: string;
};

const TRIMESTER_LABELS = ["", "First (Weeks 1–12)", "Second (Weeks 13–26)", "Third (Weeks 27–40)"];
const TRIMESTER_COLORS = ["", "bg-sky-500/15 text-sky-600 dark:text-sky-400", "bg-violet-500/15 text-violet-600 dark:text-violet-400", "bg-amber-500/15 text-amber-600 dark:text-amber-400"];

const SEVERITY_BADGE: Record<string, string> = {
  green: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  yellow: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  red: "bg-rose-500/15 text-rose-700 dark:text-rose-400",
  critical: "bg-rose-700/20 text-rose-800 dark:text-rose-300 font-bold",
};

const SEVERITY_ICON: Record<string, ReactNode> = {
  green: <CheckCircle className="h-4 w-4" />,
  yellow: <AlertTriangle className="h-4 w-4" />,
  red: <AlertTriangle className="h-4 w-4" />,
  critical: <AlertTriangle className="h-4 w-4" />,
};

function computeGestationalAge(lmp?: string): string {
  if (!lmp) return "—";
  const weeks = Math.floor((Date.now() - new Date(lmp).getTime()) / (7 * 24 * 60 * 60 * 1000));
  if (weeks < 0) return "—";
  return `${weeks}w ${Math.floor(((Date.now() - new Date(lmp).getTime()) % (7 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000))}d`;
}

function computeDaysToEDD(edd?: string): number | null {
  if (!edd) return null;
  const diff = new Date(edd).getTime() - Date.now();
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}

import { ExerciseAi } from "@/components/wellness/ExerciseAi";
import { MealPrepAi } from "@/components/wellness/MealPrepAi";

export default function PregnancyPage() {
  const [records, setRecords] = useState<PregnancyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/care/pregnancy?limit=50")
      .then((r) => r.json())
      .then((d) => setRecords(Array.isArray(d) ? d : []))
      .catch(() => setError("Failed to load pregnancy records."))
      .finally(() => setLoading(false));
  }, []);

  const active = records.filter((r) => r.status === "active");
  const closed = records.filter((r) => r.status !== "active");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4 py-6">
      <div className="lg:col-span-2 space-y-8">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-pink-500/10 p-3 dark:bg-pink-500/20">
            <Baby className="h-6 w-6 text-pink-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pregnancy Care</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Monitor your maternal health journey, antenatal care, and upcoming milestones.
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
            <Activity className="h-5 w-5 animate-pulse mr-2" /> Loading your pregnancy records…
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-300 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-800 p-4 text-sm text-rose-700 dark:text-rose-400 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {error}
          </div>
        )}

        {!loading && !error && records.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-10 text-center space-y-3">
            <Baby className="h-12 w-12 text-muted-foreground/40 mx-auto" />
            <p className="text-sm font-medium text-muted-foreground">No pregnancy records found</p>
            <p className="text-xs text-muted-foreground/70 max-w-xs mx-auto">
              Your care team will enroll you in a Pregnancy Care program during your antenatal visit.
            </p>
          </div>
        )}

        {/* Active Episodes */}
        {active.map((rec) => {
          const daysToEDD = computeDaysToEDD(rec.expected_delivery_date);
          const gestAge = computeGestationalAge(rec.lmp);
          return (
            <div key={rec.id} className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              {/* Status bar */}
              <div className={`h-1.5 w-full ${rec.severity_level === "green" ? "bg-emerald-500" : rec.severity_level === "yellow" ? "bg-amber-400" : "bg-rose-500"}`} />

              <div className="p-6 space-y-5">
                {/* Top row */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TRIMESTER_COLORS[rec.trimester] ?? ""}`}>
                        {TRIMESTER_LABELS[rec.trimester] ?? `Trimester ${rec.trimester}`}
                      </span>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 ${SEVERITY_BADGE[rec.severity_level]}`}>
                        {SEVERITY_ICON[rec.severity_level]} {rec.severity_level.charAt(0).toUpperCase() + rec.severity_level.slice(1)} risk
                      </span>
                      {rec.high_risk && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                          High Risk Pregnancy
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Gravida {rec.gravidity}, Para {rec.parity}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium">
                    Active
                  </span>
                </div>

                {/* Key metrics grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <MetricCard icon={<Clock className="h-4 w-4 text-sky-500" />} label="Gestational Age" value={gestAge} />
                  <MetricCard
                    icon={<Calendar className="h-4 w-4 text-violet-500" />}
                    label="EDD"
                    value={rec.expected_delivery_date ? new Date(rec.expected_delivery_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                  />
                  <MetricCard
                    icon={<Heart className="h-4 w-4 text-pink-500" />}
                    label="Days to EDD"
                    value={daysToEDD !== null ? (daysToEDD > 0 ? `${daysToEDD} days` : daysToEDD === 0 ? "Today!" : `${Math.abs(daysToEDD)}d ago`) : "—"}
                    highlight={daysToEDD !== null && daysToEDD <= 14 && daysToEDD >= 0}
                  />
                  <MetricCard
                    icon={<Activity className="h-4 w-4 text-emerald-500" />}
                    label="LMP"
                    value={rec.lmp ? new Date(rec.lmp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                  />
                </div>

                {/* Risk factors */}
                {rec.risk_factors.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Risk Factors</p>
                    <div className="flex flex-wrap gap-1.5">
                      {rec.risk_factors.map((f) => (
                        <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Existing conditions */}
                {rec.existing_conditions.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Existing Conditions</p>
                    <div className="flex flex-wrap gap-1.5">
                      {rec.existing_conditions.map((c) => (
                        <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {rec.notes && (
                  <div className="rounded-lg bg-muted/40 border border-border/50 p-3 flex gap-2">
                    <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{rec.notes}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Closed / Postpartum */}
        {closed.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <FileText className="h-4 w-4" /> Past Episodes
            </h2>
            {closed.map((rec) => (
              <div key={rec.id} className="rounded-xl border border-border bg-card/60 p-4 flex items-center justify-between gap-3 opacity-75">
                <div className="flex items-center gap-3">
                  <Baby className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{TRIMESTER_LABELS[rec.trimester] ?? `Trimester ${rec.trimester}`}</p>
                    <p className="text-xs text-muted-foreground">
                      {rec.status === "postpartum" ? "Postpartum" : "Closed"} ·{" "}
                      {rec.expected_delivery_date ? new Date(rec.expected_delivery_date).toLocaleDateString() : "—"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <MealPrepAi context="Pregnancy Care. Include safe recipes avoiding raw fish, undercooked meats, and unpasteurized dairy. Focus on high folate, iron, and calcium." />
        <ExerciseAi context="Pregnancy Care. Include safe prenatal exercises such as swimming, walking, and prenatal yoga. Avoid high-impact sports or lying flat on the back." />
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, highlight }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-3 space-y-1 ${highlight ? "border-pink-300 bg-pink-50 dark:border-pink-800 dark:bg-pink-950/20" : "border-border bg-muted/30"}`}>
      <div className="flex items-center gap-1.5">{icon}<span className="text-xs text-muted-foreground">{label}</span></div>
      <p className={`text-sm font-semibold ${highlight ? "text-pink-600 dark:text-pink-400" : ""}`}>{value}</p>
    </div>
  );
}
