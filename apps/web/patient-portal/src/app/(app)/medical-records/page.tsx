"use client";

import { Download, Share2, FileText, Loader2, Calendar } from "lucide-react";
import { useEffect, useState } from "react";

type VisitSummary = {
  id: string;
  appointment_id: string;
  patient_id: string;
  summary: string;
  disposition: string;
  service_type?: string;
  facility_name?: string;
  scheduled_at?: string;
  created_at: string;
};

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<VisitSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [keyword, setKeyword] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    async function loadRecords() {
      try {
        setLoading(true);
        const res = await fetch("/api/medical-records");
        if (!res.ok) throw new Error("Failed to load medical records");
        const data = await res.json();
        setRecords(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadRecords();
  }, []);

  const filteredRecords = records.filter(record => {
    if (keyword && !record.summary.toLowerCase().includes(keyword.toLowerCase()) && 
        !record.disposition.toLowerCase().includes(keyword.toLowerCase())) {
      return false;
    }
    if (dateFilter) {
      const recordDate = new Date(record.created_at).toISOString().split('T')[0];
      if (recordDate !== dateFilter) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Medical Records</h1>
        <p className="text-sm text-slate-400 mt-1">Patient history timeline, diagnoses, and visit summaries from your doctors.</p>
      </div>

      <section className="rounded-2xl border border-white/10 bg-slate-950/50 p-5 shadow-soft">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <input 
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50" 
            placeholder="Search summaries or dispositions..." 
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <input 
            type="date" 
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500/50" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-sky-500" />
            <p>Loading your medical records...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-400">
            {error}
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-slate-400">
            <FileText className="mx-auto h-12 w-12 opacity-20 mb-4" />
            <p>No medical records found.</p>
            {keyword || dateFilter ? <p className="text-xs mt-2">Try adjusting your filters.</p> : null}
          </div>
        ) : (
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
            {filteredRecords.map((entry, idx) => (
              <div key={entry.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Timeline dot */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-950 bg-sky-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <FileText className="h-4 w-4" />
                </div>
                
                {/* Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {new Date(entry.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <button className="rounded-lg bg-white/5 p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition" title="Download PDF"><Download className="h-3.5 w-3.5" /></button>
                        <button className="rounded-lg bg-white/5 p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition" title="Share"><Share2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-white text-base">Visit Summary</h3>
                    
                    {(entry.facility_name || entry.service_type) && (
                      <div className="flex flex-wrap gap-2 text-xs">
                        {entry.facility_name && (
                          <span className="rounded-md bg-slate-800 px-2 py-1 text-slate-300">🏥 {entry.facility_name}</span>
                        )}
                        {entry.service_type && (
                          <span className="rounded-md bg-slate-800 px-2 py-1 text-slate-300">🩺 {entry.service_type.replace(/_/g, ' ')}</span>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-2 text-sm text-slate-300 whitespace-pre-wrap bg-slate-900/50 p-3 rounded-lg border border-white/5">
                      {entry.summary}
                    </div>
                    
                    {entry.disposition && (
                      <div className="mt-2 border-t border-white/5 pt-2">
                        <p className="text-xs font-medium text-slate-400 mb-1">Doctor's Disposition / Plan</p>
                        <p className="text-sm text-sky-200">{entry.disposition}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
