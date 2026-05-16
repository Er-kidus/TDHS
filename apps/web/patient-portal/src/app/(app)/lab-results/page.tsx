"use client";

import { useEffect, useState } from "react";
import { FlaskConical, AlertCircle, CheckCircle2, Clock, Loader2, Download } from "lucide-react";

type LabOrder = {
  id: string;
  order_id: string;
  test_name: string;
  service_area: string;
  status: string;
  priority: string;
  result_value?: string;
  result_notes?: string;
  critical_alert: boolean;
  created_at: string;
  updated_at: string;
  result_entered_at?: string;
};

export default function LabResultsPage() {
  const [labs, setLabs] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLabs() {
      try {
        setLoading(true);
        const res = await fetch("/api/patient/lab-orders");
        if (!res.ok) throw new Error("Failed to load lab results");
        const data = await res.json();
        const items = Array.isArray(data) ? data : [];
        setLabs(items);
        if (items.length > 0) setSelectedId(items[0].id);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchLabs();
  }, []);

  const selected = labs.find((l) => l.id === selectedId) || null;

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Lab Results</h1>
        <p className="text-sm text-slate-400 mt-1">Review your laboratory orders, tracking status, and final test results.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6">
        {/* Left List */}
        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 rounded-2xl border border-white/10 bg-slate-950/50">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-sky-500" />
              <p>Loading your lab orders...</p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-400">
              {error}
            </div>
          ) : labs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-slate-400 bg-slate-950/50">
              <FlaskConical className="mx-auto h-12 w-12 opacity-20 mb-4" />
              <p>No lab orders found.</p>
            </div>
          ) : (
            labs.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`flex flex-col gap-2 p-4 rounded-xl border transition-all text-left ${
                  selectedId === item.id 
                    ? "border-sky-500/50 bg-sky-500/10" 
                    : "border-white/10 bg-slate-950/50 hover:bg-white/5"
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <h3 className="font-semibold text-white truncate pr-4">{item.test_name}</h3>
                  {item.critical_alert && (
                    <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                  )}
                </div>
                <div className="flex items-center justify-between w-full text-xs">
                  <span className="text-slate-400">Order: {item.order_id}</span>
                  <span className={`px-2 py-0.5 rounded-md font-medium ${
                    item.status === 'finalized' ? 'bg-emerald-500/20 text-emerald-400' :
                    item.status === 'pending_collection' ? 'bg-amber-500/20 text-amber-400' :
                    item.status === 'critical' ? 'bg-red-500/20 text-red-400' :
                    'bg-sky-500/20 text-sky-400'
                  }`}>
                    {item.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Right Detail Panel */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-6 h-fit sticky top-6">
          {selected ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between border-b border-white/10 pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Test Details</span>
                    {selected.priority === 'urgent' || selected.priority === 'asap' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 uppercase tracking-widest">{selected.priority}</span>
                    ) : null}
                  </div>
                  <h2 className="text-xl font-semibold text-white">{selected.test_name}</h2>
                  <p className="text-sm text-slate-400 mt-1">Ordered on {new Date(selected.created_at).toLocaleString()}</p>
                </div>
                <button className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 transition">
                  <Download className="h-4 w-4" /> Report
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/5 bg-slate-900 p-4">
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {selected.status === 'finalized' ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Clock className="h-4 w-4 text-amber-400" />}
                    <span className="text-sm font-medium text-slate-200 capitalize">{selected.status.replace(/_/g, ' ')}</span>
                  </div>
                </div>
                <div className="rounded-xl border border-white/5 bg-slate-900 p-4">
                  <p className="text-xs text-slate-500 mb-1">Service Area</p>
                  <p className="text-sm font-medium text-slate-200 capitalize">{selected.service_area}</p>
                </div>
              </div>

              {selected.status === 'finalized' || selected.status === 'critical' ? (
                <div className={`rounded-xl border p-5 ${selected.critical_alert ? 'border-red-500/30 bg-red-500/10' : 'border-emerald-500/30 bg-emerald-500/5'}`}>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-3 opacity-70">Result Findings</p>
                  <p className="text-lg font-medium text-white mb-4">{selected.result_value || 'No value recorded'}</p>
                  
                  {selected.result_notes && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-xs text-slate-400 mb-1">Technician Notes</p>
                      <p className="text-sm text-slate-300">{selected.result_notes}</p>
                    </div>
                  )}
                  {selected.result_entered_at && (
                    <p className="text-xs text-slate-500 mt-4">Result entered: {new Date(selected.result_entered_at).toLocaleString()}</p>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-white/5 bg-slate-900 p-8 text-center text-slate-400">
                  <Clock className="mx-auto h-8 w-8 mb-3 opacity-50" />
                  <p>Results are not yet available.</p>
                  <p className="text-xs mt-1">The laboratory is processing your order.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-500">
              <FlaskConical className="h-10 w-10 mb-4 opacity-20" />
              <p>Select a lab order to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
