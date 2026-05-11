import { backendFetch } from "@/lib/backend";
import { orgAuthHeaderFromCookie } from "@/lib/routeAuth";

export async function listOrgPatients() {
  const auth = await orgAuthHeaderFromCookie();
  const res = await backendFetch("/org/patients", { method: "GET", headers: { ...auth } });
  if (!res.ok) throw new Error("Failed to load patients");
  return (await res.json()) as unknown;
}

export async function getOrgPatient(id: string) {
  const auth = await orgAuthHeaderFromCookie();
  const res = await backendFetch(`/org/patients/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: { ...auth },
  });
  if (!res.ok) throw new Error("Failed to load patient");
  return (await res.json()) as unknown;
}

export async function listAppointments(limit = 50) {
  const auth = await orgAuthHeaderFromCookie();
  const res = await backendFetch(`/appointments?limit=${limit}`, { method: "GET", headers: { ...auth } });
  if (!res.ok) throw new Error("Failed to load appointments");
  return (await res.json()) as unknown;
}
