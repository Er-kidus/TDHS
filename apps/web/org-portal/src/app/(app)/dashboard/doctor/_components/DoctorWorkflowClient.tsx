"use client";

import { DoctorWorkspaceShell } from "./DoctorWorkspaceShell";
import { PatientPanel } from "./PatientPanel";
import { QueueList } from "./QueueList";
import { useDoctorWorkspace } from "./useDoctorWorkspace";
import { WorkflowActivity } from "./WorkflowActivity";
import { WorkflowForms } from "./WorkflowForms";

export function DoctorWorkflowClient() {
  const workspace = useDoctorWorkspace();

  return (
    <DoctorWorkspaceShell view="workflow" onRefresh={() => void workspace.loadData()} loadingError={workspace.loadingError} actionError={workspace.actionError} actionMessage={workspace.actionMessage}>
      <section className="grid gap-4 xl:grid-cols-[340px_1fr]">
        <QueueList
          appointments={workspace.organizationQueue}
          patientLookup={workspace.patientLookup}
          queueLookup={workspace.queueLookup}
          selectedAppointmentId={workspace.selectedAppointmentId}
          loading={workspace.loading}
          onSelect={workspace.setSelectedAppointmentId}
        />
        <div className="space-y-4">
          <PatientPanel appointment={workspace.selectedAppointment} patient={workspace.selectedPatient} queueEntry={workspace.selectedQueueEntry} />
          <WorkflowForms
            key={workspace.selectedAppointment?.id || "empty"}
            appointment={workspace.selectedAppointment}
            defaultFollowUpDate={workspace.defaultFollowUpDate}
            canStartConsult={workspace.canStartConsult}
            canOrderDuringConsult={workspace.canOrderDuringConsult}
            canCompleteVisit={workspace.canCompleteVisit}
            isSubmitting={workspace.isSubmittingAction}
            onSubmitAction={workspace.submitDoctorAction}
          />
          <WorkflowActivity workflow={workspace.workflow} />
        </div>
      </section>
    </DoctorWorkspaceShell>
  );
}
