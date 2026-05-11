"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Appointment = {
  id: string;
  patient_id: string;
  status: string;
  reason?: string;
  notes?: string;
  serviceType?: string;
  scheduled_at: string;
};

type QueueEntry = {
  appointment_id: string;
  position: number;
  status: string;
  service_type?: string;
  estimated_wait_minutes?: number;
};

type Patient = {
  id: string;
  full_name: string;
};

export default function NurseTriageBoardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [appointmentsRes, queuesRes, patientsRes] = await Promise.all([
        fetch("/api/appointments?limit=250", { cache: "no-store" }),
        fetch("/api/org/queues", { cache: "no-store" }),
        fetch("/api/org/patients?limit=300", { cache: "no-store" }),
      ]);

      const apptPayload = await appointmentsRes.json().catch(() => []);
      const queuePayload = await queuesRes.json().catch(() => []);
      const patientPayload = await patientsRes.json().catch(() => []);

      setAppointments(Array.isArray(apptPayload) ? apptPayload : []);
      setQueueEntries(Array.isArray(queuePayload) ? queuePayload : []);
      setPatients(Array.isArray(patientPayload) ? patientPayload : []);

      if (!appointmentsRes.ok) {
        throw new Error("Unable to load triage board");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load triage board");
    } finally {
      setLoading(false);
    }
  }

  const patientLookup = useMemo(() => new Map(patients.map((p) => [p.id, p.full_name])), [patients]);

  const triageRows = useMemo(() => {
    const byAppointment = new Map(appointments.map((a) => [a.id, a]));
    return queueEntries
      .map((entry) => ({ entry, appointment: byAppointment.get(entry.appointment_id) }))
      .filter((row) => {
        const status = row.appointment?.status || "";
        return status === "booked" || status === "triage_waiting" || status === "triage_in_progress";
      })
      .sort((a, b) => a.entry.position - b.entry.position);
  }, [queueEntries, appointments]);

  return (
    <div className="mx-auto max-w-screen-2xl space-y-4 p-4 md:p-6">
      <header className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Nurse workspace</p>
        <h1 className="mt-1 text-xl font-semibold">Triage Board</h1>
        <p className="mt-1 text-sm text-muted-foreground">Monitor triage-ready patients, open forms quickly, and keep patient flow moving.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/dashboard/nurse" className="rounded-lg border border-border bg-background px-3 py-2 text-sm">Queue Home</Link>
          <Link href="/dashboard/nurse/triage/history" className="rounded-lg border border-border bg-background px-3 py-2 text-sm">Triage History</Link>
          <Link href="/dashboard/nurse/triage/protocols" className="rounded-lg border border-border bg-background px-3 py-2 text-sm">Protocols</Link>
        </div>
      </header>

      {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Loading triage board...</p> : null}

      {!loading ? (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Queue Lanes</h2>
            <button type="button" onClick={() => void load()} className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs">Refresh</button>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {triageRows.map(({ entry, appointment }) => {
              if (!appointment) return null;
              const patientName = patientLookup.get(appointment.patient_id) || appointment.patient_id;
              return (
                <article key={appointment.id} className="rounded-xl border border-border bg-background p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">#{entry.position} {patientName}</p>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">{appointment.status.replaceAll("_", " ")}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{appointment.serviceType || entry.service_type || "general"} • ETA {entry.estimated_wait_minutes ?? "-"}m</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{appointment.reason || "No reason captured"}</p>
                  <div className="mt-3 flex gap-2">
                    <Link href={`/dashboard/nurse/triage/${encodeURIComponent(appointment.id)}`} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">Open form</Link>
                    <Link href="/dashboard/nurse/triage/history" className="rounded-lg border border-border px-3 py-1.5 text-xs">History</Link>
                  </div>
                </article>
              );
            })}
          </div>
          {triageRows.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No triage-ready appointments in queue.</p> : null}
        </section>
      ) : null}
    </div>
  );
}
