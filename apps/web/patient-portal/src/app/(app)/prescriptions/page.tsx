import { fetchPatientResource } from "@/lib/serverApi";
import { PatientPrescriptionsSection } from "@/components/PatientPrescriptionsSection";

type Prescription = {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  prescribing_doctor: string;
  status: string;
};

export default async function PrescriptionsPage() {
  const data = (await fetchPatientResource("/prescriptions?limit=50")) as Prescription[];
  const prescriptions = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight">Prescriptions</h1>
      <PatientPrescriptionsSection prescriptions={prescriptions} />
    </div>
  );
}
