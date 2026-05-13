import Link from "next/link";
import { ArrowRight, CircleDollarSign, Clock3, CreditCard, ReceiptText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
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
  const outstanding = invoices.filter((invoice) => invoice.status.toLowerCase() !== "paid");
  const paid = invoices.filter((invoice) => invoice.status.toLowerCase() === "paid");
  const totalDue = outstanding.reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);
  const totalPaid = paid.reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);

  return (
    <div className="mx-auto max-w-screen-2xl space-y-6 p-4 md:p-6">
      <div className="rounded-[28px] border border-border bg-card p-6 shadow-soft">
        <p className="text-xs uppercase tracking-[0.3em] text-primary/80">Billing</p>
        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Invoices and payments</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Review what is due, what has already been settled, and jump back into care or session history from the same place.</p>
          </div>
          <Link href="/session-history" className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <Clock3 className="h-4 w-4" />
            Session history
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card text-foreground">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-muted-foreground"><ReceiptText className="h-4 w-4" /> Open invoices</CardDescription>
            <CardTitle className="text-xl">{outstanding.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border bg-card text-foreground">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-muted-foreground"><CircleDollarSign className="h-4 w-4" /> Amount due</CardDescription>
            <CardTitle className="text-xl">{outstanding.length > 0 ? `${outstanding[0].currency} ${totalDue.toFixed(2)}` : "0.00"}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border bg-card text-foreground">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-muted-foreground"><CreditCard className="h-4 w-4" /> Paid this cycle</CardDescription>
            <CardTitle className="text-xl">{paid.length > 0 ? `${paid[0].currency} ${totalPaid.toFixed(2)}` : "0.00"}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-3">
        {invoices.length === 0 ? <p className="text-sm text-muted-foreground">No invoices found.</p> : null}
        {invoices.map((inv) => (
          <article key={inv.id} className="rounded-xl border border-border bg-background p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{inv.invoice_number}</p>
                <p className="text-xs text-muted-foreground">{inv.currency} {inv.amount.toFixed(2)}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${inv.status.toLowerCase() === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{inv.status}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Related actions</h2>
            <p className="text-sm text-muted-foreground">Billing sits next to session history and records so you can move across the care workflow quickly.</p>
          </div>
          <Link href="/telemedicine" className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm hover:bg-muted/40">
            Open telemedicine <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
