import { getOrgPatient } from "@/lib/serverApi";

type Patient = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  active: boolean;
  profile?: Record<string, unknown>;
  created_at?: string;
};

export default async function PatientDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let patient: Patient | null = null;
  let error: string | null = null;
  try {
    patient = (await getOrgPatient(id)) as Patient;
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load patient";
  }

  if (error) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Patient</h1>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{patient.full_name}</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{patient.email}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200/70 bg-white/60 p-4 backdrop-blur dark:border-white/10 dark:bg-zinc-950/40">
          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Phone</div>
          <div className="mt-1 text-sm">{patient.phone}</div>
        </div>
        <div className="rounded-2xl border border-zinc-200/70 bg-white/60 p-4 backdrop-blur dark:border-white/10 dark:bg-zinc-950/40">
          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Status</div>
          <div className="mt-1 text-sm">{patient.active ? "Active" : "Inactive"}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200/70 bg-white/60 p-4 backdrop-blur dark:border-white/10 dark:bg-zinc-950/40">
        <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Profile (JSON)</div>
        <pre className="mt-2 overflow-auto rounded-xl bg-black/5 p-3 text-xs dark:bg-white/10">
          {JSON.stringify(patient.profile ?? {}, null, 2)}
        </pre>
      </div>
    </div>
  );
}
