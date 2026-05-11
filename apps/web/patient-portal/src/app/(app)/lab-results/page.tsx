import { fetchPatientResource } from "@/lib/serverApi";

type LabResult = {
  id: string;
  test_name: string;
  status: string;
  result_value?: string;
  normal_range?: string;
  abnormal: boolean;
};

export default async function LabResultsPage() {
  const data = (await fetchPatientResource("/lab-results?limit=50")) as LabResult[];
  const results = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight">Lab Results</h1>
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="pb-2">Test</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Result</th>
              <th className="pb-2">Range</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id} className="border-b border-border/60">
                <td className="py-2 font-medium">{r.test_name}</td>
                <td>{r.status}</td>
                <td className={r.abnormal ? "text-critical font-medium" : ""}>{r.result_value || "--"}</td>
                <td>{r.normal_range || "--"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {results.length === 0 ? <p className="text-sm text-muted-foreground mt-3">No lab results found.</p> : null}
      </section>
    </div>
  );
}
