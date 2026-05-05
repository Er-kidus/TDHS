export type ApiErrorBody = { error?: string };

function getApiBaseUrl(): string {
  const configured = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (configured) return configured;
  // In dev, Vite proxy handles /api -> gateway
  return "/api";
}

export async function apiFetch(path: string, init?: RequestInit & { token?: string | null }) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init?.headers);

  if (init?.token) headers.set("Authorization", `Bearer ${init.token}`);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  return fetch(url, {
    ...init,
    headers,
  });
}

export async function readJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return null as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    // @ts-expect-error fallback
    return text;
  }
}

export async function getErrorMessage(res: Response, p0: string): Promise<string> {
  const body = await readJson<unknown>(res).catch(() => null);
  if (body && typeof body === "object" && "error" in (body as Record<string, unknown>)) {
    const err = (body as Record<string, unknown>).error;
    if (typeof err === "string" && err.trim()) return err;
  }
  return `${res.status} ${res.statusText}`.trim();
}
