import { fetchPatientResource } from "@/lib/serverApi";

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
      <section className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
        {prescriptions.length === 0 ? <p className="text-sm text-muted-foreground">No prescriptions found.</p> : null}
        {prescriptions.map((med) => (
          <article key={med.id} className="rounded-lg border border-border bg-background p-3">
            <p className="font-medium">{med.medication_name}</p>
            <p className="text-xs text-muted-foreground">{med.dosage} • {med.frequency} • {med.status}</p>
            <p className="text-xs mt-1">Prescriber: {med.prescribing_doctor}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
