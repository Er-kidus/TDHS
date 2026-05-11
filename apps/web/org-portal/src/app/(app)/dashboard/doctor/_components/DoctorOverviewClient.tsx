"use client";

import { useRouter } from "next/navigation";
import { UserRound } from "lucide-react";
import { DoctorWorkspaceShell, StatGrid } from "./DoctorWorkspaceShell";
import { useDoctorWorkspace } from "./useDoctorWorkspace";
import { QueueList } from "./QueueList";

export function DoctorOverviewClient() {
  const router = useRouter();
  const workspace = useDoctorWorkspace();
  const stats = [
    { label: "Waiting", value: workspace.statusCounts.waitingForDoctor },
    { label: "Active", value: workspace.statusCounts.activeConsults },
    { label: "Lab", value: workspace.statusCounts.awaitingLab },
    { label: "Triage", value: workspace.statusCounts.awaitingTriage },
  ];

  return (
    <DoctorWorkspaceShell view="overview" onRefresh={() => void workspace.loadData()} loadingError={workspace.loadingError} actionError={workspace.actionError} actionMessage={workspace.actionMessage}>
      <StatGrid stats={stats} />

      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
        <QueueList
          appointments={workspace.organizationQueue.slice(0, 6)}
          patientLookup={workspace.patientLookup}
          queueLookup={workspace.queueLookup}
          selectedAppointmentId={workspace.selectedAppointmentId}
          loading={workspace.loading}
          onSelect={(appointmentId) => {
            workspace.setSelectedAppointmentId(appointmentId);
            router.push("/dashboard/doctor/queue");
          }}
        />

        <article className="rounded-lg border border-border bg-card p-4 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Doctor Roster</h2>
              <p className="mt-1 text-sm text-muted-foreground">{workspace.doctors.length} clinicians</p>
            </div>
            <UserRound className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-4 space-y-2">
            {workspace.doctors.slice(0, 6).map((doctor) => (
              <div key={doctor.id} className="rounded-lg border border-border bg-background p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{doctor.full_name}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{doctor.specialty || "General practice"}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-medium ${doctor.verified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {doctor.verified ? "Verified" : "Pending"}
                  </span>
                </div>
              </div>
            ))}
            {!workspace.loading && workspace.doctors.length === 0 ? <p className="text-sm text-muted-foreground">No doctors registered.</p> : null}
          </div>
        </article>
      </section>

      <section className="rounded-lg border border-border bg-card p-5 shadow-soft">
        <h2 className="text-base font-semibold">Workflow Lanes</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {workspace.workflowLanes.map((lane) => (
            <div key={lane.title} className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{lane.title}</p>
              <p className="mt-2 text-2xl font-semibold">{lane.count}</p>
            </div>
          ))}
        </div>
      </section>
    </DoctorWorkspaceShell>
  );
}
