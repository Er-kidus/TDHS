"use client";

import { useRouter } from "next/navigation";

import { DoctorWorkspaceShell, StatGrid } from "./DoctorWorkspaceShell";
import { PatientPanel } from "./PatientPanel";
import { QueueList } from "./QueueList";
import { useDoctorWorkspace } from "./useDoctorWorkspace";

export function DoctorQueueClient() {
  const workspace = useDoctorWorkspace();
  const router = useRouter();

  return (
    <DoctorWorkspaceShell view="queue" onRefresh={() => void workspace.loadData()} loadingError={workspace.loadingError} actionError={workspace.actionError} actionMessage={workspace.actionMessage}>
  
        <QueueList
          appointments={workspace.organizationQueue}
          patientLookup={workspace.patientLookup}
          queueLookup={workspace.queueLookup}
          selectedAppointmentId={workspace.selectedAppointmentId}
          loading={workspace.loading}
          onSelect={(id) => {
            workspace.setSelectedAppointmentId(id);
            router.push("/dashboard/doctor/workflow");
          }}
        />
       
    
    </DoctorWorkspaceShell>
  );
}
