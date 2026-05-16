"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Plus, Search, CheckCircle, AlertTriangle, User, Calendar } from "lucide-react";

type CommunityVisit = {
  id: string;
  agent_id: string;
  household_id: string;
  member_id?: string;
  visit_date: string;
  visit_type: "routine" | "follow_up" | "emergency" | "maternal" | "chronic";
  triage_escalated: boolean;
  triage_reason?: string;
  vitals_logged: Record<string, string>;
};

export default function CommunityVisitWorkspace() {
  const [visits, setVisits] = useState<CommunityVisit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/org/community/visits?limit=100")
      .then(res => res.json())
      .then(data => setVisits(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Visit Workspace</h1>
          <p className="text-sm text-muted-foreground mt-1">Log field encounters, vitals, and sync with Triage.</p>
        </div>
        <button className="h-10 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 shadow-sm transition">
          <Plus className="h-4 w-4" /> Log New Visit
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20 flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search past visits..."
              className="w-full h-9 pl-9 pr-4 rounded-md border border-input bg-background focus:ring-2 focus:ring-ring text-sm"
            />
          </div>
        </div>
        <div className="divide-y divide-border">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading visits...</div>
          ) : visits.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No recent visits logged.</div>
          ) : (
            visits.map(visit => (
              <div key={visit.id} className="p-5 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm capitalize">{visit.visit_type.replace('_', ' ')} Visit</span>
                    {visit.triage_escalated && (
                      <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                        <AlertTriangle className="h-3 w-3" /> Escalated to Triage
                      </span>
                    )}
                    {!visit.triage_escalated && (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle className="h-3 w-3" /> Standard
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(visit.visit_date).toLocaleString()}</span>
                    <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> Member {visit.member_id || "Household Level"}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(visit.vitals_logged || {}).map(([k, v]) => (
                    <div key={k} className="bg-muted px-2 py-1 rounded text-xs">
                      <span className="text-muted-foreground uppercase">{k}:</span> <span className="font-medium">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
