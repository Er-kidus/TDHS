import Link from 'next/link';
import { MapPin, PackageCheck, Pill, Receipt, Truck } from 'lucide-react';
import type { ComponentType } from 'react';

import { fetchPatientResource } from '@/lib/serverApi';

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

type Prescription = {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  status: string;
  prescribed_at: string;
};

type Invoice = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  issued_at: string;
};

export default async function PharmacyPage() {
  const [medicationsData, prescriptionsData, invoicesData] = await Promise.all([
    fetchPatientResource('/pharmacy/medications?limit=12') as Promise<Medication[]>,
    fetchPatientResource('/prescriptions?limit=8') as Promise<Prescription[]>,
    fetchPatientResource('/billing/invoices?limit=8') as Promise<Invoice[]>,
  ]);

  const medications = Array.isArray(medicationsData) ? medicationsData : [];
  const prescriptions = Array.isArray(prescriptionsData) ? prescriptionsData : [];
  const invoices = Array.isArray(invoicesData) ? invoicesData : [];

  const pendingPrescriptions = prescriptions.filter((item) => item.status.toLowerCase() !== 'dispensed');
  const unpaidInvoices = invoices.filter((item) => item.status.toLowerCase() !== 'paid');

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h1 className="text-2xl font-semibold tracking-tight">Pharmacy Workflow</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Inventory, prescriptions, dispensation status, billing, and pickup logistics in one workspace.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Metric title="Available medications" value={String(medications.filter((item) => item.in_stock).length)} icon={PackageCheck} />
        <Metric title="Pending prescriptions" value={String(pendingPrescriptions.length)} icon={Pill} />
        <Metric title="Unpaid invoices" value={String(unpaidInvoices.length)} icon={Receipt} />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-soft space-y-3">
          <h2 className="font-semibold inline-flex items-center gap-2">
            <PackageCheck className="h-4 w-4 text-primary" /> Inventory and medication catalog
          </h2>
          {medications.length === 0 ? <p className="text-sm text-muted-foreground">No medication inventory available.</p> : null}
          {medications.map((medication) => (
            <div key={medication.id} className="rounded-xl border border-border bg-background p-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{medication.name}</p>
                <p className="text-xs text-muted-foreground">
                  {medication.dosage} • {medication.quantity_label} • {medication.prescription_required ? 'Prescription required' : 'OTC'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{medication.currency} {medication.price.toFixed(2)}</p>
                <p className={'text-xs ' + (medication.in_stock ? 'text-green-600' : 'text-red-600')}>
                  {medication.in_stock ? 'In stock' : 'Out of stock'}
                </p>
              </div>
            </div>
          ))}
        </div>

        <aside className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-3">
          <h2 className="font-semibold inline-flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" /> Dispensation and delivery
          </h2>
          {pendingPrescriptions.slice(0, 4).map((prescription) => (
            <div key={prescription.id} className="rounded-lg border border-border bg-background p-3 text-sm">
              <p className="font-medium">{prescription.medication_name}</p>
              <p className="text-xs text-muted-foreground">{prescription.dosage} • {prescription.frequency}</p>
              <p className="mt-1 text-xs text-amber-600">Status: {prescription.status}</p>
            </div>
          ))}
          {pendingPrescriptions.length === 0 ? <p className="text-sm text-muted-foreground">No pending dispensation requests.</p> : null}
          <Link href="/prescriptions" className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Manage prescriptions
          </Link>
        </aside>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-3">
          <h2 className="font-semibold inline-flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" /> Billing and insurance payments
          </h2>
          {invoices.slice(0, 5).map((invoice) => (
            <div key={invoice.id} className="rounded-lg border border-border bg-background p-3 text-sm flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">Invoice {invoice.id.slice(0, 8)}</p>
                <p className="text-xs text-muted-foreground">{new Date(invoice.issued_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{invoice.currency} {invoice.amount.toFixed(2)}</p>
                <p className={'text-xs ' + (invoice.status.toLowerCase() === 'paid' ? 'text-green-600' : 'text-amber-600')}>
                  {invoice.status}
                </p>
              </div>
            </div>
          ))}
          {invoices.length === 0 ? <p className="text-sm text-muted-foreground">No billing records available.</p> : null}
          <Link href="/billing" className="inline-flex rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-accent">
            Open billing center
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft space-y-3">
          <h2 className="font-semibold inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Pharmacy locator
          </h2>
          <div className="rounded-xl border border-dashed border-border bg-background/70 p-6 text-sm text-muted-foreground">
            Map integration is prepared for Live location data and nearest participating pharmacies.
            Use your selected pharmacy on checkout to complete pickup or delivery.
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Use nearest pharmacy</button>
            <button className="rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-accent">Choose manually</button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ title, value, icon: Icon }: { title: string; value: string; icon: ComponentType<{ className?: string }> }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-2xl font-semibold">{value}</p>
        <Icon className="h-5 w-5 text-primary" />
      </div>
    </article>
  );
}
