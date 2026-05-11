import { getPatientToken } from "@/lib/auth";
import { BackendRequestError, backendFetch } from "@/lib/backend";

export async function fetchPatientMe() {
  const token = await getPatientToken();
  if (!token) throw new Error("Not authenticated");
  const res = await backendFetch("/patients/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function fetchMyAppointments() {
  const token = await getPatientToken();
  if (!token) throw new Error("Not authenticated");
  const res = await backendFetch("/appointments?limit=5", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function fetchPatientResource<T = unknown>(path: string, fallback: T | null = null) {
  const token = await getPatientToken();
  if (!token) throw new Error("Not authenticated");
  try {
    const res = await backendFetch(path, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return (await res.json()) as T;
  } catch (error) {
    if (error instanceof BackendRequestError && error.status === 404) {
      return fallback;
    }
    throw error;
  }
}

export async function fetchOrgResource(path: string, token: string) {
  const res = await backendFetch(path, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
