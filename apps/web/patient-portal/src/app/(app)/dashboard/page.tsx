import { fetchMyAppointments, fetchPatientMe } from "@/lib/serverApi";
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

export default async function DashboardPage() {
  let patient: Patient | null = null;
  let appointments: Appointment[] = [];

  try {
    const [patientRes, appointmentsRes] = await Promise.all([
      fetchPatientMe(),
      fetchMyAppointments(),
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
    />
  );
}