export type Doctor = {
  id: string;
  full_name: string;
  email: string;
  specialty: string;
  license_number: string;
  verified: boolean;
};

export type Appointment = {
  id: string;
  patient_id: string;
  status: string;
  reason?: string;
  notes?: string;
  serviceType?: string;
  serviceCategory?: string;
  scheduled_at: string;
};

export type QueueEntry = {
  queue_id: string;
  service_type?: string;
  appointment_id: string;
  position: number;
  status: string;
  estimated_wait_minutes?: number;
};

export type Patient = {
  id: string;
  full_name: string;
  phone?: string;
  email?: string;
};

export type PrescriptionRecord = {
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

export type LabOrderRecord = {
  id: string;
  appointmentId: string;
  patientId: string;
  testName: string;
  indication: string;
  priority: "routine" | "urgent" | "asap";
  status: "requested" | "sample_collected" | "completed";
  createdAt: string;
};

export type FollowUpRecord = {
  id: string;
  sourceAppointmentId: string;
  followUpAppointmentId: string;
  patientId: string;
  scheduledAt: string;
  reason: string;
  notes?: string;
  createdAt: string;
};

export type VisitSummaryRecord = {
  id: string;
  appointmentId: string;
  patientId: string;
  summary: string;
  disposition: string;
  createdAt: string;
};

export type WorkflowPayload = {
  prescriptions: PrescriptionRecord[];
  labOrders: LabOrderRecord[];
  followUps: FollowUpRecord[];
  visitSummaries: VisitSummaryRecord[];
};

export type ActionPanel = "consult" | "lab" | "prescription" | "followup" | "complete";
export type ApiPayload = Record<string, unknown> | string | null;
