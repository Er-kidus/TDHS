"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ApiPayload, Appointment, Doctor, Patient, QueueEntry, WorkflowPayload } from "./types";
import { EMPTY_WORKFLOW, formatDateTimeInput, getErrorMessage, readJsonResponse } from "./utils";

const ACTIVE_QUEUE_STATUSES = ["booked", "arrived", "triage_waiting", "triage_in_progress", "doctor_waiting", "lab_waiting", "opd_waiting", "in-progress"];
const START_CONSULT_STATUSES = ["booked", "arrived", "triage_waiting", "triage_in_progress", "doctor_waiting", "opd_waiting"];
const ORDER_STATUSES = ["doctor_waiting", "opd_waiting", "in-progress", "lab_waiting"];
const COMPLETE_STATUSES = ["in-progress", "opd_waiting", "lab_waiting", "doctor_waiting"];

export function useDoctorWorkspace() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [queueEntries, setQueueEntries] = useState<QueueEntry[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowPayload>(EMPTY_WORKFLOW);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadingError("");

    try {
      const [docsRes, appointmentsRes, queuesRes, patientsRes, meRes] = await Promise.all([
        fetch("/api/org/doctors", { cache: "no-store" }),
        fetch("/api/appointments?limit=200", { cache: "no-store" }),
        fetch("/api/org/queues", { cache: "no-store" }),
        fetch("/api/org/patients?limit=300", { cache: "no-store" }),
        fetch("/api/org/me", { cache: "no-store" }),
      ]);

      const [docsData, appointmentsData, queueData, patientsData, meData] = await Promise.all([
        readJsonResponse(docsRes),
        readJsonResponse(appointmentsRes),
        readJsonResponse(queuesRes),
        readJsonResponse(patientsRes),
        readJsonResponse(meRes),
      ]);
      const errors: string[] = [];

      if (docsRes.ok) setDoctors(Array.isArray(docsData) ? (docsData as Doctor[]) : []);
      else {
        setDoctors([]);
        errors.push(`[${docsRes.status}] Doctors: ${getErrorMessage(docsData, "Unable to load doctors")}`);
      }

      if (appointmentsRes.ok) setAppointments(Array.isArray(appointmentsData) ? (appointmentsData as Appointment[]) : []);
      else {
        setAppointments([]);
        errors.push(`[${appointmentsRes.status}] Appointments: ${getErrorMessage(appointmentsData, "Unable to load appointments")}`);
      }

      if (queuesRes.ok) setQueueEntries(Array.isArray(queueData) ? (queueData as QueueEntry[]) : []);
      else {
        setQueueEntries([]);
        errors.push(`[${queuesRes.status}] Queues: ${getErrorMessage(queueData, "Unable to load queue")}`);
      }

      if (patientsRes.ok) setPatients(Array.isArray(patientsData) ? (patientsData as Patient[]) : []);
      else {
        setPatients([]);
        errors.push(`[${patientsRes.status}] Patients: ${getErrorMessage(patientsData, "Unable to load patients")}`);
      }

      if (meRes.ok && meData) setCurrentUser(meData as { id: string; role: string });
      else setCurrentUser(null);

      if (errors.length > 0) {
        setLoadingError(`API Connection Issues - ${errors.join(" | ")} - Check that the backend API is running on http://localhost:8000`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const patientLookup = useMemo(() => new Map(patients.map((item) => [item.id, item])), [patients]);
  const queueLookup = useMemo(() => new Map(queueEntries.map((item) => [item.appointment_id, item])), [queueEntries]);

  const organizationQueue = useMemo(() => {
    return appointments
      .filter((item) => item.status !== "telemedicine_waiting")
      .filter((item) => ACTIVE_QUEUE_STATUSES.includes(item.status))
      .filter((item) => !currentUser || !item.doctor_id || item.doctor_id === currentUser.id)
      .sort((left, right) => {
        const leftQueue = queueLookup.get(left.id)?.position ?? Number.MAX_SAFE_INTEGER;
        const rightQueue = queueLookup.get(right.id)?.position ?? Number.MAX_SAFE_INTEGER;
        if (leftQueue !== rightQueue) return leftQueue - rightQueue;
        return new Date(left.scheduled_at).getTime() - new Date(right.scheduled_at).getTime();
      });
  }, [appointments, queueLookup, currentUser]);

  useEffect(() => {
    if (!organizationQueue.length) {
      setSelectedAppointmentId("");
      return;
    }
    if (!organizationQueue.some((item) => item.id === selectedAppointmentId)) {
      setSelectedAppointmentId(organizationQueue[0].id);
    }
  }, [organizationQueue, selectedAppointmentId]);

  const selectedAppointment = useMemo(
    () => organizationQueue.find((item) => item.id === selectedAppointmentId) || organizationQueue[0] || null,
    [organizationQueue, selectedAppointmentId],
  );
  const selectedPatient = selectedAppointment ? patientLookup.get(selectedAppointment.patient_id) || null : null;
  const selectedQueueEntry = selectedAppointment ? queueLookup.get(selectedAppointment.id) || null : null;

  const loadWorkflow = useCallback(async (appointment: Appointment | null) => {
    if (!appointment) {
      setWorkflow(EMPTY_WORKFLOW);
      return;
    }
    const response = await fetch(`/api/org/doctor-workflow?appointmentId=${encodeURIComponent(appointment.id)}&patientId=${encodeURIComponent(appointment.patient_id)}`, {
      cache: "no-store",
    });
    const payload = (await response.json().catch(() => null)) as WorkflowPayload | null;
    setWorkflow(payload || EMPTY_WORKFLOW);
  }, []);

  useEffect(() => {
    void loadWorkflow(selectedAppointment);
  }, [loadWorkflow, selectedAppointment]);

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
      { title: "Doctor Queue", count: organizationQueue.filter((item) => item.status === "doctor_waiting").length },
      { title: "In Consultation", count: organizationQueue.filter((item) => item.status === "in-progress").length },
      { title: "Lab Follow-through", count: organizationQueue.filter((item) => item.status === "lab_waiting").length },
      { title: "OPD", count: organizationQueue.filter((item) => item.status === "opd_waiting").length },
    ],
    [organizationQueue],
  );

  const canStartConsult = Boolean(selectedAppointment && START_CONSULT_STATUSES.includes(selectedAppointment.status));
  const canOrderDuringConsult = Boolean(selectedAppointment && ORDER_STATUSES.includes(selectedAppointment.status));
  const canCompleteVisit = Boolean(selectedAppointment && COMPLETE_STATUSES.includes(selectedAppointment.status));

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
      if (!response.ok) throw new Error(getErrorMessage(body as ApiPayload, "Doctor workflow action failed"));
      await loadData();
      await loadWorkflow(selectedAppointment);
      setActionMessage(successMessage);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Doctor workflow action failed");
    } finally {
      setIsSubmittingAction(false);
    }
  }

  return {
    doctors,
    loading,
    loadingError,
    actionMessage,
    actionError,
    organizationQueue,
    patientLookup,
    queueLookup,
    workflow,
    statusCounts,
    workflowLanes,
    selectedAppointment,
    selectedPatient,
    selectedQueueEntry,
    selectedAppointmentId,
    setSelectedAppointmentId,
    canStartConsult,
    canOrderDuringConsult,
    canCompleteVisit,
    isSubmittingAction,
    loadData,
    submitDoctorAction,
    defaultFollowUpDate: selectedAppointment ? formatDateTimeInput(selectedAppointment.scheduled_at) : new Date(Date.now() + 86400000).toISOString().slice(0, 16),
  };
}
