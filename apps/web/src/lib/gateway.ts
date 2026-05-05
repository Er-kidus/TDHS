import { apiFetch, getErrorMessage, readJson } from "@/lib/api";

export type GatewayPatient = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  profile: Record<string, unknown>;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type GatewayAppointment = {
  id: string;
  patient_id: string;
  created_by?: string | null;
  scheduled_at: string;
  status: string;
  reason?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export async function getPatientMe(token: string): Promise<GatewayPatient> {
  const res = await apiFetch("/patients/me", { token });
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return readJson<GatewayPatient>(res);
}

export async function listAppointments(token: string, limit?: number): Promise<GatewayAppointment[]> {
  const qs = limit ? `?limit=${encodeURIComponent(String(limit))}` : "";
  const res = await apiFetch(`/appointments${qs}`, { token });
  if (!res.ok) throw new Error(await getErrorMessage(res));
  const data = await readJson<unknown>(res);
  return asArray<GatewayAppointment>(data);
}

export async function createAppointment(
  token: string,
  input: { scheduledAt: string; reason?: string; notes?: string; patientId?: string }
): Promise<GatewayAppointment> {
  const qs = input.patientId ? `?patientId=${encodeURIComponent(input.patientId)}` : "";
  const res = await apiFetch(`/appointments${qs}`, {
    method: "POST",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      scheduledAt: input.scheduledAt,
      reason: input.reason || undefined,
      notes: input.notes || undefined,
    }),
  });
  if (!res.ok) throw new Error(await getErrorMessage(res));
  return readJson<GatewayAppointment>(res);
}

export async function deleteAppointment(token: string, id: string): Promise<void> {
  const res = await apiFetch(`/appointments/${encodeURIComponent(id)}`, { method: "DELETE", token });
  if (!res.ok && res.status !== 204) throw new Error(await getErrorMessage(res));
}

export async function listOrgPatients(token: string, limit?: number): Promise<GatewayPatient[]> {
  const qs = limit ? `?limit=${encodeURIComponent(String(limit))}` : "";
  const res = await apiFetch(`/org/patients${qs}`, { token });
  if (!res.ok) throw new Error(await getErrorMessage(res));
  const data = await readJson<unknown>(res);
  return asArray<GatewayPatient>(data);
}
