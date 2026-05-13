import { fetchPatientResource } from "@/lib/serverApi";
import { PatientLabResultsSection } from "@/components/PatientLabResultsSection";

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
      <PatientLabResultsSection labs={results} />
    </div>
  );
}
