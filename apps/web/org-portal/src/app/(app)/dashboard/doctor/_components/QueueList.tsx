"use client";

import type { Appointment, Patient, QueueEntry } from "./types";
import { appointmentTitle, formatStatusLabel } from "./utils";

export function QueueList({
  appointments,
  patientLookup,
  queueLookup,
  selectedAppointmentId,
  loading,
  onSelect,
}: {
  appointments: Appointment[];
  patientLookup: Map<string, Patient>;
  queueLookup: Map<string, QueueEntry>;
  selectedAppointmentId?: string;
  loading: boolean;
  onSelect: (appointmentId: string) => void;
}) {
  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Queue</h2>
          <p className="mt-1 text-sm text-muted-foreground">{appointments.length} active cases</p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {appointments.map((appointment) => {
          const patient = patientLookup.get(appointment.patient_id);
          const queueEntry = queueLookup.get(appointment.id);
          const active = selectedAppointmentId === appointment.id;
          return (
            <button
              key={appointment.id}
              type="button"
              onClick={() => onSelect(appointment.id)}
              className={`w-full rounded-lg border p-3 text-left transition ${active ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-muted"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{patient?.full_name || appointment.patient_id}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{appointmentTitle(appointment.reason, appointment.serviceType, appointment.serviceCategory)}</p>
                </div>
                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">{formatStatusLabel(appointment.status)}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{queueEntry ? `#${queueEntry.position} | ETA ${queueEntry.estimated_wait_minutes ?? "-"} min` : "No queue position"}</p>
            </button>
          );
        })}
        {!loading && appointments.length === 0 ? <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">No patients are waiting.</p> : null}
      </div>
    </article>
  );
}
