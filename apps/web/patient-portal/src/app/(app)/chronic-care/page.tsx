"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Stethoscope, AlertTriangle, CheckCircle, Activity,
  TrendingUp, Shield, Calendar, FileText, ChevronRight,
  Clock, Info
} from "lucide-react";
import { ExerciseAi } from "@/components/wellness/ExerciseAi";
import { MealPrepAi } from "@/components/wellness/MealPrepAi";

type ChronicRecord = {
  id: string;
  patient_id: string;
  organization_id: string;
  condition_name: string;
  icd_code?: string;
  care_plan: string;
  alert_thresholds: Record<string, number | string>;
  monitoring_frequency: string;
  severity_level: "green" | "yellow" | "red" | "critical";
  risk_score: number;
  status: "active" | "stable" | "critical" | "discharged";
  last_review_at?: string;
  created_at: string;
};

const SEVERITY_CONFIG: Record<string, { badge: string; bar: string; label: string }> = {
  green: { badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", bar: "bg-emerald-500", label: "Stable" },
  yellow: { badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", bar: "bg-amber-400", label: "Warning" },
  red: { badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400", bar: "bg-rose-500", label: "At Risk" },
  critical: { badge: "bg-rose-200 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300", bar: "bg-rose-700", label: "Critical" },
};

const STATUS_CONFIG: Record<string, string> = {
  active: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  stable: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  critical: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  discharged: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const CONDITION_ICON_MAP: Record<string, { icon: ReactNode; color: string }> = {
  default: { icon: <Stethoscope className="h-5 w-5" />, color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" },
};

function getRiskScoreColor(score: number): string {
  if (score < 30) return "text-emerald-600 dark:text-emerald-400";
  if (score < 60) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

function RiskMeter({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score));
  const color = pct < 30 ? "bg-emerald-500" : pct < 60 ? "bg-amber-400" : "bg-rose-500";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Risk Score</span>
        <span className={`text-sm font-bold ${getRiskScoreColor(pct)}`}>{pct.toFixed(0)}/100</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function ChronicCarePage() {
  const [records, setRecords] = useState<ChronicRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/care/chronic?limit=50")
      .then((r) => r.json())
      .then((d) => setRecords(Array.isArray(d) ? d : []))
      .catch(() => setError("Failed to load chronic care records."))
      .finally(() => setLoading(false));
  }, []);

  const active = records.filter((r) => r.status !== "discharged");
  const discharged = records.filter((r) => r.status === "discharged");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4 py-6">
      <div className="lg:col-span-2 space-y-8">
        {/* Header */}
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-sky-500/10 p-3 dark:bg-sky-500/20">
          <Shield className="h-6 w-6 text-sky-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chronic Care</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track your long-term conditions, care plans, and monitoring schedules.
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
          <Activity className="h-5 w-5 animate-pulse mr-2" /> Loading your care plans…
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-800 p-4 text-sm text-rose-700 dark:text-rose-400 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {error}
        </div>
      )}

      {!loading && !error && records.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-10 text-center space-y-3">
          <Shield className="h-12 w-12 text-muted-foreground/40 mx-auto" />
          <p className="text-sm font-medium text-muted-foreground">No chronic care programs found</p>
          <p className="text-xs text-muted-foreground/70 max-w-xs mx-auto">
            Your care team will enroll you when a chronic condition is diagnosed and a care plan is established.
          </p>
        </div>
      )}

      {/* Active / Stable / Critical enrollments */}
      {active.map((rec) => {
        const sev = SEVERITY_CONFIG[rec.severity_level] ?? SEVERITY_CONFIG.green;
        return (
          <div key={rec.id} className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className={`h-1.5 w-full ${sev.bar}`} />
            <div className="p-6 space-y-5">
              {/* Top row */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold">{rec.condition_name}</h2>
                    {rec.icd_code && (
                      <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                        {rec.icd_code}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${sev.badge}`}>
                      {rec.severity_level === "green" ? <CheckCircle className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                      {sev.label}
                    </span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_CONFIG[rec.status]}`}>
                      {rec.status}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Monitoring: {rec.monitoring_frequency}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Enrolled</p>
                  <p className="text-xs font-medium">{new Date(rec.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Risk Meter */}
              <RiskMeter score={rec.risk_score} />

              {/* Alert Thresholds */}
              {Object.keys(rec.alert_thresholds).length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5" /> Alert Thresholds
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(rec.alert_thresholds).map(([k, v]) => (
                      <div key={k} className="rounded-lg border border-border bg-muted/30 p-2.5 space-y-0.5">
                        <p className="text-xs text-muted-foreground capitalize">{k.replace(/_/g, " ")}</p>
                        <p className="text-sm font-semibold">{String(v)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Care Plan */}
              {rec.care_plan && (
                <div className="rounded-lg bg-muted/40 border border-border/50 p-3 flex gap-2">
                  <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Care Plan</p>
                    <p className="text-sm text-muted-foreground">{rec.care_plan}</p>
                  </div>
                </div>
              )}

              {/* Last Review */}
              {rec.last_review_at && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Last reviewed: {new Date(rec.last_review_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              )}
            </div>
          </div>
        );
      })}

      {/* Discharged */}
      {discharged.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <FileText className="h-4 w-4" /> Discharged Programs
          </h2>
          {discharged.map((rec) => (
            <div key={rec.id} className="rounded-xl border border-border bg-card/60 p-4 flex items-center justify-between gap-3 opacity-70">
              <div className="flex items-center gap-3">
                <Stethoscope className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{rec.condition_name}</p>
                  <p className="text-xs text-muted-foreground">Discharged · Enrolled {new Date(rec.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      )}
      </div>
      
      <div className="space-y-6">
        <MealPrepAi context="Chronic Care Management. If diabetic, recommend low glycemic index foods. If hypertensive, recommend DASH diet components." />
        <ExerciseAi context="Chronic Care Management. Include safe low-impact cardiovascular exercises and flexibility training." />
      </div>
    </div>
  );
}
