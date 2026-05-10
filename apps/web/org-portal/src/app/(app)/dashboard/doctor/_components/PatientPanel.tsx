"use client";

import Link from "next/link";
import type { Appointment, Patient, QueueEntry } from "./types";
import { appointmentTitle, formatStatusLabel } from "./utils";

export function PatientPanel({
  appointment,
  patient,
  queueEntry,
  onStartConsult,
  canStartConsult,
  isSubmitting,
}: {
  appointment: Appointment | null;
  patient: Patient | null;
  queueEntry: QueueEntry | null;
  onStartConsult?: () => void;
  canStartConsult?: boolean;
  isSubmitting?: boolean;
}) {
  if (!appointment) {
    return (
      <article className="rounded-lg border border-dashed border-border bg-card p-5 text-sm text-muted-foreground">
        Select a patient from the queue.
      </article>
    );
  }

  return (
    <article className="rounded-lg border border-border bg-card p-5 shadow-soft">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Selected Patient</p>
          <h2 className="mt-1 text-xl font-semibold">{patient?.full_name || appointment.patient_id}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{appointmentTitle(appointment.reason, appointment.serviceType, appointment.serviceCategory)}</p>
        </div>
        <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{formatStatusLabel(appointment.status)}</span>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Info label="Queue" value={queueEntry ? `#${queueEntry.position}` : "Not queued"} />
        <Info label="ETA" value={queueEntry?.estimated_wait_minutes ? `${queueEntry.estimated_wait_minutes} min` : "-"} />
        <Info label="Phone" value={patient?.phone || "-"} />
        <Info label="Time" value={new Date(appointment.scheduled_at).toLocaleString()} />
      </dl>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link href={`/patients/${encodeURIComponent(appointment.patient_id)}`} className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted">
          Patient Chart
        </Link>
        {onStartConsult ? (
          <button type="button" onClick={onStartConsult} disabled={!canStartConsult || isSubmitting} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {isSubmitting ? "Starting..." : "Start Consult"}
          </button>
        ) : null}
      </div>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 truncate text-sm">{value}</dd>
    </div>
  );
}
