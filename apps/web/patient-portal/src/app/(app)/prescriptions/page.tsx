"use client";

import { useEffect, useState } from "react";
import { Pill, Calendar, Clock, Loader2, AlertCircle } from "lucide-react";

type DoctorPrescription = {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration_days: number;
  instructions?: string;
  status: string;
  created_at: string;
};

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<DoctorPrescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrescriptions() {
      try {
        setLoading(true);
        const res = await fetch("/api/patient/doctor-prescriptions");
        if (!res.ok) throw new Error("Failed to load prescriptions");
        const data = await res.json();
        setPrescriptions(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPrescriptions();
  }, []);

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Prescriptions</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your active medications and review prescription history.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 rounded-2xl border border-white/10 bg-slate-950/50">
          <Loader2 className="h-8 w-8 animate-spin mb-4 text-sky-500" />
          <p>Loading your prescriptions...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-400">
          {error}
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-slate-400 bg-slate-950/50">
          <Pill className="mx-auto h-12 w-12 opacity-20 mb-4" />
          <p>No prescriptions found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prescriptions.map((item) => (
            <div key={item.id} className="flex flex-col rounded-2xl border border-white/10 bg-slate-950/50 p-5 hover:bg-white/5 transition group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
                    <Pill className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg leading-tight">{item.medication}</h3>
                    <p className="text-sm text-sky-400">{item.dosage}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-center gap-2 text-sm text-slate-300 bg-white/5 p-2 rounded-lg border border-white/5">
                  <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{item.frequency}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-300 bg-white/5 p-2 rounded-lg border border-white/5">
                  <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>Duration: {item.duration_days} days</span>
                </div>

                {item.instructions && (
                  <div className="flex items-start gap-2 text-sm text-slate-300 bg-white/5 p-2 rounded-lg border border-white/5">
                    <AlertCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="italic">{item.instructions}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-xs text-slate-500">
                  Issued: {new Date(item.created_at).toLocaleDateString()}
                </span>
                <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${
                  item.status === 'dispensed' ? 'bg-emerald-500/20 text-emerald-400' :
                  item.status === 'pending_dispense' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-slate-500/20 text-slate-400'
                }`}>
                  {item.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
