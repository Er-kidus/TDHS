import { fetchPatientResource } from "@/lib/serverApi";

type Session = {
  id: string;
  doctor_name: string;
  scheduled_at: string;
  status: string;
};

export default async function SessionHistoryPage() {
  const data = (await fetchPatientResource("/telemedicine/sessions?limit=100")) as Session[];
  const sessions = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight">Session History</h1>
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-2">
        {sessions.length === 0 ? <p className="text-sm text-muted-foreground">No telemedicine sessions.</p> : null}
        {sessions.map((s) => (
          <article key={s.id} className="rounded-lg border border-border bg-background p-3">
            <p className="font-medium">{s.doctor_name}</p>
            <p className="text-xs text-muted-foreground">{new Date(s.scheduled_at).toLocaleString()} • {s.status}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
