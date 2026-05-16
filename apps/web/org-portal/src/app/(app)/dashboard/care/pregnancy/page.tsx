"use client";

import { useEffect, useState } from "react";
import { Baby, Plus, Search, Filter, AlertTriangle, ShieldCheck, ChevronRight } from "lucide-react";

type PregnancyRecord = {
  id: string;
  patient_id: string;
  lmp?: string;
  expected_delivery_date?: string;
  trimester: number;
  high_risk: boolean;
  severity_level: "green" | "yellow" | "red" | "critical";
  status: "active" | "closed" | "postpartum";
  created_at: string;
  notes: string;
  patient?: any;
};

const SEVERITY_BG: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
  yellow: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
  red: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30",
  critical: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800",
};

export default function OrgPregnancyRegistry() {
  const [records, setRecords] = useState<PregnancyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Fetch pregnancy records and map them to patient names.
    // To do this properly, we first fetch records, then get patient details.
    async function load() {
      try {
        const res = await fetch("/api/org/care/pregnancy?limit=100");
        const data = await res.json();
        const recs: PregnancyRecord[] = Array.isArray(data) ? data : [];
        setRecords(recs);

        // Fetch patient names
        const uniquePatientIds = [...new Set(recs.map(r => r.patient_id))];
        const pMap: Record<string, any> = {};
        for (const pid of uniquePatientIds) {
          try {
             const pRes = await fetch(`/api/org/patients/${pid}`);
             if (pRes.ok) {
               pMap[pid] = await pRes.json();
             }
          } catch (e) {
             // Ignore
          }
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

  const active = records.filter(r => r.status === "active");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pregnancy Registry</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage active antenatal patients and high-risk cases.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-10 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 shadow-sm transition">
            <Plus className="h-4 w-4" /> Enroll Patient
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Active Enrollees" value={active.length} icon={<Baby className="h-4 w-4 text-pink-600" />} />
        <MetricCard title="High Risk" value={active.filter(r => r.high_risk).length} icon={<AlertTriangle className="h-4 w-4 text-rose-600" />} alert />
        <MetricCard title="Third Trimester" value={active.filter(r => r.trimester === 3).length} icon={<ShieldCheck className="h-4 w-4 text-violet-600" />} />
        <MetricCard title="Recent Deliveries" value={records.filter(r => r.status === "postpartum").length} icon={<Baby className="h-4 w-4 text-emerald-600" />} />
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search registry..."
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
                <th className="px-5 py-3.5">Trimester</th>
                <th className="px-5 py-3.5">EDD</th>
                <th className="px-5 py-3.5">Risk Level</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">Loading registry...</td>
                </tr>
              ) : active.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">No active patients in registry.</td>
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
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-medium">
                          Trimester {rec.trimester}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {rec.expected_delivery_date ? new Date(rec.expected_delivery_date).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${sevClass}`}>
                          {rec.high_risk && <AlertTriangle className="h-3 w-3" />}
                          {rec.severity_level.charAt(0).toUpperCase() + rec.severity_level.slice(1)}
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
