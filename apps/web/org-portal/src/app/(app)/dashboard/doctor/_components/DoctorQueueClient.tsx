"use client";

import { DoctorWorkspaceShell, StatGrid } from "./DoctorWorkspaceShell";
import { PatientPanel } from "./PatientPanel";
import { QueueList } from "./QueueList";
import { useDoctorWorkspace } from "./useDoctorWorkspace";

export function DoctorQueueClient() {
  const workspace = useDoctorWorkspace();
  // const stats = [
  //   { label: "Waiting", value: workspace.statusCounts.waitingForDoctor },
  //   { label: "Active", value: workspace.statusCounts.activeConsults },
  //   { label: "Lab", value: workspace.statusCounts.awaitingLab },
  //   { label: "Triage", value: workspace.statusCounts.awaitingTriage },
  // ];

  return (
    <DoctorWorkspaceShell view="queue" onRefresh={() => void workspace.loadData()} loadingError={workspace.loadingError} actionError={workspace.actionError} actionMessage={workspace.actionMessage}>
      {/* <StatGrid stats={stats} /> */}
      <section className="grid gap-4 xl:grid-cols-[800px_1fr]">
        <QueueList
          appointments={workspace.organizationQueue}
          patientLookup={workspace.patientLookup}
          queueLookup={workspace.queueLookup}
          selectedAppointmentId={workspace.selectedAppointmentId}
          loading={workspace.loading}
          onSelect={workspace.setSelectedAppointmentId}
        />
        {/* <PatientPanel
          appointment={workspace.selectedAppointment}
          patient={workspace.selectedPatient}
          queueEntry={workspace.selectedQueueEntry}
          canStartConsult={workspace.canStartConsult}
          isSubmitting={workspace.isSubmittingAction}
          onStartConsult={() => workspace.selectedAppointment ? void workspace.submitDoctorAction({ action: "start_consult", appointmentId: workspace.selectedAppointment.id }, "Consultation started.") : undefined}
        /> */}
      </section>
    </DoctorWorkspaceShell>
  );
}
