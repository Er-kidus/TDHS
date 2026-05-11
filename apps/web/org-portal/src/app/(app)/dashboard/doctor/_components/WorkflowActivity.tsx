"use client";

import type { WorkflowPayload } from "./types";
import { formatStatusLabel } from "./utils";

export function WorkflowActivity({ workflow }: { workflow: WorkflowPayload }) {
  return (
    <article className="rounded-lg border border-border bg-card p-5 shadow-soft">
      <h2 className="text-base font-semibold">Workflow Activity</h2>
      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        <ActivityList
          title="Lab Orders"
          empty="No lab orders"
          items={workflow.labOrders.map((item) => ({
            id: item.id,
            title: item.testName,
            meta: `${formatStatusLabel(item.status)} | ${item.priority}`,
            detail: item.indication,
          }))}
        />
        <ActivityList
          title="Prescriptions"
          empty="No prescriptions"
          items={workflow.prescriptions.map((item) => ({
            id: item.id,
            title: `${item.medication} ${item.dosage}`,
            meta: `${item.frequency} | ${item.durationDays} days | ${formatStatusLabel(item.status)}`,
            detail: item.instructions || "No instructions",
          }))}
        />
        <ActivityList
          title="Follow-ups"
          empty="No follow-ups"
          items={workflow.followUps.map((item) => ({
            id: item.id,
            title: item.reason,
            meta: new Date(item.scheduledAt).toLocaleString(),
            detail: item.notes || item.followUpAppointmentId,
          }))}
        />
        <ActivityList
          title="Visit Summaries"
          empty="No summaries"
          items={workflow.visitSummaries.map((item) => ({
            id: item.id,
            title: formatStatusLabel(item.disposition),
            meta: new Date(item.createdAt).toLocaleString(),
            detail: item.summary,
          }))}
        />
      </div>
    </article>
  );
}

function ActivityList({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: Array<{ id: string; title: string; meta: string; detail: string }>;
}) {
  return (
    <section className="rounded-lg border border-border bg-background p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-border bg-card p-3">
            <p className="text-sm font-medium">{item.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.meta}</p>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.detail}</p>
          </div>
        ))}
        {items.length === 0 ? <p className="text-sm text-muted-foreground">{empty}</p> : null}
      </div>
    </section>
  );
}
