import { DoctorOverviewClient } from "./_components/DoctorOverviewClient";
import { DoctorErrorBoundary } from "./_components/DoctorErrorBoundary";

export default function DoctorDashboardPage() {
  return (
    <DoctorErrorBoundary>
      <DoctorOverviewClient />
    </DoctorErrorBoundary>
  );
}
