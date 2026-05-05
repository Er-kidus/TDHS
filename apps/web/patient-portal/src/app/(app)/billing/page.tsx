import { fetchPatientResource } from "@/lib/serverApi";

type Invoice = {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: string;
};

export default async function BillingPage() {
  const data = (await fetchPatientResource("/billing/invoices?limit=50")) as Invoice[];
  const invoices = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-2">
        {invoices.length === 0 ? <p className="text-sm text-muted-foreground">No invoices found.</p> : null}
        {invoices.map((inv) => (
          <div key={inv.id} className="rounded-lg border border-border bg-background p-3 flex items-center justify-between">
            <div>
              <p className="font-medium">{inv.invoice_number}</p>
              <p className="text-xs text-muted-foreground">{inv.currency} {inv.amount.toFixed(2)}</p>
            </div>
            <span className="text-xs">{inv.status}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
