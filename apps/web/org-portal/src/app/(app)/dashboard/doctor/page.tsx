"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Activity, CalendarPlus2, ClipboardList, FilePlus2, FlaskConical, RefreshCw, Stethoscope, UserRound } from "lucide-react";

type Doctor = {
  id: string;
  full_name: string;
  email: string;
  specialty: string;
  license_number: string;
  verified: boolean;
};

type Appointment = {
  id: string;
  patient_id: string;
  status: string;
  reason?: string;
  notes?: string;
  serviceType?: string;
  serviceCategory?: string;
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

type PrescriptionRecord = {
  id: string;
  appointmentId: string;
  patientId: string;
  medication: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  instructions?: string;
  status: "draft" | "pending_dispense" | "dispensed";
  createdAt: string;
};

type LabOrderRecord = {
  id: string;
  appointmentId: string;
  patientId: string;
  testName: string;
  indication: string;
  priority: "routine" | "urgent" | "asap";
  status: "requested" | "sample_collected" | "completed";
  createdAt: string;
};

type FollowUpRecord = {
  id: string;
  sourceAppointmentId: string;
  followUpAppointmentId: string;
  patientId: string;
  scheduledAt: string;
  reason: string;
  notes?: string;
  createdAt: string;
};

type VisitSummaryRecord = {
  id: string;
  appointmentId: string;
  patientId: string;
  summary: string;
  disposition: string;
  createdAt: string;
};

type WorkflowPayload = {
  prescriptions: PrescriptionRecord[];
  labOrders: LabOrderRecord[];
  followUps: FollowUpRecord[];
  visitSummaries: VisitSummaryRecord[];
};

type ApiPayload = Record<string, unknown> | string | null;
type DoctorWorkspaceView = "overview" | "queue" | "workflow";
type ActionPanel = "consult" | "lab" | "prescription" | "followup" | "complete";

async function readJsonResponse(response: Response): Promise<ApiPayload> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as ApiPayload;
  } catch {
    return text;
  }
}

function getErrorMessage(payload: ApiPayload, fallback: string): string {
  if (payload && typeof payload === "object" && "error" in payload) {
    const value = payload.error;
    if (typeof value === "string" && value.trim()) return value;
  }
  if (typeof payload === "string" && payload.trim()) return payload;
  return fallback;
}

function formatStatusLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function describeStatus(status: string) {
  switch (status) {
    case "triage_waiting":
      return "Awaiting final doctor review after triage.";
    case "triage_in_progress":
      return "Still in active triage and should be monitored closely.";
    case "doctor_waiting":
      return "Ready for clinician assessment in the doctor queue.";
    case "lab_waiting":
      return "Queued for laboratory or diagnostic work.";
    case "opd_waiting":
      return "Prepared for OPD follow-through and consultation.";
    case "in-progress":
      return "Consultation has started and the patient is actively in care.";
    case "fulfilled":
      return "Consultation workflow has been completed.";
    case "arrived":
      return "Patient has arrived and is waiting to move through care.";
    case "booked":
      return "Patient is booked and pending queue progression.";
    default:
      return "Current workflow status is available for clinician review.";
  }
}

function getWorkspaceView(pathname: string): DoctorWorkspaceView {
  if (pathname.startsWith("/dashboard/doctor/queue")) return "queue";
  if (pathname.startsWith("/dashboard/doctor/workflow")) return "workflow";
  return "overview";
}

function formatDateTimeInput(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date(Date.now() + 86400000).toISOString().slice(0, 16);
  return new Date(date.getTime() + 3600000).toISOString().slice(0, 16);
}

export default function DoctorDashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const currentView = getWorkspaceView(pathname);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [workflow, setWorkflow] = useState<WorkflowPayload>({ prescriptions: [], labOrders: [], followUps: [], visitSummaries: [] });
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");
  const [activePanel, setActivePanel] = useState<ActionPanel>("consult");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const [labForm, setLabForm] = useState({ testName: "", indication: "", priority: "routine" as "routine" | "urgent" | "asap" });
  const [prescriptionForm, setPrescriptionForm] = useState({ medication: "", dosage: "", frequency: "", durationDays: "5", instructions: "" });
  const [followUpForm, setFollowUpForm] = useState({ scheduledAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16), reason: "", notes: "" });
  const [completeForm, setCompleteForm] = useState({ summary: "", disposition: "completed" });

  async function loadData() {
    setLoading(true);
    setLoadingError("");

    try {
      const [docsRes, appointmentsRes, queuesRes, patientsRes] = await Promise.all([
        fetch("/api/org/doctors", { cache: "no-store" }),
        fetch("/api/appointments?limit=200", { cache: "no-store" }),
        fetch("/api/org/queues", { cache: "no-store" }),
        fetch("/api/org/patients?limit=300", { cache: "no-store" }),
      ]);

      const docsData = await readJsonResponse(docsRes);
      const appointmentsData = await readJsonResponse(appointmentsRes);
      const queueData = await readJsonResponse(queuesRes);
      const patientsData = await readJsonResponse(patientsRes);
      const errors: string[] = [];

      if (docsRes.ok) {
        setDoctors(Array.isArray(docsData) ? (docsData as Doctor[]) : []);
      } else {
        setDoctors([]);
        errors.push(getErrorMessage(docsData, "Unable to load doctors"));
      }

      if (appointmentsRes.ok) {
        setAppointments(Array.isArray(appointmentsData) ? (appointmentsData as Appointment[]) : []);
      } else {
        setAppointments([]);
        errors.push(getErrorMessage(appointmentsData, "Unable to load appointments"));
      }

      if (queuesRes.ok) {
        setQueueEntries(Array.isArray(queueData) ? (queueData as QueueEntry[]) : []);
      } else {
        setQueueEntries([]);
        errors.push(getErrorMessage(queueData, "Unable to load queue"));
      }

      if (patientsRes.ok) {
        setPatients(Array.isArray(patientsData) ? (patientsData as Patient[]) : []);
      } else {
        setPatients([]);
        errors.push(getErrorMessage(patientsData, "Unable to load patients"));
      }

      setLoadingError(errors.join(" | "));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const patientLookup = useMemo(() => new Map(patients.map((item) => [item.id, item])), [patients]);
  const queueLookup = useMemo(() => new Map(queueEntries.map((item) => [item.appointment_id, item])), [queueEntries]);

  const organizationQueue = useMemo(() => {
    return appointments
      .filter((item) => item.status !== "telemedicine_waiting")
      .filter((item) =>
        ["booked", "arrived", "triage_waiting", "triage_in_progress", "doctor_waiting", "lab_waiting", "opd_waiting", "in-progress"].includes(item.status),
      )
      .sort((left, right) => {
        const leftQueue = queueLookup.get(left.id)?.position ?? Number.MAX_SAFE_INTEGER;
        const rightQueue = queueLookup.get(right.id)?.position ?? Number.MAX_SAFE_INTEGER;
        if (leftQueue !== rightQueue) return leftQueue - rightQueue;
        return new Date(left.scheduled_at).getTime() - new Date(right.scheduled_at).getTime();
      });
  }, [appointments, queueLookup]);

  useEffect(() => {
    if (!organizationQueue.length) {
      setSelectedAppointmentId("");
      return;
    }

    const currentExists = organizationQueue.some((item) => item.id === selectedAppointmentId);
    if (!currentExists) {
      setSelectedAppointmentId(organizationQueue[0].id);
    }
  }, [organizationQueue, selectedAppointmentId]);

  const selectedAppointment = useMemo(
    () => organizationQueue.find((item) => item.id === selectedAppointmentId) || organizationQueue[0] || null,
    [organizationQueue, selectedAppointmentId],
  );
  const selectedPatient = selectedAppointment ? patientLookup.get(selectedAppointment.patient_id) || null : null;
  const selectedQueueEntry = selectedAppointment ? queueLookup.get(selectedAppointment.id) || null : null;

  useEffect(() => {
    async function loadWorkflow() {
      if (!selectedAppointment) {
        setWorkflow({ prescriptions: [], labOrders: [], followUps: [], visitSummaries: [] });
        return;
      }
      const response = await fetch(`/api/org/doctor-workflow?appointmentId=${encodeURIComponent(selectedAppointment.id)}&patientId=${encodeURIComponent(selectedAppointment.patient_id)}`, {
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => null)) as WorkflowPayload | null;
      setWorkflow(
        payload || {
          prescriptions: [],
          labOrders: [],
          followUps: [],
          visitSummaries: [],
        },
      );
    }
    void loadWorkflow();
  }, [selectedAppointment]);

  useEffect(() => {
    if (!selectedAppointment) return;
    setFollowUpForm((current) => ({
      ...current,
      scheduledAt: formatDateTimeInput(selectedAppointment.scheduled_at),
      reason: current.reason || `Follow-up for ${selectedAppointment.reason || "recent consultation"}`,
    }));
  }, [selectedAppointment]);

  const statusCounts = useMemo(
    () => ({
      waitingForDoctor: organizationQueue.filter((item) => item.status === "doctor_waiting").length,
      activeConsults: organizationQueue.filter((item) => item.status === "in-progress").length,
      awaitingLab: organizationQueue.filter((item) => item.status === "lab_waiting").length,
      awaitingTriage: organizationQueue.filter((item) => item.status === "triage_waiting" || item.status === "triage_in_progress").length,
    }),
    [organizationQueue],
  );

  const workflowLanes = useMemo(
    () => [
      { title: "Doctor Queue", description: "Cases ready for doctor assessment after triage.", count: organizationQueue.filter((item) => item.status === "doctor_waiting").length },
      { title: "In Consultation", description: "Patients currently under doctor review.", count: organizationQueue.filter((item) => item.status === "in-progress").length },
      { title: "Lab Follow-through", description: "Patients routed for diagnostics or results follow-up.", count: organizationQueue.filter((item) => item.status === "lab_waiting").length },
      { title: "General OPD", description: "Patients routed to regular outpatient flow.", count: organizationQueue.filter((item) => item.status === "opd_waiting").length },
    ],
    [organizationQueue],
  );

  const canStartConsult = Boolean(selectedAppointment && ["booked", "arrived", "triage_waiting", "triage_in_progress", "doctor_waiting", "opd_waiting"].includes(selectedAppointment.status));
  const canOrderDuringConsult = Boolean(selectedAppointment && ["doctor_waiting", "opd_waiting", "in-progress", "lab_waiting"].includes(selectedAppointment.status));
  const canCompleteVisit = Boolean(selectedAppointment && ["in-progress", "opd_waiting", "lab_waiting", "doctor_waiting"].includes(selectedAppointment.status));

  async function reloadAfterAction(message: string) {
    await loadData();
    setActionError("");
    setActionMessage(message);
  }

  async function submitDoctorAction(payload: Record<string, unknown>, successMessage: string) {
    setIsSubmittingAction(true);
    setActionError("");
    setActionMessage("");
    try {
      const response = await fetch("/api/org/doctor-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(getErrorMessage(body as ApiPayload, "Doctor workflow action failed"));
      }
      await reloadAfterAction(successMessage);
      if (selectedAppointment) {
        const workflowResponse = await fetch(
          `/api/org/doctor-workflow?appointmentId=${encodeURIComponent(selectedAppointment.id)}&patientId=${encodeURIComponent(selectedAppointment.patient_id)}`,
          { cache: "no-store" },
        );
        const workflowBody = (await workflowResponse.json().catch(() => null)) as WorkflowPayload | null;
        if (workflowBody) setWorkflow(workflowBody);
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Doctor workflow action failed");
    } finally {
      setIsSubmittingAction(false);
    }
  }

  async function handleStartConsult() {
    if (!selectedAppointment) return;
    await submitDoctorAction(
      {
        action: "start_consult",
        appointmentId: selectedAppointment.id,
      },
      "Consultation started.",
    );
    setActivePanel("lab");
  }

  async function handleLabOrderSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedAppointment) return;
    await submitDoctorAction(
      {
        action: "send_to_lab",
        appointmentId: selectedAppointment.id,
        testName: labForm.testName,
        indication: labForm.indication,
        priority: labForm.priority,
      },
      "Lab order placed successfully.",
    );
    setLabForm({ testName: "", indication: "", priority: "routine" });
  }

  async function handlePrescriptionSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedAppointment) return;
    await submitDoctorAction(
      {
        action: "open_prescription",
        appointmentId: selectedAppointment.id,
        medication: prescriptionForm.medication,
        dosage: prescriptionForm.dosage,
        frequency: prescriptionForm.frequency,
        durationDays: Number(prescriptionForm.durationDays),
        instructions: prescriptionForm.instructions,
      },
      "Prescription added to the pharmacy queue.",
    );
    setPrescriptionForm({ medication: "", dosage: "", frequency: "", durationDays: "5", instructions: "" });
  }

  async function handleFollowUpSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedAppointment) return;
    await submitDoctorAction(
      {
        action: "another_appointment",
        appointmentId: selectedAppointment.id,
        scheduledAt: followUpForm.scheduledAt,
        reason: followUpForm.reason,
        notes: followUpForm.notes,
      },
      "Follow-up appointment created.",
    );
  }

  async function handleRouteToOpd() {
    if (!selectedAppointment) return;
    await submitDoctorAction(
      {
        action: "route_to_opd",
        appointmentId: selectedAppointment.id,
      },
      "Patient routed to OPD.",
    );
  }

  async function handleCompleteVisitSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedAppointment) return;
    await submitDoctorAction(
      {
        action: "complete_visit",
        appointmentId: selectedAppointment.id,
        summary: completeForm.summary,
        disposition: completeForm.disposition,
      },
      "Visit completed successfully.",
    );
    setCompleteForm({ summary: "", disposition: "completed" });
  }

  return (
    <div className="mx-auto flex max-w-screen-2xl flex-col gap-6 p-4 md:p-6">
      <header className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Organization Mode</p>
            <h1 className="mt-1 text-2xl font-semibold">Doctor Workflow Dashboard</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Run consultations in the correct order, place lab requests, prepare prescriptions, schedule follow-up visits,
              route patients into OPD, and complete visits with proper summaries. Telemedicine remains in its own workspace only.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/telemedicine" className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted">
              Open Telemedicine Workspace
            </Link>
            <button type="button" onClick={() => void loadData()} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/dashboard/doctor" className={`rounded-full px-3 py-1.5 text-xs font-semibold ${currentView === "overview" ? "bg-primary text-primary-foreground" : "border border-border bg-background"}`}>Overview</Link>
          <Link href="/dashboard/doctor/queue" className={`rounded-full px-3 py-1.5 text-xs font-semibold ${currentView === "queue" ? "bg-primary text-primary-foreground" : "border border-border bg-background"}`}>Queue</Link>
          <Link href="/dashboard/doctor/workflow" className={`rounded-full px-3 py-1.5 text-xs font-semibold ${currentView === "workflow" ? "bg-primary text-primary-foreground" : "border border-border bg-background"}`}>Patient Workflow</Link>
        </div>
      </header>

      {loadingError ? <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{loadingError}</p> : null}
      {actionError ? <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{actionError}</p> : null}
      {actionMessage ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{actionMessage}</p> : null}

      <section className="grid gap-3 md:grid-cols-4">
        <StatCard label="Waiting For Doctor" value={statusCounts.waitingForDoctor} />
        <StatCard label="Active Consults" value={statusCounts.activeConsults} />
        <StatCard label="Awaiting Lab" value={statusCounts.awaitingLab} />
        <StatCard label="Awaiting Triage" value={statusCounts.awaitingTriage} />
      </section>

      {currentView === "overview" ? (
        <>
          <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
            <article className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Organization Queue Snapshot</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Doctor-facing queue excluding telemedicine sessions.</p>
                </div>
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-4 space-y-3">
                {organizationQueue.slice(0, 6).map((appointment) => {
                  const patient = patientLookup.get(appointment.patient_id);
                  const queueEntry = queueLookup.get(appointment.id);
                  return (
                    <button
                      key={appointment.id}
                      type="button"
                      onClick={() => {
                        setSelectedAppointmentId(appointment.id);
                        router.push("/dashboard/doctor/queue");
                      }}
                      className="w-full rounded-xl border border-border bg-background p-3 text-left transition hover:bg-muted"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{patient?.full_name || appointment.patient_id}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {appointment.reason || appointment.serviceType || appointment.serviceCategory || "General consult"} | {new Date(appointment.scheduled_at).toLocaleString()}
                          </p>
                        </div>
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">{formatStatusLabel(appointment.status)}</span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{queueEntry ? `Queue #${queueEntry.position} | ETA ${queueEntry.estimated_wait_minutes ?? "-"} min` : "No queue entry available"}</p>
                    </button>
                  );
                })}
                {!loading && organizationQueue.length === 0 ? <p className="text-sm text-muted-foreground">No doctor-facing patients are currently in the organization queue.</p> : null}
              </div>
            </article>

            <article className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Clinician Team View</h2>
                  <p className="mt-1 text-sm text-muted-foreground">See who is currently available in the doctor roster.</p>
                </div>
                <UserRound className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-4 space-y-3">
                {doctors.slice(0, 6).map((doctor) => (
                  <div key={doctor.id} className="rounded-xl border border-border bg-background p-3">
                    <p className="font-medium">{doctor.full_name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{doctor.specialty || "General practice"} | {doctor.email}</p>
                    <p className={`mt-1 text-xs ${doctor.verified ? "text-emerald-600" : "text-amber-600"}`}>{doctor.verified ? "Verified for workflow coverage" : "Pending verification"}</p>
                  </div>
                ))}
                {!loading && doctors.length === 0 ? <p className="text-sm text-muted-foreground">No doctors are registered in this organization yet.</p> : null}
              </div>
            </article>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-lg font-semibold">Workflow Lanes</h2>
            <p className="mt-1 text-sm text-muted-foreground">A high-level operational view of the doctor workflow outside telemedicine.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {workflowLanes.map((lane) => (
                <div key={lane.title} className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{lane.title}</p>
                  <p className="mt-2 text-2xl font-semibold">{lane.count}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{lane.description}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {(currentView === "queue" || currentView === "workflow") ? (
        <section className="grid gap-4 xl:grid-cols-[360px_1.1fr_0.9fr]">
          <article className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Queue</h2>
                <p className="mt-1 text-sm text-muted-foreground">Select the patient you want to move through care.</p>
              </div>
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <div className="mt-4 space-y-3">
              {organizationQueue.map((appointment) => {
                const patient = patientLookup.get(appointment.patient_id);
                const queueEntry = queueLookup.get(appointment.id);
                const active = selectedAppointment?.id === appointment.id;
                return (
                  <button
                    key={appointment.id}
                    type="button"
                    onClick={() => setSelectedAppointmentId(appointment.id)}
                    className={`w-full rounded-xl border p-3 text-left transition ${active ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-muted"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{patient?.full_name || appointment.patient_id}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{appointment.reason || "General consultation"}</p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">{formatStatusLabel(appointment.status)}</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{queueEntry ? `Queue #${queueEntry.position} | ETA ${queueEntry.estimated_wait_minutes ?? "-"} min` : "Not yet mapped into queue"}</p>
                  </button>
                );
              })}
              {!loading && organizationQueue.length === 0 ? <p className="text-sm text-muted-foreground">No patients are waiting in the organization queue.</p> : null}
            </div>
          </article>

          <article className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            {selectedAppointment ? (
              <div className="space-y-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Selected Patient</p>
                    <h2 className="mt-1 text-xl font-semibold">{selectedPatient?.full_name || selectedAppointment.patient_id}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {selectedAppointment.reason || selectedAppointment.serviceType || selectedAppointment.serviceCategory || "General doctor workflow"} | {new Date(selectedAppointment.scheduled_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{formatStatusLabel(selectedAppointment.status)}</span>
                </div>

                {/* <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <InfoCard label="Queue Position" value={selectedQueueEntry ? `#${selectedQueueEntry.position}` : "Not queued"} />
                  <InfoCard label="Queue Status" value={selectedQueueEntry ? formatStatusLabel(selectedQueueEntry.status) : "Not available"} />
                  <InfoCard label="Phone" value={selectedPatient?.phone || "Not recorded"} />
                  <InfoCard label="Workflow Note" value={describeStatus(selectedAppointment.status)} />
                </div> */}

                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-sm font-semibold">Doctor Action Bar</p>
                  <p className="mt-1 text-sm text-muted-foreground">Move through the consultation in the right order, then place the next care step.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => void handleStartConsult()} disabled={!canStartConsult || isSubmittingAction} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
                      <Stethoscope className="h-4 w-4" /> Start Consult
                    </button>
                    <button type="button" onClick={() => setActivePanel("lab")} disabled={!canOrderDuringConsult} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${activePanel === "lab" ? "bg-primary text-primary-foreground" : "border border-border bg-background"}`}>
                      <FlaskConical className="h-4 w-4" /> Send To Lab
                    </button>
                    <button type="button" onClick={() => setActivePanel("prescription")} disabled={!canOrderDuringConsult} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${activePanel === "prescription" ? "bg-primary text-primary-foreground" : "border border-border bg-background"}`}>
                      <FilePlus2 className="h-4 w-4" /> Open Prescription
                    </button>
                    <button type="button" onClick={() => setActivePanel("followup")} disabled={!canOrderDuringConsult} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${activePanel === "followup" ? "bg-primary text-primary-foreground" : "border border-border bg-background"}`}>
                      <CalendarPlus2 className="h-4 w-4" /> Another Appointment
                    </button>
                    <button type="button" onClick={() => void handleRouteToOpd()} disabled={!canOrderDuringConsult || isSubmittingAction} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium disabled:opacity-60">
                      <Activity className="h-4 w-4" /> Route To OPD
                    </button>
                    <button type="button" onClick={() => setActivePanel("complete")} disabled={!canCompleteVisit} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${activePanel === "complete" ? "bg-primary text-primary-foreground" : "border border-border bg-background"}`}>
                      <ClipboardList className="h-4 w-4" /> Complete Visit
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-background p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">Action Workspace</p>
                      <p className="mt-1 text-sm text-muted-foreground">Use the selected workspace to place the next clinical action.</p>
                    </div>
                    <Link href={`/patients/${encodeURIComponent(selectedAppointment.patient_id)}`} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium">
                      <UserRound className="h-4 w-4" /> Patient Chart
                    </Link>
                  </div>

                  {activePanel === "consult" ? (
                    <div className="rounded-xl border border-border bg-card p-4">
                      <p className="font-medium">Consultation Start</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Begin the clinical encounter first so the patient is clearly marked as active in the doctor workflow.
                      </p>
                    </div>
                  ) : null}

                  {activePanel === "lab" ? (
                    <form onSubmit={handleLabOrderSubmit} className="space-y-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="space-y-1 text-sm">
                          <span className="text-muted-foreground">Test name</span>
                          <input value={labForm.testName} onChange={(event) => setLabForm((current) => ({ ...current, testName: event.target.value }))} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" placeholder="CBC, Chest X-Ray, FBS" />
                        </label>
                        <label className="space-y-1 text-sm">
                          <span className="text-muted-foreground">Priority</span>
                          <select value={labForm.priority} onChange={(event) => setLabForm((current) => ({ ...current, priority: event.target.value as "routine" | "urgent" | "asap" }))} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm">
                            <option value="routine">routine</option>
                            <option value="urgent">urgent</option>
                            <option value="asap">asap</option>
                          </select>
                        </label>
                      </div>
                      <label className="space-y-1 text-sm">
                        <span className="text-muted-foreground">Clinical indication</span>
                        <textarea value={labForm.indication} onChange={(event) => setLabForm((current) => ({ ...current, indication: event.target.value }))} className="min-h-24 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Why this diagnostic work is needed right now" />
                      </label>
                      <button type="submit" disabled={isSubmittingAction || !canOrderDuringConsult} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
                        {isSubmittingAction ? "Submitting..." : "Place Lab Order"}
                      </button>
                    </form>
                  ) : null}

                  {activePanel === "prescription" ? (
                    <form onSubmit={handlePrescriptionSubmit} className="space-y-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="space-y-1 text-sm">
                          <span className="text-muted-foreground">Medication</span>
                          <input value={prescriptionForm.medication} onChange={(event) => setPrescriptionForm((current) => ({ ...current, medication: event.target.value }))} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" placeholder="Amoxicillin" />
                        </label>
                        <label className="space-y-1 text-sm">
                          <span className="text-muted-foreground">Dosage</span>
                          <input value={prescriptionForm.dosage} onChange={(event) => setPrescriptionForm((current) => ({ ...current, dosage: event.target.value }))} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" placeholder="500 mg" />
                        </label>
                        <label className="space-y-1 text-sm">
                          <span className="text-muted-foreground">Frequency</span>
                          <input value={prescriptionForm.frequency} onChange={(event) => setPrescriptionForm((current) => ({ ...current, frequency: event.target.value }))} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" placeholder="Three times daily" />
                        </label>
                        <label className="space-y-1 text-sm">
                          <span className="text-muted-foreground">Duration (days)</span>
                          <input type="number" min="1" value={prescriptionForm.durationDays} onChange={(event) => setPrescriptionForm((current) => ({ ...current, durationDays: event.target.value }))} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" />
                        </label>
                      </div>
                      <label className="space-y-1 text-sm">
                        <span className="text-muted-foreground">Instructions</span>
                        <textarea value={prescriptionForm.instructions} onChange={(event) => setPrescriptionForm((current) => ({ ...current, instructions: event.target.value }))} className="min-h-24 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Take after meals, monitor symptoms, return if..." />
                      </label>
                      <button type="submit" disabled={isSubmittingAction || !canOrderDuringConsult} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
                        {isSubmittingAction ? "Saving..." : "Save Prescription"}
                      </button>
                    </form>
                  ) : null}

                  {activePanel === "followup" ? (
                    <form onSubmit={handleFollowUpSubmit} className="space-y-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="space-y-1 text-sm">
                          <span className="text-muted-foreground">Follow-up date and time</span>
                          <input type="datetime-local" value={followUpForm.scheduledAt} onChange={(event) => setFollowUpForm((current) => ({ ...current, scheduledAt: event.target.value }))} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" />
                        </label>
                        <label className="space-y-1 text-sm">
                          <span className="text-muted-foreground">Reason</span>
                          <input value={followUpForm.reason} onChange={(event) => setFollowUpForm((current) => ({ ...current, reason: event.target.value }))} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" placeholder="Post-treatment review" />
                        </label>
                      </div>
                      <label className="space-y-1 text-sm">
                        <span className="text-muted-foreground">Notes</span>
                        <textarea value={followUpForm.notes} onChange={(event) => setFollowUpForm((current) => ({ ...current, notes: event.target.value }))} className="min-h-24 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="What should be checked during the next visit" />
                      </label>
                      <button type="submit" disabled={isSubmittingAction || !canOrderDuringConsult} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
                        {isSubmittingAction ? "Creating..." : "Create Follow-up Appointment"}
                      </button>
                    </form>
                  ) : null}

                  {activePanel === "complete" ? (
                    <form onSubmit={handleCompleteVisitSubmit} className="space-y-3">
                      <label className="space-y-1 text-sm">
                        <span className="text-muted-foreground">Visit summary</span>
                        <textarea value={completeForm.summary} onChange={(event) => setCompleteForm((current) => ({ ...current, summary: event.target.value }))} className="min-h-28 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="Assessment, plan, response, and discharge guidance" />
                      </label>
                      <label className="space-y-1 text-sm">
                        <span className="text-muted-foreground">Disposition</span>
                        <select value={completeForm.disposition} onChange={(event) => setCompleteForm((current) => ({ ...current, disposition: event.target.value }))} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm">
                          <option value="completed">completed</option>
                          <option value="stable_for_follow_up">stable_for_follow_up</option>
                          <option value="referred_to_lab">referred_to_lab</option>
                          <option value="continued_opd_care">continued_opd_care</option>
                        </select>
                      </label>
                      <button type="submit" disabled={isSubmittingAction || !canCompleteVisit} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
                        {isSubmittingAction ? "Completing..." : "Complete Visit"}
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
                No patient is selected yet. Pick a patient from the queue to open the doctor workflow.
              </div>
            )}
          </article>

          <article className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-lg font-semibold">Workflow Activity</h2>
            <p className="mt-1 text-sm text-muted-foreground">Recent actions recorded for the selected patient and appointment.</p>
            <div className="mt-4 space-y-4">
              <WorkflowList
                title="Lab Orders"
                empty="No lab orders yet."
                items={workflow.labOrders.map((item) => ({
                  id: item.id,
                  title: item.testName,
                  meta: `${item.priority} | ${formatStatusLabel(item.status)} | ${new Date(item.createdAt).toLocaleString()}`,
                  detail: item.indication,
                }))}
              />
              <WorkflowList
                title="Prescriptions"
                empty="No prescriptions yet."
                items={workflow.prescriptions.map((item) => ({
                  id: item.id,
                  title: `${item.medication} ${item.dosage}`,
                  meta: `${item.frequency} for ${item.durationDays} days | ${formatStatusLabel(item.status)}`,
                  detail: item.instructions || "No instructions recorded.",
                }))}
              />
              <WorkflowList
                title="Follow-up Appointments"
                empty="No follow-up appointments yet."
                items={workflow.followUps.map((item) => ({
                  id: item.id,
                  title: item.reason,
                  meta: new Date(item.scheduledAt).toLocaleString(),
                  detail: item.notes || `Follow-up appointment ID: ${item.followUpAppointmentId}`,
                }))}
              />
              <WorkflowList
                title="Visit Summaries"
                empty="No completed visit summary yet."
                items={workflow.visitSummaries.map((item) => ({
                  id: item.id,
                  title: formatStatusLabel(item.disposition),
                  meta: new Date(item.createdAt).toLocaleString(),
                  detail: item.summary,
                }))}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/dashboard/lab" className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium">Open Lab Dashboard</Link>
              <Link href="/dashboard/pharmacy" className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium">Open Pharmacy Dashboard</Link>
            </div>
          </article>
        </section>
      ) : null}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </article>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm text-foreground">{value}</p>
    </div>
  );
}

function WorkflowList({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: Array<{ id: string; title: string; meta: string; detail: string }>;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-border bg-card p-3">
            <p className="font-medium">{item.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.meta}</p>
            <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
          </div>
        ))}
        {items.length === 0 ? <p className="text-sm text-muted-foreground">{empty}</p> : null}
      </div>
    </div>
  );
}
