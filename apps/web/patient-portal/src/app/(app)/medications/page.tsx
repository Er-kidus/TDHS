import { fetchPatientResource } from "@/lib/serverApi";

type Medication = {
  id: string;
  name: string;
  dosage: string;
  quantity_label: string;
  price: number;
  currency: string;
  prescription_required: boolean;
  in_stock: boolean;
};

export default async function MedicationsPage() {
  const data = (await fetchPatientResource("/pharmacy/medications?limit=100")) as Medication[];
  const meds = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight">Medications</h1>
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {meds.length === 0 ? <p className="text-sm text-muted-foreground">No medications available.</p> : null}
        {meds.map((m) => (
          <article key={m.id} className="rounded-xl border border-border bg-card p-4 shadow-soft">
            <p className="font-medium">{m.name}</p>
            <p className="text-xs text-muted-foreground">{m.dosage} • {m.quantity_label}</p>
            <p className="text-sm mt-2">{m.currency} {m.price.toFixed(2)}</p>
            <p className={"text-xs mt-1 " + (m.in_stock ? "text-success" : "text-destructive")}>{m.in_stock ? "In stock" : "Out of stock"}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
