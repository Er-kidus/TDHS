import { NextResponse } from "next/server";
import {
  appendFollowUp,
  appendLabOrder,
  appendPrescription,
  appendVisitSummary,
  readDoctorWorkflowStore,
  updateLabOrder,
  type DoctorWorkflowPriority,
} from "@/lib/server/doctorWorkflowStore";
import { backendFetch, BackendRequestError } from "@/lib/backend";
import { orgAuthHeaderFromCookie } from "@/lib/routeAuth";

type AppointmentRecord = {
  id: string;
  patient_id: string;
  status: string;
  notes?: string;
  reason?: string;
  serviceType?: string;
  serviceCategory?: string;
  scheduled_at: string;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function appendNote(existing: string | undefined, note: string) {
  return [existing || "", note].filter(Boolean).join("\n");
}

function normalizeServiceArea(value: unknown, testName?: string, indication?: string) {
  if (value === "lab" || value === "imaging") {
    return value;
  }

  const haystack = `${testName || ""} ${indication || ""}`.toLowerCase();
  if (/(x[- ]?ray|ct\b|mri\b|ultrasound|sonogram|radiolog|scan|imaging)/.test(haystack)) {
    return "imaging";
  }
  return "lab";
}

async function fetchAppointment(auth: Record<string, string>, appointmentId: string) {
  const upstream = await backendFetch(`/appointments/${encodeURIComponent(appointmentId)}`, {
    method: "GET",
    headers: { ...auth },
  });
  return (await upstream.json()) as AppointmentRecord;
}

async function updateAppointment(auth: Record<string, string>, appointmentId: string, patch: Record<string, unknown>) {
  const upstream = await backendFetch(`/appointments/${encodeURIComponent(appointmentId)}`, {
    method: "PUT",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return upstream.json().catch(() => null);
}

async function fetchPatient(auth: Record<string, string>, patientId: string) {
  const upstream = await backendFetch(`/org/patients/${encodeURIComponent(patientId)}`, {
    method: "GET",
    headers: { ...auth },
  });
  return (await upstream.json().catch(() => ({}))) as Record<string, unknown>;
}

function extractPatientDob(patient: Record<string, unknown>) {
  const profile = patient.profile && typeof patient.profile === "object" ? (patient.profile as Record<string, unknown>) : {};
  const candidates = [
    patient.date_of_birth,
    patient.dateOfBirth,
    profile.date_of_birth,
    profile.dateOfBirth,
    profile.dob,
    profile.birthDate,
  ];
  const match = candidates.find((value) => typeof value === "string" && value.trim());
  return typeof match === "string" ? match : "Not recorded";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const appointmentId = searchParams.get("appointmentId");
  const patientId = searchParams.get("patientId");
  const kind = searchParams.get("kind");
  const orderId = searchParams.get("orderId");
  const dob = searchParams.get("dob");
  const serviceArea = searchParams.get("serviceArea");
  const store = await readDoctorWorkflowStore();

  const filtered = {
    prescriptions: store.prescriptions.filter((item) => (!appointmentId || item.appointmentId === appointmentId) && (!patientId || item.patientId === patientId)),
    labOrders: store.labOrders.filter(
      (item) =>
        (!appointmentId || item.appointmentId === appointmentId) &&
        (!patientId || item.patientId === patientId) &&
        (!orderId || item.orderId.toLowerCase() === orderId.toLowerCase()) &&
        (!dob || item.patientDob.toLowerCase() === dob.toLowerCase()) &&
        (!serviceArea || item.serviceArea === serviceArea),
    ),
    followUps: store.followUps.filter((item) => (!appointmentId || item.sourceAppointmentId === appointmentId || item.followUpAppointmentId === appointmentId) && (!patientId || item.patientId === patientId)),
    visitSummaries: store.visitSummaries.filter((item) => (!appointmentId || item.appointmentId === appointmentId) && (!patientId || item.patientId === patientId)),
  };

  if (kind === "prescriptions") return NextResponse.json(filtered.prescriptions);
  if (kind === "labOrders") return NextResponse.json(filtered.labOrders);
  if (kind === "followUps") return NextResponse.json(filtered.followUps);
  if (kind === "visitSummaries") return NextResponse.json(filtered.visitSummaries);
  return NextResponse.json(filtered);
}

export async function POST(request: Request) {
  try {
    const auth = await orgAuthHeaderFromCookie();
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const action = typeof body.action === "string" ? body.action : "";
    const appointmentId = typeof body.appointmentId === "string" ? body.appointmentId : "";

    if (!action) return jsonError("action is required");
    if (!appointmentId) return jsonError("appointmentId is required");

    const appointment = await fetchAppointment(auth, appointmentId);
    const patientId = appointment.patient_id;
    const timestamp = new Date().toISOString();
    const patient = await fetchPatient(auth, patientId).catch(() => ({})) as Record<string, unknown>;
    const patientName = typeof patient.full_name === "string" && patient.full_name.trim() ? patient.full_name : patientId;
    const patientDob = extractPatientDob(patient);

    if (action === "start_consult") {
      if (appointment.status === "fulfilled" || appointment.status === "cancelled" || appointment.status === "completed") {
        return jsonError("Consultation cannot be started for a completed or cancelled appointment.");
      }

      await updateAppointment(auth, appointmentId, {
        status: "in-progress",
        notes: appendNote(appointment.notes, `[Doctor Workflow] Consultation started at ${timestamp}.`),
      });

      return NextResponse.json({
        ok: true,
        action,
        message: "Consultation started.",
      });
    }

    if (action === "send_to_lab") {
      const testName = typeof body.testName === "string" ? body.testName.trim() : "";
      const indication = typeof body.indication === "string" ? body.indication.trim() : "";
      const priority = (typeof body.priority === "string" ? body.priority : "routine") as DoctorWorkflowPriority;
      const serviceArea = normalizeServiceArea(body.serviceArea, testName, indication);

      if (!testName) return jsonError("testName is required");
      if (!indication) return jsonError("indication is required");
      if (!["doctor_waiting", "opd_waiting", "in-progress", "lab_waiting"].includes(appointment.status)) {
        return jsonError("Patient should be under doctor review before routing to lab.");
      }

      const labOrder = await appendLabOrder({
        appointmentId,
        patientId,
        patientName,
        patientDob,
        serviceArea,
        testName,
        indication,
        priority,
        sampleLabel: `${patientName} | DOB ${patientDob} | ${testName}`,
      });

      await updateAppointment(auth, appointmentId, {
        status: "lab_waiting",
        assignedStaffType: serviceArea === "imaging" ? "radiology" : "lab",
        notes: appendNote(
          appointment.notes,
          `[Doctor Workflow] ${serviceArea === "imaging" ? "Imaging" : "Lab"} order ${labOrder.orderId} for ${labOrder.testName} requested (${labOrder.priority}) at ${timestamp}. Indication: ${labOrder.indication}`,
        ),
      });

      return NextResponse.json({
        ok: true,
        action,
        message: "Lab order placed and patient routed to lab.",
        labOrder,
      });
    }

    if (action === "receive_lab_sample") {
      const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
      const dob = typeof body.dob === "string" ? body.dob.trim() : "";
      const manualConfirm = typeof body.manualConfirm === "boolean" ? body.manualConfirm : false;

      if (!orderId || !dob) return jsonError("orderId and dob are required");
      if (!manualConfirm) return jsonError("Manual confirmation is required before receiving the sample.");

      const updated = await updateLabOrder(orderId, (current) => {
        if (current.patientDob !== "Not recorded" && current.patientDob.toLowerCase() !== dob.toLowerCase()) {
          throw new Error("Date of birth does not match the lab order.");
        }
        return {
          ...current,
          status: "received_in_lab",
          verificationStatus: "verified",
          confirmedAt: timestamp,
        };
      });
      if (!updated) return jsonError("Lab order not found", 404);

      await updateAppointment(auth, updated.appointmentId, {
        status: "lab_waiting",
        assignedStaffType: "lab",
        notes: appendNote(appointment.notes, `[Lab Workflow] Sample ${updated.orderId} received in lab and manually verified at ${timestamp}.`),
      });

      return NextResponse.json({
        ok: true,
        action,
        message: "Sample received and verified in lab.",
        labOrder: updated,
      });
    }

    if (action === "save_lab_results") {
      const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
      const resultValue = typeof body.resultValue === "string" ? body.resultValue.trim() : "";
      const resultNotes = typeof body.resultNotes === "string" ? body.resultNotes.trim() : "";
      const patientIdReentry = typeof body.patientIdReentry === "string" ? body.patientIdReentry.trim() : "";
      const criticalAlert = typeof body.criticalAlert === "boolean" ? body.criticalAlert : false;

      if (!orderId || !resultValue || !patientIdReentry) {
        return jsonError("orderId, resultValue, and patientIdReentry are required");
      }

      const updated = await updateLabOrder(orderId, (current) => {
        if (current.patientId !== patientIdReentry) {
          throw new Error("Re-entered patient ID does not match this lab order.");
        }
        const nextStatus = criticalAlert ? "critical" : "finalized";
        return {
          ...current,
          status: nextStatus,
          criticalAlert,
          results: {
            value: resultValue,
            notes: resultNotes,
            enteredAt: timestamp,
            patientIdReentry,
          },
        };
      });
      if (!updated) return jsonError("Lab order not found", 404);

      await updateAppointment(auth, updated.appointmentId, {
        status: "doctor_waiting",
        assignedStaffType: "doctor",
        notes: appendNote(
          appointment.notes,
          `[Lab Workflow] Results entered for ${updated.orderId} at ${timestamp}. Status: ${updated.status}. Result: ${resultValue}${resultNotes ? ` | Notes: ${resultNotes}` : ""}`,
        ),
      });

      return NextResponse.json({
        ok: true,
        action,
        message: criticalAlert ? "Critical result saved and escalated to doctor." : "Lab result finalized and routed to doctor.",
        labOrder: updated,
      });
    }

    if (action === "acknowledge_lab_result") {
      const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
      if (!orderId) return jsonError("orderId is required");

      const updated = await updateLabOrder(orderId, (current) => ({
        ...current,
        acknowledgedByDoctor: true,
        acknowledgedAt: timestamp,
      }));
      if (!updated) return jsonError("Lab order not found", 404);

      return NextResponse.json({
        ok: true,
        action,
        message: "Lab result acknowledged by doctor.",
        labOrder: updated,
      });
    }

    if (action === "open_prescription") {
      const medication = typeof body.medication === "string" ? body.medication.trim() : "";
      const dosage = typeof body.dosage === "string" ? body.dosage.trim() : "";
      const frequency = typeof body.frequency === "string" ? body.frequency.trim() : "";
      const durationDays = typeof body.durationDays === "number" ? body.durationDays : Number(body.durationDays || 0);
      const instructions = typeof body.instructions === "string" ? body.instructions.trim() : "";

      if (!medication || !dosage || !frequency || !durationDays) {
        return jsonError("medication, dosage, frequency, and durationDays are required");
      }

      if (!["doctor_waiting", "opd_waiting", "in-progress", "lab_waiting"].includes(appointment.status)) {
        return jsonError("Patient should be in doctor workflow before creating a prescription.");
      }

      const prescription = await appendPrescription({
        appointmentId,
        patientId,
        medication,
        dosage,
        frequency,
        durationDays,
        instructions,
      });

      await updateAppointment(auth, appointmentId, {
        notes: appendNote(
          appointment.notes,
          `[Doctor Workflow] Prescription ${prescription.medication} ${prescription.dosage}, ${prescription.frequency} for ${prescription.durationDays} days created at ${timestamp}.`,
        ),
      });

      return NextResponse.json({
        ok: true,
        action,
        message: "Prescription created and sent to the pharmacy workflow.",
        prescription,
      });
    }

    if (action === "another_appointment") {
      const scheduledAt = typeof body.scheduledAt === "string" ? body.scheduledAt : "";
      const reason = typeof body.reason === "string" ? body.reason.trim() : "";
      const notes = typeof body.notes === "string" ? body.notes.trim() : "";

      if (!scheduledAt || !reason) return jsonError("scheduledAt and reason are required");

      const payload = {
        patientId,
        scheduledAt: new Date(scheduledAt).toISOString(),
        reason,
        notes: notes || `Follow-up booked from doctor workflow for appointment ${appointmentId}.`,
        serviceType: appointment.serviceType || "follow_up_consultation",
        serviceCategory: appointment.serviceCategory || "consultation",
        appointmentType: "in-person",
        status: "booked",
      };

      const upstream = await backendFetch(`/appointments?patientId=${encodeURIComponent(patientId)}`, {
        method: "POST",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const followUpAppointment = (await upstream.json()) as { id?: string };

      const followUp = await appendFollowUp({
        sourceAppointmentId: appointmentId,
        followUpAppointmentId: String(followUpAppointment.id || ""),
        patientId,
        scheduledAt: payload.scheduledAt,
        reason,
        notes,
      });

      await updateAppointment(auth, appointmentId, {
        notes: appendNote(appointment.notes, `[Doctor Workflow] Follow-up appointment booked for ${payload.scheduledAt}. Reason: ${reason}`),
      });

      return NextResponse.json({
        ok: true,
        action,
        message: "Follow-up appointment created.",
        followUp,
        followUpAppointment,
      });
    }

    if (action === "route_to_opd") {
      const routeNote = typeof body.routeNote === "string" ? body.routeNote.trim() : "";

      await updateAppointment(auth, appointmentId, {
        status: "opd_waiting",
        assignedStaffType: "doctor",
        notes: appendNote(appointment.notes, `[Doctor Workflow] Routed to OPD at ${timestamp}.${routeNote ? ` Note: ${routeNote}` : ""}`),
      });

      return NextResponse.json({
        ok: true,
        action,
        message: "Patient routed to OPD.",
      });
    }

    if (action === "complete_visit") {
      const summary = typeof body.summary === "string" ? body.summary.trim() : "";
      const disposition = typeof body.disposition === "string" ? body.disposition.trim() : "completed";

      if (!summary) return jsonError("summary is required");
      if (!["in-progress", "opd_waiting", "lab_waiting", "doctor_waiting"].includes(appointment.status)) {
        return jsonError("Visit should be active in the doctor workflow before completion.");
      }

      const visitSummary = await appendVisitSummary({
        appointmentId,
        patientId,
        summary,
        disposition,
      });

      await updateAppointment(auth, appointmentId, {
        status: "fulfilled",
        notes: appendNote(appointment.notes, `[Doctor Workflow] Visit completed at ${timestamp}. Disposition: ${disposition}. Summary: ${summary}`),
      });

      return NextResponse.json({
        ok: true,
        action,
        message: "Visit completed.",
        visitSummary,
      });
    }

    return jsonError("Unsupported doctor workflow action", 422);
  } catch (error) {
    if (error instanceof BackendRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Doctor workflow action failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
