import { fetchMyAppointments, fetchPatientMe, fetchPatientResource } from "@/lib/serverApi";
import { PatientDashboardClient } from "@/components/PatientDashboardClient";
import { redirect } from "next/navigation";

type Appointment = {
  id: string;
  scheduled_at: string;
  status: string;
  reason?: string;
  notes?: string;
};

type Patient = {
  full_name?: string;
};

type LabResult = {
  id: string;
  test_name?: string;
  test?: string;
  status?: string;
  result_value?: string;
  result_notes?: string;
  normal_range?: string;
  abnormal?: boolean;
  created_at?: string;
  updated_at?: string;
};

type Prescription = {
  id: string;
  medication_name?: string;
  medication?: string;
  dosage?: string;
  frequency?: string;
  prescribing_doctor?: string;
  status?: string;
  instructions?: string;
  duration_days?: number;
  created_at?: string;
  updated_at?: string;
};

export default async function DashboardPage() {
  let patient: Patient | null = null;
  let appointments: Appointment[] = [];
  let labs: LabResult[] = [];
  let prescriptions: Prescription[] = [];

  try {
    const [patientRes, appointmentsRes, labsRes, prescriptionsRes] = await Promise.all([
      fetchPatientMe(),
      fetchMyAppointments(),
      fetchPatientResource<LabResult[]>("/lab-results?limit=10", []),
      fetchPatientResource<Prescription[]>("/prescriptions?limit=10", []),
    ]);

    patient = patientRes ?? null;

    if (Array.isArray(appointmentsRes)) {
      appointments = appointmentsRes;
    } else if (
      appointmentsRes?.appointments &&
      Array.isArray(appointmentsRes.appointments)
    ) {
      appointments = appointmentsRes.appointments;
    }

    labs = Array.isArray(labsRes) ? labsRes : [];
    prescriptions = Array.isArray(prescriptionsRes) ? prescriptionsRes : [];
  } catch (error) {
    const message =
      error instanceof Error ? error.message.toLowerCase() : "";

    if (
      message.includes("not authenticated") ||
      message.includes("invalid token") ||
      message.includes("unauthorized")
    ) {
      redirect("/login");
    }

    throw error;
  }

  if (!patient) {
    redirect("/login");
  }

  return (
    <PatientDashboardClient
      patient={{
        full_name: patient.full_name ?? "Patient",
      }}
      appointments={appointments}
      labs={labs}
      prescriptions={prescriptions}
    />
  );
}