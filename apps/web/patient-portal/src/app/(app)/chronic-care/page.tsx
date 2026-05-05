import { fetchPatientResource } from "@/lib/serverApi";

type Chronic = {
  id: string;
  condition_name: string;
  care_plan: string;
  severity_level: string;
  risk_score: number;
};

export default async function ChronicCarePage() {
  const data = (await fetchPatientResource("/care/chronic?limit=50")) as Chronic[];
  const items = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight">Chronic Care</h1>
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-2">
        {items.length === 0 ? <p className="text-sm text-muted-foreground">No chronic care plans.</p> : null}
        {items.map((it) => (
          <article key={it.id} className="rounded-lg border border-border bg-background p-3">
            <p className="font-medium">{it.condition_name}</p>
            <p className="text-sm mt-1">{it.care_plan}</p>
            <p className="text-xs text-muted-foreground mt-1">Severity: {it.severity_level} • Risk score: {it.risk_score}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
