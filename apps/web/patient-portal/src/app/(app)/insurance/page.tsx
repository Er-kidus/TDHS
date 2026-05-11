import { fetchPatientResource } from "@/lib/serverApi";

type Insurance = {
  provider: string;
  policy_number: string;
  coverage: string;
  valid_from?: string;
  valid_to?: string;
};

export default async function InsurancePage() {
  const item = (await fetchPatientResource("/insurance")) as Insurance;

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight">Insurance</h1>
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft text-sm space-y-2">
        <p><span className="text-muted-foreground">Provider:</span> {item?.provider || "--"}</p>
        <p><span className="text-muted-foreground">Policy:</span> {item?.policy_number || "--"}</p>
        <p><span className="text-muted-foreground">Coverage:</span> {item?.coverage || "--"}</p>
        <p><span className="text-muted-foreground">Validity:</span> {item?.valid_from ? new Date(item.valid_from).toLocaleDateString() : "--"} - {item?.valid_to ? new Date(item.valid_to).toLocaleDateString() : "--"}</p>
      </section>
    </div>
  );
}
