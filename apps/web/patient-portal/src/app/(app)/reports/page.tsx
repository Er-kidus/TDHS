import { fetchPatientResource } from "@/lib/serverApi";

type Recurrent = {
  id: string;
  medication_name: string;
  adherence_percent: number;
  diet_notes: string;
  appointment_severity: string;
  medication_alert_severity: string;
};

export default async function ReportsPage() {
  const data = (await fetchPatientResource("/care/recurrent-medications?limit=100")) as Recurrent[];
  const items = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight">Medication & Habit Reports</h1>
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-2">
        {items.length === 0 ? <p className="text-sm text-muted-foreground">No report data available.</p> : null}
        {items.map((it) => (
          <article key={it.id} className="rounded-lg border border-border bg-background p-3">
            <p className="font-medium">{it.medication_name}</p>
            <p className="text-xs text-muted-foreground">Adherence: {it.adherence_percent}% • Appointment severity: {it.appointment_severity} • Alert severity: {it.medication_alert_severity}</p>
            <p className="text-sm mt-1">Diet/habit notes: {it.diet_notes || "--"}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
