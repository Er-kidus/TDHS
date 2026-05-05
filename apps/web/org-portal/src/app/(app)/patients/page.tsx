import Link from "next/link";
import { listOrgPatients } from "@/lib/serverApi";

type PatientListItem = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  active: boolean;
  createdAt?: string;
};

export default async function PatientsPage() {
  let patients: PatientListItem[] = [];
  try {
    const payload = await listOrgPatients();
    if (Array.isArray(payload)) {
      patients = payload as PatientListItem[];
    } else if (
      payload &&
      typeof payload === "object" &&
      "patients" in payload &&
      Array.isArray((payload as { patients?: unknown }).patients)
    ) {
      patients = (payload as { patients: PatientListItem[] }).patients;
    }
  } catch {
    patients = [];
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Patients</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Organization view of registered patients.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200/70 bg-white/60 backdrop-blur dark:border-white/10 dark:bg-zinc-950/40">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50/70 text-xs uppercase text-zinc-600 dark:bg-black/20 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id} className="border-t border-zinc-200/60 dark:border-white/10">
                <td className="px-4 py-3 font-medium">
                  <Link className="hover:underline" href={`/patients/${p.id}`}>
                    {p.full_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{p.email}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{p.phone}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      "rounded-full px-2 py-1 text-xs " +
                      (p.active
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300")
                    }
                  >
                    {p.active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
            {patients.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-zinc-600 dark:text-zinc-300" colSpan={4}>
                  No patients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
