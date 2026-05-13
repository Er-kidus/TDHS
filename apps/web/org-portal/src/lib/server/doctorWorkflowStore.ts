// src/lib/server/doctorWorkflowStore.ts
// Database-backed doctor workflow store (PostgreSQL)
// Handles lab orders, prescriptions, follow-ups, and visit summaries
// This module is server-only and should only be imported in server-side code

import { query } from "./db";

export type DoctorWorkflowPriority = "routine" | "urgent" | "asap";

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
  updatedAt: string;
};

export type LabOrderRecord = {
  id: string;
  orderId: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientDob: string;
  serviceArea: "lab" | "imaging";
  testName: string;
  indication: string;
  priority: DoctorWorkflowPriority;
  status: "pending_collection" | "received_in_lab" | "pending_review" | "finalized" | "critical";
  verificationStatus: "unverified" | "verified";
  sampleLabel: string;
  confirmedAt?: string;
  results?: {
    value: string;
    notes?: string;
    enteredAt: string;
    patientIdReentry: string;
  };
  criticalAlert: boolean;
  acknowledgedByDoctor: boolean;
  acknowledgedAt?: string;
  createdAt: string;
  updatedAt: string;
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

export type DoctorWorkflowStore = {
  prescriptions: PrescriptionRecord[];
  labOrders: LabOrderRecord[];
  followUps: FollowUpRecord[];
  visitSummaries: VisitSummaryRecord[];
};

function newLabOrderId() {
  return `LAB-${Math.floor(1000 + Math.random() * 9000)}`;
}

function normalizeServiceArea(value: unknown): "lab" | "imaging" {
  return value === "imaging" ? "imaging" : "lab";
}

// Lab Orders
export async function appendLabOrder(
  input: Omit<
    LabOrderRecord,
    "id" | "createdAt" | "updatedAt" | "orderId" | "status" | "verificationStatus" | "sampleLabel" | "criticalAlert" | "acknowledgedByDoctor"
  > & {
    orderId?: string;
    status?: LabOrderRecord["status"];
    verificationStatus?: LabOrderRecord["verificationStatus"];
    sampleLabel?: string;
    criticalAlert?: boolean;
    acknowledgedByDoctor?: boolean;
  },
): Promise<LabOrderRecord> {
  const orderId = input.orderId || newLabOrderId();
  const status = input.status || "pending_collection";
  const serviceArea = normalizeServiceArea(input.serviceArea);

  const result = await query(
    `INSERT INTO lab_orders (
      appointment_id, patient_id, patient_name, patient_dob,
      order_id, service_area, test_name, indication, priority,
      status, verification_status, sample_label,
      critical_alert, acknowledged_by_doctor
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING id, order_id, appointment_id, patient_id, patient_name, patient_dob,
              service_area, test_name, indication, priority, status,
              verification_status, sample_label, critical_alert, acknowledged_by_doctor,
              created_at, updated_at`,
    [
      input.appointmentId,
      input.patientId,
      input.patientName,
      input.patientDob,
      orderId,
      serviceArea,
      input.testName,
      input.indication,
      input.priority,
      status,
      input.verificationStatus || "unverified",
      input.sampleLabel || "",
      input.criticalAlert || false,
      input.acknowledgedByDoctor || false,
    ],
  );

  if (!result.rows[0]) {
    throw new Error("Failed to create lab order");
  }

  const row = result.rows[0];
  return {
    id: row.id,
    orderId: row.order_id,
    appointmentId: row.appointment_id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    patientDob: row.patient_dob,
    serviceArea: row.service_area,
    testName: row.test_name,
    indication: row.indication,
    priority: row.priority,
    status: row.status,
    verificationStatus: row.verification_status,
    sampleLabel: row.sample_label,
    criticalAlert: row.critical_alert,
    acknowledgedByDoctor: row.acknowledged_by_doctor,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function updateLabOrder(
  orderId: string,
  updater: (current: LabOrderRecord) => LabOrderRecord,
): Promise<LabOrderRecord | null> {
  // Fetch current record
  const currentResult = await query("SELECT * FROM lab_orders WHERE order_id = $1", [orderId]);

  if (!currentResult.rows[0]) {
    return null;
  }

  const row = currentResult.rows[0];
  const current: LabOrderRecord = {
    id: row.id,
    orderId: row.order_id,
    appointmentId: row.appointment_id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    patientDob: row.patient_dob,
    serviceArea: row.service_area,
    testName: row.test_name,
    indication: row.indication,
    priority: row.priority,
    status: row.status,
    verificationStatus: row.verification_status,
    sampleLabel: row.sample_label,
    criticalAlert: row.critical_alert,
    acknowledgedByDoctor: row.acknowledged_by_doctor,
    acknowledgedAt: row.acknowledged_at,
    confirmedAt: row.confirmed_at,
    results: row.result_value
      ? {
          value: row.result_value,
          notes: row.result_notes,
          enteredAt: row.result_entered_at,
          patientIdReentry: row.result_patient_id_entry,
        }
      : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  // Apply updates
  const updated = updater(current);

  // Save to database
  const updateResult = await query(
    `UPDATE lab_orders SET
      status = $1,
      verification_status = $2,
      confirmed_at = $3,
      result_value = $4,
      result_notes = $5,
      result_entered_at = $6,
      result_patient_id_entry = $7,
      critical_alert = $8,
      acknowledged_by_doctor = $9,
      acknowledged_at = $10,
      updated_at = NOW()
    WHERE order_id = $11
    RETURNING id, order_id, appointment_id, patient_id, patient_name, patient_dob,
              service_area, test_name, indication, priority, status,
              verification_status, sample_label, critical_alert, acknowledged_by_doctor,
              confirmed_at, result_value, result_notes, result_entered_at, result_patient_id_entry,
              acknowledged_at, created_at, updated_at`,
    [
      updated.status,
      updated.verificationStatus,
      updated.confirmedAt,
      updated.results?.value,
      updated.results?.notes,
      updated.results?.enteredAt,
      updated.results?.patientIdReentry,
      updated.criticalAlert,
      updated.acknowledgedByDoctor,
      updated.acknowledgedAt,
      orderId,
    ],
  );

  if (!updateResult.rows[0]) {
    return null;
  }

  const updatedRow = updateResult.rows[0];
  return {
    id: updatedRow.id,
    orderId: updatedRow.order_id,
    appointmentId: updatedRow.appointment_id,
    patientId: updatedRow.patient_id,
    patientName: updatedRow.patient_name,
    patientDob: updatedRow.patient_dob,
    serviceArea: updatedRow.service_area,
    testName: updatedRow.test_name,
    indication: updatedRow.indication,
    priority: updatedRow.priority,
    status: updatedRow.status,
    verificationStatus: updatedRow.verification_status,
    sampleLabel: updatedRow.sample_label,
    criticalAlert: updatedRow.critical_alert,
    acknowledgedByDoctor: updatedRow.acknowledged_by_doctor,
    acknowledgedAt: updatedRow.acknowledged_at,
    confirmedAt: updatedRow.confirmed_at,
    results: updatedRow.result_value
      ? {
          value: updatedRow.result_value,
          notes: updatedRow.result_notes,
          enteredAt: updatedRow.result_entered_at,
          patientIdReentry: updatedRow.result_patient_id_entry,
        }
      : undefined,
    createdAt: updatedRow.created_at,
    updatedAt: updatedRow.updated_at,
  };
}

export async function getLabOrdersByServiceArea(serviceArea: string): Promise<LabOrderRecord[]> {
  const result = await query(
    `SELECT * FROM lab_orders WHERE service_area = $1 ORDER BY created_at DESC`,
    [normalizeServiceArea(serviceArea)],
  );

  return result.rows.map((row) => ({
    id: row.id,
    orderId: row.order_id,
    appointmentId: row.appointment_id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    patientDob: row.patient_dob,
    serviceArea: row.service_area,
    testName: row.test_name,
    indication: row.indication,
    priority: row.priority,
    status: row.status,
    verificationStatus: row.verification_status,
    sampleLabel: row.sample_label,
    criticalAlert: row.critical_alert,
    acknowledgedByDoctor: row.acknowledged_by_doctor,
    acknowledgedAt: row.acknowledged_at,
    confirmedAt: row.confirmed_at,
    results: row.result_value
      ? {
          value: row.result_value,
          notes: row.result_notes,
          enteredAt: row.result_entered_at,
          patientIdReentry: row.result_patient_id_entry,
        }
      : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

// Prescriptions
export async function appendPrescription(
  input: Omit<PrescriptionRecord, "id" | "createdAt" | "updatedAt" | "status"> & { status?: PrescriptionRecord["status"] },
): Promise<PrescriptionRecord> {
  const status = input.status || "pending_dispense";

  const result = await query(
    `INSERT INTO doctor_prescriptions (
      appointment_id, patient_id, medication, dosage, frequency, duration_days, instructions, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, appointment_id, patient_id, medication, dosage, frequency, duration_days, instructions, status, created_at, updated_at`,
    [
      input.appointmentId,
      input.patientId,
      input.medication,
      input.dosage,
      input.frequency,
      input.durationDays,
      input.instructions,
      status,
    ],
  );

  if (!result.rows[0]) {
    throw new Error("Failed to create prescription");
  }

  const row = result.rows[0];
  return {
    id: row.id,
    appointmentId: row.appointment_id,
    patientId: row.patient_id,
    medication: row.medication,
    dosage: row.dosage,
    frequency: row.frequency,
    durationDays: row.duration_days,
    instructions: row.instructions,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Follow-ups
export async function appendFollowUp(input: Omit<FollowUpRecord, "id" | "createdAt">): Promise<FollowUpRecord> {
  const result = await query(
    `INSERT INTO doctor_followups (
      source_appointment_id, followup_appointment_id, patient_id, scheduled_at, reason, notes
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, source_appointment_id, followup_appointment_id, patient_id, scheduled_at, reason, notes, created_at`,
    [
      input.sourceAppointmentId,
      input.followUpAppointmentId || null,
      input.patientId,
      input.scheduledAt,
      input.reason,
      input.notes,
    ],
  );

  if (!result.rows[0]) {
    throw new Error("Failed to create follow-up");
  }

  const row = result.rows[0];
  return {
    id: row.id,
    sourceAppointmentId: row.source_appointment_id,
    followUpAppointmentId: row.followup_appointment_id,
    patientId: row.patient_id,
    scheduledAt: row.scheduled_at,
    reason: row.reason,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

// Visit Summaries
export async function appendVisitSummary(input: Omit<VisitSummaryRecord, "id" | "createdAt">): Promise<VisitSummaryRecord> {
  const result = await query(
    `INSERT INTO doctor_visit_summaries (
      appointment_id, patient_id, summary, disposition
    ) VALUES ($1, $2, $3, $4)
    RETURNING id, appointment_id, patient_id, summary, disposition, created_at`,
    [input.appointmentId, input.patientId, input.summary, input.disposition],
  );

  if (!result.rows[0]) {
    throw new Error("Failed to create visit summary");
  }

  const row = result.rows[0];
  return {
    id: row.id,
    appointmentId: row.appointment_id,
    patientId: row.patient_id,
    summary: row.summary,
    disposition: row.disposition,
    createdAt: row.created_at,
  };
}

// Legacy function for compatibility
export async function readDoctorWorkflowStore(): Promise<DoctorWorkflowStore> {
  const [prescriptionsResult, labOrdersResult, followUpsResult, summariesResult] = await Promise.all([
    query("SELECT * FROM doctor_prescriptions ORDER BY created_at DESC"),
    query("SELECT * FROM lab_orders ORDER BY created_at DESC"),
    query("SELECT * FROM doctor_followups ORDER BY created_at DESC"),
    query("SELECT * FROM doctor_visit_summaries ORDER BY created_at DESC"),
  ]);

  return {
    prescriptions: prescriptionsResult.rows.map((row) => ({
      id: row.id,
      appointmentId: row.appointment_id,
      patientId: row.patient_id,
      medication: row.medication,
      dosage: row.dosage,
      frequency: row.frequency,
      durationDays: row.duration_days,
      instructions: row.instructions,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    labOrders: labOrdersResult.rows.map((row) => ({
      id: row.id,
      orderId: row.order_id,
      appointmentId: row.appointment_id,
      patientId: row.patient_id,
      patientName: row.patient_name,
      patientDob: row.patient_dob,
      serviceArea: row.service_area,
      testName: row.test_name,
      indication: row.indication,
      priority: row.priority,
      status: row.status,
      verificationStatus: row.verification_status,
      sampleLabel: row.sample_label,
      criticalAlert: row.critical_alert,
      acknowledgedByDoctor: row.acknowledged_by_doctor,
      acknowledgedAt: row.acknowledged_at,
      confirmedAt: row.confirmed_at,
      results: row.result_value
        ? {
            value: row.result_value,
            notes: row.result_notes,
            enteredAt: row.result_entered_at,
            patientIdReentry: row.result_patient_id_entry,
          }
        : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
    followUps: followUpsResult.rows.map((row) => ({
      id: row.id,
      sourceAppointmentId: row.source_appointment_id,
      followUpAppointmentId: row.followup_appointment_id,
      patientId: row.patient_id,
      scheduledAt: row.scheduled_at,
      reason: row.reason,
      notes: row.notes,
      createdAt: row.created_at,
    })),
    visitSummaries: summariesResult.rows.map((row) => ({
      id: row.id,
      appointmentId: row.appointment_id,
      patientId: row.patient_id,
      summary: row.summary,
      disposition: row.disposition,
      createdAt: row.created_at,
    })),
  };
}
