"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Appointment = {
  id: string;
  patient_id: string;
  status: string;
  reason?: string;
  notes?: string;
  scheduled_at: string;
};

type Patient = {
  id: string;
  full_name: string;
};

export default function NurseTriageHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [appointmentsRes, patientsRes] = await Promise.all([
        fetch("/api/appointments?limit=400", { cache: "no-store" }),
        fetch("/api/org/patients?limit=300", { cache: "no-store" }),
      ]);
      const appointmentPayload = await appointmentsRes.json().catch(() => []);
      const patientPayload = await patientsRes.json().catch(() => []);
      setAppointments(Array.isArray(appointmentPayload) ? appointmentPayload : []);
      setPatients(Array.isArray(patientPayload) ? patientPayload : []);
    } finally {
      setLoading(false);
    }
  }

  const patientLookup = useMemo(() => new Map(patients.map((p) => [p.id, p.full_name])), [patients]);

  const rows = useMemo(() => {
    return appointments
      .filter((a) => a.status === "triage_completed" || a.status === "doctor_waiting" || a.status === "lab_waiting" || a.status === "telemedicine_waiting" || a.status === "opd_waiting")
      .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())
      .slice(0, 80);
  }, [appointments]);

  return (
    <div className="mx-auto max-w-screen-2xl space-y-4 p-4 md:p-6">
      <header className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Nurse workspace</p>
        <h1 className="mt-1 text-xl font-semibold">Triage History</h1>
        <p className="mt-1 text-sm text-muted-foreground">Review recently completed and routed triage cases.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/dashboard/nurse/triage" className="rounded-lg border border-border bg-background px-3 py-2 text-sm">Back to board</Link>
          <Link href="/dashboard/nurse/triage/protocols" className="rounded-lg border border-border bg-background px-3 py-2 text-sm">Protocols</Link>
        </div>
      </header>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        {loading ? <p className="text-sm text-muted-foreground">Loading history...</p> : null}
        {!loading ? (
          <div className="space-y-2">
            {rows.map((item) => (
              <article key={item.id} className="rounded-lg border border-border bg-background p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{patientLookup.get(item.patient_id) || item.patient_id}</p>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{item.status.replaceAll("_", " ")}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(item.scheduled_at).toLocaleString()}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.reason || "No complaint captured"}</p>
                <div className="mt-2">
                  <Link href={`/dashboard/nurse/triage/${encodeURIComponent(item.id)}`} className="rounded-lg border border-border px-3 py-1.5 text-xs">Open case</Link>
                </div>
              </article>
            ))}
            {rows.length === 0 ? <p className="text-sm text-muted-foreground">No triage history yet.</p> : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
