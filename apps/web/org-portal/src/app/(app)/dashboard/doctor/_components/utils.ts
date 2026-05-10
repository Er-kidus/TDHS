import type { ApiPayload, WorkflowPayload } from "./types";

export const EMPTY_WORKFLOW: WorkflowPayload = {
  prescriptions: [],
  labOrders: [],
  followUps: [],
  visitSummaries: [],
};

export async function readJsonResponse(response: Response): Promise<ApiPayload> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as ApiPayload;
  } catch {
    return text;
  }
}

export function getErrorMessage(payload: ApiPayload, fallback: string): string {
  if (payload && typeof payload === "object" && "error" in payload) {
    const value = payload.error;
    if (typeof value === "string" && value.trim()) return value;
  }
  if (typeof payload === "string" && payload.trim()) return payload;
  return fallback;
}

export function formatStatusLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatDateTimeInput(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date(Date.now() + 86400000).toISOString().slice(0, 16);
  return new Date(date.getTime() + 3600000).toISOString().slice(0, 16);
}

export function appointmentTitle(reason?: string, serviceType?: string, serviceCategory?: string) {
  return reason || serviceType || serviceCategory || "General consultation";
}
