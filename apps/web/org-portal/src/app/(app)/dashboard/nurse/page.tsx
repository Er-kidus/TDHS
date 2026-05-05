"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Appointment = {
  id: string;
  patient_id: string;
  status: string;
  reason?: string;
  serviceType?: string;
  scheduled_at: string;
};

type QueueEntry = {
  queue_id: string;
  service_type?: string;
  appointment_id: string;
  position: number;
  status: string;
  estimated_wait_minutes?: number;
};

type Patient = {
  id: string;
  full_name: string;
  phone?: string;
  email?: string;
};

export default function NurseDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [appointmentsRes, queuesRes, patientsRes] = await Promise.all([
        fetch("/api/appointments?limit=200"),
        fetch("/api/org/queues"),
        fetch("/api/org/patients?limit=300"),
      ]);

      if (!appointmentsRes.ok) {
        const body = (await appointmentsRes.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Failed to load appointments");
      }
      const appointmentsPayload = (await appointmentsRes.json().catch(() => [])) as unknown;
      setAppointments(Array.isArray(appointmentsPayload) ? (appointmentsPayload as Appointment[]) : []);

      if (queuesRes.ok) {
        const queuePayload = (await queuesRes.json().catch(() => [])) as unknown;
        setQueueEntries(Array.isArray(queuePayload) ? (queuePayload as QueueEntry[]) : []);
      } else {
        setQueueEntries([]);
      }

      if (patientsRes.ok) {
        const payload = (await patientsRes.json().catch(() => [])) as unknown;
        setPatients(Array.isArray(payload) ? (payload as Patient[]) : []);
      } else {
        setPatients([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load nurse queue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const bookedQueue = useMemo(() => {
    const lookup = new Map(appointments.map((item) => [item.id, item]));
    return queueEntries
      .map((entry) => ({ entry, appointment: lookup.get(entry.appointment_id) }))
      .filter((row) => row.appointment && ["booked", "triage_waiting"].includes(row.appointment.status))
      .sort((a, b) => a.entry.position - b.entry.position);
  }, [appointments, queueEntries]);

  const activeTriage = useMemo(
    () => appointments.filter((item) => item.status === "triage_in_progress").sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()),
    [appointments],
  );

  const completedTriage = useMemo(
    () => appointments.filter((item) => item.status === "triage_completed").slice(0, 8),
    [appointments],
  );

  const patientLookup = useMemo(() => new Map(patients.map((item) => [item.id, item])), [patients]);

  return (
    <div className="mx-auto max-w-screen-2xl space-y-4 p-4 md:p-6">
      <header className="rounded-xl border border-border bg-card p-4">
        <h1 className="text-xl font-semibold">Nurse Triage Queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">Booked patients only. Open a patient to complete the dedicated triage form.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/dashboard/nurse/triage" className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs">Triage Board</Link>
          <Link href="/dashboard/nurse/triage/history" className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs">Triage History</Link>
          <Link href="/dashboard/nurse/triage/protocols" className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs">Protocols</Link>
        </div>
      </header>

      {!loading ? (
        <section className="grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-border bg-card p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">Booked in Queue</p><p className="mt-2 text-2xl font-semibold">{bookedQueue.length}</p></article>
          <article className="rounded-xl border border-border bg-card p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">Active Triage</p><p className="mt-2 text-2xl font-semibold">{activeTriage.length}</p></article>
          <article className="rounded-xl border border-border bg-card p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">Completed Today</p><p className="mt-2 text-2xl font-semibold">{completedTriage.length}</p></article>
        </section>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Loading triage queue...</p> : null}

      {!loading ? (
        <section className="grid gap-4 xl:grid-cols-[1.05fr_1fr]">
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-2 text-sm font-semibold">Booked Patients Queue</h2>
            <p className="mb-3 text-xs text-muted-foreground">Select a patient to open the triage form.</p>
            <div className="space-y-2">
              {bookedQueue.map(({ entry, appointment }) => {
                const patientName = patientLookup.get(appointment?.patient_id || "")?.full_name || appointment?.patient_id || "Unknown patient";
                return (
                  <Link key={entry.appointment_id} href={`/dashboard/nurse/triage/${encodeURIComponent(entry.appointment_id)}`} className="block rounded-lg border border-border bg-background px-3 py-2 hover:border-primary/50 hover:bg-primary/5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">#{entry.position} {patientName}</p>
                        <p className="text-xs text-muted-foreground">{entry.service_type || appointment?.serviceType || 'service'} • {new Date(appointment?.scheduled_at || '').toLocaleTimeString()}</p>
                      </div>
                      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] text-amber-700">{appointment?.status === 'booked' ? 'Booked' : 'Waiting'}</span>
                    </div>
                  </Link>
                );
              })}
              {bookedQueue.length === 0 ? <p className="text-sm text-muted-foreground">No booked patients waiting for triage.</p> : null}
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-border bg-card p-4">
            <div>
              <h2 className="mb-2 text-sm font-semibold">Active Triage Cases</h2>
              <div className="space-y-2">
                {activeTriage.map((appointment) => (
                  <Link key={appointment.id} href={`/dashboard/nurse/triage/${encodeURIComponent(appointment.id)}`} className="block rounded-lg border border-border bg-background px-3 py-2 hover:border-primary/50 hover:bg-primary/5">
                    <p className="text-sm font-medium">{patientLookup.get(appointment.patient_id)?.full_name || appointment.patient_id}</p>
                    <p className="text-xs text-muted-foreground">{appointment.serviceType || 'service'} • {new Date(appointment.scheduled_at).toLocaleTimeString()}</p>
                  </Link>
                ))}
                {activeTriage.length === 0 ? <p className="text-sm text-muted-foreground">No active triage cases.</p> : null}
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h2 className="mb-2 text-sm font-semibold">Recently Completed</h2>
              <div className="space-y-2">
                {completedTriage.map((appointment) => (
                  <article key={appointment.id} className="rounded-lg border border-border bg-background px-3 py-2">
                    <p className="text-sm font-medium">{patientLookup.get(appointment.patient_id)?.full_name || appointment.patient_id}</p>
                    <p className="text-xs text-muted-foreground">Completed triage • {new Date(appointment.scheduled_at).toLocaleString()}</p>
                  </article>
                ))}
                {completedTriage.length === 0 ? <p className="text-sm text-muted-foreground">No completed triage appointments yet.</p> : null}
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h2 className="mb-2 text-sm font-semibold">Workflow</h2>
              <p className="text-sm text-muted-foreground">1. Reception routes booked patients into triage. 2. Nurse opens the triage form. 3. Triage is completed and routed to OPD, lab, doctor, or telemedicine.</p>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
