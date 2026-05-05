"use client";

import { useEffect, useMemo, useState } from "react";

type Appointment = {
  id: string;
  patient_id: string;
  scheduled_at: string;
  status: string;
  reason?: string;
  serviceType?: string;
  serviceCategory?: string;
  notes?: string;
};

type QueueEntry = {
  queue_id: string;
  service_type: string;
  facility?: string;
  appointment_id: string;
  position: number;
  status: string;
  estimated_wait_minutes: number;
};

type Patient = {
  id: string;
  full_name: string;
  phone?: string;
  email?: string;
};

type AppointmentWithQueue = {
  appointment: Appointment;
  patient?: Patient;
  queueEntry?: QueueEntry;
  inCorrectQueue: boolean;
};

type RouteTarget = "triage" | "opd" | "lab" | "telemedicine";

type PopupState = {
  kind: "success" | "error";
  message: string;
} | null;

function normalizeService(value?: string) {
  return (value || "general_consultation").trim().toLowerCase();
}

function getRecommendedRoute(appointment: Appointment): RouteTarget {
  const service = normalizeService(appointment.serviceType || appointment.serviceCategory);
  const details = normalizeService(`${appointment.reason || ""} ${appointment.notes || ""}`);
  if (service.includes("lab") || details.includes("lab")) return "lab";
  if (service.includes("tele") || details.includes("tele")) return "telemedicine";
  if (service.includes("diag") || service.includes("medical") || details.includes("diag") || details.includes("medical")) return "triage";
  return "opd";
}

function formatStatusLabel(value: string) {
  if (!value) return "Unknown";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function ReceptionDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [popup, setPopup] = useState<PopupState>(null);

  useEffect(() => {
    if (!popup) return;
    const timer = window.setTimeout(() => setPopup(null), 3200);
    return () => window.clearTimeout(timer);
  }, [popup]);

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
        const queuesPayload = (await queuesRes.json().catch(() => [])) as unknown;
        setQueueEntries(Array.isArray(queuesPayload) ? (queuesPayload as QueueEntry[]) : []);
      } else {
        setQueueEntries([]);
      }

      if (patientsRes.ok) {
        const patientsPayload = (await patientsRes.json().catch(() => [])) as unknown;
        setPatients(Array.isArray(patientsPayload) ? (patientsPayload as Patient[]) : []);
      } else {
        setPatients([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load reception queue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const todayBooked = useMemo(
    () => appointments.filter((a) => a.status === "booked").sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()),
    [appointments]
  );

  const patientLookup = useMemo(() => new Map(patients.map((patient) => [patient.id, patient])), [patients]);
  const queueByAppointment = useMemo(() => new Map(queueEntries.map((entry) => [entry.appointment_id, entry])), [queueEntries]);

  const bookedAppointmentRows = useMemo<AppointmentWithQueue[]>(() => {
    return todayBooked.map((appointment) => {
      const queueEntry = queueByAppointment.get(appointment.id);
      const inCorrectQueue = !queueEntry
        ? false
        : normalizeService(queueEntry.service_type) === normalizeService(appointment.serviceType);
      return {
        appointment,
        patient: patientLookup.get(appointment.patient_id),
        queueEntry,
        inCorrectQueue,
      };
    });
  }, [patientLookup, queueByAppointment, todayBooked]);

  const queuedBookedRows = useMemo(() => bookedAppointmentRows.filter((row) => row.inCorrectQueue), [bookedAppointmentRows]);
  const needsQueueRows = useMemo(() => bookedAppointmentRows.filter((row) => !row.inCorrectQueue), [bookedAppointmentRows]);

  const queueList = useMemo(() => {
    const lookup = new Map(appointments.map((a) => [a.id, a]));
    return queueEntries
      .map((entry) => ({ entry, appointment: lookup.get(entry.appointment_id) }))
      .filter((row) => row.appointment)
      .sort((a, b) => a.entry.position - b.entry.position);
  }, [appointments, queueEntries]);

  function pushPopup(kind: "success" | "error", message: string) {
    setPopup({ kind, message });
  }

  async function ensureQueueEntry(appointmentId: string) {
    setError(null);
    const checkInRes = await fetch("/api/org/queues/check-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId }),
    });
    if (!checkInRes.ok) {
      const body = (await checkInRes.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error || "Failed to check-in queue");
    }
  }

  async function routeAppointment(appointmentId: string, target?: RouteTarget) {
    const appointment = appointments.find((item) => item.id === appointmentId);
    if (!appointment) {
      setError("Appointment not found for routing.");
      return;
    }
    const queueEntry = queueByAppointment.get(appointmentId);
    const inCorrectQueue = !queueEntry
      ? false
      : normalizeService(queueEntry.service_type) === normalizeService(appointment.serviceType);
    const patientName = patientLookup.get(appointment.patient_id)?.full_name || appointment.patient_id;
    const routeTarget = target || getRecommendedRoute(appointment);
    const confirmed = window.confirm(`Route ${patientName} to ${formatStatusLabel(routeTarget)} now?`);
    if (!confirmed) {
      return;
    }

    try {
      if (!queueEntry || !inCorrectQueue) {
        await ensureQueueEntry(appointmentId);
      }

      const nextStatus = routeTarget === "triage" ? "triage_waiting" : routeTarget === "lab" ? "lab_waiting" : routeTarget === "telemedicine" ? "telemedicine_waiting" : "opd_waiting";
      const mergedNotes = `${appointment.notes || ""}\n[Reception] Routed to ${routeTarget} queue.`.trim();
      const updateRes = await fetch(`/api/appointments/${encodeURIComponent(appointmentId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          notes: mergedNotes,
          assignedStaffType: routeTarget === "lab" ? "lab" : routeTarget === "telemedicine" ? "doctor" : routeTarget === "triage" ? "nurse" : "doctor",
        }),
      });

      if (!updateRes.ok) {
        const body = (await updateRes.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || `Failed to route booking to ${routeTarget}`);
      }

      pushPopup("success", `${patientName} routed to ${formatStatusLabel(routeTarget)}.`);
      await load();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to route booking";
      setError(message);
      pushPopup("error", message);
    }
  }

  async function startQueue() {
    const next = bookedAppointmentRows.find((row) => row.appointment.status === "booked");
    if (!next) {
      setError("No booked appointments are available to start queue.");
      return;
    }
    await routeAppointment(next.appointment.id, getRecommendedRoute(next.appointment));
  }

  async function callNextToTriage() {
    const next = queueList.find((row) => row.appointment?.status === "booked");
    if (!next?.appointment) {
      setError("No booked patient is waiting to be sent to triage.");
      return;
    }
    await routeAppointment(next.appointment.id, getRecommendedRoute(next.appointment));
  }

  return (
    <div className="mx-auto max-w-screen-2xl space-y-4 p-4 md:p-6">
      <header className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h1 className="text-xl font-semibold">Reception Queue Desk</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track booked patients, verify queue placement, and move arrivals into triage without missing context.</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Booked Today</p>
          <p className="mt-1 text-2xl font-semibold">{todayBooked.length}</p>
        </article>
        <article className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Correct Queue</p>
          <p className="mt-1 text-2xl font-semibold text-success">{queuedBookedRows.length}</p>
        </article>
        <article className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Needs Queue</p>
          <p className="mt-1 text-2xl font-semibold text-warning">{needsQueueRows.length}</p>
        </article>
        <article className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Waiting In Queue</p>
          <p className="mt-1 text-2xl font-semibold">{queueList.length}</p>
        </article>
      </section>

      <div className="flex flex-wrap gap-2">
        <button onClick={startQueue} className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground">Queue Starter</button>
        <button onClick={callNextToTriage} className="rounded-lg border border-border px-3 py-2 text-xs">Send Next To Triage</button>
        <button onClick={() => load()} className="rounded-lg border border-border px-3 py-2 text-xs">Refresh</button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Loading queue...</p> : null}

      {!loading ? (
        <section className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Appointments • Booked Patients</h2>
              <span className="text-xs text-muted-foreground">Backend synced</span>
            </div>
            <div className="space-y-2">
              {bookedAppointmentRows.map((row) => {
                const patientName = row.patient?.full_name || row.appointment.patient_id;
                const service = row.appointment.serviceType || row.appointment.serviceCategory || "general_consultation";
                return (
                  <article key={row.appointment.id} className="rounded-xl border border-border bg-background p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{patientName}</p>
                        <p className="text-xs text-muted-foreground">{new Date(row.appointment.scheduled_at).toLocaleString()} • {service}</p>
                        <p className="text-xs text-muted-foreground">{row.patient?.phone || row.patient?.email || "No contact available"}</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-[11px] ${row.inCorrectQueue ? "bg-emerald-500/15 text-emerald-700" : "bg-amber-500/15 text-amber-700"}`}>
                        {row.inCorrectQueue ? "Queued correctly" : "Needs queue assignment"}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                      <p className="text-xs text-muted-foreground">
                        {row.queueEntry
                          ? `Queue #${row.queueEntry.position} • ETA ${row.queueEntry.estimated_wait_minutes}m • ${formatStatusLabel(row.queueEntry.status)}`
                          : "Not in queue yet"}
                      </p>
                      <div className="flex flex-wrap justify-end gap-2">
                        <button onClick={() => void routeAppointment(row.appointment.id, "triage")} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium">To Triage</button>
                        <button onClick={() => void routeAppointment(row.appointment.id, "opd")} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium">To OPD</button>
                        <button onClick={() => void routeAppointment(row.appointment.id, "lab")} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium">To Lab</button>
                        <button onClick={() => void routeAppointment(row.appointment.id, "telemedicine")} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium">Telemedicine</button>
                      </div>
                    </div>
                  </article>
                );
              })}
              {bookedAppointmentRows.length === 0 ? <p className="text-sm text-muted-foreground">No booked appointments found.</p> : null}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <h2 className="mb-3 text-sm font-semibold">Live Queue List</h2>
            <div className="space-y-2">
              {queueList.map(({ entry, appointment }) => {
                const patient = appointment ? patientLookup.get(appointment.patient_id) : undefined;
                const patientName = patient?.full_name || appointment?.patient_id || "Unknown patient";
                return (
                  <article key={`${entry.queue_id}-${entry.appointment_id}`} className="rounded-xl border border-border bg-background p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">#{entry.position} {patientName}</p>
                        <p className="text-xs text-muted-foreground">{entry.service_type || appointment?.serviceType || "service"} • ETA {entry.estimated_wait_minutes}m</p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] text-primary">{formatStatusLabel(entry.status)}</span>
                    </div>
                    <div className="mt-3 flex justify-end">
                      {appointment?.status === "booked" ? (
                        <button onClick={() => void routeAppointment(entry.appointment_id, getRecommendedRoute(appointment))} className="rounded-lg border border-border px-3 py-1.5 text-xs">Route To Service</button>
                      ) : (
                        <span className="text-xs text-muted-foreground">{formatStatusLabel(appointment?.status || "waiting")}</span>
                      )}
                    </div>
                  </article>
                );
              })}
              {queueList.length === 0 ? <p className="text-sm text-muted-foreground">No queue entries yet.</p> : null}
            </div>
          </div>
        </section>
      ) : null}

      {popup ? (
        <div className="fixed bottom-5 right-5 z-50 max-w-xs rounded-xl border border-border bg-card px-4 py-3 shadow-2xl">
          <p className={`text-sm ${popup.kind === "success" ? "text-emerald-700" : "text-red-700"}`}>{popup.message}</p>
        </div>
      ) : null}
    </div>
  );
}
