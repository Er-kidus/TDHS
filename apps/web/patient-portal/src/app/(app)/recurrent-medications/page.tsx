import { fetchPatientResource } from "@/lib/serverApi";

type Recurrent = {
  id: string;
  medication_name: string;
  taken_today: boolean;
  adherence_percent: number;
  appointment_severity: string;
  medication_alert_severity: string;
  diet_notes: string;
};

export default async function RecurrentMedicationsPage() {
  const data = (await fetchPatientResource("/care/recurrent-medications?limit=50")) as Recurrent[];
  const items = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight">Recurrent Medications</h1>
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-2">
        {items.length === 0 ? <p className="text-sm text-muted-foreground">No recurrent medication tracking records.</p> : null}
        {items.map((it) => (
          <article key={it.id} className="rounded-lg border border-border bg-background p-3">
            <p className="font-medium">{it.medication_name}</p>
            <p className="text-xs text-muted-foreground">Taken today: {it.taken_today ? "Yes" : "No"} • Adherence: {it.adherence_percent}%</p>
            <p className="text-xs mt-1">Appointment severity: {it.appointment_severity} • Medication alert severity: {it.medication_alert_severity}</p>
            <p className="text-sm mt-1">Diet notes: {it.diet_notes || "--"}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
