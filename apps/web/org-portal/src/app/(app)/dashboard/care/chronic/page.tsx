"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Filter, AlertTriangle, Shield, Activity, ChevronRight } from "lucide-react";

type ChronicRecord = {
  id: string;
  patient_id: string;
  condition_name: string;
  icd_code?: string;
  severity_level: "green" | "yellow" | "red" | "critical";
  risk_score: number;
  status: "active" | "stable" | "critical" | "discharged";
  created_at: string;
};

const SEVERITY_BG: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
  yellow: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
  red: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30",
  critical: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800",
};

export default function OrgChronicCare() {
  const [records, setRecords] = useState<ChronicRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/org/care/chronic?limit=100");
        const data = await res.json();
        const recs: ChronicRecord[] = Array.isArray(data) ? data : [];
        setRecords(recs);

        const uniquePatientIds = [...new Set(recs.map(r => r.patient_id))];
        const pMap: Record<string, any> = {};
        for (const pid of uniquePatientIds) {
          try {
             const pRes = await fetch(`/api/org/patients/${pid}`);
             if (pRes.ok) {
               pMap[pid] = await pRes.json();
             }
          } catch (e) {}
        }
        setPatients(pMap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const active = records.filter(r => r.status !== "discharged");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chronic Care Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor patients enrolled in long-term care programs.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-10 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 shadow-sm transition">
            <Plus className="h-4 w-4" /> Enroll Patient
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Total Enrolled" value={active.length} icon={<Shield className="h-4 w-4 text-sky-600" />} />
        <MetricCard title="Critical Risk" value={active.filter(r => r.risk_score >= 80).length} icon={<AlertTriangle className="h-4 w-4 text-rose-600" />} alert />
        <MetricCard title="Stable" value={active.filter(r => r.status === "stable").length} icon={<Activity className="h-4 w-4 text-emerald-600" />} />
        <MetricCard title="Recent Discharges" value={records.filter(r => r.status === "discharged").length} icon={<Shield className="h-4 w-4 text-slate-500" />} />
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search care programs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring focus:border-input text-sm"
          />
        </div>
        <button className="h-10 px-4 py-2 border border-input bg-background hover:bg-muted text-sm font-medium rounded-lg flex items-center gap-2">
          <Filter className="h-4 w-4" /> Filter
        </button>
      </div>

      {/* Registry Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-5 py-3.5">Patient</th>
                <th className="px-5 py-3.5">Condition</th>
                <th className="px-5 py-3.5">Risk Score</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">Loading care plans...</td>
                </tr>
              ) : active.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">No active chronic care patients.</td>
                </tr>
              ) : (
                active.map(rec => {
                  const pat = patients[rec.patient_id];
                  const sevClass = SEVERITY_BG[rec.severity_level] || SEVERITY_BG.green;
                  return (
                    <tr key={rec.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium">{pat?.full_name || "Unknown Patient"}</p>
                        <p className="text-xs text-muted-foreground">{pat?.gender ? pat.gender + ", " : ""}{pat?.date_of_birth ? new Date().getFullYear() - new Date(pat.date_of_birth).getFullYear() + " yrs" : ""}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-medium">{rec.condition_name}</span>
                          {rec.icd_code && <span className="text-xs text-muted-foreground">{rec.icd_code}</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className={`h-full ${rec.risk_score >= 80 ? "bg-rose-500" : rec.risk_score >= 50 ? "bg-amber-400" : "bg-emerald-500"}`} style={{ width: `${Math.min(100, Math.max(0, rec.risk_score))}%` }} />
                          </div>
                          <span className="text-xs font-semibold">{rec.risk_score}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium ${sevClass}`}>
                          {rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted text-muted-foreground">
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, alert }: { title: string, value: number, icon: React.ReactNode, alert?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${alert ? "bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/30" : "bg-card border-border"}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center border border-border/50 shadow-sm">
          {icon}
        </div>
      </div>
      <p className={`text-2xl font-bold mt-2 ${alert ? "text-rose-700 dark:text-rose-400" : ""}`}>{value}</p>
    </div>
  );
}
