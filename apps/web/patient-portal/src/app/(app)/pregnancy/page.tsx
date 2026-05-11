import { fetchPatientResource } from "@/lib/serverApi";

type Pregnancy = {
  id: string;
  trimester: number;
  expected_delivery_date?: string;
  high_risk: boolean;
  notes: string;
  severity_level: string;
};

export default async function PregnancyPage() {
  const data = (await fetchPatientResource("/care/pregnancy?limit=50")) as Pregnancy[];
  const items = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight">Pregnancy Care</h1>
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-2">
        {items.length === 0 ? <p className="text-sm text-muted-foreground">No pregnancy care records.</p> : null}
        {items.map((it) => (
          <article key={it.id} className="rounded-lg border border-border bg-background p-3">
            <p className="font-medium">Trimester {it.trimester}</p>
            <p className="text-xs text-muted-foreground">EDD: {it.expected_delivery_date ? new Date(it.expected_delivery_date).toLocaleDateString() : "--"}</p>
            <p className="text-sm mt-1">{it.notes}</p>
            <p className="text-xs mt-1">Risk: {it.high_risk ? "High" : "Standard"} • Severity: {it.severity_level}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
